"""Confere cobertura lexical dos TXT contra extração integral já inventariada.

Esta auditoria não confere significado, ordem, negações ou rótulos de aderência.
python conferir_textos_processados.py --textos-root ../curriculos_processados \
    --referencia validation/base_completa/textos_completos.jsonl --saida validation/conferencia_textos.json
"""
from __future__ import annotations
import argparse
import collections
import hashlib
import json
import re
from pathlib import Path
from protocolo_experimento import gravar_json_atomico


def tokens_conferencia(texto):
    texto = re.sub(r"---\s*PAGE\s+\d+\s*---", " ", texto, flags=re.I)
    return re.findall(r"[a-z0-9]+|\+|#", texto.lower())


def comparar_tokens(original, processado):
    a = collections.Counter(tokens_conferencia(original))
    b = collections.Counter(tokens_conferencia(processado))
    total = sum(a.values())
    return {"tokens_pdf": total, "tokens_txt": sum(b.values()),
            "cobertura_tokens_pdf": sum((a & b).values()) / total if total else None,
            "perdas_tokens": dict(a - b)}


def conferir(root, referencia):
    textos = {}
    with referencia.open(encoding="utf-8") as f:
        for line in f:
            row = json.loads(line)
            cid = str(row["id"])
            if cid in textos:
                raise ValueError("ID repetido na referência: " + cid)
            textos[cid] = row["texto"]
    result = {"metodo": "Cobertura de multiconjunto de tokens alfanuméricos, + e #; remove marcadores PAGE.",
              "limitacao": "Não valida significado, ordem ou negações. Alta cobertura não garante fidelidade semântica; conferir original em casos ambíguos.",
              "n_referencia": len(textos), "versoes": {}}
    for folder in ["extracted_text_en", "cleaned_text_en", "cleaned_text_en_readable"]:
        paths = sorted((root / folder).rglob("*.txt"))
        ids = [p.stem for p in paths]
        if len(ids) != len(set(ids)):
            raise ValueError("IDs repetidos em " + folder)
        checks = []
        for p in paths:
            raw = p.read_bytes()
            texto = raw.decode("utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
            item = {"id": p.stem, "caracteres": len(texto), "sha256_txt": hashlib.sha256(raw).hexdigest()}
            if p.stem in textos:
                item.update(comparar_tokens(textos[p.stem], texto))
            else:
                item["sem_referencia"] = True
            checks.append(item)
        scores = [x["cobertura_tokens_pdf"] for x in checks if x.get("cobertura_tokens_pdf") is not None]
        result["versoes"][folder] = {
            "n": len(checks), "ids_ausentes": sorted(set(textos) - set(ids)),
            "ids_extras": sorted(set(ids) - set(textos)),
            "vazios_apos_marcadores": [x["id"] for x in checks if x.get("tokens_txt") == 0],
            "n_cobertura_ao_menos_99": sum(x >= .99 for x in scores),
            "menor_cobertura": min(scores) if scores else None,
            "n_maiores_12000_caracteres": sum(x["caracteres"] > 12000 for x in checks),
            "requer_conferencia": [x for x in checks if x.get("cobertura_tokens_pdf") is not None and x["cobertura_tokens_pdf"] < .99],
        }
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--textos-root", type=Path, required=True)
    parser.add_argument("--referencia", type=Path, required=True)
    parser.add_argument("--saida", type=Path, required=True)
    args = parser.parse_args()
    result = conferir(args.textos_root, args.referencia)
    gravar_json_atomico(args.saida, result)
    print(json.dumps({k: {a: b for a, b in v.items() if a != "requer_conferencia"}
                      for k, v in result["versoes"].items()}, ensure_ascii=True))
