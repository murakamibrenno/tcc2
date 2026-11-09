"""
Mede tempo de treino e inferência (CV 5-fold) e pico de RSS no ajuste.
Reutiliza embeddings em cache; não chama encode_llm.

Saida:
  output/custo_classificacao.json
  Atualiza metricasReais.json (tempos e memoria; preserva F1 publicado)

Uso:
  python custo_classificacao.py
"""

from __future__ import annotations

import json
import time
from copy import deepcopy
from pathlib import Path

import numpy as np
import pandas as pd
import psutil
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from xgboost import XGBClassifier

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"
MAX_CHARS = 8000
MIB = 1024**2

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

REP_KEYS = [
    ("TF-IDF", "tfidf"),
    ("Sentence-Transformers", "st"),
    ("LLM Embeddings", "llm"),
]


def trunc(t: str) -> str:
    t = (t or "").strip()
    return t[:MAX_CHARS] if len(t) > MAX_CHARS else t


def rss_mib() -> float:
    return psutil.Process().memory_info().rss / MIB


def medir_fold_pipeline(pipe, textos: list[str], y_tr, y_te, tr_idx, te_idx):
    texto_tr = [textos[i] for i in tr_idx]
    texto_te = [textos[i] for i in te_idx]
    proc = psutil.Process()
    rss_antes = proc.memory_info().rss
    pico = rss_antes
    t0_fit = time.perf_counter()
    pipe.fit(texto_tr, y_tr)
    t_fit = time.perf_counter() - t0_fit
    pico = max(pico, proc.memory_info().rss)
    t0_inf = time.perf_counter()
    pred = pipe.predict(texto_te)
    pipe.predict_proba(texto_te)
    t_inf = time.perf_counter() - t0_inf
    pico = max(pico, proc.memory_info().rss)
    return pred, t_fit, t_inf, pico / MIB, round((pico - rss_antes) / MIB, 3)


def medir_fold_clf(clf, X_tr, y_tr, X_te):
    proc = psutil.Process()
    rss_antes = proc.memory_info().rss
    pico = rss_antes
    t0_fit = time.perf_counter()
    clf.fit(X_tr, y_tr)
    t_fit = time.perf_counter() - t0_fit
    pico = max(pico, proc.memory_info().rss)
    t0_inf = time.perf_counter()
    pred = clf.predict(X_te)
    clf.predict_proba(X_te)
    t_inf = time.perf_counter() - t0_inf
    pico = max(pico, proc.memory_info().rss)
    return pred, t_fit, t_inf, pico / MIB, round((pico - rss_antes) / MIB, 3)


def cv_metricas_tempos(estimator, X, y, textos: list[str] | None = None) -> dict:
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    preds = np.zeros(len(y), dtype=int)
    t_fit = 0.0
    t_inf = 0.0
    pico_mib = 0.0
    delta_mib = 0.0

    for tr, te in cv.split(np.arange(len(y)), y):
        if textos is not None:
            pipe = deepcopy(estimator)
            pred, tf, ti, pm, dm = medir_fold_pipeline(pipe, textos, y[tr], y[te], tr, te)
        else:
            clf = deepcopy(estimator)
            pred, tf, ti, pm, dm = medir_fold_clf(clf, X[tr], y[tr], X[te])
        preds[te] = pred
        t_fit += tf
        t_inf += ti
        pico_mib = max(pico_mib, pm)
        delta_mib = max(delta_mib, dm)

    f1 = round(float(f1_score(y, preds, average="macro")), 4)
    return {
        "f1_macro_cv": f1,
        "tempo_treino_seg": round(t_fit, 3),
        "tempo_inferencia_seg": round(t_inf, 3),
        "memoria_rss_pico_mib": round(pico_mib, 2),
        "memoria_rss_delta_mib": delta_mib,
    }


def id_combo(rep_key: str, clf: str) -> str:
    clf_key = {"Regressao Logistica": "lr", "SVM": "svm", "XGBoost": "xgb"}[clf]
    return f"{rep_key}_{clf_key}"


def _tempos_vetorizacao_protocolo(meta: dict) -> dict[str, float]:
    mv = meta.get("memoriaVetorizacao") or {}
    por_bloco = {
        "tfidf": (mv.get("tfidf") or {}).get("tempo_seg"),
        "st": (mv.get("sentence_transformers") or {}).get("tempo_seg"),
        "llm": (mv.get("llm_embeddings") or {}).get("tempo_seg"),
    }
    out = {k: float(v) for k, v in por_bloco.items() if isinstance(v, (int, float))}
    if len(out) == 3:
        return out
    for item in meta.get("ranking") or []:
        t = item.get("tempo_vetorizacao_seg")
        if not isinstance(t, (int, float)):
            continue
        if item.get("metodo") == "TF-IDF":
            out.setdefault("tfidf", float(t))
        elif item.get("metodo") == "Sentence-Transformers":
            out.setdefault("st", float(t))
        elif item.get("metodo") == "LLM Embeddings":
            out.setdefault("llm", float(t))
    return out


