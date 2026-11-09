"""
Diagnóstico de interpretabilidade em representações densas (ST e Qwen).
Usa apenas caches .npy — não carrega transformers.

Uso:
  python interpretabilidade_densa.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"

CACHE_ST = OUT / "cache_st.npy"
CACHE_ST_META = OUT / "cache_st.json"
CACHE_LLM = OUT / "cache_llm" / "19435bd16f833b0f.npy"
CACHE_LLM_META = OUT / "cache_llm" / "19435bd16f833b0f.json"


def ajuste_xgb_indices(X: np.ndarray, y: np.ndarray, n_top: int = 15) -> list[dict]:
    clf = XGBClassifier(
        n_estimators=50,
        max_depth=3,
        learning_rate=0.1,
        random_state=42,
        eval_metric="mlogloss",
    )
    clf.fit(X, y)
    imp = clf.feature_importances_
    ordem = np.argsort(imp)[::-1][:n_top]
    return [
        {
            "dimensao": int(i),
            "importancia": round(float(imp[i]), 6),
            "nota": "Índice do vetor denso; não corresponde a uma palavra.",
        }
        for i in ordem
        if imp[i] > 0
    ]


def main():
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    if len(cur) != 100:
        raise SystemExit(f"Esperados 100 currículos, encontrados {len(cur)}")

    labels = [
        c.get("classificacaoManualConfirmada") or c.get("classificacaoManualReferencia", "")
        for c in cur
    ]
    le = LabelEncoder()
    y = le.fit_transform(labels)

    X_st = np.load(CACHE_ST)
    meta_st = json.loads(CACHE_ST_META.read_text(encoding="utf-8")) if CACHE_ST_META.exists() else {}
    X_llm = np.load(CACHE_LLM)
    meta_llm = json.loads(CACHE_LLM_META.read_text(encoding="utf-8")) if CACHE_LLM_META.exists() else {}

    if X_st.shape[0] != 100:
        raise SystemExit(f"cache_st esperado (100, d), obtido {X_st.shape}")
    if X_llm.shape[0] != 100:
        raise SystemExit(f"cache_llm esperado (100, d), obtido {X_llm.shape}")

    payload = {
        "nota_geral": (
            "Nas representações densas cada dimensão é anônima: não há lista lexical "
            "equivalente ao TF-IDF. A importância do XGBoost abaixo é diagnóstica "
            "(quais índices do vetor o modelo usa), não explicação por termos."
        ),
        "sentence_transformers": {
            "modelo": meta_st.get("modelo", "BAAI/bge-large-en-v1.5"),
            "shape": list(X_st.shape),
            "xgboost_top_dimensoes": ajuste_xgb_indices(X_st, y),
        },
        "llm_embeddings": {
            "modelo": meta_llm.get("modelo", "Qwen/Qwen2.5-0.5B"),
            "protocolo": "ultimo hidden state, media dos tokens, 512 tokens, L2",
            "shape": list(X_llm.shape),
            "xgboost_top_dimensoes": ajuste_xgb_indices(X_llm, y),
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "interpretabilidade_densa.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    if UI.exists():
        meta = json.loads(UI.read_text(encoding="utf-8"))
        meta["interpretabilidadeDensa"] = payload
        UI.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Salvo:", OUT / "interpretabilidade_densa.json")


if __name__ == "__main__":
    main()
