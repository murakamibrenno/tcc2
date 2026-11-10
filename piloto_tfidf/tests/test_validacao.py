import csv
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

BASE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE))
from cache_embeddings import carregar_vetores, salvar_vetores
from protocolo_experimento import fingerprint_textos, gravar_json_atomico
from validar_experimento import auditar, exigir_preflight, metricas_ranking, preparar_revisao
from anotar_automatico import detectar_criterios
from extrair_llm import _chave


class IdentidadeCacheTests(unittest.TestCase):
    def test_mudanca_apos_prefixo_invalida(self):
        prefix = "a" * 80
        self.assertNotEqual(fingerprint_textos([prefix + "sql"], "modelo"),
                            fingerprint_textos([prefix + "git"], "modelo"))

    def test_ordem_modelo_e_configuracao_invalidam(self):
        original = fingerprint_textos(["a", "b"], "m", max_tokens=512)
        self.assertNotEqual(original, fingerprint_textos(["b", "a"], "m", max_tokens=512))
        self.assertNotEqual(original, fingerprint_textos(["a", "b"], "n", max_tokens=512))
        self.assertNotEqual(original, fingerprint_textos(["a", "b"], "m", max_tokens=256))

    def test_idempotencia(self):
        self.assertEqual(fingerprint_textos(["São Paulo"], "m"), fingerprint_textos(["São Paulo"], "m"))

    def test_encoder_llm_usa_conteudo_integral(self):
        self.assertNotEqual(_chave(["a" * 80 + "SQL"], "m", 512), _chave(["a" * 80 + "Git"], "m", 512))

    def test_encoder_llm_invalida_janela_de_tokens(self):
        self.assertNotEqual(_chave(["texto"], "m", 512), _chave(["texto"], "m", 256))

    def test_cache_corrompido_ou_alterado_nao_e_reutilizado(self):
        with tempfile.TemporaryDirectory() as tmp:
            path, meta = Path(tmp) / "cache.npy", Path(tmp) / "cache.json"
            values = np.array([[1., 2.], [3., 4.]], dtype=np.float32)
            salvar_vetores(path, meta, values, "digest", 1., "m")
            loaded = carregar_vetores(path, meta, "digest", 2)
            self.assertIsNotNone(loaded)
            np.testing.assert_array_equal(loaded[0], values)
            self.assertIsNone(carregar_vetores(path, meta, "outro", 2))
            self.assertIsNone(carregar_vetores(path, meta, "digest", 3))
            np.save(path, values + 1)
            self.assertIsNone(carregar_vetores(path, meta, "digest", 2))
            path.write_bytes(b"interrompido")
            self.assertIsNone(carregar_vetores(path, meta, "digest", 2))

    def test_cache_legado_e_recusado(self):
        with tempfile.TemporaryDirectory() as tmp:
            path, meta = Path(tmp) / "cache.npy", Path(tmp) / "cache.json"
            np.save(path, np.ones((2, 3)))
            gravar_json_atomico(meta, {"n": 2, "modelo": "m", "tempo_seg": 1})
            self.assertIsNone(carregar_vetores(path, meta, "x", 2))

    def test_valores_nao_finitos_nao_sao_salvos(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                salvar_vetores(Path(tmp) / "x.npy", Path(tmp) / "x.json", [[float("nan")]], "x", 1, "m")

    def test_json_temporario_nao_substitui_oficial_sem_commit(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "estado.json"
            gravar_json_atomico(path, {"ok": 1})
            path.with_name("estado.json.tmp").write_text("{parcial")
            self.assertEqual(json.loads(path.read_text()), {"ok": 1})
            gravar_json_atomico(path, {"ok": 2})
            self.assertEqual(json.loads(path.read_text()), {"ok": 2})


class MetricasTests(unittest.TestCase):
    def test_ranking_ideal(self):
        result = metricas_ranking(["Adequado", "Parcialmente Adequado", "Inadequado"])
        self.assertEqual(result["AP"], 1.)
        self.assertEqual(result["NDCG@10"], 1.)

    def test_sem_relevantes(self):
        self.assertTrue(all(v == 0 for v in metricas_ranking(["Inadequado"] * 10).values()))

    def test_relevancia_binaria_distingue_ap_de_precisao(self):
        result = metricas_ranking(["Parcialmente Adequado", "Adequado", "Inadequado", "Inadequado", "Inadequado"])
        self.assertEqual(result["AP"], .5)
        self.assertEqual(result["P@5"], .4)

    def test_rotulo_desconhecido_nao_vira_zero_silenciosamente(self):
        with self.assertRaises(KeyError):
            metricas_ranking(["Aprovado"])


class CorpusPublicadoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = auditar(BASE)

    def test_preflight_detecta_pendencias_reais(self):
        codes = {f["codigo"] for f in self.report["achados"]}
        self.assertTrue({"revisao_nao_adjudicada", "rotulos_automaticos", "documentos_proximos",
                         "proximos_entre_particoes", "folds_classe_rara"}.issubset(codes))
        self.assertFalse(self.report["apto_para_conclusoes"])

    def test_integridade_dos_numeros_publicados(self):
        codes = {f["codigo"] for f in self.report["achados"]}
        self.assertFalse({"metrica_divergente", "ui_ranking", "ui_ids", "ranking_rotulos", "matriz_total"} & codes)
        self.assertAlmostEqual(self.report["rankings"]["st"]["publicado_recalculado"]["AP"], 1.)

    def test_revisao_e_sensibilidade_nao_aplica_rotulo(self):
        self.assertAlmostEqual(self.report["rankings"]["st"]["sensibilidade_revisao_nao_oficial"]["AP"], .8)
        corpus = json.loads((BASE / "data/curriculos_piloto.json").read_text(encoding="utf8"))
        candidate = next(c for c in corpus if str(c["id"]) == "21297521")
        self.assertEqual(candidate["classificacaoManualConfirmada"], "Inadequado")

    def test_execucao_bloqueada_antes_de_treinar(self):
        with self.assertRaises(SystemExit):
            exigir_preflight(BASE)

    def test_formulario_novo_sem_rotulos_anteriores_e_sem_sobrescrita(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "revisao.csv"
            preparar_revisao(BASE, path)
            with path.open(encoding="utf-8-sig", newline="") as file:
                rows = list(csv.DictReader(file))
            self.assertEqual(len(rows), 100)
            self.assertTrue(all(not r["rotulo_revisor"] and r["texto"] for r in rows))
            self.assertNotIn("categoria", rows[0])
            with self.assertRaises(FileExistsError):
                preparar_revisao(BASE, path)

    def test_cli_grava_relatorio_e_sinaliza_pendencias(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "relatorio.json"
            process = subprocess.run([sys.executable, str(BASE / "validar_experimento.py"), "--saida", str(path)], capture_output=True, text=True)
            self.assertEqual(process.returncode, 2, process.stderr)
            self.assertTrue(json.loads(path.read_text(encoding="utf8"))["validacao_concluida"])

    def test_detecta_csharp_dotnet_cpp(self):
        for term in ["C#", ".NET", "ASP.NET", "C++"]:
            with self.subTest(term=term):
                self.assertTrue(detectar_criterios(term)[3])


if __name__ == "__main__":
    unittest.main()
