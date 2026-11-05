"""
Correlacao entre rankings TF-IDF, ST e LLM (Spearman, Kendall).
Deslocamento de posicao por curriculo e casos de discordancia.

Uso:
  python correlacao_rankings.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from scipy.stats import kendalltau, spearmanr

BASE = Path(__file__).resolve().parent
OUT = BASE / "output"

RANKINGS = [
    ("TF-IDF", "ranking_tfidf_piloto.csv", "score_tfidf"),
    ("Sentence-Transformers", "ranking_st_piloto.csv", "score_st"),
    ("LLM Embeddings", "ranking_llm_piloto.csv", "score_llm"),
]


def carregar_posicoes() -> pd.DataFrame:
    frames = {}
    for nome, arq, col in RANKINGS:
        df = pd.read_csv(OUT / arq, encoding="utf-8-sig")
        df["id"] = df["id"].astype(str)
        df = df.sort_values(col, ascending=False).reset_index(drop=True)
        df["posicao"] = range(1, len(df) + 1)
        frames[nome] = df.set_index("id")[["posicao", "classificacao_manual", col]]
    ids = sorted(set.intersection(*[set(f.index) for f in frames.values()]))
    merged = pd.DataFrame(index=ids)
    merged.index.name = "id"
    score_cols = {r[0]: r[2] for r in RANKINGS}
    for nome, f in frames.items():
        merged[f"pos_{nome}"] = f.loc[ids, "posicao"]
        merged[f"score_{nome}"] = f.loc[ids, score_cols[nome]]
        if "classe" not in merged.columns:
            merged["classe"] = f.loc[ids, "classificacao_manual"]
    return merged.reset_index()


def main():
    merged = carregar_posicoes()
    metodos = [r[0] for r in RANKINGS]
    pares = []
    for i in range(len(metodos)):
        for j in range(i + 1, len(metodos)):
            a, b = metodos[i], metodos[j]
            rho, p_rho = spearmanr(merged[f"pos_{a}"], merged[f"pos_{b}"])
            tau, p_tau = kendalltau(merged[f"pos_{a}"], merged[f"pos_{b}"])
            pares.append(
                {
                    "metodo_a": a,
                    "metodo_b": b,
                    "spearman_rho": round(float(rho), 4),
                    "spearman_p": round(float(p_rho), 4),
                    "kendall_tau": round(float(tau), 4),
                    "kendall_p": round(float(p_tau), 4),
                }
            )

    desloc = merged.copy()
    for a in metodos:
        for b in metodos:
            if a != b:
                desloc[f"delta_{a}_vs_{b}"] = desloc[f"pos_{a}"] - desloc[f"pos_{b}"]

    # Casos relevantes: adequados e falso positivo
    ids_destaque = ["83816738", "16186411", "26746496", "10138632", "20674668"]
    casos = desloc[desloc["id"].isin(ids_destaque)].copy()

    OUT.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(pares).to_csv(OUT / "correlacao_rankings.csv", index=False, encoding="utf-8-sig")
    desloc.to_csv(OUT / "deslocamento_posicoes_ranking.csv", index=False, encoding="utf-8-sig")
    casos.to_csv(OUT / "casos_destaque_ranking.csv", index=False, encoding="utf-8-sig")

    ui = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"
    payload = json.loads(ui.read_text(encoding="utf-8")) if ui.exists() else {}
    payload["correlacaoRankings"] = pares
    payload["casosDestaqueRanking"] = casos.to_dict(orient="records")
    ui.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Correlacao entre rankings:")
    print(pd.DataFrame(pares).to_string(index=False))
    print("\nCasos destaque:")
    print(casos.to_string(index=False))


if __name__ == "__main__":
    main()
