"""Inventaria e extrai os PDFs completos sem usar rótulos ou executar modelos.

python inventariar_base.py --raiz-pdfs ../archive/data/data --saida validation/base_completa
Os textos integrais locais são escritos em textos_completos.jsonl; não são ground truth.
"""
from __future__ import annotations
import argparse
import collections
import csv
import hashlib
import json
import os
import time
import unicodedata
from pathlib import Path

BASE = Path(__file__).resolve().parent


def hash_texto(texto):
    texto = " ".join(unicodedata.normalize("NFKC", texto).casefold().split())
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def atribuir_grupos(registros):
    """Textos idênticos normalizados e par adjudicado; não detecta toda quase duplicação."""
    parent = {r["id"]: r["id"] for r in registros}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a, b):
        a, b = find(a), find(b)
        parent[max(a, b)] = min(a, b)
    hashes = {}
    for r in registros:
        if r["status"] != "ok":
            continue
        h = r["sha256_texto_normalizado"]
        if h in hashes:
            union(r["id"], hashes[h])
        else:
            hashes[h] = r["id"]
    if {"26746496", "16186411"} <= parent.keys():
        union("26746496", "16186411")
    for r in registros:
        r["grupo_documental"] = "grupo_" + find(r["id"])
    return registros


def executar(raiz_pdfs, saida, catalogo=BASE / "data/catalogo_archive.csv"):
    import pymupdf
    saida.mkdir(parents=True, exist_ok=True)
    with catalogo.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    ids = [str(r["id"]) for r in rows]
    if len(ids) != len(set(ids)):
        raise ValueError("IDs repetidos no catálogo")
    inicio = time.perf_counter()
    registros = []
    tmp = saida / "textos_completos.jsonl.tmp"
    with tmp.open("w", encoding="utf-8", newline="\n") as f:
        for n, r in enumerate(rows, 1):
            cid, categoria = str(r["id"]), r["categoria"]
            relativo = Path(categoria.upper()) / (cid + ".pdf")
            path = raiz_pdfs / relativo
            item = {"id": cid, "categoria_origem": categoria, "pdf_relativo": relativo.as_posix()}
            t0 = time.perf_counter()
            try:
                raw = path.read_bytes()
                with pymupdf.open(stream=raw, filetype="pdf") as doc:
                    texto = "\n".join(p.get_text() for p in doc)
                    item["paginas"] = len(doc)
                item.update(status="ok" if texto.strip() else "texto_vazio",
                            caracteres=len(texto), sha256_pdf=hashlib.sha256(raw).hexdigest(),
                            sha256_texto_normalizado=hash_texto(texto))
                f.write(json.dumps({"id": cid, "texto": texto}, ensure_ascii=False) + "\n")
            except Exception as e:
                item.update(status="erro", erro=type(e).__name__ + ": " + str(e))
            item["segundos_extracao"] = round(time.perf_counter() - t0, 6)
            registros.append(item)
            if n % 250 == 0:
                print(f"PDFs conferidos: {n}/{len(rows)}", flush=True)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, saida / "textos_completos.jsonl")
    atribuir_grupos(registros)
    grupos = collections.defaultdict(list)
    for r in registros:
        grupos[r["grupo_documental"]].append(r["id"])
    payload = {
        "schema": 1, "etapa": "inventario_e_extracao_sem_modelos", "n_documentos": len(rows),
        "status": dict(collections.Counter(r["status"] for r in registros)),
        "categorias": dict(collections.Counter(r["categoria_origem"] for r in registros)),
        "grupos_multiplos": [v for v in grupos.values() if len(v) > 1],
        "segundos_totais": round(time.perf_counter() - inicio, 3),
        "nota": "Não mede desempenho de TF-IDF/BGE/Qwen nem qualidade. Quase duplicação adicional ainda exige triagem. Categoria não é rótulo de aderência.",
        "registros": registros,
    }
    from protocolo_experimento import gravar_json_atomico
    gravar_json_atomico(saida / "inventario.json", payload)
    print(json.dumps({k: v for k, v in payload.items() if k != "registros"}, ensure_ascii=True), flush=True)
    return payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raiz-pdfs", type=Path, required=True)
    parser.add_argument("--saida", type=Path, required=True)
    args = parser.parse_args()
    result = executar(args.raiz_pdfs, args.saida)
    raise SystemExit(0 if result["status"].get("ok", 0) == result["n_documentos"] else 2)
