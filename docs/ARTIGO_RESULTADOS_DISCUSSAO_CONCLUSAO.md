# Resultados, discussão e conclusão do TCC2

Versão de redação para revisão do autor e orientador. Artigo editável mantido no Drive do autor. Mesmos protocolos, modelos e referências da execução registrada; ROC-AUC complementar explicitamente posterior à análise primária.

## RESULTADOS E DISCUSSÃO

Os resultados são apresentados em dois níveis complementares. A coleção completa sustenta a execução das representações, os rankings e as medições de custo. Os documentos anotados sustentam o desenvolvimento supervisionado e a avaliação exploratória de qualidade. Essa organização preserva a comparação originalmente proposta, delimitando o tipo de evidência obtido em cada etapa.

### Participação da coleção completa e dos subconjuntos

Foram inventariados 2.484 PDFs, dos quais 2.483 forneceram texto utilizável. O arquivo em branco, ID 12632728, foi mantido no inventário, sem preenchimento artificial. Todos os 2.483 documentos utilizáveis receberam vetores e escores nas três representações, originando três rankings completos. A Tabela 2 distingue os universos e seus papéis.

Tabela 2 – Universos e participação no experimento

Fonte: resultados experimentais do autor (2026).

| Universo | Quantidade | Papel |
| --- | --- | --- |
| PDFs inventariados | 2.484 | Cobertura da coleção e identificação de arquivo em branco |
| Textos utilizáveis | 2.483 | Vetorização, escores, rankings completos e custos |
| Desenvolvimento incluído | 294 | Treino e comparação em três folds por grupos |
| Coorte avaliada | 97 | Métricas de qualidade e classificação |
| Auditoria assistida na coorte | 5 dos 97 | Ratificação de propostas, sem independência ou extrapolação |

Os 97 casos pertencem à coleção de 2.483, mas foram separados do conjunto de treino. A distinção não torna os demais documentos acessórios: seus textos determinaram os vetores, a extensão dos rankings e os custos de processamento da coleção. Entretanto, a existência de escore para todos não equivale a uma referência correta de aderência para todos. Por isso, o trabalho não atribui F1 ou acurácia global aos 2.483.

O desenvolvimento reuniu seis Adequados, 75 Parciais e 213 Inadequados. Na coorte, foram quatro, 35 e 58, respectivamente. As seis dúvidas de desenvolvimento e os três documentos relacionados à partição de treino permaneceram excluídos dos universos correspondentes. A seleção enriquecida por sinais técnicos limita inferências sobre a prevalência de aderência na coleção inteira.

### Classificação com e sem pesos

A referência majoritária obteve acurácia de concordância 0,598 e F1 macro 0,249. As Tabelas 3 e 4 apresentam todas as configurações fixadas no desenvolvimento, preservando a condição original e a ponderada. Acurácia e demais métricas medem concordância com a referência assistida, e não precisão profissional validada em recrutamento.

Tabela 3 – Classificação na condição original sem pesos nos 97 casos

Fonte: resultados experimentais do autor (2026).

| Método | Modelo | Acurácia | F1 macro | Precisão A | Recall A | AUC macro |
| --- | --- | --- | --- | --- | --- | --- |
| TF-IDF | LR | 0,660 | 0,366 | 0,000 | 0,000 | 0,934 |
| TF-IDF | SVM | 0,753 | 0,483 | 0,000 | 0,000 | 0,891 |
| TF-IDF | XGB | 0,835 | 0,557 | 0,000 | 0,000 | 0,942 |
| BGE | LR | 0,691 | 0,419 | 0,000 | 0,000 | 0,920 |
| BGE | SVM | 0,722 | 0,452 | 0,000 | 0,000 | 0,925 |
| BGE | XGB | 0,701 | 0,440 | 0,000 | 0,000 | 0,867 |
| Qwen | LR | 0,608 | 0,272 | 0,000 | 0,000 | 0,902 |
| Qwen | SVM | 0,598 | 0,249 | 0,000 | 0,000 | 0,940 |
| Qwen | XGB | 0,784 | 0,514 | 0,000 | 0,000 | 0,932 |

LR = Regressão Logística; SVM = máquina de vetores de suporte linear; XGB = XGBoost; A = Adequado. AUC macro é complemento descritivo one-vs-rest, operacionalizado após a avaliação primária. Precisão zero pode decorrer da ausência de marcações Adequado.

