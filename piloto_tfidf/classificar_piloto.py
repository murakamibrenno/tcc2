"""
Classificacao supervisionada — 9 combinacoes (3 representacoes x LR/SVM/XGBoost).

Validacao estratificada 5-fold (20 amostras, 3 classes — resultados preliminares).

Uso:
  python classificar_piloto.py
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from xgboost import XGBClassifier

from extrair_llm import encode_llm

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"

MAX_CHARS = 8000
MODEL_ST = "BAAI/bge-large-en-v1.5"
MODEL_ST_FB = "BAAI/bge-base-en-v1.5"

CORES = {
    ("TF-IDF", "Regressao Logistica"): "#0369A1",
    ("TF-IDF", "SVM"): "#0E7490",
    ("TF-IDF", "XGBoost"): "#0891B2",
    ("Sentence-Transformers", "Regressao Logistica"): "#B45309",
    ("Sentence-Transformers", "SVM"): "#D97706",
    ("Sentence-Transformers", "XGBoost"): "#F59E0B",
    ("LLM Embeddings", "Regressao Logistica"): "#6D28D9",
    ("LLM Embeddings", "SVM"): "#7C3AED",
    ("LLM Embeddings", "XGBoost"): "#8B5CF6",
}

CLASSIFICADORES = [
    ("Regressao Logistica", lambda: LogisticRegression(max_iter=2000, random_state=42)),
    ("SVM", lambda: SVC(kernel="linear", random_state=42)),
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


def trunc(t: str) -> str:
    t = (t or "").strip()
    return t[:MAX_CHARS] if len(t) > MAX_CHARS else t


def emb_st(name: str, fb: str, textos: list[str]) -> tuple[np.ndarray, str, float]:
    from sentence_transformers import SentenceTransformer

    t0 = time.perf_counter()
    try:
        model = SentenceTransformer(name)
        used = name
    except Exception:
        model = SentenceTransformer(fb)
        used = fb
    X = model.encode(textos, normalize_embeddings=True, show_progress_bar=False)
    return X, used, time.perf_counter() - t0


def avaliar_cv(clf, X: np.ndarray, y: np.ndarray) -> dict:
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    t0 = time.perf_counter()
    pred = cross_val_predict(clf, X, y, cv=cv)
    tempo = time.perf_counter() - t0
    return {
        "f1_macro": round(float(f1_score(y, pred, average="macro")), 4),
        "f1_weighted": round(float(f1_score(y, pred, average="weighted")), 4),
        "folds": 5,
        "tempo_treino_inferencia_seg": round(tempo, 3),
    }


def id_combo(rep_key: str, clf: str) -> str:
    clf_key = {"Regressao Logistica": "lr", "SVM": "svm", "XGBoost": "xgb"}[clf]
    return f"{rep_key}_{clf_key}"


def label_curto(rep: str, clf: str) -> str:
    r = {"TF-IDF": "TF-IDF", "Sentence-Transformers": "ST", "LLM Embeddings": "LLM"}[rep]
    c = {"Regressao Logistica": "LR", "SVM": "SVM", "XGBoost": "XGB"}[clf]
    return f"{r} + {c}"


def carregar_ndcg_por_rep() -> dict[str, float]:
    path = OUT / "comparativo_ranking.csv"
    if not path.exists():
        return {}
    df = pd.read_csv(path, encoding="utf-8-sig")
    return {row["metodo"]: float(row["NDCG@10"]) for _, row in df.iterrows()}


def main():
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    textos = [trunc(c["texto"]) for c in cur]
    labels = [
        c.get("classificacaoManualConfirmada") or c.get("classificacaoManualReferencia", "")
        for c in cur
    ]
    y = LabelEncoder().fit_transform(labels)

    representacoes = []

    t0 = time.perf_counter()
    X_tfidf = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=1.0, lowercase=True).fit_transform(
        textos
    ).toarray()
    representacoes.append(
        ("TF-IDF", "tfidf", "TfidfVectorizer", X_tfidf, time.perf_counter() - t0)
    )

    X_st, model_st, t_st = emb_st(MODEL_ST, MODEL_ST_FB, textos)
    representacoes.append(("Sentence-Transformers", "st", model_st, X_st, t_st))

    X_llm, model_llm, t_llm = encode_llm(textos)
    representacoes.append(("LLM Embeddings", "llm", model_llm, X_llm, t_llm))

    ndcg_map = carregar_ndcg_por_rep()
    linhas = []
    combinacoes_ui = []

    for rep_nome, rep_key, emb_nome, X, tempo_vet in representacoes:
        ndcg = ndcg_map.get(rep_nome, None)
        for clf_nome, clf_factory in CLASSIFICADORES:
            metrics = avaliar_cv(clf_factory(), X, y)
            linha = {
                "id": id_combo(rep_key, clf_nome),
                "representacao": rep_nome,
                "representacao_key": rep_key,
                "modelo_embedding": emb_nome,
                "classificador": clf_nome,
                "tempo_vetorizacao_seg": round(tempo_vet, 3),
                **metrics,
            }
            linhas.append(linha)

            tempo_total = round(tempo_vet + metrics["tempo_treino_inferencia_seg"], 3)
            combinacoes_ui.append(
                {
                    "id": linha["id"],
                    "representacao": rep_nome,
                    "representacaoKey": rep_key,
                    "modelo": clf_nome.replace("Regressao Logistica", "Regressão Logística"),
                    "modeloKey": {
                        "Regressao Logistica": "logisticRegression",
                        "SVM": "svm",
                        "XGBoost": "xgboost",
                    }[clf_nome],
                    "labelCurto": label_curto(rep_nome, clf_nome),
                    "cor": CORES.get((rep_nome, clf_nome), "#6B7280"),
                    "f1Score": metrics["f1_macro"],
                    "f1Weighted": metrics["f1_weighted"],
                    "ndcg": ndcg,
                    "tempoVetorizacao": round(tempo_vet, 3),
                    "tempoTreinamento": metrics["tempo_treino_inferencia_seg"],
                    "tempoTotal": tempo_total,
                    "real": True,
                    "observacao": "Resultado real — piloto 20 CVs, 5-fold CV. Dataset pequeno.",
                }
            )

    OUT.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(linhas)
    df.to_csv(OUT / "comparativo_classificacao_9.csv", index=False, encoding="utf-8-sig")
    df.to_csv(OUT / "comparativo_classificacao.csv", index=False, encoding="utf-8-sig")

    payload = json.loads(UI.read_text(encoding="utf-8")) if UI.exists() else {}
    payload["classificacao"] = linhas
    payload["combinacoes9"] = combinacoes_ui
    payload["geradoEm"] = pd.Timestamp.now().isoformat()
    UI.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print("=" * 60)
    print("9 COMBINACOES — Classificacao (5-fold CV)")
    print("=" * 60)
    print(df.to_string(index=False))
    print(f"\nCSV: {OUT / 'comparativo_classificacao_9.csv'}")
    print(f"UI:  {UI}")


if __name__ == "__main__":
    main()
