"""Caches com identidade integral, validação estrutural e gravação recuperável."""
from __future__ import annotations

import json
import math
import os
from pathlib import Path

import numpy as np

from protocolo_experimento import CACHE_SCHEMA, gravar_json_atomico


def carregar_vetores(path: Path, meta_path: Path, fingerprint: str, n: int):
    try:
        meta = json.loads(Path(meta_path).read_text(encoding="utf-8"))
        if meta.get("cache_schema") != CACHE_SCHEMA or meta.get("fingerprint") != fingerprint:
            return None
        vectors = np.load(path, allow_pickle=False)
        elapsed = float(meta["tempo_seg"])
        if (vectors.ndim != 2 or vectors.shape[0] != n or vectors.shape[1] < 1
                or list(vectors.shape) != meta.get("shape")
                or not np.isfinite(vectors).all() or not math.isfinite(elapsed) or elapsed < 0):
            return None
        digest = __import__("hashlib").sha256(Path(path).read_bytes()).hexdigest()
        if digest != meta.get("sha256_npy"):
            return None
        return vectors, elapsed
    except (OSError, ValueError, KeyError, TypeError, EOFError):
        return None


def salvar_vetores(path: Path, meta_path: Path, vectors, fingerprint: str, elapsed: float, modelo: str):
    vectors = np.asarray(vectors)
    if vectors.ndim != 2 or not np.isfinite(vectors).all() or not math.isfinite(elapsed) or elapsed < 0:
        raise ValueError("Cache inválido: vetores bidimensionais finitos e tempo não negativo são obrigatórios.")
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    with tmp.open("wb") as file:
        np.save(file, vectors, allow_pickle=False)
        file.flush()
        os.fsync(file.fileno())
    os.replace(tmp, path)
    gravar_json_atomico(meta_path, {
        "cache_schema": CACHE_SCHEMA, "fingerprint": fingerprint,
        "sha256_npy": __import__("hashlib").sha256(path.read_bytes()).hexdigest(),
        "modelo": modelo, "shape": list(vectors.shape), "n": int(vectors.shape[0]),
        "tempo_seg": elapsed,
    })
