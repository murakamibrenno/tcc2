# Contexto TCC2 — CurrículoRank + Avaliação Comparativa de Representações Textuais

> **Como usar:** cole este arquivo inteiro (ou seções relevantes) como contexto antes de pedir implementação experimental, redação de capítulos ou atualização do `.docx`.  
> **Última atualização:** 06/out/2026 (corpus n=100 + anotação automática)  
> **Status TCC1:** entregue e defendido (jun/2026)  
> **Status TCC2:** experimento EN **n=100** executado, UI integrada, análises estendidas; redação `.docx` pendente

---

## 1. Identificação do trabalho

| Campo | Valor |
|-------|-------|
| **Título** | Avaliação Comparativa de Representações Textuais Aplicadas à Triagem Automatizada de Currículos: TF-IDF, Sentence-Transformers e Embeddings de LLMs |
| **Autor** | Brenno Murakami |
| **Orientador** | Prof. Vilson Francisco Maziero |
| **Instituição** | IFSP — Campus Presidente Epitácio — Bacharelado em Ciência da Computação |
| **Produto** | **CurrículoRank** — protótipo web (React) para visualização de triagem e comparativos |
| **Questão central** | Qual representação textual oferece o melhor equilíbrio entre desempenho, custo computacional e interpretabilidade? |

**Objetivo geral (TCC2):** comparar TF-IDF, Sentence-Transformers e embeddings densos (rotulados na UI como “LLM Embeddings”), combinados com Regressão Logística, SVM e XGBoost (**9 combinações**), avaliando métricas de classificação, ranking, custo e interpretabilidade.

---

## 2. O que o TCC1 já entregou (NÃO reescrever do zero)

### 2.1 Capítulos concluídos no `.docx`

| Cap. | Conteúdo | Status |
|------|----------|--------|
| 1 | Introdução, contextualização RI, objetivos | ✅ Escrito |
| 2 | Fundamentação teórica completa | ✅ Escrito |
| 3 | Metodologia (piloto TF-IDF; ST/LLM em futuro) | ✅ Escrito (**atualizar para passado**) |
| 4 | CurrículoRank + piloto TF-IDF (Tabela 1) | ✅ Escrito (**expandir**) |
| 5 | Considerações parciais + roadmap TCC2 | ✅ Escrito (**substituir por conclusões**) |
| — | Referências (~15 fontes) | ✅ Escrito |

**Arquivo:** `Avaliação Comparativa de Representações Textuais... (1).docx`  
**Defesa:** `Defesa de TCC - Brenno Murakami (1).pdf` (27 slides)

### 2.2 Piloto TCC1 (n=20, referência histórica)

| # | Etapa | Status |
|---|--------|--------|
| 1 | Vaga de referência calibrada ao corpus | ✅ |
| 2 | 20 currículos reais (archive) | ✅ |
| 3 | Anotação **manual** (3 classes, 1 anotador) | ✅ |
| 4 | TF-IDF + similaridade cosseno + ranking | ✅ |

**Evidência TCC1:** 3 Adequados nas posições **1–3** (TF-IDF, n=20). Sales Manager na **5ª posição**.

---

## 3. Decisões metodológicas (TCC2)

| Decisão | Status | Valor |
|---------|--------|-------|
| **Idioma do corpus** | ✅ | **Inglês** (archive) |
| **Tamanho atual** | ✅ | **n=100** (20 manual + 80 auto) |
| **Anotação ampliada** | ✅ Automática | `anotar_automatico.py` — regras lexicas (95% concordância com n=20 manual) |
| **ST** | ✅ | `BAAI/bge-large-en-v1.5` |
| **Embeddings “LLM”** | ✅ | `Qwen/Qwen2.5-0.5B` — último hidden state, média dos tokens, 512 tokens, L2. Não é API e não é BGE. O ranking antigo com `bge-base` ficou em `output/ranking_bge_base_piloto.csv`. |
| **Validação classificação** | ✅ | 5-fold CV estratificado + versão rigorosa (Pipeline TF-IDF sem vazamento) |
| **Split train/val/test** | ✅ | `data/splits.json` (60/20/20 sobre n=100) |
| **Multilíngue / PT** | ⏳ | Trocar modelo; pipeline igual |
| **2º anotador + Kappa** | ⏳ | Revisão amostral da anotação auto |
| **Hold-out test evaluation** | ⏳ | Script dedicado pendente |
| **Corpus PT 200+** | ⏳ | Fase final TCC2 |

