"""Identidade dos textos e operaÃ§Ãµes de gravaÃ§Ã£o recuperÃ¡veis, sem carregar modelos."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

CACHE_SCHEMA = 2
MAX_CHARS = 8000
BGE_QUERY_PREFIX = "Represent this job posting for retrieval: "


def fingerprint_textos(textos: list[str], modelo: str, **config) -> str:
    """Hash integral e ordenado. RÃ³tulos nÃ£o invalidam vetores de textos iguais."""
    payload = {"schema": CACHE_SCHEMA, "modelo": modelo, "textos": textos, "config": config}
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def gravar_json_atomico(path: Path, payload) -> None:
    """A interrupÃ§Ã£o da escrita nÃ£o deixa o JSON oficial pela metade."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    with tmp.open("w", encoding="utf-8", newline="\n") as out:
        json.dump(payload, out, ensure_ascii=False, indent=2)
        out.write("\n")
        out.flush()
        os.fsync(out.fileno())
    os.replace(tmp, path)
