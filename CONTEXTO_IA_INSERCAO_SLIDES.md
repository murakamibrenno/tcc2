# Contexto para IA — Inserção de figuras dos slides no artigo TCC

> **Objetivo:** você receberá **imagens/capturas dos slides** da defesa (`Defesa de TCC - Brenno Murakami (1).pdf`) e o **texto do artigo** (`.docx`). Sua tarefa é **encontrar o local adequado** para cada figura, **inserir a referência ABNT** (Figura N, Fonte) e fazer **ajustes mínimos** no texto — **sem reescrever capítulos**, preservando **coerência** e **cronologia** do documento.

---

## 1. Regras obrigatórias

1. **Não reescreva** parágrafos inteiros. Máximo: 1–2 frases de transição ou legenda se indispensável.
2. **Mantenha a ordem cronológica** do artigo: Intro → Fundamentação → Metodologia → Aplicação → Considerações.
3. **Não duplique** figuras já existentes (ver §4). Prefira **substituir** screenshot antigo ou **inserir após** o parágrafo que a figura ilustra.
4. **Numeração ABNT:** Figura 1, Figura 2… sequencial por ordem de aparição no texto (renumerar lista de figuras se necessário).
5. **Fonte:** slides da defesa → `Fonte: Elaborado pelo autor (2026).` ou `Fonte: Apresentação de defesa do TCC (2026).`
6. **Slides de título/agradecimento** (slides 1, 27): **não inserir** no corpo do artigo.
7. **Slides repetidos** (“Pipeline técnico” — slides 5, 8, 15, 19, 26): usar **apenas uma** instância no capítulo Metodologia (§3.1).
8. Se o slide for **tabela comparativa**, pode virar **Tabela** em vez de Figura — mantenha consistência com o template do curso.

---

## 2. Mapa slide → seção do artigo

Use este mapa como guia principal. Ajuste ±1 parágrafo se o fluxo do `.docx` exigir.

| Slide | Título / conteúdo | Seção destino no `.docx` | Ação sugerida |
|-------|-------------------|--------------------------|---------------|
| 2 | Desafio do volume + Heterogeneidade textual | **1.1 Contextualização** | Inserir após 1º parágrafo sobre volume de candidaturas |
| 3 | Triagem como Recuperação de Informação | **1.1 Contextualização** (final) ou início **2.1** | Inserir antes da transição para representação vetorial |
| 4 | Questão central (desempenho × custo × interpretabilidade) | **1.3 Objetivos** | Inserir após objetivo geral |
| 5 | Pipeline experimental (visão geral) | **3.1 Visão Geral – Pipeline Experimental** | Figura principal do pipeline — **prioridade alta** |
| 6 | Representação esparsa vs densa | **2.2 Representação textual: abordagens esparsas e densas** | Após definição das duas categorias |
| 7 | Representações textuais (vetores) | **2.2** (reforço visual) | Opcional se slide 6 já couber; evitar redundância |
| 8 | Pipeline técnico | **3.1** | **Não repetir** se slide 5 for usado; escolher o mais completo |
| 9 | TF-IDF — representação lexical | **2.3 TF-IDF como baseline** | Após fórmulas ou antes das limitações |
| 10 | TF-IDF — exemplo currículo + pesos | **3.4.1 Vetorização com TF-IDF** ou **4.6 Resultados** | Ilustra interpretabilidade; bom perto da Tabela 1 |
| 11 | Sentence-Transformers — significado | **2.5 Sentence-Transformers** | Próximo à Figura 1 existente (SBERT Reimers) ou substituir se redundante |
| 12 | Embeddings de LLMs | **2.6 Embeddings extraídos de LLMs** | Após parágrafo Bi-Encoder vs Cross-Encoder |
| 13 | Tabela comparativa TF-IDF / ST / LLM | **2.10 Síntese da fundamentação** | Pode ser **Tabela** resumo antes da síntese |
| 14 | Algoritmos de classificação | **2.7 Modelos supervisionados** (início) | Introdução visual aos 3 classificadores |
| 15 | Pipeline técnico | — | **Pular** (duplicata) |
| 16 | Regressão Logística e SVM | **2.7** (LR e SVM) | Após parágrafo sobre SVM |
| 17 | XGBoost — ensemble | **2.7** (XGBoost) | Após parágrafo Chen & Guestrin |
| 18 | Tabela comparativa classificadores | **2.7** (final) | Tabela resumo LR / SVM / XGBoost |
| 19 | Pipeline técnico | — | **Pular** (duplicata) |
| 20 | Métricas (classificação + ranking + operacionais) | **2.8 Avaliação por métricas** ou **3.7 Métricas** | Preferir **2.8** (teoria); slide resume F1, MAP, NDCG, P@k |
| 21 | Custo e interpretabilidade | **2.9 Custo computacional e interpretabilidade** | Reforço visual |
| 22 | Dataset e anotação (2.484 CVs, 3 classes) | **3.2 Construção e anotação do dataset** | Após descrição do Resume Dataset |
| 23 | Ranking preliminar TF-IDF (top 4) | **4.6 Resultados visualizados** | **Complementar** Tabela 1 (já tem top 20); usar se quiser figura compacta |
| 24 | Aplicação CurrículoRank | **4.1 Finalidade** ou **4.4 Fluxo de uso** | Substituir/complementar Figuras 2–6 se screenshots forem melhores |
| 25 | TCC1 / TCC2 — evolução | **5. Considerações Parciais** (final) | Timeline TCC1→TCC2; **não** no Cap. 4 |
| 26 | Pipeline técnico | — | **Pular** (duplicata) |
| 27 | Obrigado | — | **Não inserir** |