def main():
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    textos = [trunc(c["texto"]) for c in cur]
    labels = [
        c.get("classificacaoManualConfirmada") or c.get("classificacaoManualReferencia", "")
        for c in cur
    ]
    le = LabelEncoder()
    y = le.fit_transform(labels)

    csv_ref = OUT / "comparativo_classificacao_rigoroso.csv"
    if not csv_ref.exists():
        raise SystemExit("Rode classificar_rigoroso.py antes ou mantenha o CSV publicado.")
    ref = {row["id"]: row for _, row in pd.read_csv(csv_ref, encoding="utf-8-sig").iterrows()}

    tfidf_pipe_factory = lambda clf: Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=1.0, lowercase=True)),
            ("clf", clf),
        ]
    )

    combinacoes = []
    for clf_nome, clf_factory in CLASSIFICADORES:
        cid = id_combo("tfidf", clf_nome)
        pipe = tfidf_pipe_factory(clf_factory())
        m = cv_metricas_tempos(pipe, None, y, textos=textos)
        _checar_f1(cid, m["f1_macro_cv"], ref)
        combinacoes.append(
            {
                "id": cid,
                "representacao_key": "tfidf",
                **m,
                "tempo_treino_inferencia_seg_legado": float(ref[cid]["tempo_treino_inferencia_seg"]),
            }
        )

    X_st = np.load(OUT / "cache_st.npy")
    X_llm = np.load(OUT / "cache_llm" / "19435bd16f833b0f.npy")

    for rep_nome, rep_key, X in [
        ("Sentence-Transformers", "st", X_st),
        ("LLM Embeddings", "llm", X_llm),
    ]:
        for clf_nome, clf_factory in CLASSIFICADORES:
            cid = id_combo(rep_key, clf_nome)
            m = cv_metricas_tempos(clf_factory(), X, y)
            _checar_f1(cid, m["f1_macro_cv"], ref)
            combinacoes.append(
                {
                    "id": cid,
                    "representacao_key": rep_key,
                    **m,
                    "tempo_treino_inferencia_seg_legado": float(ref[cid]["tempo_treino_inferencia_seg"]),
                }
            )

    payload = {
        "unidade_memoria_ajuste": (
            "MiB: acréscimo máximo de RSS do processo Python durante o fit em cada fold (CV 5). "
            "Vetorização medida em memoria_vetorizacao.json (processos separados)."
        ),
        "unidade_tempo": "segundos (soma dos 5 folds)",
        "combinacoes": combinacoes,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "custo_classificacao.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    if UI.exists():
        meta = json.loads(UI.read_text(encoding="utf-8"))
        meta["custoClassificacao"] = payload
        vet_prot = _tempos_vetorizacao_protocolo(meta)

        por_id = {c["id"]: c for c in combinacoes}
        for comb in meta.get("combinacoes9", []):
            dados = por_id.get(comb["id"])
            if not dados:
                continue
            comb["tempoTreinamento"] = dados["tempo_treino_seg"]
            comb["tempoInferencia"] = dados["tempo_inferencia_seg"]
            comb["memoriaRssPicoMib"] = dados["memoria_rss_pico_mib"]
            comb["memoriaRssDeltaMib"] = dados["memoria_rss_delta_mib"]
            comb["tempoTreinoInferenciaLegado"] = dados["tempo_treino_inferencia_seg_legado"]
            rep = comb.get("representacaoKey")
            tv = vet_prot.get(rep, comb.get("tempoVetorizacao", 0) or 0)
            comb["tempoVetorizacao"] = tv
            comb["tempoTotal"] = round(
                float(tv) + dados["tempo_treino_seg"] + dados["tempo_inferencia_seg"], 3
            )

        for linha in meta.get("classificacaoRigorosa", []):
            dados = por_id.get(linha["id"])
            if dados:
                linha["tempo_treino_seg"] = dados["tempo_treino_seg"]
                linha["tempo_inferencia_seg"] = dados["tempo_inferencia_seg"]
                linha["memoria_rss_pico_mib"] = dados["memoria_rss_pico_mib"]
            rep = linha.get("representacao_key")
            if rep in vet_prot:
                linha["tempo_vetorizacao_seg"] = vet_prot[rep]

        meta["geradoEm"] = pd.Timestamp.now().isoformat()
        UI.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(payload, ensure_ascii=False, indent=2))


def _checar_f1(cid: str, obtido: float, ref: dict) -> None:
    esperado = round(float(ref[cid]["f1_macro"]), 4)
    if obtido != esperado:
        raise SystemExit(
            f"F1 divergente em {cid}: obtido {obtido}, esperado {esperado}. Parar sem sobrescrever métricas."
        )
    print(f"  OK F1 {cid}: {obtido}")


if __name__ == "__main__":
    main()
