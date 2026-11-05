"""Embeddings extraídos de um LLM generativo.

Protocolo, alinhado à seção 3.4.3 do artigo:
- modelo: Qwen/Qwen2.5-0.5B (decoder treinado para geração, não Sentence-Transformer)
- camada: último hidden state
- agregação: média dos tokens com attention_mask 1
- normalização: L2
- documento longo: truncar em 512 tokens do tokenizer do próprio modelo

Uso:
  from extrair_llm import encode_llm, MODEL_LLM
"""

from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path

import numpy as np

MODEL_LLM = "Qwen/Qwen2.5-0.5B"
MAX_TOKENS = 512
BATCH_SIZE = 4

BASE = Path(__file__).resolve().parent
CACHE_DIR = BASE / "output" / "cache_llm"


def _chave(textos: list[str], model_id: str, max_tokens: int) -> str:
    h = hashlib.sha256()
    h.update(model_id.encode())
    h.update(str(max_tokens).encode())
    h.update(str(len(textos)).encode())
    for t in textos:
        h.update(str(len(t)).encode())
        h.update((t[:80] if t else "").encode("utf-8", errors="ignore"))
    return h.hexdigest()[:16]


def _carregar_cache(chave: str) -> tuple[np.ndarray, float] | None:
    npz = CACHE_DIR / f"{chave}.npy"
    meta = CACHE_DIR / f"{chave}.json"
    if not npz.exists() or not meta.exists():
        return None
    info = json.loads(meta.read_text(encoding="utf-8"))
    return np.load(npz), float(info["tempo_seg"])


def _salvar_cache(chave: str, vetores: np.ndarray, tempo: float, model_id: str) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    np.save(CACHE_DIR / f"{chave}.npy", vetores)
    (CACHE_DIR / f"{chave}.json").write_text(
        json.dumps({"modelo": model_id, "tempo_seg": round(tempo, 3), "n": int(vetores.shape[0]), "max_tokens": MAX_TOKENS}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def encode_llm(
    textos: list[str],
    model_id: str = MODEL_LLM,
    max_tokens: int = MAX_TOKENS,
    batch_size: int = BATCH_SIZE,
) -> tuple[np.ndarray, str, float]:
    chave = _chave(textos, model_id, max_tokens)
    cache = _carregar_cache(chave)
    if cache is not None:
        vetores, tempo = cache
        print(f"  Cache LLM: {model_id} | {vetores.shape} | {tempo:.1f}s (gravado)")
        return vetores, model_id, tempo

    import torch
    from transformers import AutoModel, AutoTokenizer

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"  Carregando LLM generativo: {model_id} ({device})")
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModel.from_pretrained(model_id)
    model.eval()
    model.to(device)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    blocos: list[np.ndarray] = []
    t0 = time.perf_counter()
    with torch.no_grad():
        for inicio in range(0, len(textos), batch_size):
            lote = textos[inicio : inicio + batch_size]
            batch = tokenizer(
                lote,
                padding=True,
                truncation=True,
                max_length=max_tokens,
                return_tensors="pt",
            )
            batch = {k: v.to(device) for k, v in batch.items()}
            hidden = model(**batch).last_hidden_state
            mask = batch["attention_mask"].unsqueeze(-1).float()
            soma = (hidden * mask).sum(dim=1)
            conta = mask.sum(dim=1).clamp(min=1.0)
            emb = soma / conta
            emb = torch.nn.functional.normalize(emb, p=2, dim=1)
            blocos.append(emb.cpu().numpy().astype(np.float32))
            print(f"    {min(inicio + batch_size, len(textos))}/{len(textos)}")
    tempo = time.perf_counter() - t0
    vetores = np.vstack(blocos)
    _salvar_cache(chave, vetores, tempo, model_id)
    print(f"  LLM: {model_id} | {vetores.shape} | {tempo:.1f}s")
    return vetores, model_id, tempo
