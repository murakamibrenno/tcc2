# CurrículoRank — experimento n=100

Parte prática do TCC. A interface mostra o resultado já calculado. O Python não precisa estar rodando para o orientador olhar.

## O que está comparado

100 currículos em inglês, uma vaga de desenvolvedor backend/web, três representações e nove classificadores (Regressão Logística, SVM, XGBoost).

- TF-IDF
- Sentence-Transformers: `BAAI/bge-large-en-v1.5`
- Embeddings extraídos de `Qwen/Qwen2.5-0.5B` (último hidden state, média dos tokens, 512 tokens, normalização L2). Não é um segundo BGE e não usa API paga.

Vinte rótulos são manuais. Oitenta vêm de regra lexical. A amostra para conferência está em `piloto_tfidf/data/amostra_revisao.csv`.

## Interface

```powershell
cd aplicacao_mockup
npm install
npm run dev
```

Abre em http://127.0.0.1:5173

Para publicar num servidor com nginx, gere a pasta estática e aponte o site para ela:

```powershell
npm run build
```

A pasta é `aplicacao_mockup/dist`. O nginx precisa devolver `index.html` nas rotas do React:

```nginx
root /caminho/aplicacao_mockup/dist;
index index.html;
location / {
    try_files $uri $uri/ /index.html;
}
```

## Recalcular só o braço do Qwen

Não rode `expandir_corpus_auto.py` de novo: ele mexe na seleção dos 100.

```powershell
cd piloto_tfidf
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe embeddings_piloto.py --so-llm
.\.venv\Scripts\python.exe avaliar_ranking.py
.\.venv\Scripts\python.exe exportar_piloto_ui.py
.\.venv\Scripts\python.exe classificar_rigoroso.py
.\.venv\Scripts\python.exe correlacao_rankings.py
.\.venv\Scripts\python.exe avaliar_holdout.py
```

A primeira extração do Qwen em CPU levou cerca de 25 minutos. As seguintes usam o cache em `output/cache_llm/`.
