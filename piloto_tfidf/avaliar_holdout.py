"""Treina nos 60 currículos de treino e mede uma vez nos 20 de teste.

O conjunto de validação não entra no treino nem no teste.
TF-IDF: vocabulário ajustado só no treino.
Embeddings: vetores pré-treinados já congelados; o classificador vê só o treino.

Uso:
  python avaliar_holdout.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from xgboost import XGBClassifier

from classificar_rigoroso import MODEL_ST, MODEL_ST_FB, emb_encode, trunc
from extrair_llm import encode_llm

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"

CLASSIFICADORES = [
    ("Regressao Logistica", lambda: LogisticRegression(max_iter=2000, random_state=42)),
    ("SVM", lambda: SVC(kernel="linear", probability=True, random_state=42)),
    (
        "XGBoost",
        lambda: XGBClassifier(
            n_estimators=50,
            max_depth=3,
            learning_rate=0.1,
            random_state=42,
            eval_metric="mlogloss",
        ),
    ),
]


def metricas(y_true: np.ndarray, pred: np.ndarray, proba: np.ndarray | None) -> dict:
    roc = None
    if proba is not None and len(np.unique(y_true)) > 1:
        try:
            roc = float(roc_auc_score(y_true, proba, multi_class="ovr", average="macro"))
        except ValueError:
            roc = None
    return {
        "f1_macro": round(float(f1_score(y_true, pred, average="macro", zero_division=0)), 4),
        "acuracia": round(float(accuracy_score(y_true, pred)), 4),
        "roc_auc_macro": None if roc is None else round(roc, 4),
        "n_teste": int(len(y_true)),
    }


def avaliar_texto(textos_tr, y_tr, textos_te, y_te, clf):
    pipe = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=1.0, lowercase=True)),
            ("clf", clf),
        ]
    )
    pipe.fit(textos_tr, y_tr)
    pred = pipe.predict(textos_te)
    proba = pipe.predict_proba(textos_te) if hasattr(pipe, "predict_proba") else None
    return metricas(y_te, pred, proba)


def avaliar_vetor(X_tr, y_tr, X_te, y_te, clf):
    clf.fit(X_tr, y_tr)
    pred = clf.predict(X_te)
    proba = clf.predict_proba(X_te) if hasattr(clf, "predict_proba") else None
    return metricas(y_te, pred, proba)


def main():
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    splits = json.loads((DATA / "splits.json").read_text(encoding="utf-8"))
    por_id = {c["id"]: c for c in cur}
    treino = [por_id[i] for i in splits["train"]]
    teste = [por_id[i] for i in splits["test"]]
    textos_tr = [trunc(c["texto"]) for c in treino]
    textos_te = [trunc(c["texto"]) for c in teste]
    rotulos = [c.get("classificacaoManualConfirmada") or "" for c in treino + teste]
    le = LabelEncoder()
    y = le.fit_transform(rotulos)
    y_tr, y_te = y[: len(treino)], y[len(treino) :]

    textos_todos = [trunc(c["texto"]) for c in cur]
    ordem = {c["id"]: n for n, c in enumerate(cur)}
    idx_tr = np.array([ordem[c["id"]] for c in treino])
    idx_te = np.array([ordem[c["id"]] for c in teste])

    X_st, modelo_st, _ = emb_encode(MODEL_ST, MODEL_ST_FB, textos_todos)
    X_llm, modelo_llm, _ = encode_llm(textos_todos)

    linhas = []
    for nome, factory in CLASSIFICADORES:
        m = avaliar_texto(textos_tr, y_tr, textos_te, y_te, factory())
        linhas.append({"representacao": "TF-IDF", "modelo_embedding": "TfidfVectorizer", "classificador": nome, **m})
        m = avaliar_vetor(X_st[idx_tr], y_tr, X_st[idx_te], y_te, factory())
        linhas.append({"representacao": "Sentence-Transformers", "modelo_embedding": modelo_st, "classificador": nome, **m})
        m = avaliar_vetor(X_llm[idx_tr], y_tr, X_llm[idx_te], y_te, factory())
        linhas.append({"representacao": "LLM Embeddings", "modelo_embedding": modelo_llm, "classificador": nome, **m})

    OUT.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(linhas)
    df.to_csv(OUT / "holdout_classificacao.csv", index=False, encoding="utf-8-sig")
    payload = json.loads(UI.read_text(encoding="utf-8")) if UI.exists() else {}
    payload["holdout"] = {
        "n_treino": len(treino),
        "n_validacao_nao_usada": len(splits["val"]),
        "n_teste": len(teste),
        "nota": "Treino nos 60. Teste nos 20, uma vez. Validação de 20 não entra.",
        "linhas": linhas,
    }
    UI.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(df.to_string(index=False))


if __name__ == "__main__":
    main()
