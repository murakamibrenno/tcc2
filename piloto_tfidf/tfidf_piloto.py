"""
Piloto TF-IDF — Etapa 4 do experimento inicial do TCC.

Lê a vaga de referência e os currículos do piloto, calcula similaridade
cosseno TF-IDF (vaga × currículo) e gera ranking + CSV de saída.

Uso:
  python tfidf_piloto.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"


def carregar_json(caminho: Path):
    with caminho.open(encoding="utf-8") as f:
        return json.load(f)


def main():
    vaga = carregar_json(DATA_DIR / "vaga_referencia.json")
    curriculos = carregar_json(DATA_DIR / "curriculos_piloto.json")

    texto_vaga = vaga["texto"]
    textos_curriculos = [c["texto"] for c in curriculos]

    # TF-IDF: unigramas + bigramas, mínimo 1 documento (piloto pequeno)
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        max_df=1.0,
        lowercase=True,
        strip_accents="unicode",
    )

    documentos = [texto_vaga] + textos_curriculos
    matriz = vectorizer.fit_transform(documentos)

    similaridades = cosine_similarity(matriz[0:1], matriz[1:])[0]

    linhas = []
    for candidato, score in zip(curriculos, similaridades):
        classif = candidato.get("classificacaoManualConfirmada") or candidato.get(
            "classificacaoManualReferencia", ""
        )
        linhas.append(
            {
                "id": candidato["id"],
                "nome": candidato["nome"],
                "categoria_origem": candidato.get("categoria_origem", ""),
                "score_tfidf": round(float(score), 4),
                "classificacao_manual": classif,
                "classificacao_referencia": candidato.get("classificacaoManualReferencia", ""),
                "arquivo_txt": candidato.get("arquivo_txt", ""),
            }
        )

    df = pd.DataFrame(linhas)
    df = df.sort_values("score_tfidf", ascending=False).reset_index(drop=True)
    df.insert(0, "posicao", df.index + 1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    csv_path = OUTPUT_DIR / "ranking_tfidf_piloto.csv"
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")

    # Exportar dataset completo para revisão manual
    dataset_path = OUTPUT_DIR / "dataset_piloto.csv"
    pd.DataFrame(curriculos).to_csv(dataset_path, index=False, encoding="utf-8-sig")

    # Top termos da vaga (interpretabilidade)
    vocab = vectorizer.get_feature_names_out()
    scores_vaga = matriz[0].toarray().flatten()
    top_indices = scores_vaga.argsort()[::-1][:15]
    termos_vaga = [(vocab[i], round(scores_vaga[i], 4)) for i in top_indices if scores_vaga[i] > 0]

    termos_path = OUTPUT_DIR / "termos_tfidf_vaga.txt"
    with termos_path.open("w", encoding="utf-8") as f:
        f.write(f"Vaga: {vaga['titulo']}\n\n")
        f.write("Top 15 termos TF-IDF da vaga de referência:\n")
        for termo, peso in termos_vaga:
            f.write(f"  {termo}: {peso}\n")

    print("=" * 60)
    print("PILOTO TF-IDF — Resultado")
    print("=" * 60)
    print(f"Vaga: {vaga['titulo']}")
    print(f"Currículos analisados: {len(curriculos)}")
    print()
    print(df[["posicao", "nome", "score_tfidf", "classificacao_manual"]].to_string(index=False))
    print()
    print(f"Arquivos gerados em: {OUTPUT_DIR}")
    print(f"  - {csv_path.name}")
    print(f"  - {dataset_path.name}")
    print(f"  - {termos_path.name}")
    print()
    print("Próximo passo manual: compare o ranking com sua anotação em protocolo_anotacao.md")


if __name__ == "__main__":
    main()