**⚠️ Limitações (declarar sempre):**
- **80 CVs** com anotação **heurística**, não revisada manualmente.
- Classe **Adequado**: apenas **3 exemplos** → LR/SVM colapsam (F1 macro ≈ 0,29).
- Desbalanceamento forte: 76 Inadequados, 21 Parciais, 3 Adequados.
- Ranking TF-IDF ainda fita vetorizador no corpus inteiro (vazamento leve no ranking, não na classificação rigorosa).

---

## 4. Modelos

### 4.1 Representações (executadas)

| Papel | Modelo | Script |
|-------|--------|--------|
| TF-IDF | `TfidfVectorizer` (1–2 gramas) | `tfidf_piloto.py` |
| Sentence-Transformers | `BAAI/bge-large-en-v1.5` | `embeddings_piloto.py` |
| Embeddings de LLM | `Qwen/Qwen2.5-0.5B` (extração, ver `extrair_llm.py`) | `embeddings_piloto.py --so-llm` |

### 4.2 Classificadores (executados)

- Regressão Logística (`max_iter=2000`)
- SVM (`kernel="linear"`, `probability=True`)
- XGBoost (`n_estimators=50`, `max_depth=3`)

---

## 5. Matriz experimental 3×3 — resultados atuais (n=100, rigoroso)

| | Regressão Logística | SVM | XGBoost |
|---|:---:|:---:|:---:|
| **TF-IDF** | F1=0,29 | F1=0,29 | F1=0,60 |
| **Sentence-Transformers** | F1=0,29 | F1=0,29 | **F1=0,61** ★ |
| **LLM Embeddings (Qwen)** | F1=0,29 | F1=0,29 | F1=0,57 |

★ **Melhor F1 macro na validação cruzada:** Sentence-Transformers + XGBoost — F1 macro **0,6099**, acurácia **0,78**, ROC-AUC **0,7936**. Qwen + XGBoost ficou em F1 **0,5710** (o 0,76 antigo era o BGE base, não um LLM).

**Fonte:** `output/comparativo_classificacao_rigoroso.csv`

---

## 6. Repositório — scripts principais

```
piloto_tfidf/
├── expandir_corpus_auto.py      ← n=100: seleção + anotação auto ★
├── anotar_automatico.py         ← regras lexicas (protocolo) ★
├── tfidf_piloto.py
├── embeddings_piloto.py
├── exportar_piloto_ui.py
├── avaliar_ranking.py
├── classificar_piloto.py        ← legacy
├── classificar_rigoroso.py      ← ROC-AUC + matrizes confusão ★
├── correlacao_rankings.py
├── interpretabilidade_tfidf.py
├── particionar_dataset.py
├── run_pipeline_demo.ps1        ← one-shot ★
├── data/
│   ├── curriculos_piloto.json   ← 100 CVs ativos
│   ├── corpus_meta.json
│   ├── selecao_corpus_auto_100.csv
│   ├── selecao_piloto.csv       ← 20 originais (manual)
│   └── splits.json
└── output/
    ├── comparativo_ranking.csv
    ├── comparativo_classificacao_rigoroso.csv
    ├── correlacao_rankings.csv
    ├── casos_destaque_ranking.csv
    ├── interpretabilidade_tfidf.json
    └── matrizes_confusao/*.csv

aplicacao_mockup/src/data/
├── pilotoTfidf.json / pilotoSt.json / pilotoLlm.json  (100 candidatos)
├── metricasReais.json
└── corpusMeta.json
```

---

## 7. Dados experimentais (n=100) — referência numérica

### 7.1 Corpus

| Item | Valor |
|------|-------|
| Total | **100 CVs** |
| Anotação manual | 20 (piloto TCC1) |
| Anotação automática | 80 (`expandir_corpus_auto.py`) |
| Adequado | 3 |
| Parcialmente Adequado | 21 |
| Inadequado | 76 |
| Meta | `data/corpus_meta.json` |