Tabela 4 – Classificação na condição com pesos balanceados nos 97 casos

Fonte: resultados experimentais do autor (2026).

| Método | Modelo | Acurácia | F1 macro | Precisão A | Recall A | AUC macro |
| --- | --- | --- | --- | --- | --- | --- |
| TF-IDF | LR | 0,825 | 0,550 | 0,000 | 0,000 | 0,942 |
| TF-IDF | SVM | 0,814 | 0,544 | 0,000 | 0,000 | 0,911 |
| TF-IDF | XGB | 0,856 | 0,759 | 0,667 | 0,500 | 0,949 |
| BGE | LR | 0,814 | 0,743 | 0,500 | 0,750 | 0,928 |
| BGE | SVM | 0,814 | 0,713 | 0,500 | 0,500 | 0,916 |
| BGE | XGB | 0,701 | 0,450 | 0,000 | 0,000 | 0,839 |
| Qwen | LR | 0,804 | 0,704 | 0,375 | 0,750 | 0,911 |
| Qwen | SVM | 0,845 | 0,785 | 1,000 | 0,500 | 0,912 |
| Qwen | XGB | 0,825 | 0,682 | 1,000 | 0,250 | 0,942 |

LR = Regressão Logística; SVM = máquina de vetores de suporte linear; XGB = XGBoost; A = Adequado. AUC macro é complemento descritivo one-vs-rest, operacionalizado após a avaliação primária. Precisão zero pode decorrer da ausência de marcações Adequado.

Nas nove condições originais, nenhum dos quatro Adequados foi recuperado e nenhum modelo emitiu a classe Adequado. A melhor acurácia original, 0,835 em TF-IDF com XGBoost, coexistiu com recall zero nessa classe. Esse comportamento evidencia por que a acurácia isolada é insuficiente numa triagem em que recuperar candidatos aderentes é relevante.

O desenvolvimento continha apenas seis Adequados entre 294 exemplos. Sem ponderação, a contribuição dessa classe para o ajuste é pequena em relação às classes majoritárias. A baixa disponibilidade de exemplos, a separação aprendida pelas representações e a regra de decisão categórica são explicações compatíveis com o padrão observado. O experimento não isola cada fator nem demonstra que desbalanceamento é sua única causa; parte das evidências técnicas também pode estar fora da janela dos encoders densos.

Na condição ponderada, Qwen com SVM apresentou o maior F1 macro observado, 0,785, com acurácia 0,845. Recuperou dois dos quatro Adequados e realizou duas marcações dessa classe, ambas concordantes com a referência. Os outros dois Adequados foram classificados como Parciais. As duas marcações corretas não constituem demonstração de precisão perfeita em uso real, dado o suporte reduzido e a natureza assistida da referência.

BGE com Regressão Logística e pesos recuperou três dos quatro Adequados, mas marcou seis casos como Adequado: três concordantes e três falsos positivos. Qwen com Regressão Logística e pesos também recuperou três, com oito marcações e cinco falsos positivos. Portanto, maior recuperação veio acompanhada de mais documentos encaminhados indevidamente à classe mais aderente. A escolha prática depende do custo de perder candidatos relevantes e do esforço disponível para conferência.

TF-IDF com XGBoost e pesos obteve a maior acurácia de concordância, 0,856, com F1 macro 0,759 e dois Adequados recuperados. A configuração de maior acurácia não foi a de maior F1 macro. Além disso, pesos não resolveram todos os casos: BGE com XGBoost permaneceu sem recuperar Adequados, apesar de emitir uma marcação incorreta dessa classe. Os achados não justificam atribuir desempenho a uma representação sem considerar o classificador e a condição de ajuste.

A ponderação foi comparada nas mesmas partições e com as mesmas referências, o que documenta o comportamento das duas condições. Ainda assim, não houve teste de significância ou validação externa. A ampliação do subconjunto, a revisão de rótulos e a ponderação são intervenções distintas; não se atribui toda diferença frente aos pilotos anteriores ao crescimento dos dados ou a uma única alteração.

### Leitura da ROC-AUC complementar

