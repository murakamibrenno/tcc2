"""Aplica o protocolo lexical aos 2.484 currículos da base archive.

Não altera curriculos_piloto.json. Os 20 rótulos manuais do piloto
substituem a regra quando o id coincide.

Uso:
  python rotular_base_completa.py
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

import pandas as pd

from anotar_automatico import classificar
from expandir_corpus_auto import extrair_titulo, limpar_texto, resolver_txt

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
CATALOGO = DATA / "catalogo_archive.csv"
PILOTO = DATA / "curriculos_piloto.json"
JSON_OUT = DATA / "curriculos_completo.json"
CSV_OUT = DATA / "rotulos_base_completa.csv"
META_OUT = DATA / "corpus_completo_meta.json"


def main() -> None:
    cat = pd.read_csv(CATALOGO, encoding="utf-8-sig", dtype=str).fillna("")
    manuais = {}
    if PILOTO.exists():
        for c in json.loads(PILOTO.read_text(encoding="utf-8")):
            if not c.get("anotacaoAutomatica"):
                manuais[str(c["id"])] = c

    curriculos = []
    linhas = []
    stats = {"Adequado": 0, "Parcialmente Adequado": 0, "Inadequado": 0}
    sem_texto = 0
    override = 0

    for row in cat.to_dict(orient="records"):
        cid = str(row["id"]).strip()
        caminho = resolver_txt(row)
        if caminho is None:
            sem_texto += 1
            continue
        bruto = caminho.read_text(encoding="utf-8", errors="replace")
        titulo = extrair_titulo(bruto, row.get("titulo_detectado", ""))
        texto = limpar_texto(bruto)
        res = classificar(row.get("categoria", ""), texto, titulo)
        classe = res.classe
        observacao = res.observacao
        automatica = True
        if cid in manuais:
            classe = manuais[cid].get("classificacaoManualConfirmada") or classe
            observacao = manuais[cid].get("observacao") or observacao
            automatica = False
            override += 1
        stats[classe] = stats.get(classe, 0) + 1
        curriculos.append(
            {
                "id": cid,
                "nome": titulo,
                "categoria_origem": row.get("categoria", ""),
                "arquivo_txt": str(caminho),
                "classificacaoManualReferencia": "",
                "classificacaoManualConfirmada": classe,
                "observacao": observacao,
                "texto": texto,
                "anotacaoAutomatica": automatica,
                "criteriosAuto": {
                    "sql": res.sql,
                    "rest": res.rest,
                    "git": res.git,
                    "lang": res.lang,
                    "total": res.total,
                },
            }
        )
        linhas.append(
            {
                "id": cid,
                "categoria": row.get("categoria", ""),
                "titulo": titulo,
                "sql": int(res.sql),
                "rest": int(res.rest),
                "git": int(res.git),
                "lang": int(res.lang),
                "total": res.total,
                "rotulo": classe,
                "manual": int(not automatica),
                "observacao": observacao,
            }
        )

    JSON_OUT.write_text(json.dumps(curriculos, ensure_ascii=False), encoding="utf-8")
    with CSV_OUT.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(linhas[0].keys()))
        w.writeheader()
        w.writerows(linhas)
    meta = {
        "total": len(curriculos),
        "sem_texto": sem_texto,
        "rotulos_manuais_preservados": override,
        "anotacao": "regra lexical do protocolo; 20 manuais do piloto preservados",
        "distribuicao": stats,
        "fonte": CATALOGO.name,
        "nota": (
            "A pasta da base força Inadequado fora de information-technology. "
            "A amostra de 20 concordou em 95%; a divergência conhecida é o id 21297521."
        ),
    }
    META_OUT.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
