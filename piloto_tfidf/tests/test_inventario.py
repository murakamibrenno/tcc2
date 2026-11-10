import unittest
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from inventariar_base import hash_texto, atribuir_grupos

class InventarioTests(unittest.TestCase):
    def test_normalizacao_sem_perder_diferencas_tecnicas(self):
        self.assertEqual(hash_texto("JAVA\n SQL"), hash_texto("java  sql"))
        self.assertNotEqual(hash_texto("C# SQL"), hash_texto("C SQL"))

    def test_grupos_transitivos_com_par_adjudicado(self):
        rows = [{"id": cid, "status": "ok", "sha256_texto_normalizado": h}
                for cid, h in [("26746496", "a"), ("16186411", "b"), ("999", "a"), ("888", "c")]]
        by_id = {r["id"]: r["grupo_documental"] for r in atribuir_grupos(rows)}
        self.assertEqual(by_id["999"], by_id["16186411"])
        self.assertNotEqual(by_id["888"], by_id["999"])

    def test_erros_nao_viram_duplicatas_de_texto_vazio(self):
        rows = [{"id": "1", "status": "erro"}, {"id": "2", "status": "texto_vazio"}]
        self.assertNotEqual(*[r["grupo_documental"] for r in atribuir_grupos(rows)])