A ROC-AUC foi prevista no texto inicial e calculada como análise complementar após os resultados primários, sem alterar a grade de modelos. As probabilidades e as AUCs por classe foram preservadas, juntamente com o protocolo dessa complementação. As previsões de todas as dezoito configurações coincidiram com os registros anteriores, confirmando que a análise não mudou as decisões já avaliadas.

Qwen com SVM original apresentou AUC macro 0,940 mesmo classificando os 97 documentos como Inadequado. Já a condição ponderada teve AUC macro 0,912 e recuperou dois Adequados. Não há contradição: a AUC examina a ordenação de escores em comparações one-vs-rest ao variar cortes; o recall descreve a classe efetivamente emitida. Uma boa ordenação de probabilidades não garante uma decisão categórica apropriada para a classe rara.

No SVM, as probabilidades são produzidas pelo procedimento interno habilitado por probability=True, que pode não preservar exatamente a decisão categórica do estimador. Não foi validada a calibração dessas probabilidades. AUCs altas, sobretudo com quatro positivos e rótulos assistidos, não substituem a inspeção de falsos positivos e falsos negativos. F1 macro e métricas por classe permanecem centrais na interpretação.

### Qualidade do ranqueamento no conjunto julgado

A Tabela 5 utiliza os mesmos 97 documentos para todas as representações. Cada fila foi formada restringindo o ranking completo a esses documentos e reordenando seus escores. As posições indicadas e os valores de Precision@k pertencem a esse ranking julgado, sem representar o topo dos 2.483. Os documentos não julgados não foram considerados negativos.

Tabela 5 – Recuperação entre os 97 documentos julgados

Fonte: resultados experimentais do autor (2026).

| Método | AP | NDCG | P@5 | P@10 | Posições dos Adequados |
| --- | --- | --- | --- | --- | --- |
| TF-IDF | 0,635 | 0,934 | 0,400 | 0,200 | 1, 2, 11 e 15 |
| BGE | 0,479 | 0,865 | 0,600 | 0,300 | 2, 3, 5 e 27 |
| QWEN | 0,254 | 0,776 | 0,200 | 0,200 | 3, 10, 11 e 19 |

TF-IDF apresentou as maiores AP e NDCG observadas, 0,635 e 0,934. BGE teve AP 0,479 e NDCG 0,865, mas colocou três Adequados nos cinco primeiros, contra dois do TF-IDF. Qwen apresentou AP 0,254 e NDCG 0,776, com um Adequado nos cinco primeiros. Os indicadores valorizam aspectos diferentes da ordenação, de modo que uma única medida não resume todas as prioridades de leitura.

A vantagem lexical observada é compatível com uma vaga explicitamente descrita por tecnologias e serviços presentes nos currículos. Isso não demonstra que o TF-IDF compreende o contexto profissional nem que embeddings são dispensáveis. O falso positivo lexical do piloto ilustra um risco, enquanto o desempenho atual mostra que maior complexidade não garantiu melhor recuperação nessa consulta específica.

O resultado de Qwen na recuperação também não contradiz seu F1 macro com SVM ponderada. O primeiro mede cosseno direto com a vaga; o segundo usa uma fronteira supervisionada ajustada com os 294 rótulos de desenvolvimento. São tarefas e mecanismos distintos. Não foi proposta uma nova fila baseada em probabilidade dos classificadores nem ajustado um reranqueador pelos 97 casos.

### Custo e dimensão na coleção completa

Tabela 6 – Processamento das três representações nos 2.483 textos

Fonte: resultados experimentais do autor (2026).

| Método | Dimensão | Vetorização (s) | Consulta e escores (ms) | Dispositivo |
| --- | --- | --- | --- | --- |
| TF-IDF | 652064 | 4,464 | 12,494 | CPU |
| BGE | 1024 | 121,825 | 23,759 | GPU RTX 4060 |
| QWEN | 896 | 150,410 | 35,056 | GPU RTX 4060 |

O TF-IDF foi medido em CPU pela mediana de três ajustes completos. BGE e Qwen tiveram uma passagem completa em GPU após aquecimento, excluindo download e carga. A consulta e o cálculo dos escores utilizaram a mediana de dez medições após descartar a primeira, sem incluir ordenação ou exportação. O equipamento possuía processador Intel Core i5-10400F, 12 CPUs lógicas e cerca de 40 GiB de RAM; os densos utilizaram uma NVIDIA GeForce RTX 4060. Esses resultados descrevem a execução local e não um benchmark normalizado entre algoritmos.