### 7.2 Vaga

- **Título:** Junior Software Developer (Backend / Web)
- **Arquivo:** `data/vaga_referencia.json`

### 7.3 Ranking — comparativo (n=100)

| Método | P@5 | P@10 | MAP | NDCG@10 | Sales Mgr (10138632) | Tempo vet. |
|--------|-----|------|-----|---------|----------------------|------------|
| TF-IDF | 0,60 | 0,60 | 0,61 | **0,70** | ⚠️ **pos. 8** | 0,05 s |
| Sentence-Transformers | **1,00** | 0,80 | **1,00** | **0,93** | pos. **49** | 183 s |
| LLM (Qwen 0.5B, mean pool) | 0,80 | **0,90** | 0,59 | 0,85 | pos. **91** | 1515 s |

**Top 3 ST/LLM:** 16186411, 26746496, 83816738 (.NET Developer + Test Automation).

**Interpretação:** TF-IDF perde precisão no top-5 com corpus maior; ST/LLM mantêm P@5=1,0 e empurram falso positivo lexical para pos. 49–55.

### 7.4 Classificação rigorosa (5-fold CV, n=100)

| Combinação | F1 macro | Acurácia | ROC-AUC | Prec. Adequado | Recall Adequado |
|------------|----------|----------|---------|----------------|-----------------|
| TF-IDF + XGB | 0,5978 | 0,75 | 0,7668 | 1,00 | 0,67 |
| **ST + XGB** | **0,6099** | **0,78** | 0,7936 | 1,00 | 0,67 |
| Qwen + XGB | 0,5710 | 0,77 | 0,8238 | 0,50 | 0,67 |
| LR / SVM (todas reps.) | 0,2879 | 0,76 | — | 0,00 | 0,00 |

### 7.5 Correlação entre rankings (Spearman ρ, n=100)

| Par | ρ |
|-----|---|
| TF-IDF × ST | 0,53 |
| TF-IDF × Qwen | 0,52 |
| ST × Qwen | **0,63** |

### 7.6 Casos destaque (Sales Manager + Adequados)

| ID | Classe | Pos TF-IDF | Pos ST | Pos LLM |
|----|--------|------------|--------|---------|
| 83816738 | Adequado | 1 | 3 | 1 |
| 16186411 | Adequado | 5 | 1 | 6 |
| 26746496 | Adequado | 7 | 2 | 7 |
| 10138632 | Inadequado | **8** | 49 | **91** |
| 20674668 | Parcial | 9 | 4 | 2 |

### 7.7 Split train/val/test (n=100)

- Train: 60 (46 Inad. / 13 Parc. / 1 Adeq.)
- Val: 20 (15 / 4 / 1)
- Test: 20 (15 / 4 / 1)
- Arquivo: `data/splits.json`

### 7.8 Referência histórica TCC1 (n=20)

Mantida para comparar evolução. Ver seção 2.2 e `selecao_piloto.csv`. NDCG@10 no piloto pequeno ≈ 0,99 (teto); com n=100 TF-IDF cai para 0,70 — efeito mais realista.

---

## 8. CurrículoRank — status UI

| Componente | Status |
|------------|--------|
| 100 CVs reais na UI | ✅ |
| Rankings TF-IDF / ST / LLM | ✅ |
| Dashboard KPIs + gráficos reais | ✅ |
| Comparativo 9 combinações (F1, ROC-AUC, MAP, NDCG) | ✅ |
| Metodologia / Sobre | ✅ (revisar texto n=100) |
| Backend, upload PDF | ❌ |

**Demo:** ver `ROTEIRO_DEMO_ORIENTADOR.md`

---

## 9. Roadmap — o que falta

### ✅ Concluído

- Corpus n=100 + anotação automática
- Pipeline completo (3 reps + 9 combos)
- Classificação rigorosa + matrizes confusão + ROC-AUC
- Correlação rankings + interpretabilidade TF-IDF
- Split train/val/test
- UI integrada
- Roteiro demo

