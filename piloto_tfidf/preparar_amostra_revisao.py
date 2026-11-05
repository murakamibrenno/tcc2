"""Sorteia 20 dos currículos com rótulo automático para conferência manual.

A coluna rotulo_revisado fica vazia. Preencha com
Adequado, Parcialmente Adequado ou Inadequado e rode de novo
para gravar a concordância.

Uso:
  python preparar_amostra_revisao.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"
AMOSTRA = DATA / "amostra_revisao.csv"
N = 20
SEED = 42


def main():
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    auto = [c for c in cur if c.get("anotacaoAutomatica")]
    pool = pd.DataFrame(
        {
            "id": [str(c["id"]) for c in auto],
            "nome": [c.get("nome", "") for c in auto],
            "categoria_origem": [c.get("categoria_origem", "") for c in auto],
            "rotulo_automatico": [
                c.get("classificacaoManualConfirmada") or "" for c in auto
            ],
            "trecho": [(c.get("texto") or "")[:500].replace("\n", " ") for c in auto],
        }
    )
    if AMOSTRA.exists():
        anterior = pd.read_csv(AMOSTRA, encoding="utf-8-sig", dtype=str).fillna("")
        anterior["id"] = anterior["id"].str.strip()
        if "rotulo_revisado" not in anterior.columns:
            anterior["rotulo_revisado"] = ""
        cols = ["id", "rotulo_revisado"]
        if "justificativa" in anterior.columns:
            cols.append("justificativa")
        frame = anterior[cols].merge(pool, on="id", how="left")
    else:
        frame = pool.sample(n=min(N, len(pool)), random_state=SEED).copy()
        frame["rotulo_revisado"] = ""

    frame["rotulo_revisado"] = frame["rotulo_revisado"].fillna("").astype(str)
    DATA.mkdir(parents=True, exist_ok=True)
    frame.to_csv(AMOSTRA, index=False, encoding="utf-8-sig")

    preenchidos = frame[frame["rotulo_revisado"].str.strip() != ""]
    concordancia = None
    divergencias = []
    if len(preenchidos) == len(frame) and len(frame) > 0:
        iguais = (
            preenchidos["rotulo_revisado"].str.strip() == preenchidos["rotulo_automatico"].str.strip()
        )
        concordancia = round(float(iguais.sum()) / len(frame), 4)
        for _, row in preenchidos.loc[~iguais].iterrows():
            divergencias.append(
                {
                    "id": row["id"],
                    "nome": row["nome"],
                    "automatico": row["rotulo_automatico"],
                    "revisado": row["rotulo_revisado"].strip(),
                }
            )

    if concordancia is None:
        nota = "Preencha rotulo_revisado e rode este script de novo."
    elif not divergencias:
        nota = "Releitura pelo protocolo, no texto completo. Nenhuma divergência com a regra."
    else:
        itens = "; ".join(
            f"{d['id']} ({d['automatico']} → {d['revisado']})" for d in divergencias
        )
        nota = (
            "Releitura pelo protocolo, no texto completo, sem copiar o regex. "
            f"Divergência: {itens}."
        )

    resumo = {
        "n_automaticos": len(auto),
        "n_amostra": int(len(frame)),
        "n_revisados": int((frame["rotulo_revisado"].str.strip() != "").sum()),
        "concordancia": concordancia,
        "divergencias": divergencias,
        "arquivo": "data/amostra_revisao.csv",
        "nota": nota,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "amostra_revisao_meta.json").write_text(json.dumps(resumo, ensure_ascii=False, indent=2), encoding="utf-8")
    if UI.exists():
        payload = json.loads(UI.read_text(encoding="utf-8"))
        payload["revisaoAmostra"] = resumo
        UI.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(resumo, ensure_ascii=False, indent=2))
    print(f"CSV: {AMOSTRA}")


if __name__ == "__main__":
    main()