Tabela 7 – Armazenamento vetorial e memória observada

Fonte: resultados experimentais do autor (2026).

| Método | Arquivo vetorial (MiB) | Pico RSS amostrado (MiB) | Pico GPU alocado (MiB) |
| --- | --- | --- | --- |
| TF-IDF | 15,249 | 377,879 | Não aplicável |
| BGE | 9,699 | 1297,371 | 1384,745 |
| QWEN | 8,487 | 3335,625 | 2091,706 |

O TF-IDF foi armazenado em formato esparso NPZ comprimido; os vetores densos, em NPY float32. Os tamanhos de arquivo não equivalem diretamente à memória de trabalho nem isolam o custo de carregar os modelos. RSS é o valor absoluto do processo, amostrado a cada 20 ms; para TF-IDF, a tabela mostra o maior pico entre as três repetições. O pico GPU é a memória alocada registrada pelo framework, sem abranger toda a VRAM reservada ou a atividade do sistema. Logo, os valores não sustentam uma conclusão geral de economia de memória de um método.

O custo por configuração supervisionada também foi registrado para ajuste e inferência dos 97 casos, em uma passagem. Essas medidas são rastreáveis nos relatórios, mas não foram repetidas para comparação estatística. O custo de representação na coleção e o custo do classificador são etapas distintas e não devem ser somados a tempos que incluam operações diferentes.

### Interpretabilidade e janela de leitura

Na Regressão Logística com TF-IDF e pesos, termos como application, net, java, web, framework e database tiveram coeficientes positivos expressivos no contraste Adequado–Inadequado. As contribuições locais dos cinco casos foram verificadas pela soma dos termos e do intercepto, reproduzindo a diferença de logits. O resultado mostra quais sinais o modelo usa, mas não representa uma implementação explícita da rubrica técnica e não explica isoladamente a comparação com Parcialmente Adequado.

A importância global do XGBoost complementa essa leitura, indicando atributos utilizados no treinamento, sem informar por si a direção de uma decisão individual. Não foram calculadas explicações SHAP ou LIME. A interpretação foi mantida no alcance das técnicas implementadas, evitando atribuir uma justificativa profissional a uma lista de pesos estatísticos.

Nos densos, a leitura dos cinco casos alcançou aproximadamente 2.155 a 3.079 caracteres, dependendo da tokenização; o currículo curto de 2.204 caracteres coube inteiro. Um documento com evidência de SQL ou Git depois da janela pode ter essa evidência considerada na anotação contextual e ausente do vetor. Essa diferença entre documento disponível e documento efetivamente lido é uma limitação concreta do experimento, sem permitir atribuir automaticamente cada erro ao truncamento.

Nas oitenta intervenções por máscara, uma oclusão alterou a classe de um caso BGE, e três alteraram a classe de dois casos Qwen. A inspeção reproduziu as previsões dos quatro modelos examinados nos 97 casos e conferiu os embeddings originais com o cache antes de aplicar as máscaras. Os exemplos vieram da auditoria definida antes das métricas, enquanto os modelos inspecionados foram escolhidos após a avaliação, sem novo ajuste.

As variações de margem e de cosseno registram sensibilidade local a uma intervenção artificial. No SVM, o valor OvR agregado não é probabilidade e pode responder às comparações entre classes. Ausência de mudança categórica não comprova robustez geral; presença de mudança também não demonstra causalidade ou competência profissional. As explicações não corrigem a falta de referência humana independente.

### Limitações e ameaças à validade

A principal ameaça é a referência de aderência assistida. A mesma IA participou da anotação de desenvolvimento e avaliação, e cinco propostas foram ratificadas pelo autor com sugestões visíveis. Essa amostra intencional não valida os demais 92 rótulos, não estima concordância humana geral e não constitui avaliação por dois anotadores independentes. Um modelo pode concordar com um erro da referência; as métricas, portanto, não são prova de qualidade em decisões reais de recrutamento.

Apenas quatro Adequados compõem a avaliação. Além da variação de 25 pontos no recall por um caso, precisão e F1 dessa classe podem mudar substancialmente com poucos documentos. A seleção enriquecida por sinais técnicos, a única vaga adaptada ao vocabulário da coleção e o uso de currículos em inglês restringem validade externa. Não se generalizam os resultados a outras profissões, idiomas, empresas ou distribuições de candidatos.

