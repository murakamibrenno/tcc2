"""
Classificacao rigorosa — 9 combinacoes com:
  - TF-IDF dentro de Pipeline (sem vazamento de vocabulario no CV)
  - Embeddings congelados (vetorizacao unica; classificador com CV)
  - Metricas completas: acuracia, P/R por classe, ROC-AUC OvR, matrizes de confusao

Saida:
  output/comparativo_classificacao_rigoroso.csv
  output/matrizes_confusao/{id}.csv
  output/relatorio_classificacao.json

Uso:
  python classificar_rigoroso.py
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from xgboost import XGBClassifier

from extrair_llm import encode_llm

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"
MATRIZ_DIR = OUT / "matrizes_confusao"

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


def trunc(t: str) -> str:
    t = (t or "").strip()
    return t[:MAX_CHARS] if len(t) > MAX_CHARS else t


def emb_encode(name: str, fb: str, textos: list[str]) -> tuple[np.ndarray, str, float]:
    cache = OUT / "cache_st.npy"
    meta_path = OUT / "cache_st.json"
    if cache.exists() and meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        if meta.get("modelo") == name and meta.get("n") == len(textos):
            print(f"  Cache ST: {name}")
            return np.load(cache), name, float(meta["tempo_seg"])

    from sentence_transformers import SentenceTransformer

    t0 = time.perf_counter()
    try:
        model = SentenceTransformer(name)
        used = name
    except Exception:
        model = SentenceTransformer(fb)
        used = fb
    X = model.encode(textos, normalize_embeddings=True, show_progress_bar=False)
    tempo = time.perf_counter() - t0
    OUT.mkdir(parents=True, exist_ok=True)
    np.save(cache, X)
    meta_path.write_text(
        json.dumps({"modelo": used, "tempo_seg": round(tempo, 3), "n": len(textos)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return X, used, tempo


def avaliar_tfidf_pipeline(textos: list[str], y: np.ndarray, clf_factory) -> dict:
    pipe = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=1.0, lowercase=True),
            ),
            ("clf", clf_factory()),
        ]
    )
    return _cv_metricas(pipe, textos, y)


def avaliar_features_cv(X: np.ndarray, y: np.ndarray, clf_factory) -> dict:
    return _cv_metricas(clf_factory(), X, y)


def _cv_metricas(estimator, X, y: np.ndarray) -> dict:
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    t0 = time.perf_counter()
    pred = cross_val_predict(estimator, X, y, cv=cv)
    roc = None
    try:
        proba = cross_val_predict(estimator, X, y, cv=cv, method="predict_proba")
        roc = float(roc_auc_score(y, proba, multi_class="ovr", average="macro"))
    except Exception:
        pass
    tempo = time.perf_counter() - t0
    return _metricas(pred, y, tempo, roc)


def _metricas(pred: np.ndarray, y: np.ndarray, tempo: float, roc: float | None) -> dict:
    labels = sorted(np.unique(y))
    prec, rec, f1, _ = precision_recall_fscore_support(y, pred, labels=labels, zero_division=0)
    report = classification_report(y, pred, output_dict=True, zero_division=0)
    cm = confusion_matrix(y, pred, labels=labels)
    idx_adequado = labels.index(0) if 0 in labels else 0
    return {
        "f1_macro": round(float(f1_score(y, pred, average="macro")), 4),
        "f1_weighted": round(float(f1_score(y, pred, average="weighted")), 4),
        "acuracia": round(float(accuracy_score(y, pred)), 4),
        "roc_auc_macro": round(roc, 4) if roc is not None else None,
        "precision_adequado": round(float(prec[idx_adequado]), 4),
        "recall_adequado": round(float(rec[idx_adequado]), 4),
        "folds": 5,
        "tempo_treino_inferencia_seg": round(tempo, 3),
        "matriz_confusao": cm.tolist(),
        "labels_ordem": [int(x) for x in labels],
        "classification_report": report,
    }


def id_combo(rep_key: str, clf: str) -> str:
    clf_key = {"Regressao Logistica": "lr", "SVM": "svm", "XGBoost": "xgb"}[clf]
    return f"{rep_key}_{clf_key}"


def label_curto(rep: str, clf: str) -> str:
    r = {"TF-IDF": "TF-IDF", "Sentence-Transformers": "ST", "LLM Embeddings": "LLM"}[rep]
    c = {"Regressao Logistica": "LR", "SVM": "SVM", "XGBoost": "XGB"}[clf]
    return f"{r} + {c}"


def carregar_metricas_ranking() -> dict[str, dict]:
    path = OUT / "comparativo_ranking.csv"
    if not path.exists():
        return {}
    df = pd.read_csv(path, encoding="utf-8-sig")
    return {row["metodo"]: row.to_dict() for _, row in df.iterrows()}


def salvar_matriz(combo_id: str, cm: list, labels: list[int], le: LabelEncoder):
    MATRIZ_DIR.mkdir(parents=True, exist_ok=True)
    names = [le.inverse_transform([i])[0] for i in labels]
    pd.DataFrame(cm, index=names, columns=names).to_csv(
        MATRIZ_DIR / f"{combo_id}.csv", encoding="utf-8-sig"
    )


def _registrar(linhas, combinacoes_ui, relatorio, rep_nome, rep_key, emb_nome, clf_nome, tempo_vet, metrics, rank_map, le):
    cid = id_combo(rep_key, clf_nome)
    cm = metrics.pop("matriz_confusao")
    labels_ordem = metrics.pop("labels_ordem")
    report = metrics.pop("classification_report")
    salvar_matriz(cid, cm, labels_ordem, le)

    rank = rank_map.get(rep_nome, {})
    linha = {
        "id": cid,
        "representacao": rep_nome,
        "representacao_key": rep_key,
        "modelo_embedding": emb_nome,
        "classificador": clf_nome,
        "tempo_vetorizacao_seg": round(tempo_vet, 3),
        "sem_vazamento_tfidf": rep_key == "tfidf",
        **metrics,
    }
    linhas.append(linha)
    relatorio["combinacoes"][cid] = {"classification_report": report, "matriz_confusao": cm}

    combinacoes_ui.append(
        {
            "id": cid,
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
            "acuracia": metrics["acuracia"],
            "rocAuc": metrics["roc_auc_macro"],
            "ndcg": rank.get("NDCG@10"),
            "map": rank.get("MAP"),
            "tempoVetorizacao": round(tempo_vet, 3),
            "tempoTreinamento": metrics["tempo_treino_inferencia_seg"],
            "tempoTotal": round(tempo_vet + metrics["tempo_treino_inferencia_seg"], 3),
            "real": True,
            "rigoroso": True,
            "observacao": "CV 5-fold estratificado nos 100 currículos. TF-IDF em Pipeline, sem vazamento de vocabulário. Embeddings de LLM extraídos do Qwen, não de um segundo BGE.",
        }
    )


def main():
    import shutil
    anterior = OUT / "comparativo_classificacao_rigoroso.csv"
    arquivo = OUT / "comparativo_classificacao_rigoroso_bge_base.csv"
    if anterior.exists() and not arquivo.exists():
        shutil.copy(anterior, arquivo)
        print(f"Arquivado classificação anterior (BGE no braço LLM): {arquivo.name}")

    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    textos = [trunc(c["texto"]) for c in cur]
    labels = [
        c.get("classificacaoManualConfirmada") or c.get("classificacaoManualReferencia", "")
        for c in cur
    ]
    le = LabelEncoder()
    y = le.fit_transform(labels)

    rank_map = carregar_metricas_ranking()
    linhas = []
    combinacoes_ui = []
    relatorio = {
        "metodologia": "5-fold CV estratificado; TF-IDF em Pipeline (fit por fold); embeddings congelados",
        "combinacoes": {},
    }

    for clf_nome, clf_factory in CLASSIFICADORES:
        metrics = avaliar_tfidf_pipeline(textos, y, clf_factory)
        _registrar(
            linhas, combinacoes_ui, relatorio,
            "TF-IDF", "tfidf", "TfidfVectorizer", clf_nome, 0.0, metrics, rank_map, le,
        )

    X_st, model_st, t_st = emb_encode(MODEL_ST, MODEL_ST_FB, textos)
    for clf_nome, clf_factory in CLASSIFICADORES:
        metrics = avaliar_features_cv(X_st, y, clf_factory)
        _registrar(
            linhas, combinacoes_ui, relatorio,
            "Sentence-Transformers", "st", model_st, clf_nome, t_st, metrics, rank_map, le,
        )

    X_llm, model_llm, t_llm = encode_llm(textos)
    for clf_nome, clf_factory in CLASSIFICADORES:
        metrics = avaliar_features_cv(X_llm, y, clf_factory)
        _registrar(
            linhas, combinacoes_ui, relatorio,
            "LLM Embeddings", "llm", model_llm, clf_nome, t_llm, metrics, rank_map, le,
        )

    OUT.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(linhas)
    df.to_csv(OUT / "comparativo_classificacao_rigoroso.csv", index=False, encoding="utf-8-sig")
    (OUT / "relatorio_classificacao.json").write_text(
        json.dumps(relatorio, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    payload = json.loads(UI.read_text(encoding="utf-8")) if UI.exists() else {}
    payload["classificacaoRigorosa"] = linhas
    payload["combinacoes9"] = combinacoes_ui
    payload["relatorioClassificacao"] = relatorio
    payload["geradoEm"] = pd.Timestamp.now().isoformat()
    UI.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print("=" * 60)
    print("CLASSIFICACAO RIGOROSA — 9 combinacoes")
    print("=" * 60)
    print(df.to_string(index=False))


if __name__ == "__main__":
    main()
