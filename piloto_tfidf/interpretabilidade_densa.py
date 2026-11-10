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
from classificar_rigoroso import carregar_st_em_cache, trunc, MODEL_ST
from extrair_llm import carregar_llm_em_cache, MODEL_LLM
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"



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
    from validar_experimento import exigir_preflight
    exigir_preflight()
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    if len(cur) != 100:
        raise SystemExit(f"Esperados 100 currículos, encontrados {len(cur)}")

    labels = [
        c.get("classificacaoManualConfirmada") or c.get("classificacaoManualReferencia", "")
        for c in cur
    ]
    le = LabelEncoder()
    y = le.fit_transform(labels)

    textos = [trunc(c["texto"]) for c in cur]
    X_st, _ = carregar_st_em_cache(textos)
    X_llm = carregar_llm_em_cache(textos)

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
            "modelo": MODEL_ST,
            "shape": list(X_st.shape),
            "xgboost_top_dimensoes": ajuste_xgb_indices(X_st, y),
        },
        "llm_embeddings": {
            "modelo": MODEL_LLM,
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
