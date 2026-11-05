"""Metricas ranking. Uso: python avaliar_ranking.py"""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
import pandas as pd

BASE = Path(__file__).resolve().parent
OUT = BASE / "output"
REL = {"Adequado": 2, "Parcialmente Adequado": 1, "Inadequado": 0}
RANKINGS = [("TF-IDF","ranking_tfidf_piloto.csv","score_tfidf"),("Sentence-Transformers","ranking_st_piloto.csv","score_st"),("LLM Embeddings","ranking_llm_piloto.csv","score_llm")]

def p_at_k(rels, k):
    top = rels[:k]
    return sum(1 for r in top if r > 0) / k if top else 0.0

def map_score(rels):
    hits = prec = 0
    ps = []
    for i, r in enumerate(rels, 1):
        if r >= 2:
            hits += 1
            ps.append(hits / i)
    return float(np.mean(ps)) if ps else 0.0

def ndcg_at_k(rels, k):
    top = rels[:k]
    dcg = sum((2**r - 1) / np.log2(i + 2) for i, r in enumerate(top))
    ideal = sorted(rels, reverse=True)[:k]
    idcg = sum((2**r - 1) / np.log2(i + 2) for i, r in enumerate(ideal))
    return dcg / idcg if idcg > 0 else 0.0

def avaliar(nome, arq, col):
    p = OUT / arq
    if not p.exists(): return {"metodo": nome, "erro": f"sem {arq}"}
    df = pd.read_csv(p, encoding="utf-8-sig").sort_values(col, ascending=False).reset_index(drop=True)
    rels = [REL.get(str(r).strip(), 0) for r in df["classificacao_manual"]]
    fp = None
    row = df[df["id"].astype(str) == "10138632"]
    if not row.empty: fp = int(row.index[0]) + 1
    return {"metodo": nome, "P@5": round(p_at_k(rels,5),4), "P@10": round(p_at_k(rels,10),4),
        "MAP": round(map_score(rels),4), "NDCG@10": round(ndcg_at_k(rels,10),4), "NDCG@20": round(ndcg_at_k(rels,min(20,len(rels))),4),
        "pos_sales_manager": fp, "top3_ids": df.head(3)["id"].astype(str).tolist()}

def main():
    res = [avaliar(n,a,c) for n,a,c in RANKINGS]
    tempos = {"TF-IDF": 0.05}
    mp = OUT / "embeddings_meta.json"
    if mp.exists():
        for item in json.loads(mp.read_text(encoding="utf-8")):
            if "Sentence" in item["metodo"]: tempos["Sentence-Transformers"] = item["tempo_vetorizacao_seg"]
            if "LLM" in item["metodo"]: tempos["LLM Embeddings"] = item["tempo_vetorizacao_seg"]
    for r in res: r["tempo_vetorizacao_seg"] = tempos.get(r.get("metodo"))
    df = pd.DataFrame(res)
    df.to_csv(OUT / "comparativo_ranking.csv", index=False, encoding="utf-8-sig")
    ui = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"
    payload = json.loads(ui.read_text(encoding="utf-8")) if ui.exists() else {}
    payload["ranking"] = res
    payload["geradoEm"] = pd.Timestamp.now().isoformat()
    ui.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(df.to_string(index=False))

if __name__ == "__main__": main()
