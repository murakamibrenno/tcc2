# CurrículoRank — parte prática do TCC2

Atualização de escopo aprovada em 10/11/2026: [processamento da base completa e qualidade no subconjunto revisado](PLANEJAMENTO_TCC2_ESCALA_E_QUALIDADE.md), preservando a comparação e os objetivos do artigo.

> **Validação técnica em andamento (10/11/2026):** consulte [o checklist executado e as pendências científicas](VALIDACAO_PRATICA_CHECKLIST.md). Os números abaixo são o snapshot anterior à adjudicação. A nova verificação preserva esses números e bloqueia reexecuções enquanto houver pendências nos dados. `run_pipeline_demo.ps1` agora executa somente o preflight, sem reconstruir o corpus.

Repositório da parte prática de Brenno Murakami (IFSP Presidente Epitácio, orientador Prof. Vilson Francisco Maziero).

Título: Avaliação Comparativa de Representações Textuais Aplicadas à Triagem Automática de Currículos: TF-IDF, Sentence-Transformers e Embeddings de LLMs.

A interface React mostra um experimento já calculado. O orientador não precisa de Python para ver o resultado. Os números publicados estão em `aplicacao_mockup/src/data/metricasReais.json`. O artigo `.docx` ainda descreve o piloto antigo de 20 currículos e será reescrito por último.

Remote: https://github.com/murakamibrenno/tcc2 (`main`).

## O que este repositório responde

Qual representação de texto equilibra fila de leitura, custo e a chance de explicar a nota, para uma vaga de desenvolvedor júnior backend/web, em inglês.

A comparação é nos **100 currículos** de `piloto_tfidf/data/curriculos_piloto.json`. A base inteira (2.484) só retrata a pilha. Ela não é uma segunda rodada do Qwen.

| Fonte | Papel | Distribuição |
|---|---|---|
| 100 currículos | Resultado comparativo | 3 Adequado, 21 Parcialmente Adequado, 76 Inadequado |
| 2.484 currículos | Retrato da base Kaggle (Resume Dataset, Snehaan Bhawal) | 3 Adequado, 26 Parcialmente Adequado, 2.455 Inadequado |

Vinte rótulos dos 100 são manuais. Oitenta seguem a regra lexical de `piloto_tfidf/protocolo_anotacao.md` (SQL, REST ou web services, Git, linguagem). A releitura dos 20 manuais concordou em 19. A divergência é o id `21297521`, em `piloto_tfidf/data/amostra_revisao.csv`. Na base de 2.484, pasta fora de tecnologia da informação força Inadequado. Por isso a comparação não foi repetida nos 2.484.

## Três representações

| Representação | Como o vetor é feito |
|---|---|
| TF-IDF | `TfidfVectorizer`, unigramas e bigramas, `min_df=1`, `max_df=1.0`, minúsculas, sem `stop_words`. Truncamento de 8.000 caracteres. |
| Sentence-Transformers | `BAAI/bge-large-en-v1.5` |
| LLM Embeddings | `Qwen/Qwen2.5-0.5B`, último hidden state, média dos tokens com attention mask, 512 tokens, L2, CPU. Não é API e não é BGE. |

Classificadores, com os mesmos hiperparâmetros nas nove combinações: regressão logística (`max_iter=2000`), SVM linear (`probability=True`), XGBoost (`n_estimators=50`, `max_depth=3`, `learning_rate=0.1`). Validação cruzada estratificada de 5 partes, `random_state=42`. No TF-IDF o vocabulário entra num `Pipeline` e é ajustado dentro de cada parte.

O ranking publicado é **cosseno da vaga contra os 100**. MAP e NDCG nas linhas dos classificadores repetem o ranking da representação. Não existe uma segunda fila pela probabilidade do classificador.

Relevância do ranking: Adequado = 2, Parcial = 1, Inadequado = 0. P@k conta relevância maior que 0. MAP conta só Adequado.

## Números que não devem ser recalculados

Ranking (qualidade). O tempo abaixo é o protocolo único de custo, não a qualidade da fila.

| Método | P@5 | P@10 | MAP | NDCG@10 | Sales Manager |
|---|---|---|---|---|---|
| TF-IDF | 0,60 | 0,60 | 0,6095 | 0,702 | 8ª |
| Sentence-Transformers | 1,00 | 0,80 | 1,00 | 0,9313 | 49ª |
| Qwen | 0,80 | 0,90 | 0,5873 | 0,8508 | 91ª |

F1 macro da validação cruzada: logística e SVM, nas três representações, 0,2879. TF-IDF + XGBoost 0,5978. Sentence-Transformers + XGBoost 0,6099 (o melhor). Qwen + XGBoost 0,571. Logística e SVM não preveem Adequado. Há só três exemplos dessa classe.

Hold-out (60 treino / 20 teste) é medida instável: a fatia de teste tem um único Adequado. Não substitui a validação cruzada.

Custo de vetorização, processo novo para cada representação, mesmo roteiro (carga do modelo quando existe, vaga, 100 currículos, cosseno). Memória é o acréscimo de RSS depois das bibliotecas importadas, antes da carga do modelo.

| Representação | Tempo | Δ RSS |
|---|---|---|
| TF-IDF | 0,503 s | 16,9 MiB |
| Sentence-Transformers | 203,064 s (3,4 min) | 1.441 MiB |
| Qwen | 1.810,7 s (30,2 min) | 1.126 MiB |