### ⏳ Pendente (pós-demo / TCC2 final)

1. Revisão amostral anotação automática (ou Kappa com 2º anotador)
2. Avaliação em hold-out test
3. Corpus PT ampliado (200+)
4. Atualizar `.docx` (Metodologia + Resultados + Conclusões)
5. Backend FastAPI (opcional)

---

## 10. Declarações prontas

### 10.1 Evolução TCC1 → TCC2

> O piloto inicial (TCC1) validou TF-IDF com 20 currículos anotados manualmente. O TCC2 ampliou o experimento para 100 currículos da base archive em inglês, integrando Sentence-Transformers e embeddings densos, nove combinações com classificadores supervisionados, e exportação dos resultados para a plataforma CurrículoRank.

### 10.2 Resultados ranking (n=100)

> No corpus de 100 currículos, TF-IDF obteve P@5 de 0,60 e NDCG@10 de 0,70. Sentence-Transformers obteve P@5 de 1,00 e NDCG@10 de 0,93. Embeddings extraídos do Qwen2.5-0.5B (média do último hidden state) obtiveram P@5 de 0,80 e NDCG@10 de 0,85, com vetorização de cerca de 25 minutos em CPU. O currículo inadequado “Sales Manager” saiu da 8ª posição no TF-IDF para a 49ª no Sentence-Transformers e a 91ª no Qwen.

### 10.3 Resultados classificação (n=100)

> Com validação cruzada estratificada 5-fold e TF-IDF sem vazamento de vocabulário (Pipeline), a melhor F1 macro foi Sentence-Transformers + XGBoost (0,61). Qwen + XGBoost ficou em 0,57. Regressão Logística e SVM apresentaram F1 macro de 0,29 em todas as representações, compatível com o desbalanceamento extremo (apenas três currículos adequados). No hold-out (60 treino / 20 teste), Qwen + XGBoost teve F1 macro 0,50 e acurácia 0,85; o teste tem um único Adequado, então esse número é instável.

### 10.4 Anotação automática (transparência)

> Oitenta currículos foram rotulados automaticamente mediante regras lexicas derivadas do protocolo de anotação manual (critérios SQL, REST/web services, Git e linguagem de programação). A concordância com os 20 rótulos manuais do piloto original foi de 95%. Os rótulos automáticos devem ser interpretados como aproximação operacional para experimentação em escala, sujeitos a revisão amostral.

### 10.5 Limitações

> O desbalanceamento de classes, a anotação heurística parcial e o corpus monolíngue limitam a generalização dos resultados. Recomenda-se confirmação em conjunto de teste hold-out, revisão manual de amostra e replicação em corpus em português.

---

## 11. Comandos

```powershell
cd piloto_tfidf
.\run_pipeline_demo.ps1

cd ..\aplicacao_mockup
npm run dev
```

**Build:** `npm run build` ✅

---

## 12. Instruções ao redator / IA

- ✅ Usar números da **seção 7 (n=100)** como resultados principais
- ✅ Manter n=20 como referência histórica TCC1, não como resultado final TCC2
- ✅ Declarar anotação automática dos 80 CVs
- ✅ Citar `ROTEIRO_DEMO_ORIENTADOR.md` para apresentação
- ❌ Não afirmar anotação 100% manual
- ❌ Não usar F1=0,76 sem mencionar desbalanceamento (3 Adequados)
- ❌ Não confundir Bi-Encoder BGE com API OpenAI

---

## 13. Arquivos de apoio

| Arquivo | Uso |
|---------|-----|
| `ROTEIRO_DEMO_ORIENTADOR.md` | Demo 5–7 min |
| `CONTEXTO_IA_INSERCAO_SLIDES.md` | Figuras no `.docx` |
| `piloto_tfidf/data/corpus_meta.json` | Meta do corpus |
| `piloto_tfidf/output/comparativo_ranking.csv` | Ranking consolidado |
| `piloto_tfidf/output/comparativo_classificacao_rigoroso.csv` | Classificação |
| `aplicacao_mockup/src/data/metricasReais.json` | Fonte UI |

---

*Reflete TCC1 defendido + experimento TCC2 n=100 (out/2026).*
