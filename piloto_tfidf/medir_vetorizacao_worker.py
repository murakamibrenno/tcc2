"""
Medição isolada de vetorização (um processo, uma representação).
Protocolo: RSS inicial → carga (se houver) → vaga + 100 currículos → cosseno vaga × 100.

Uso (chamado pelo orquestrador):
  python medir_vetorizacao_worker.py --repr tfidf|st|llm --saida output/_vet_tf.json
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np
import psutil
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
CACHE_ST = OUT / "cache_st.npy"
CACHE_LLM = OUT / "cache_llm" / "19435bd16f833b0f.npy"
MAX_CHARS = 8000
MIB = 1024**2
MODEL_ST = "BAAI/bge-large-en-v1.5"
MODEL_ST_FB = "BAAI/bge-base-en-v1.5"
MODEL_LLM = "Qwen/Qwen2.5-0.5B"
MAX_TOKENS = 512
BATCH_LLM = 4

PROTOCOLO = (
    "Processo Python novo: RSS inicial; carga do modelo (se denso); "
    "TfidfVectorizer ou encode da vaga + 100 currículos (truncamento 8000); "
    "similaridade de cosseno vaga × cada currículo."
)


def trunc(t: str) -> str:
    t = (t or "").strip()
    return t[:MAX_CHARS] if len(t) > MAX_CHARS else t


def pico_atual(proc: psutil.Process, pico: int) -> int:
    return max(pico, proc.memory_info().rss)


def conferir_cache(novo: np.ndarray, referencia: Path) -> float:
    ref = np.load(referencia)
    if novo.shape != ref.shape:
        raise SystemExit(f"Forma divergente: {novo.shape} vs {ref.shape}")
    diff = float(np.abs(novo.astype(np.float64) - ref.astype(np.float64)).max())
    if diff > 1e-4:
        raise SystemExit(f"Vetores divergem (max abs {diff}). Abortando sem gravar cache.")
    return diff


def carregar_textos() -> tuple[str, list[str]]:
    cur = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    vaga = json.loads((DATA / "vaga_referencia.json").read_text(encoding="utf-8"))
    textos = [trunc(c["texto"]) for c in cur]
    if len(textos) != 100:
        raise SystemExit(f"Esperados 100 currículos, encontrados {len(textos)}")
    return trunc(vaga["texto"]), textos


def medir_tfidf(vaga: str, textos: list[str]) -> dict:
    print("TF-IDF: fit_transform + cosseno...", flush=True)
    proc = psutil.Process()
    rss0 = proc.memory_info().rss
    pico = rss0
    documentos = [vaga] + textos
    t0 = time.perf_counter()
    vec = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=1.0, lowercase=True)
    mat = vec.fit_transform(documentos)
    pico = pico_atual(proc, pico)
    _ = cosine_similarity(mat[0:1], mat[1:])[0]
    pico = pico_atual(proc, pico)
    tempo = time.perf_counter() - t0
    return {
        "representacao": "TF-IDF",
        "metodo_ranking": "TF-IDF",
        "modelo": "TfidfVectorizer(1-2, min_df=1, max_df=1.0, lowercase=True)",
        "tempo_seg": round(tempo, 3),
        "memoria_rss_inicial_mib": round(rss0 / MIB, 2),
        "memoria_rss_pico_mib": round(pico / MIB, 2),
        "memoria_rss_delta_mib": round((pico - rss0) / MIB, 3),
        "n_documentos": len(documentos),
        "cache_conferido": None,
        "cache_max_abs_diff": None,
    }


def medir_st(vaga: str, textos: list[str]) -> dict:
    from sentence_transformers import SentenceTransformer

    print("Sentence-Transformers: carregando modelo...", flush=True)
    proc = psutil.Process()
    rss0 = proc.memory_info().rss
    pico = rss0
    t0 = time.perf_counter()
    try:
        model = SentenceTransformer(MODEL_ST)
        usado = MODEL_ST
    except Exception:
        model = SentenceTransformer(MODEL_ST_FB)
        usado = MODEL_ST_FB
    pico = pico_atual(proc, pico)
    lote = [vaga] + textos
    print("Sentence-Transformers: encode vaga + 100 currículos...", flush=True)
    emb = model.encode(lote, normalize_embeddings=True, show_progress_bar=True)
    pico = pico_atual(proc, pico)
    emb = np.asarray(emb, dtype=np.float32)
    _ = cosine_similarity(emb[0:1], emb[1:])[0]
    pico = pico_atual(proc, pico)
    tempo = time.perf_counter() - t0
    vet_cur = emb[1:]
    diff = conferir_cache(vet_cur, CACHE_ST)
    return {
        "representacao": "Sentence-Transformers",
        "metodo_ranking": "Sentence-Transformers",
        "modelo": usado,
        "tempo_seg": round(tempo, 3),
        "memoria_rss_inicial_mib": round(rss0 / MIB, 2),
        "memoria_rss_pico_mib": round(pico / MIB, 2),
        "memoria_rss_delta_mib": round((pico - rss0) / MIB, 3),
        "shape_curriculos": list(vet_cur.shape),
        "cache_conferido": True,
        "cache_max_abs_diff": round(diff, 6),
    }


def medir_llm(vaga: str, textos: list[str]) -> dict:
    import torch
    from transformers import AutoModel, AutoTokenizer

    proc = psutil.Process()
    rss0 = proc.memory_info().rss
    pico = rss0
    device = "cuda" if torch.cuda.is_available() else "cpu"
    t0 = time.perf_counter()
    print("Qwen: carregando tokenizer...", flush=True)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_LLM)
    pico = pico_atual(proc, pico)
    print("Qwen: carregando pesos (CPU)...", flush=True)
    model = AutoModel.from_pretrained(MODEL_LLM)
    model.eval()
    model.to(device)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    pico = pico_atual(proc, pico)

    lote = [vaga] + textos
    n_lote = len(lote)
    blocos = []
    print(f"Qwen: encode {n_lote} textos em lotes de {BATCH_LLM} (~25–30 min em CPU)...", flush=True)
    with torch.no_grad():
        for inicio in range(0, len(lote), BATCH_LLM):
            fim = min(inicio + BATCH_LLM, n_lote)
            print(f"  lote {inicio + 1}–{fim} / {n_lote}", flush=True)
            parte = lote[inicio : inicio + BATCH_LLM]
            batch = tokenizer(
                parte,
                padding=True,
                truncation=True,
                max_length=MAX_TOKENS,
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
            pico = pico_atual(proc, pico)
    emb = np.vstack(blocos)
    _ = cosine_similarity(emb[0:1], emb[1:])[0]
    pico = pico_atual(proc, pico)
    tempo = time.perf_counter() - t0
    vet_cur = emb[1:]
    diff = conferir_cache(vet_cur, CACHE_LLM)
    return {
        "representacao": "LLM Embeddings",
        "metodo_ranking": "LLM Embeddings",
        "modelo": MODEL_LLM,
        "protocolo_embedding": "ultimo hidden state, media dos tokens, 512 tokens, L2",
        "device": device,
        "tempo_seg": round(tempo, 3),
        "memoria_rss_inicial_mib": round(rss0 / MIB, 2),
        "memoria_rss_pico_mib": round(pico / MIB, 2),
        "memoria_rss_delta_mib": round((pico - rss0) / MIB, 3),
        "shape_curriculos": list(vet_cur.shape),
        "cache_conferido": True,
        "cache_max_abs_diff": round(diff, 6),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repr", required=True, choices=["tfidf", "st", "llm"])
    ap.add_argument("--saida", required=True)
    args = ap.parse_args()
    vaga, textos = carregar_textos()
    if args.repr == "tfidf":
        bloco = medir_tfidf(vaga, textos)
    elif args.repr == "st":
        bloco = medir_st(vaga, textos)
    else:
        bloco = medir_llm(vaga, textos)
    bloco["protocolo_medicao"] = PROTOCOLO
    saida = Path(args.saida)
    saida.parent.mkdir(parents=True, exist_ok=True)
    saida.write_text(json.dumps(bloco, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(bloco, ensure_ascii=False))


if __name__ == "__main__":
    main()