A revisão de documentos semelhantes e as exclusões reduziram sobreposição conhecida entre partições. Contudo, o agrupamento lexical inicial não identificou todas as versões contextualmente semelhantes; a correção manual do histórico relacionado mostrou essa limitação. Não se afirma ausência absoluta de relações documentais remanescentes. Os registros permitem revisar a decisão em uma nova versão do experimento.

O truncamento de 8.000 caracteres e de 512 tokens nos densos pode excluir evidências relevantes. Os encoders foram congelados, e a representação Qwen usa pooling médio de um modelo generativo. Sem ablação sistemática de janelas, pooling e modelos, essas escolhas não podem ser isoladas como causas do resultado. Novas configurações não devem ser otimizadas repetidamente nos mesmos 97 casos como se constituíssem teste inédito.

Os custos refletem hardware misto e repetições distintas; a análise de interpretabilidade cobre cinco exemplos e modelos selecionados após a avaliação. Não houve teste de significância ou validação de calibração. Além disso, a inspeção visual completa do protótipo permanece pendente, embora os testes técnicos tenham verificado seus dados e a renderização em servidor. Essas restrições delimitam o alcance da demonstração e não devem ser ocultadas pela apresentação gráfica.

### Síntese da discussão

Os resultados sustentam a comparação proposta em qualidade, custo e interpretabilidade, com conclusões condicionais. TF-IDF foi competitivo na recuperação da consulta avaliada; os classificadores ponderados alteraram a recuperação da classe rara; e o melhor resultado de classificação dependeu da combinação com o modelo supervisionado. A execução da coleção completa demonstrou o funcionamento das três representações em escala, enquanto os 97 documentos forneceram evidência exploratória de qualidade. A conclusão geral é a necessidade de avaliar tarefa, configuração, custo e confiabilidade da referência conjuntamente, sem eleger uma família de representações como universalmente superior.

## CONCLUSÃO

O trabalho comparou TF-IDF, BGE e embeddings extraídos de Qwen na triagem de currículos para uma vaga de desenvolvimento backend/web, considerando qualidade, custo e interpretabilidade. Foram processados os 2.483 documentos utilizáveis, gerados três rankings completos, ajustados classificadores com 294 casos de desenvolvimento e avaliados 97 documentos separados do treino.

A implementação concretizou a comparação proposta com representações rastreáveis, três classificadores e duas condições de ponderação. A referência ampliada foi construída com assistência de IA e ratificação parcial do autor, em lugar de anotação integralmente manual. Essa alteração operacional limita a validação e foi explicitada, mantendo a pergunta comparativa e a identificação dos rótulos não conferidos.

TF-IDF apresentou as maiores AP e NDCG observadas; BGE posicionou mais Adequados entre os cinco primeiros julgados. Na classificação, Qwen com SVM e pesos atingiu F1 macro 0,785 e recuperou dois dos quatro Adequados. BGE com Regressão Logística e pesos recuperou três, com mais falsos positivos. Nenhuma condição original recuperou Adequados, evidenciando a insuficiência da acurácia isolada para analisar a classe rara.

Não foi estabelecido um vencedor universal. O compromisso entre omissões e falsos positivos depende do contexto de uso, e a pequena quantidade de Adequados e a referência assistida impedem tratar a comparação como recomendação validada de contratação. Os custos também descrevem uma execução local, com dispositivos e repetições distintos, enquanto as explicações registram comportamento do modelo, sem comprovar competência profissional.

A coleção completa forneceu evidência de cobertura, ordenação e custo; os 97 casos forneceram evidência exploratória de concordância com referências disponíveis. O CurrículoRank integra esses níveis, abrindo o ranking com os 2.483 documentos e mantendo o subconjunto julgado como opção, com proveniência e limitações visíveis. A interface apoia a inspeção dos resultados e preserva a participação da coleção inteira no experimento.

Como continuidade, propõe-se ampliar a referência humana independente, as vagas e os idiomas, e investigar documentos longos e outras estratégias de pooling. As seis dúvidas podem ser adjudicadas em versão posterior. Novas otimizações exigem outra separação de avaliação, sem reutilizar os 97 casos como teste inédito.

