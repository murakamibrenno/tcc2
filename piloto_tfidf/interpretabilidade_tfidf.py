"""
Interpretabilidade TF-IDF nos 100 currículos (ajuste único para leitura lexical).
O F1 publicado permanece o da validação cruzada (min_df=1, sem stop_words).

Uso:
  python interpretabilidade_tfidf.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from protocolo_experimento import MAX_CHARS
import pandas as pd
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from xgboost import XGBClassifier

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"
MIN_DOCS_LISTA = 2
ANO = re.compile(r"^(19|20)\d{2}$")

AVISO_LEITURA = (
    "Os modelos abaixo foram ajustados uma única vez nos 100 currículos para inspeção "
    "de termos. Não são o modelo da validação cruzada de 5 partes que gera o F1 macro. "
    "Com apenas 3 currículos Adequados, a lista é instável e não prova a causa do F1."
)


def trunc(t: str) -> str:
    t = (t or "").strip()
    return t[:MAX_CHARS] if len(t) > MAX_CHARS else t


def termo_exibivel(termo: str, doc_freq: int) -> bool:
    tokens = termo.lower().split()
    if not tokens:
        return False
    if any(t in ENGLISH_STOP_WORDS for t in tokens):
        return False
    if any(ANO.match(t) for t in tokens):
        return False
    if "like" in tokens:
        return False
    if doc_freq < MIN_DOCS_LISTA:
        return False
    return True


def doc_frequencias(X) -> np.ndarray:
    return np.asarray((X > 0).sum(axis=0)).ravel()


def top_com_peso(
    valores: np.ndarray,
    feature_names: np.ndarray,
    doc_freq: np.ndarray,
    n: int = 15,
    decrescente: bool = True,
) -> list[dict]:
    ordem = np.argsort(valores)
    if decrescente:
        ordem = ordem[::-1]
    saida: list[dict] = []
    for i in ordem:
        if len(saida) >= n:
            break
        termo = str(feature_names[i])
        if not termo_exibivel(termo, int(doc_freq[i])):
            continue
        saida.append({"termo": termo, "peso": round(float(valores[i]), 4), "n_docs": int(doc_freq[i])})
    return saida


def top_importancia_xgb(
    importancias: np.ndarray,
    feature_names: np.ndarray,
    doc_freq: np.ndarray,
    n: int = 15,
) -> list[dict]:
    ordem = np.argsort(importancias)[::-1]
    saida: list[dict] = []
    for i in ordem:
        if len(saida) >= n:
            break
        termo = str(feature_names[i])
        if not termo_exibivel(termo, int(doc_freq[i])):
            continue
        saida.append(
            {"termo": termo, "importancia": round(float(importancias[i]), 4), "n_docs": int(doc_freq[i])}
        )
    return saida


def coeficientes_classe(est, classes: np.ndarray, feature_names: np.ndarray, doc_freq: np.ndarray, classe: str) -> dict:
    idx = list(classes).index(classe)
    coef = est.coef_[idx]
    if hasattr(coef, "toarray"):
        coef = coef.toarray().ravel()
    else:
        coef = np.asarray(coef).ravel()
    return {
        "termos_positivos": top_com_peso(coef, feature_names, doc_freq, decrescente=True),
        "termos_negativos": top_com_peso(coef, feature_names, doc_freq, decrescente=False),
    }


def main():
    from validar_experimento import exigir_preflight
    exigir_preflight()
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    vaga = json.loads((DATA / "vaga_referencia.json").read_text(encoding="utf-8"))
    textos = [trunc(c["texto"]) for c in cur]
    labels = [
        c.get("classificacaoManualConfirmada") or c.get("classificacaoManualReferencia", "")
        for c in cur
    ]
    le = LabelEncoder()
    y = le.fit_transform(labels)
    classes = le.classes_

    vec = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=1.0, lowercase=True)
    X = vec.fit_transform(textos)
    feature_names = np.array(vec.get_feature_names_out())
    doc_freq = doc_frequencias(X)

    vaga_vec = vec.transform([vaga["texto"]])
    vaga_scores = vaga_vec.toarray().flatten()
    termos_vaga = []
    for i in np.argsort(vaga_scores)[::-1]:
        if vaga_scores[i] <= 0:
            break
        termo = str(feature_names[i])
        if not termo_exibivel(termo, int(doc_freq[i])):
            continue
        termos_vaga.append({"termo": termo, "score_tfidf_vaga": round(float(vaga_scores[i]), 4)})
        if len(termos_vaga) >= 25:
            break

    lr = LogisticRegression(max_iter=2000, random_state=42)
    lr.fit(X, y)
    svm = SVC(kernel="linear", probability=True, random_state=42)
    svm.fit(X, y)
    xgb = XGBClassifier(
        n_estimators=50,
        max_depth=3,
        learning_rate=0.1,
        random_state=42,
        eval_metric="mlogloss",
    )
    xgb.fit(X, y)

    termos_por_classe_lr = {
        classe: coeficientes_classe(lr, classes, feature_names, doc_freq, classe) for classe in classes
    }
    termos_por_classe_svm = {
        classe: coeficientes_classe(svm, classes, feature_names, doc_freq, classe) for classe in classes
    }

    X_dense = X.toarray()
    freq_classe = {}
    for idx, classe in enumerate(classes):
        mask = y == idx
        media = X_dense[mask].mean(axis=0)
        itens = []
        for i in np.argsort(media)[::-1]:
            if media[i] <= 0:
                break
            termo = str(feature_names[i])
            if not termo_exibivel(termo, int(doc_freq[i])):
                continue
            itens.append({"termo": termo, "tfidf_medio": round(float(media[i]), 4)})
            if len(itens) >= 15:
                break
        freq_classe[classe] = itens

    payload = {
        "corpus_n": len(cur),
        "vetorizador_f1_cv": "TfidfVectorizer(1-2, min_df=1, max_df=1.0, lowercase=True)",
        "filtro_lista_exibida": (
            f"Remove n-grama com qualquer stopword ENGLISH_STOP_WORDS, anos AAAA, token 'like', "
            f"e termos em menos de {MIN_DOCS_LISTA} currículos (só na lista exibida)."
        ),
        "aviso_leitura_tela": AVISO_LEITURA,
        "termos_vaga_referencia": termos_vaga,
        "termos_por_classe_lr": termos_por_classe_lr,
        "termos_por_classe_svm": termos_por_classe_svm,
        "xgboost_importancia_global": {
            "nota": "Importância sem sinal; indica magnitude, não empurra nem afasta da vaga.",
            "top_atributos": top_importancia_xgb(xgb.feature_importances_, feature_names, doc_freq),
        },
        "classe_adequado": {
            "regressao_logistica": termos_por_classe_lr.get("Adequado", {}),
            "svm_linear": termos_por_classe_svm.get("Adequado", {}),
            "xgboost_top": top_importancia_xgb(xgb.feature_importances_, feature_names, doc_freq),
        },
        "tfidf_medio_por_classe": freq_classe,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "interpretabilidade_tfidf.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    pd.DataFrame(termos_vaga).to_csv(OUT / "termos_vaga_tfidf.csv", index=False, encoding="utf-8-sig")

    if UI.exists():
        meta = json.loads(UI.read_text(encoding="utf-8"))
        meta["interpretabilidadeTfidf"] = payload
        meta["geradoEm"] = pd.Timestamp.now().isoformat()
        UI.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(AVISO_LEITURA)
    print(f"\nSalvo: {OUT / 'interpretabilidade_tfidf.json'}")


if __name__ == "__main__":
    main()