Na tela de Resultados, tempo acima de 90 s aparece em minutos. No Comparativo o mesmo valor aparece em segundos. 1.811 na tabela é 1.811 segundos, o mesmo que 30,2 minutos.

A chave `classificacao` de `metricasReais.json` é um ensaio antigo com BGE base e F1 0,7568. Não citar. A interface e o artigo usam `classificacaoRigorosa` e `combinacoes9`. O aviso está em `classificacao_nota`.

## Como a interface funciona

React 18, Vite 5, MUI 6, React Router 6, Recharts. Não há backend. As notas vêm dos JSON em `aplicacao_mockup/src/data/`.

```powershell
cd aplicacao_mockup
npm install
npm run dev
```

Abre em http://127.0.0.1:5173. Se a porta estiver ocupada, o Vite sobe na seguinte.

| Rota | O que mostra |
|---|---|
| `/dashboard` | Visão geral |
| `/vagas` | Vaga de referência |
| `/curriculos` | Os 100 currículos e os rótulos |
| `/ranking` | Fila por cosseno da representação escolhida |
| `/comparativo` | Nove combinações, F1, tempos e Δ RSS |
| `/metodologia` | Como o experimento foi montado |
| `/resultados` | Leitura para o orientador: fila, custo, termos, precisão e recall por classe |
| `/sobre` | Página antiga, fora do menu |

Para o nginx, `npm run build` gera `aplicacao_mockup/dist`. As rotas do React precisam cair em `index.html`:

```nginx
root /caminho/aplicacao_mockup/dist;
index index.html;
location / {
    try_files $uri $uri/ /index.html;
}
```

O Python do experimento é `piloto_tfidf\.venv\Scripts\python.exe`. Dependências em `piloto_tfidf/requirements.txt` (inclui `psutil`).

## Onde está cada resultado

| Arquivo | Conteúdo |
|---|---|
| `aplicacao_mockup/src/data/metricasReais.json` | Ranking, F1, custo, memória, interpretabilidade. Fonte da UI. |
| `piloto_tfidf/output/comparativo_classificacao_rigoroso.csv` | F1 publicado. O gate de custo confere a 4ª casa decimal. |
| `piloto_tfidf/output/memoria_vetorizacao.json` | Tempo e Δ RSS do protocolo único. |
| `piloto_tfidf/output/custo_classificacao.json` | Treino, inferência e Δ RSS do ajuste nas nove combinações. |
| `piloto_tfidf/output/interpretabilidade_tfidf.json` | Termos do TF-IDF. Ajuste único nos 100, não é o modelo do F1. |
| `piloto_tfidf/output/interpretabilidade_densa.json` | Índices do XGBoost em 1.024 e 896 dimensões. Diagnóstico. A UI não lista esses índices. |
| `piloto_tfidf/data/curriculos_completo.json` | Rótulos dos 2.484. Não entra no ranking. |
| `piloto_tfidf/data/corpus_completo_meta.json` | Contagem da base inteira. |
| `piloto_tfidf/data/vaga_referencia.json` | Texto da vaga. |

Caches de embedding não vão para o Git: `piloto_tfidf/output/cache_st.npy` e `piloto_tfidf/output/cache_llm/`. Quem clonar o repositório vê os números. Quem for reextrair o Qwen precisa do cache local ou de cerca de 30 minutos de CPU.

## Scripts

Interpretabilidade e custo, sem reextrair o Qwen e sem mexer em P@k nem no F1:

```powershell
cd piloto_tfidf
.\.venv\Scripts\python.exe interpretabilidade_tfidf.py
.\.venv\Scripts\python.exe interpretabilidade_densa.py
.\.venv\Scripts\python.exe custo_classificacao.py
```

`custo_classificacao.py` aborta se o F1 divergir do CSV. Ao gravar a UI, copia o tempo de vetorização de `memoriaVetorizacao` para `combinacoes9` e `classificacaoRigorosa`.

A medição de tempo e memória da vetorização roda três processos separados (`medir_vetorizacao_worker.py`). Sentence-Transformers e Qwen são conferidos com o cache. Se a diferença absoluta máxima passar de `1e-4`, o script para e não substitui o cache. O Qwen nessa medição leva cerca de 30 minutos. Não rode de novo sem necessidade.

```powershell
.\.venv\Scripts\python.exe medir_memoria_vetorizacao.py
```

`sincronizar_tempos_vetorizacao_ui.py` só alinha os tempos já medidos na interface. Não chama modelo.

## O que não rodar

- `expandir_corpus_auto.py` reescolhe os 100 e invalida o experimento publicado.
- `classificar_piloto.py` depois de `classificar_rigoroso.py` regrava as nove combinações com o caminho antigo.
- `run_pipeline_demo.ps1` chama os dois acima.
- Não tratar o F1 0,7568 como resultado do Qwen.
- Não citar uma lista de palavras para Sentence-Transformers ou Qwen. A dimensão é anônima.
- Não editar o `.docx` no meio de um recálculo. O artigo vem depois que estes números param de se mover.

Reextrair só o Qwen, se o cache local existir e for preciso refazer o braço, nesta ordem: `embeddings_piloto.py --so-llm`, `avaliar_ranking.py`, `exportar_piloto_ui.py`, `classificar_rigoroso.py`, `correlacao_rankings.py`, `avaliar_holdout.py`. Isso mexe no resultado publicado. Não é o caminho para atualizar a tela.

## Fora desta entrega

Corpus em português, upload de PDF, backend, segunda fila pela probabilidade do classificador e busca de hiperparâmetros. O CurrículoRank permanece uma visualização do experimento já calculado.
