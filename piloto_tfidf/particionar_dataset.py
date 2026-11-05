"""
Particionamento estratificado train/val/test para o piloto (ou corpus ampliado).

Saida: data/splits.json

Uso:
  python particionar_dataset.py
  python particionar_dataset.py --csv data/selecao_corpus_80.csv
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default="selecao_piloto.csv")
    parser.add_argument("--test", type=float, default=0.2)
    parser.add_argument("--val", type=float, default=0.2)
    args = parser.parse_args()

    path = DATA / args.csv
    df = pd.read_csv(path, encoding="utf-8-sig")
    df = df[df["incluir"].astype(str).isin(["1", "True", "true"])].copy()
    label_col = "classificacao_confirmada" if "classificacao_confirmada" in df.columns else "classificacao_referencia"
    df = df[df[label_col].notna() & (df[label_col].astype(str).str.strip() != "")]

    ids = df["id"].astype(str).tolist()
    y = df[label_col].astype(str).tolist()

    train_val_ids, test_ids, train_val_y, test_y = train_test_split(
        ids, y, test_size=args.test, stratify=y, random_state=42
    )
    val_ratio = args.val / (1 - args.test)
    train_ids, val_ids, _, _ = train_test_split(
        train_val_ids, train_val_y, test_size=val_ratio, stratify=train_val_y, random_state=42
    )

    splits = {
        "fonte": str(path.name),
        "total": len(ids),
        "proporcoes": {"train": round(1 - args.test - args.val, 2), "val": args.val, "test": args.test},
        "train": train_ids,
        "val": val_ids,
        "test": test_ids,
        "distribuicao": {
            "train": pd.Series([y[ids.index(i)] for i in train_ids]).value_counts().to_dict(),
            "val": pd.Series([y[ids.index(i)] for i in val_ids]).value_counts().to_dict(),
            "test": pd.Series([y[ids.index(i)] for i in test_ids]).value_counts().to_dict(),
        },
    }

    out = DATA / "splits.json"
    out.write_text(json.dumps(splits, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Split salvo: {out}")
    print(json.dumps(splits["distribuicao"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
