"""
Interpretabilidade TF-IDF: termos mais associados a cada classe e a vaga.
Saida para subsecao de interpretabilidade no TCC.

Uso:
  python interpretabilidade_tfidf.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"


def main():
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    vaga = json.loads((DATA / "vaga_referencia.json").read_text(encoding="utf-8"))
    textos = [c["texto"][:8000] for c in cur]
    labels = [
        c.get("classificacaoManualConfirmada") or c.get("classificacaoManualReferencia", "")
        for c in cur
    ]
    le = LabelEncoder()
    y = le.fit_transform(labels)

    vec = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=1.0, lowercase=True)
    X = vec.fit_transform(textos)
    feature_names = np.array(vec.get_feature_names_out())

    # Termos da vaga (top TF-IDF vaga vs corpus)
    vaga_vec = vec.transform([vaga["texto"]])
    vaga_scores = vaga_vec.toarray().flatten()
    top_vaga_idx = np.argsort(vaga_scores)[::-1][:25]
    termos_vaga = [
        {"termo": feature_names[i], "score_tfidf_vaga": round(float(vaga_scores[i]), 4)}
        for i in top_vaga_idx
        if vaga_scores[i] > 0
    ]

    # Coeficientes LR por classe (interpretabilidade)
    clf = LogisticRegression(max_iter=2000, random_state=42)
    clf.fit(X, y)
    classes = le.classes_
    termos_por_classe = {}
    for idx, classe in enumerate(classes):
        coef = clf.coef_[idx]
        top_pos = np.argsort(coef)[::-1][:15]
        top_neg = np.argsort(coef)[:15]
        termos_por_classe[classe] = {
            "termos_positivos": [
                {"termo": feature_names[i], "peso": round(float(coef[i]), 4)} for i in top_pos
            ],
            "termos_negativos": [
                {"termo": feature_names[i], "peso": round(float(coef[i]), 4)} for i in top_neg
            ],
        }

    # Frequencia media TF-IDF por classe
    X_dense = X.toarray()
    freq_classe = {}
    for idx, classe in enumerate(classes):
        mask = y == idx
        media = X_dense[mask].mean(axis=0)
        top = np.argsort(media)[::-1][:15]
        freq_classe[classe] = [
            {"termo": feature_names[i], "tfidf_medio": round(float(media[i]), 4)} for i in top if media[i] > 0
        ]

    payload = {
        "termos_vaga_referencia": termos_vaga,
        "termos_por_classe_lr": termos_por_classe,
        "tfidf_medio_por_classe": freq_classe,
        "nota": "LR treinado no corpus piloto completo (n=20) — exploratorio.",
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "interpretabilidade_tfidf.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    pd.DataFrame(termos_vaga).to_csv(OUT / "termos_vaga_tfidf.csv", index=False, encoding="utf-8-sig")

    ui = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"
    if ui.exists():
        meta = json.loads(ui.read_text(encoding="utf-8"))
        meta["interpretabilidadeTfidf"] = payload
        ui.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Termos vaga (top 10):")
    for t in termos_vaga[:10]:
        print(f"  {t['termo']}: {t['score_tfidf_vaga']}")
    print(f"\nSalvo: {OUT / 'interpretabilidade_tfidf.json'}")


if __name__ == "__main__":
    main()