---

## 3. Figuras já existentes no `.docx` (Lista de Figuras TCC1)

| Figura | Descrição atual | Relação com slides |
|--------|-----------------|-------------------|
| Figura 1 | Arquitetura SBERT (Reimers 2019) | **Manter** — fonte externa; slide 11 é complementar, não substituto |
| Figura 2 | Dashboard CurrículoRank | Slide 24 ou screenshot real da app |
| Figura 3 | Vaga de referência | Slide 24 ou screenshot `/vagas` |
| Figura 4 | Listagem currículos | Slide 24 ou screenshot `/curriculos` |
| Figura 5 | Fluxo vaga→TF-IDF→ranking | Slide 5 ou 8 (pipeline) — **escolher um** |
| Figura 6 | Ranking TF-IDF | Slide 23 ou screenshot `/ranking?vagaId=4` |

**Estratégia:** slides teóricos (2–21) → **inserir na Fundamentação/Metodologia**; slides aplicados (24) → **Cap. 4**; evitar inflar Cap. 4 com slides teóricos.

---

## 4. Cronologia do artigo (não inverter)

```
1. INTRODUÇÃO (slides 2–4)
      ↓
2. FUNDAMENTAÇÃO TEÓRICA (slides 6–7, 9, 11–13, 16–18, 20–21)
      ↓
3. METODOLOGIA (slides 5/8, 22)
      ↓
4. APLICAÇÃO (slides 10, 23–24 + Figuras 2–6)
      ↓
5. CONSIDERAÇÕES PARCIAIS (slide 25)
```

Se inserir figura em Metodologia que depende de conceito da Fundamentação, **não antecipar** explicação — apenas referenciar (“conforme seção 2.3”).

---

## 5. Formato de inserção (template)

Para cada figura inserida:

```
[Parágrafo existente — não alterar ou alterar mínimo]

Figura N – [Título descritivo em português, alinhado ao slide]

[ESPAÇO PARA IMAGEM — largura ~14cm, centralizada]

Fonte: Elaborado pelo autor (2026).
```

No texto, **referenciar antes ou depois**:

> Conforme ilustrado na Figura N, …

ou

> … como apresentado na Figura N.

---

## 6. O que NÃO mudar no texto

- Definições, fórmulas e citações (Manning, Reimers, etc.)
- Tabela 1 (ranking completo top 20) — **dados reais**, não substituir por slide 23 (só top 4)
- Considerações sobre falso positivo ID 10138632
- Status futuro de ST/LLM (mantém futuro até TCC2 concluir experimentos)
- Referências bibliográficas

---

## 7. Checklist de entrega

- [ ] Cada slide útil mapeado a uma seção
- [ ] Duplicatas de pipeline (5/8/15/19/26) reduzidas a **1 figura**
- [ ] Lista de Figuras atualizada no `.docx`
- [ ] Referências no texto (`Figura N`) coerentes com a numeração
- [ ] Nenhum slide de agradecimento no corpo
- [ ] Cap. 4 continua distinguindo **dados reais** (piloto) vs **simulados** (Comparativo)
- [ ] Slide 25 apenas em Considerações Parciais

---

## 8. Arquivos de referência

| Arquivo | Caminho |
|---------|---------|
| Slides defesa | `Defesa de TCC - Brenno Murakami (1).pdf` |
| Artigo TCC1 | `Avaliação Comparativa de Representações Textuais... (1).docx` |
| Contexto técnico | `CONTEXTO_TCC2_GPT.md` |
| Spec UI (screenshots alternativos) | `aplicacao_mockup/` — `npm run dev` → localhost:5174 |
| Ranking real (tabela) | `piloto_tfidf/output/ranking_tfidf_piloto.csv` |

---

## 9. Modelo de IA recomendado para ESTA tarefa

| Tarefa | Modelo sugerido | Motivo |
|--------|-----------------|--------|
| Ver slides + ler `.docx` + inserir figuras | **Claude Opus / Sonnet** ou **GPT-4o** com visão | Multimodal, segue instruções longas |
| Edição fina do `.docx` (tracked changes) | **Claude** com skill docx | Manipula OOXML |
| Só mapear slide→seção (sem editar) | Qualquer modelo forte em contexto longo | Este arquivo basta |

**Não use** modelos pequenos/fast para esta tarefa — erram numeração ABNT e ordem de capítulos.

---

*Contexto criado para encaminhar a IA externa. Projeto: Brenno Murakami — IFSP 2026.*
