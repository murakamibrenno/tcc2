"""
Seleciona corpus ampliado + anotacao automatica + monta curriculos_piloto.json.

Default: 100 CVs (60 IT + 40 outras categorias), excluindo piloto original.
Use --incluir-piloto para manter os 20 originais (total = 120).

Uso:
  python expandir_corpus_auto.py
  python expandir_corpus_auto.py --total 80 --incluir-piloto
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

import pandas as pd

from anotar_automatico import classificar

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
TEXT_BASE = BASE.parent / "curriculos_processados" / "cleaned_text_en_readable"
CATALOGO = DATA / "catalogo_archive.csv"
PILOTO_CSV = DATA / "selecao_piloto.csv"
MAX_CHARS = 12000


def limpar_texto(texto: str) -> str:
    texto = re.sub(r"--- PAGE \d+ ---", " ", texto)
    return re.sub(r"\s+", " ", texto).strip()[:MAX_CHARS]


def extrair_titulo(texto_bruto: str, fallback: str = "") -> str:
    if fallback:
        return fallback[:120]
    for linha in texto_bruto.splitlines():
        linha = linha.strip()
        if linha and not linha.startswith("--- PAGE"):
            if linha.lower() not in {"summary", "skills", "experience", "highlights", "work history"}:
                return linha[:120]
    return "Sem titulo"


def resolver_txt(row) -> Path | None:
    caminho = _s(row.get("caminho_txt"))
    if caminho:
        p = Path(caminho)
        if p.exists():
            return p
    cat = _s(row.get("categoria")).lower()
    cid = _s(row.get("id"))
    if cat and cid:
        p = TEXT_BASE / cat / f"{cid}.txt"
        if p.exists():
            return p
    return None


def selecionar_ids(total: int, it_ratio: float, excluir: set[str]) -> pd.DataFrame:
    cat = pd.read_csv(CATALOGO, encoding="utf-8-sig")
    cat["id"] = cat["id"].astype(str)
    cat = cat[~cat["id"].isin(excluir)].copy()
    cat["_txt_path"] = cat.apply(resolver_txt, axis=1)
    cat = cat[cat["_txt_path"].notna()].copy()

    n_it = int(total * it_ratio)
    n_out = total - n_it

    it = cat[cat["categoria"] == "information-technology"].sort_values(
        "hits_backend", ascending=False
    )
    outros = cat[cat["categoria"] != "information-technology"]
    sel_it = it.head(n_it)
    por_cat = outros.groupby("categoria", group_keys=False).apply(
        lambda g: g.sort_values("caracteres", ascending=False).head(max(1, n_out // 23))
    )
    sel_out = por_cat.head(n_out)
    if len(sel_out) < n_out:
        resto = outros[~outros["id"].isin(sel_out["id"])].sort_values("caracteres", ascending=False)
        sel_out = pd.concat([sel_out, resto.head(n_out - len(sel_out))])

    return pd.concat([sel_it, sel_out]).drop_duplicates("id").head(total)


def _s(val, default="") -> str:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return default
    return str(val).strip()


def processar_linha(row: dict) -> dict:
    cid = _s(row["id"])
    txt_path = row.get("_txt_path")
    if isinstance(txt_path, str):
        txt_path = Path(txt_path)
    if not isinstance(txt_path, Path):
        txt_path = resolver_txt(row)
    if not txt_path or not txt_path.exists():
        raise FileNotFoundError(txt_path)
    cat = _s(row.get("categoria")).lower() or txt_path.parent.name
    bruto = txt_path.read_text(encoding="utf-8", errors="ignore")
    texto = limpar_texto(bruto)
    titulo = extrair_titulo(bruto, _s(row.get("titulo_detectado")))
    ann = classificar(cat, texto, titulo)
    return {
        "id": cid,
        "categoria": cat,
        "titulo_detectado": titulo,
        "hits_backend": row.get("hits_backend", ""),
        "incluir": 1,
        "classificacao_referencia": ann.classe,
        "classificacao_confirmada": ann.classe,
        "observacao": f"AUTO: {ann.observacao} | SQL={ann.sql} REST={ann.rest} GIT={ann.git} LANG={ann.lang}",
        "texto": texto,
        "anotacao_automatica": True,
        **ann.as_dict(),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--total", type=int, default=100)
    parser.add_argument("--it-ratio", type=float, default=0.6)
    parser.add_argument("--incluir-piloto", action="store_true", help="Manter 20 CVs manuais + expandir")
    args = parser.parse_args()

    excluir: set[str] = set()
    linhas_csv = []
    curriculos_json = []

    if args.incluir_piloto and PILOTO_CSV.exists():
        with PILOTO_CSV.open(encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                if str(row.get("incluir", "")).strip().lower() in {"1", "sim", "true", "x"}:
                    excluir.add(row["id"].strip())
                    linhas_csv.append(row)
                    # montar json entry from manual
                    cat = row["categoria"].strip().lower()
                    cid = row["id"].strip()
                    bruto = (TEXT_BASE / cat / f"{cid}.txt").read_text(encoding="utf-8", errors="ignore")
                    curriculos_json.append(
                        {
                            "id": cid,
                            "nome": extrair_titulo(bruto),
                            "categoria_origem": cat,
                            "arquivo_txt": str(TEXT_BASE / cat / f"{cid}.txt"),
                            "classificacaoManualReferencia": row.get("classificacao_referencia", ""),
                            "classificacaoManualConfirmada": row.get("classificacao_confirmada", ""),
                            "observacao": row.get("observacao", ""),
                            "texto": limpar_texto(bruto),
                            "anotacaoAutomatica": False,
                        }
                    )
    else:
        excluir = set()

    novos = selecionar_ids(args.total, args.it_ratio, excluir)
    print(f"Selecionados {len(novos)} CVs novos (excluidos {len(excluir)} do piloto manual)")

    stats = {"Adequado": 0, "Parcialmente Adequado": 0, "Inadequado": 0}
    for _, row in novos.iterrows():
        proc = processar_linha(row.to_dict())
        stats[proc["classificacao_confirmada"]] = stats.get(proc["classificacao_confirmada"], 0) + 1
        linhas_csv.append({k: proc[k] for k in [
            "id", "categoria", "titulo_detectado", "hits_backend", "incluir",
            "classificacao_referencia", "classificacao_confirmada", "observacao",
        ]})
        curriculos_json.append(
            {
                "id": proc["id"],
                "nome": proc["titulo_detectado"],
                "categoria_origem": proc["categoria"],
                "arquivo_txt": str(TEXT_BASE / proc["categoria"] / f"{proc['id']}.txt"),
                "classificacaoManualReferencia": proc["classificacao_referencia"],
                "classificacaoManualConfirmada": proc["classificacao_confirmada"],
                "observacao": proc["observacao"],
                "texto": proc["texto"],
                "anotacaoAutomatica": True,
                "criteriosAuto": {
                    "sql": proc["sql"],
                    "rest": proc["rest"],
                    "git": proc["git"],
                    "lang": proc["lang"],
                    "total": proc["total_requisitos"],
                },
            }
        )

    for c in curriculos_json:
        if not args.incluir_piloto or c.get("anotacaoAutomatica"):
            stats[c["classificacaoManualConfirmada"]] = stats.get(c["classificacaoManualConfirmada"], 0)

    # Recompute stats on full set
    stats = {"Adequado": 0, "Parcialmente Adequado": 0, "Inadequado": 0}
    for c in curriculos_json:
        cl = c["classificacaoManualConfirmada"]
        if cl in stats:
            stats[cl] += 1

    csv_path = DATA / f"selecao_corpus_auto_{len(curriculos_json)}.csv"
    json_path = DATA / "curriculos_piloto.json"
    meta_path = DATA / "corpus_meta.json"

    fieldnames = [
        "id", "categoria", "titulo_detectado", "hits_backend", "incluir",
        "classificacao_referencia", "classificacao_confirmada", "observacao",
    ]
    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(linhas_csv)

    json_path.write_text(json.dumps(curriculos_json, ensure_ascii=False, indent=2), encoding="utf-8")
    meta = {
        "total": len(curriculos_json),
        "anotacao": "automatica_heuristica",
        "inclui_piloto_manual": args.incluir_piloto,
        "distribuicao": stats,
        "fonte_csv": csv_path.name,
        "nota": "Anotacao por regras lexicas (protocolo_anotacao.md). Revisar amostra antes da versao final.",
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    ui_meta = BASE.parent / "aplicacao_mockup" / "src" / "data" / "corpusMeta.json"
    ui_meta.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nCorpus montado: {len(curriculos_json)} CVs")
    print(f"  Adequado: {stats['Adequado']}")
    print(f"  Parcialmente Adequado: {stats['Parcialmente Adequado']}")
    print(f"  Inadequado: {stats['Inadequado']}")
    print(f"CSV:  {csv_path}")
    print(f"JSON: {json_path}")
    print(f"Meta: {meta_path}")


if __name__ == "__main__":
    main()
