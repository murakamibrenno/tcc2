"""Auditoria somente de leitura do experimento; não recalcula modelos nem muda rótulos.

python validar_experimento.py --saida validation/relatorio_validacao.json
python validar_experimento.py --preparar-revisao validation/revisao_humana.csv
Saídas: 0 = sem bloqueios detectados; 2 = pendências científicas; 1 = erro de execução.
Ausência de bloqueios automáticos não equivale a aprovação científica.
"""
from __future__ import annotations

import argparse
import collections
import csv
import hashlib
import json
import math
import re
from pathlib import Path

from protocolo_experimento import gravar_json_atomico

BASE = Path(__file__).resolve().parent
CLASSES = ("Adequado", "Inadequado", "Parcialmente Adequado")
REL = {"Adequado": 2, "Parcialmente Adequado": 1, "Inadequado": 0}
RANKINGS = (
    ("tfidf", "TF-IDF", "pilotoTfidf.json", "scoreTfidf"),
    ("st", "Sentence-Transformers", "pilotoSt.json", "scoreSt"),
    ("llm", "LLM Embeddings", "pilotoLlm.json", "scoreLlm"),
)


def ler_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def ler_csv(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def rotulo(item):
    return item.get("classificacaoManualConfirmada") or item.get("classificacaoManualReferencia", "")


def metricas_ranking(labels):
    """Contrato publicado: AP só Adequado; P@k inclui Parcial; NDCG usa 2^rel-1."""
    rels = [REL[label] for label in labels]
    hits = 0
    precisions = []
    for i, value in enumerate(rels, 1):
        if value == 2:
            hits += 1
            precisions.append(hits / i)
    def dcg(values):
        return sum((2 ** r - 1) / math.log2(i + 2) for i, r in enumerate(values[:10]))
    ideal = dcg(sorted(rels, reverse=True))
    return {
        "AP": sum(precisions) / len(precisions) if precisions else 0.0,
        "P@5": sum(r > 0 for r in rels[:5]) / min(5, len(rels)) if rels else 0.0,
        "P@10": sum(r > 0 for r in rels[:10]) / min(10, len(rels)) if rels else 0.0,
        "NDCG@10": dcg(rels) / ideal if ideal else 0.0,
    }


def detectar_proximos(corpus, threshold=0.9):
    """Triagem por Jaccard de palavras; não afirma identidade de candidato."""
    sets = [set(re.findall(r"[a-z0-9]+", item["texto"].lower())) for item in corpus]
    pairs = []
    for i in range(len(corpus)):
        for j in range(i + 1, len(corpus)):
            union = sets[i] | sets[j]
            similarity = len(sets[i] & sets[j]) / len(union) if union else 0.0
            if similarity >= threshold:
                pairs.append({"ids": [str(corpus[i]["id"]), str(corpus[j]["id"])], "jaccard_palavras": round(similarity, 6)})
    return pairs


def auditar(base=BASE, folds=5, somente_dados=False):
    base = Path(base)
    data, out = base / "data", base / "output"
    ui = base.parent / "aplicacao_mockup" / "src" / "data"
    corpus = ler_json(data / "curriculos_piloto.json")
    findings = []
    def add(code, level, message, evidence=None):
        findings.append({"codigo": code, "nivel": level, "mensagem": message, "evidencia": evidence})
    ids = [str(c["id"]) for c in corpus]
    by_id = dict(zip(ids, corpus))
    distribution = collections.Counter(rotulo(c) for c in corpus)
    if len(ids) != len(set(ids)):
        add("ids_duplicados", "bloqueador", "IDs duplicados no corpus.")
    if any(not str(c.get("texto", "")).strip() for c in corpus):
        add("texto_vazio", "bloqueador", "Há documentos sem texto.")
    unknown = set(distribution) - set(CLASSES)
    if unknown:
        add("rotulos_invalidos", "bloqueador", "Rótulos fora do contrato.", sorted(unknown))
    if len(distribution) < 2 or folds < 2 or (distribution and min(distribution.values()) < folds):
        add("folds_classe_rara", "bloqueador", "Número de folds incompatível com a presença de cada classe em todo teste.", {"folds": folds, "distribuicao": dict(distribution)})
    n_auto = sum(bool(c.get("anotacaoAutomatica")) for c in corpus)
    if n_auto:
        add("rotulos_automaticos", "bloqueador", "Rótulos por regra exigem revisão ou delimitação explícita como supervisão fraca antes das conclusões finais.", {"automaticos": n_auto, "total": len(corpus)})
    reviewed = {}
    revision = data / "amostra_revisao.csv"
    if revision.exists():
        for row in ler_csv(revision):
            cid, label = row["id"].strip(), row.get("rotulo_revisado", "").strip()
            if label and cid in by_id:
                if label not in CLASSES:
                    add("revisao_invalida", "bloqueador", "Rótulo de revisão inválido.", {"id": cid, "rotulo": label})
                    continue
                reviewed[cid] = label
                if label != rotulo(by_id[cid]):
                    add("revisao_nao_adjudicada", "bloqueador", "Revisão diverge do rótulo avaliado; adjudicar sem favorecer modelos.", {"id": cid, "publicado": rotulo(by_id[cid]), "revisado": label})
    pairs = detectar_proximos(corpus)
    if pairs:
        add("documentos_proximos", "bloqueador", "Verificar documentos muito semelhantes e definir grupos antes da avaliação.", pairs)
    splits = ler_json(data / "splits.json")
    owners = collections.defaultdict(list)
    for split in ("train", "val", "test"):
        values = [str(i) for i in splits[split]]
        if len(values) != len(set(values)) or set(values) - set(ids):
            add("split_ids_invalidos", "bloqueador", "IDs repetidos ou desconhecidos em uma partição.", split)
        for cid in values:
            owners[cid].append(split)
    overlaps = {cid: parts for cid, parts in owners.items() if len(parts) != 1}
    if overlaps or set(owners) != set(ids):
        add("particoes_inconsistentes", "bloqueador", "Partições não formam uma cobertura disjunta do corpus.", overlaps)
    crossing = [p for p in pairs if set(owners[p["ids"][0]]) != set(owners[p["ids"][1]])]
    if crossing:
        add("proximos_entre_particoes", "bloqueador", "Documentos próximos atravessam as partições salvas.", crossing)
    if somente_dados:
        return {"achados": findings}
    metrics_csv = {r["metodo"]: r for r in ler_csv(out / "comparativo_ranking.csv")}
    ui_metrics = ler_json(ui / "metricasReais.json")
    metrics_ui = {r["metodo"]: r for r in ui_metrics.get("ranking", [])}
    rankings = {}
    for key, method, ui_file, score_json in RANKINGS:
        rows = ler_csv(out / f"ranking_{key}_piloto.csv")
        scores = [float(r[f"score_{key}"]) for r in rows]
        if set(r["id"] for r in rows) != set(ids) or len(rows) != len(ids):
            add("ranking_ids", "bloqueador", "Ranking e corpus não contêm os mesmos IDs.", method)
        if any(not math.isfinite(s) or not -1 <= s <= 1 for s in scores):
            add("score_invalido", "bloqueador", "Score de cosseno inválido.", method)
        if scores != sorted(scores, reverse=True):
            add("ranking_ordem", "bloqueador", "Ranking não está em ordem decrescente.", method)
        mismatches = [r["id"] for r in rows if r["id"] in by_id and r["classificacao_manual"] != rotulo(by_id[r["id"]])]
        if mismatches:
            add("ranking_rotulos", "bloqueador", "Ranking diverge dos rótulos do corpus.", {"metodo": method, "ids": mismatches})
        candidates = ler_json(ui / ui_file)["candidatos"]
        csv_map, ui_map = {r["id"]: r for r in rows}, {str(c["id"]): c for c in candidates}
        if len(candidates) != len(rows) or set(csv_map) != set(ui_map):
            add("ui_ids", "bloqueador", "UI e CSV não têm os mesmos IDs.", method)
        elif any(float(csv_map[cid][f"score_{key}"]) != ui_map[cid].get(score_json) or csv_map[cid]["classificacao_manual"] != ui_map[cid].get("classificacaoManual") for cid in csv_map):
            add("ui_ranking", "bloqueador", "UI diverge de score ou rótulo publicado no CSV.", method)
        if unknown:
            continue
        values = metricas_ranking([r["classificacao_manual"] for r in rows])
        for metric, value in values.items():
            column = "MAP" if metric == "AP" else metric
            for source, record in (("CSV", metrics_csv.get(method, {})), ("UI", metrics_ui.get(method, {}))):
                saved = record.get(column)
                if saved is None or abs(float(saved) - value) > 0.000051:
                    add("metrica_divergente", "bloqueador", "Métrica não confere com o ranking salvo.", {"metodo": method, "fonte": source, "metrica": column, "calculado": value, "salvo": saved})
        revised = metricas_ranking([reviewed.get(r["id"], r["classificacao_manual"]) for r in rows])
        rankings[key] = {"publicado_recalculado": values, "sensibilidade_revisao_nao_oficial": revised}
    report = ler_json(out / "relatorio_classificacao.json")
    collapsed = []
    for name, combo in report["combinacoes"].items():
        matrix = combo["matriz_confusao"]
        cols = [sum(row[i] for row in matrix) for i in range(len(matrix[0]))]
        if sum(cols) != len(corpus):
            add("matriz_total", "bloqueador", "Matriz de confusão não cobre o corpus.", name)
        if sum(v > 0 for v in cols) == 1:
            collapsed.append(name)
    if collapsed:
        add("classificacao_colapsada", "aviso", "Combinações preveem uma única classe; comparar com DummyClassifier.", collapsed)
    counts = distribution.values()
    majority = max(counts) / len(corpus) if corpus else 0
    manifest = {
        "schema": 1,
        "ids_ordenados": ids,
        "sha256_textos": hashlib.sha256(json.dumps([(str(c["id"]), c["texto"]) for c in corpus], ensure_ascii=False, separators=(",", ":")).encode()).hexdigest(),
        "sha256_rotulos": hashlib.sha256(json.dumps([(str(c["id"]), rotulo(c)) for c in corpus], ensure_ascii=False, separators=(",", ":")).encode()).hexdigest(),
    }
    return {"validacao_concluida": True, "apto_para_conclusoes": not any(f["nivel"] == "bloqueador" for f in findings), "nota": "Verificação automática não substitui adjudicação e revisão científica.", "corpus": {"n": len(corpus), "distribuicao": dict(distribution), "n_automaticos": n_auto}, "manifesto": manifest, "baseline_majoritario": {"acuracia": majority, "f1_macro": 2 * majority / (1 + majority) / len(distribution) if distribution else 0}, "achados": findings, "rankings": rankings}


def preparar_revisao(base, destination):
    """Formulário novo, sem rótulo anterior, categoria ou ranking para evitar ancoragem."""
    destination = Path(destination)
    corpus = ler_json(Path(base) / "data" / "curriculos_piloto.json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("x", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["id", "texto", "rotulo_revisor", "justificativa", "anotador", "data_revisao", "grupo_documental"])
        writer.writeheader()
        writer.writerows({"id": c["id"], "texto": c["texto"]} for c in corpus)


def exigir_preflight(base=BASE):
    result = auditar(base, somente_dados=True)
    # Resultados antigos podem estar desatualizados justamente por uma correção
    # do corpus. Não criar um ciclo em que recalcular exija resultados já novos.
    dataset_codes = {"ids_duplicados", "texto_vazio", "rotulos_invalidos", "folds_classe_rara",
                     "rotulos_automaticos", "revisao_invalida", "revisao_nao_adjudicada",
                     "documentos_proximos", "split_ids_invalidos", "particoes_inconsistentes",
                     "proximos_entre_particoes"}
    blockers = [f["codigo"] for f in result["achados"] if f["codigo"] in dataset_codes]
    if blockers:
        raise SystemExit("Execução experimental bloqueada pelo preflight: " + ", ".join(blockers)
                         + ". Consulte VALIDACAO_PRATICA_CHECKLIST.md; nenhum rótulo foi corrigido automaticamente.")


def atualizar_status_ui(base=BASE):
    """Publicação explícita de proveniência/status; não modifica métricas ou rótulos."""
    base = Path(base)
    result = auditar(base)
    corpus = ler_json(base / "data" / "curriculos_piloto.json")
    reviewed = {r["id"]: r.get("rotulo_revisado", "").strip() for r in ler_csv(base / "data" / "amostra_revisao.csv")}
    provenance = {str(c["id"]): {"anotacaoAutomatica": bool(c.get("anotacaoAutomatica")),
                  "revisaoPendente": bool(reviewed.get(str(c["id"])) and reviewed[str(c["id"])] != rotulo(c))} for c in corpus}
    ui = base.parent / "aplicacao_mockup" / "src" / "data"
    gravar_json_atomico(ui / "origemRotulos.json", provenance)
    gravar_json_atomico(ui / "validacaoExperimento.json", {
        "aptoParaConclusoes": result["apto_para_conclusoes"], "manifesto": result["manifesto"],
        "bloqueios": [f["codigo"] for f in result["achados"] if f["nivel"] == "bloqueador"],
        "mensagem": "Resultados publicados antes da validação final. Há rótulos e documentos semelhantes pendentes de revisão; os números exibidos não foram recalculados.",
    })
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", type=Path, default=BASE)
    parser.add_argument("--folds", type=int, default=5)
    parser.add_argument("--saida", type=Path)
    parser.add_argument("--preparar-revisao", type=Path)
    parser.add_argument("--publicar-status-ui", action="store_true", help="Atualiza explicitamente apenas status/proveniência na UI.")
    args = parser.parse_args(argv)
    if args.preparar_revisao:
        preparar_revisao(args.base, args.preparar_revisao)
        print(f"Formulário sem rótulos prévios: {args.preparar_revisao}")
    result = atualizar_status_ui(args.base) if args.publicar_status_ui else auditar(args.base, args.folds)
    if args.saida:
        gravar_json_atomico(args.saida, result)
    blockers = [f for f in result["achados"] if f["nivel"] == "bloqueador"]
    print(f"Corpus: {result['corpus']['n']} | Bloqueios científicos/integridade: {len(blockers)}")
    for finding in result["achados"]:
        print(f"[{finding['nivel']}] {finding['codigo']}: {finding['mensagem']}")
    return 2 if blockers else 0


if __name__ == "__main__":
    raise SystemExit(main())
