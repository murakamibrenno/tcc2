# ESPECIFICAÇÃO TÉCNICA COMPLETA — CurrículoRank (aplicacao_mockup)

**Versão:** v0.1 | **Pacote:** curriculo-rank | **Atualização:** outubro/2026  
**Autor:** Brenno Murakami — IFSP Presidente Epitácio  
**Propósito:** fonte única de verdade sobre o que **FUNCIONA** vs **MOCKUP**

> Atualizado em out/2026. Versão anterior (jun/2026) estava desatualizada (3 vagas fictícias, curriculosMock como principal).

---

## 0. MATRIZ IMPLEMENTADO vs MOCKUP (LEIA PRIMEIRO)

**Legenda:** `[REAL]` pipeline experimental | `[MOCK]` fictício | `[UI]` interface | `[N/A]` inexistente

### 0.1 Por funcionalidade

| Funcionalidade | Status | Detalhe |
|----------------|--------|---------|
| SPA React + rotas + layout | `[UI]` ✅ | 8 rotas, sidebar, topbar |
| Extração PDF na interface | `[N/A]` ❌ | Offline: PyMuPDF |
| TF-IDF runtime no browser | `[N/A]` ❌ | Scores em JSON pré-calculado |
| Ranking TF-IDF vaga piloto | `[REAL]` ✅ | `pilotoTfidf.json`, `vagaId=4` |
| 20 CVs archive + anotação | `[REAL]` ✅ | IDs reais, inglês |
| Falso positivo lexical | `[REAL]` ✅ | `marcarFalsosPositivos()` |
| Sentence-Transformers | `[MOCK]` ❌ | `metricasMock.js` |
| LLM Embeddings | `[MOCK]` ❌ | idem |
| LR / SVM / XGBoost | `[MOCK]` ❌ | 9 combinações simuladas |
| F1, MAP, NDCG na UI | `[MOCK]` ❌ | Valores 0.72–0.87 fictícios |
| Dashboard Top 5 | `[REAL]` ✅ | `getTop5Candidatos()` |
| Dashboard KPIs / gráficos F1 | `[MOCK]` ❌ | `metricasMock` |
| Página Comparativo | `[MOCK]` ❌ | 100% simulado |
| Backend / upload / auth | `[N/A]` ❌ | — |
| `curriculosMock.js` | ÓRFÃO | Existe, **não importado** |

### 0.2 Por rota

| Rota | UI | Dados | Real/Mock |
|------|----|-------|-----------|
| `/dashboard` | ✅ | rankingUtils + metricasMock | **Híbrido** |
| `/vagas` | ✅ | vagasMock (só id=4) | Meta real |
| `/curriculos` | ✅ | pilotoTfidf.json | **100% REAL** |
| `/ranking?vagaId=4` | ✅ | pilotoTfidf.json | **REAL** |
| `/ranking` (outro id) | ✅ | — | Lista vazia |
| `/comparativo` | ✅ | metricasMock.js | **100% MOCK** |
| `/metodologia` | ✅ | JSX estático | Status parcial desatualizado |
| `/sobre` | ✅ | JSX estático | Fora do menu |

### 0.3 Arquivos `src/data/`

| Arquivo | Usado | Tipo |
|---------|-------|------|
| `pilotoTfidf.json` | Sim | **REAL** — 20 CVs, scores cosseno, anotação |
| `vagasMock.js` | Sim | MIX — apenas vaga piloto id=4 |
| `metricasMock.js` | Sim | **MOCK** — não citar como resultado TCC |
| `curriculosMock.js` | **Não** | MOCK legado PT — órfão |

### 0.4 Pipeline offline → UI

```
montar_piloto_archive.py → tfidf_piloto.py → exportar_piloto_ui.py
    → src/data/pilotoTfidf.json → rankingUtils.js → UI
```

---

## 1. Contexto acadêmico

**TCC:** Avaliação Comparativa de Representações Textuais… (TF-IDF, ST, LLM Embeddings)

**CurrículoRank:** protótipo para visualizar triagem; Cap. 4 do TCC.

**Regra:** banners verdes / chip "Dados reais · TF-IDF" = piloto; Comparativo = simulado até TCC2.

---

## 2. Stack

React 18, Vite 5, MUI v6, React Router 6, Recharts 2 (Bar + Scatter; **sem RadarChart**).

`npm run dev` → localhost:5173/5174 | Zero HTTP | Zero persistência.

**Pastas:** `pages/` (7), `components/` (10), `data/` (4), `utils/rankingUtils.js`.

---

## 3. Páginas — detalhe

### Dashboard
- **REAL:** Top 5 piloto TF-IDF
- **MOCK:** KPIs Melhor F1, gráficos F1/tempo

### Vagas
- **1 vaga** (id=4 piloto). Spec antiga citava 3 vagas — **incorreto**.

### Currículos
- **100% REAL:** 20 CVs, filtros, modal, scores cosseno 0.05–0.18

### Ranking
- **REAL** só `vagaId=4`. Seletores ST/LLM/modelo são **cosméticos** (ignorados).

### Comparativo
- **100% MOCK.** Melhor combo simulada: LLM+XGB F1=0.87.

### Metodologia
- Timeline 7 etapas. Etapas 1–6 marcadas "Pendente" na UI, mas 1–4 parcialmente feitas **offline**.

### Sobre
- Lista "Gráfico radar" — **não implementado** (erro em Sobre.jsx).

---

## 4. rankingUtils.js

- `PILOTO_VAGA_ID = 4`
- `getRankingParaVaga(id)` → piloto ou `[]`
- `getAderenciaPiloto()` → cores por **anotação manual**, não por score 0.6/0.8
- `marcarFalsosPositivos()` → Sales Manager (pos 5) destacado

---

## 5. Dados reais do piloto

| Pos | ID | Score | Classe |
|-----|-----|-------|--------|
| 1 | 83816738 | 0.1840 | Adequado |
| 2 | 16186411 | 0.1207 | Adequado |
| 3 | 26746496 | 0.1154 | Adequado |
| 5 | 10138632 | 0.1059 | Inadequado ⚠️ falso positivo |

CSV: `piloto_tfidf/output/ranking_tfidf_piloto.csv`

---

## 6. Implementado ✅

UI completa, piloto TF-IDF integrado, falso positivo, filtros, modais, gráficos (mock), metodologia estática, pipeline Python→JSON.

---

## 7. Não implementado ❌ (TCC2)

Backend FastAPI, upload PDF, ST/LLM/LR/SVM/XGBoost reais, métricas reais na UI, múltiplas vagas reais, PostgreSQL, auth, export PDF, radar chart, dataset PT ≥200.

---

## 8. Evolução TCC2

1. Export JSON por combinação (como `exportar_piloto_ui.py`)
2. Substituir `metricasMock.js`
3. `getRankingParaVaga` respeitar representação+modelo
4. Atualizar Metodologia.jsx e Sobre.jsx

---

## 9. Demo banca

1. `/vagas` → Piloto → Ver ranking  
2. Top 3 Adequados + falso positivo pos 5  
3. `/comparativo` → declarar simulado

---

## 10. Arquivos relacionados

- `CONTEXTO_TCC2_GPT.md`
- `CONTEXTO_IA_INSERCAO_SLIDES.md`
- `piloto_tfidf/exportar_piloto_ui.py`

---

*Fim da especificação v0.1 — out/2026*
