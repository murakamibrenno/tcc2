> **Roteiro histórico, anterior à validação de 10/11/2026.** Não usar os comandos de recálculo abaixo para retomar uma execução interrompida. Consulte `VALIDACAO_PRATICA_CHECKLIST.md`; o corpus e os números ainda aguardam adjudicação.

# Roteiro demo — Orientador (~5–7 min)

**Antes da demo:**
```powershell
cd piloto_tfidf
.\run_pipeline_demo.ps1    # ~10 min (embeddings ST demoram)

cd ..\aplicacao_mockup
npm run dev
```
→ http://localhost:5173

---

## 0. Contexto rápido (20 s)

- Corpus **100 CVs reais** (archive, inglês): 20 anotados manualmente no TCC1 + **80 com anotação automática** (regras lexicas do protocolo).
- Pipeline completo: **3 representações × 3 classificadores = 9 combinações**.
- Produto: **CurrículoRank** (React) com dados reais exportados do Python.

> **Frase de abertura:** “Implementamos o experimento completo e integramos os resultados na interface — sem depender de dados simulados.”

---

## 1. Problema e objetivo (30 s)

- Triagem manual não escala; currículos heterogêneos.
- Comparar **TF-IDF vs Sentence-Transformers vs LLM Embeddings** (Bi-Encoder BGE) na triagem para vaga de dev backend/web.
- Classificadores: **LR, SVM, XGBoost** sobre cada representação.

---

## 2. Dashboard (45 s)

Rota: `/`

- **100 currículos**, **3 representações**, KPIs reais.
- Gráfico F1: melhor combo na validação cruzada **Sentence-Transformers + XGBoost (F1 macro ≈ 0,61)**. Qwen + XGBoost fica em ≈ 0,57.
- Gráfico tempo: **TF-IDF ~0,05 s** vs ST ~183 s vs Qwen ~1515 s (100 CVs, CPU).

---

## 3. Ranking — ponto forte da demo (2 min)

Rota: `/ranking?vagaId=4` → alternar representação.

| Método | P@5 | NDCG@10 | Sales Manager (falso positivo) |
|--------|-----|---------|--------------------------------|
| **TF-IDF** | 0,60 | 0,70 | **pos. 8** |
| **Sentence-Transformers** | **1,00** | **0,93** | pos. 49 |
| **Qwen 0.5B (extração)** | 0,80 | 0,85 | pos. 91 |

**Mostrar ao vivo:**
1. TF-IDF → Adequado no top, mas Sales Manager ainda alto.
2. ST → top 3 = .NET Developer + Test Automation; Sales cai muito.
3. Qwen → Sales Manager cai para a posição 91. A correlação com o Sentence-Transformers é ρ = 0,63. Os escores ficam espremidos perto de 0,95 porque o vetor não foi treinado para busca.

> **Mensagem:** embeddings densos capturam **semântica**, não só overlap lexical.

---

## 4. Comparativo — 9 combinações (1,5 min)

Rota: `/comparativo`

- Cards verdes: métricas de **ranking reais** (NDCG, P@5, tempo).
- Matriz 3×3 + gráficos: **F1, acurácia, ROC-AUC reais** (classificação rigorosa).
- Destaque da validação cruzada: **Sentence-Transformers + XGBoost** — F1 macro **0,61**.
- Qwen + XGBoost — F1 **0,57** na validação cruzada. No hold-out (20 de teste) esse braço sobe para F1 **0,50** e acurácia **0,85**, com um único Adequado no teste.

---

## 5. Evidência no terminal (45 s)

Abrir no VS Code / terminal:

```
piloto_tfidf/output/comparativo_ranking.csv
piloto_tfidf/output/comparativo_classificacao_rigoroso.csv
piloto_tfidf/output/matrizes_confusao/llm_xgb.csv
piloto_tfidf/data/corpus_meta.json
```

Números batem com a UI (`metricasReais.json`).

---

## 6. Limitações — ser transparente (30 s)

Dizer explicitamente:

1. **80 CVs** anotados por **heurística automática** (keywords SQL/REST/Git/lang) — não revisados manualmente; piloto original (20) sim.
2. Classe **Adequado** tem só **3 exemplos** → desbalanceamento; LR/SVM colapsam (F1 ≈ 0,29).
3. Corpus em **inglês**; versão PT = trocar modelo, mesma pipeline.
4. TF-IDF ranking ainda faz fit no corpus inteiro (vazamento leve); classificação rigorosa usa Pipeline sem vazamento.

---

## 7. Próximos passos pós-demo (30 s)

- Revisão amostral da anotação automática (ou 2º anotador + Kappa).
- Corpus PT ampliado (meta 200+ CVs).
- Hold-out test no split (`data/splits.json`).
- Atualizar Cap. Resultados no `.docx`.

---

## Mensagem-chave (fechamento)

> “O TCC2 saiu do piloto TF-IDF de 20 CVs para um **experimento integrado de 100 CVs**, com **9 combinações**, métricas de ranking e classificação **reais na UI**, e evidência de que **representações densas superam TF-IDF** no ranking semântico — com trade-off de tempo de vetorização.”

---

## Checklist pré-demo

- [ ] `run_pipeline_demo.ps1` executado sem erro
- [ ] `npm run dev` rodando
- [ ] Vaga Piloto com chip verde visível
- [ ] Alternar TF-IDF / ST / LLM no Ranking testado
- [ ] Comparativo carrega sem NaN nos gráficos
- [ ] Saber explicar anotação automática vs manual

---

## Números de bolso (se perguntarem)

| Pergunta | Resposta |
|----------|----------|
| Quantos CVs? | 100 (20 manual + 80 auto) |
| Melhor F1 na CV? | Sentence-Transformers + XGBoost, F1=0,61 |
| Melhor ranking? | Sentence-Transformers, P@5=1,0, NDCG@10≈0,93 |
| Mais rápido? | TF-IDF, ~0,05 s |
| Falso positivo? | Sales Manager: pos. 8 (TF-IDF), 49 (ST), 91 (Qwen) |
| Modelos ST/LLM? | bge-large-en-v1.5 / Qwen2.5-0.5B (extração, não BGE) |
