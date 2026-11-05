"""Gera rankings ST + LLM. Uso: python embeddings_piloto.py [--so-llm]"""
from __future__ import annotations
import argparse, json, shutil, time
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from extrair_llm import encode_llm

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"
MODEL_ST = "BAAI/bge-large-en-v1.5"
MODEL_ST_FALLBACK = "BAAI/bge-base-en-v1.5"
MAX_CHARS = 8000

def carregar_json(p):
    with p.open(encoding="utf-8") as f: return json.load(f)

def truncar(t):
    t = (t or "").strip()
    return t[:MAX_CHARS] if len(t) > MAX_CHARS else t

def carregar_modelo(nome, fallback=None):
    from sentence_transformers import SentenceTransformer
    try:
        print(f"  Carregando: {nome}")
        return SentenceTransformer(nome), nome
    except Exception as e:
        if fallback and fallback != nome:
            print(f"  Fallback {fallback}: {e}")
            return SentenceTransformer(fallback), fallback
        raise

def encode(model, textos):
    return model.encode(textos, normalize_embeddings=True, show_progress_bar=True, batch_size=8)

def ranking(curriculos, sims, score_col):
    linhas = []
    for c, score in zip(curriculos, sims):
        classif = c.get("classificacaoManualConfirmada") or c.get("classificacaoManualReferencia", "")
        linhas.append({"id": c["id"], "nome": c["nome"], "categoria_origem": c.get("categoria_origem", ""),
            score_col: round(float(score), 4), "classificacao_manual": classif})
    df = pd.DataFrame(linhas).sort_values(score_col, ascending=False).reset_index(drop=True)
    df.insert(0, "posicao", df.index + 1)
    return df

def processar(nome, model_id, fallback, vaga_texto, curriculos, score_col, csv_name, query_prefix):
    print(f"\n{'='*60}\n{nome}\n{'='*60}")
    model, usado = carregar_modelo(model_id, fallback)
    textos = [truncar(c["texto"]) for c in curriculos]
    vaga = truncar(vaga_texto)
    t0 = time.perf_counter()
    emb_v = encode(model, [query_prefix + vaga])
    emb_c = encode(model, textos)
    tempo = time.perf_counter() - t0
    sims = cosine_similarity(emb_v, emb_c)[0]
    df = ranking(curriculos, sims, score_col)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_DIR / csv_name, index=False, encoding="utf-8-sig")
    print(df[["posicao","nome",score_col,"classificacao_manual"]].head(8).to_string(index=False))
    print(f"  Modelo: {usado} | Tempo: {tempo:.2f}s | {csv_name}")
    return {"metodo": nome, "modelo": usado, "tempo_vetorizacao_seg": round(tempo,3), "top3_ids": df.head(3)["id"].tolist()}

def processar_llm(vaga_texto, curriculos):
    print(f"\n{'='*60}\nLLM Embeddings (extração, não Sentence-Transformer)\n{'='*60}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    antigo = OUTPUT_DIR / "ranking_llm_piloto.csv"
    arquivo = OUTPUT_DIR / "ranking_bge_base_piloto.csv"
    if antigo.exists() and not arquivo.exists():
        shutil.copy(antigo, arquivo)
        print(f"  Arquivado ranking anterior (BGE base): {arquivo.name}")
    textos = [truncar(c["texto"]) for c in curriculos]
    vaga = truncar(vaga_texto)
    emb_v, usado, t_v = encode_llm([vaga])
    emb_c, _, t_c = encode_llm(textos)
    tempo = t_v + t_c
    sims = cosine_similarity(emb_v, emb_c)[0]
    df = ranking(curriculos, sims, "score_llm")
    df.to_csv(OUTPUT_DIR / "ranking_llm_piloto.csv", index=False, encoding="utf-8-sig")
    print(df[["posicao", "nome", "score_llm", "classificacao_manual"]].head(8).to_string(index=False))
    print(f"  Modelo: {usado} | Tempo: {tempo:.2f}s | ranking_llm_piloto.csv")
    return {
        "metodo": "LLM Embeddings",
        "modelo": usado,
        "protocolo": "ultimo hidden state, media dos tokens, 512 tokens, L2",
        "tempo_vetorizacao_seg": round(tempo, 3),
        "top3_ids": df.head(3)["id"].tolist(),
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--so-llm", action="store_true", help="Recalcula só o braço LLM e preserva o meta do ST")
    args = ap.parse_args()
    vaga = carregar_json(DATA_DIR / "vaga_referencia.json")
    curriculos = carregar_json(DATA_DIR / "curriculos_piloto.json")
    prefix = "Represent this job posting for retrieval: "
    res = []
    if not args.so_llm:
        res.append(processar("Sentence-Transformers", MODEL_ST, MODEL_ST_FALLBACK, vaga["texto"], curriculos, "score_st", "ranking_st_piloto.csv", prefix))
    elif (OUTPUT_DIR / "embeddings_meta.json").exists():
        anteriores = json.loads((OUTPUT_DIR / "embeddings_meta.json").read_text(encoding="utf-8"))
        res.extend([item for item in anteriores if item.get("metodo") != "LLM Embeddings"])
    res.append(processar_llm(vaga["texto"], curriculos))
    with (OUTPUT_DIR / "embeddings_meta.json").open("w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)
    print("\nPróximo: python exportar_piloto_ui.py")

if __name__ == "__main__": main()
