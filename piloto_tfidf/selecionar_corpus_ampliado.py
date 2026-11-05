"""
Seleciona corpus ampliado a partir do catalogo archive para anotacao.

Estrategia default (80 CVs):
  - 40 de information-technology (prioriza hits_backend)
  - 40 de outras categorias (diversidade)
  - Exclui IDs ja usados no piloto n=20

Saida:
  data/selecao_corpus_80.csv  (coluna classificacao_confirmada vazia para anotar)

Uso:
  python selecionar_corpus_ampliado.py
  python selecionar_corpus_ampliado.py --total 100
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
CATALOGO = DATA / "catalogo_archive.csv"
PILOTO = DATA / "selecao_piloto.csv"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--total", type=int, default=80)
    parser.add_argument("--it-ratio", type=float, default=0.5)
    args = parser.parse_args()

    if not CATALOGO.exists():
        raise FileNotFoundError("Execute gerar_catalogo_archive.py primeiro.")

    cat = pd.read_csv(CATALOGO, encoding="utf-8-sig")
    piloto_ids = set()
    if PILOTO.exists():
        p = pd.read_csv(PILOTO, encoding="utf-8-sig")
        piloto_ids = set(p["id"].astype(str))

    cat = cat[~cat["id"].astype(str).isin(piloto_ids)].copy()
    n_it = int(args.total * args.it_ratio)
    n_out = args.total - n_it

    it = cat[cat["categoria"] == "information-technology"].sort_values(
        "hits_backend", ascending=False
    )
    outros = cat[cat["categoria"] != "information-technology"].sort_values("caracteres", ascending=False)

    sel_it = it.head(n_it)
    sel_out = outros.groupby("categoria", group_keys=False).head(max(2, n_out // 20))
    if len(sel_out) < n_out:
        sel_out = pd.concat([sel_out, outros[~outros["id"].isin(sel_out["id"])].head(n_out - len(sel_out))])

    sel = pd.concat([sel_it, sel_out.head(n_out)]).drop_duplicates("id")
    sel = sel.head(args.total)

    out_df = pd.DataFrame(
        {
            "id": sel["id"].astype(str),
            "categoria": sel["categoria"],
            "titulo_detectado": sel["titulo_detectado"],
            "hits_backend": sel["hits_backend"],
            "incluir": 1,
            "classificacao_referencia": "",
            "classificacao_confirmada": "",
            "observacao": sel.apply(
                lambda r: f"IT hits={r['hits_backend']}" if r["categoria"] == "information-technology" else f"NEGATIVO: {r['categoria']}",
                axis=1,
            ),
        }
    )

    dest = DATA / f"selecao_corpus_{args.total}.csv"
    out_df.to_csv(dest, index=False, encoding="utf-8-sig")
    print(f"Selecionados {len(out_df)} CVs -> {dest}")
    print(f"  IT: {(out_df['categoria'] == 'information-technology').sum()}")
    print(f"  Outras categorias: {(out_df['categoria'] != 'information-technology').sum()}")
    print("\nProximo passo: preencher classificacao_confirmada e rodar montar_piloto com novo CSV.")


if __name__ == "__main__":
    main()
