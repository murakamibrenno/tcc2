Fonte textual sincronizada com o Word combinado em 19/11/2026, após integração da janela equivalente. Tabelas em linhas separadas por ponto e vírgula; a formatação final permanece no Word do Drive.

RESULTADOS E DISCUSSÃO

Os resultados são apresentados em dois níveis complementares. A coleção completa sustenta a execução das representações, os rankings e as medições de custo. Os documentos anotados sustentam o desenvolvimento supervisionado e a avaliação exploratória de qualidade. Essa organização preserva a comparação originalmente proposta, delimitando o tipo de evidência obtido em cada etapa.

Participação da coleção completa e dos subconjuntos

Foram inventariados 2.484 PDFs, dos quais 2.483 forneceram texto utilizável. O arquivo em branco, ID 12632728, foi mantido no inventário, sem preenchimento artificial. Todos os 2.483 documentos utilizáveis receberam vetores e escores nas três representações, originando três rankings completos. A Tabela 2 distingue os universos e seus papéis.

Tabela 2 – Universos e participação no experimento

Universo; Quantidade; Papel

PDFs inventariados; 2.484; Cobertura da coleção e identificação de arquivo em branco

Textos utilizáveis; 2.483; Vetorização, escores, rankings completos e custos

Desenvolvimento incluído; 294; Treino e comparação em três folds por grupos

Coorte avaliada; 97; Métricas de qualidade e classificação

Auditoria original na coorte; 5 dos 97; Ratificação de propostas, sem independência ou extrapolação

Fonte: resultados experimentais do autor (2026).

Os 97 casos pertencem à coleção de 2.483, mas foram separados do conjunto de treino. A distinção não torna os demais documentos acessórios: seus textos determinaram os vetores, a extensão dos rankings e os custos de processamento da coleção. Entretanto, a existência de escore para todos não equivale a uma referência correta de aderência para todos. Por isso, o trabalho não atribui F1 ou acurácia global aos 2.483.

O desenvolvimento reuniu seis Adequados, 75 Parciais e 213 Inadequados. Na coorte, foram quatro, 35 e 58, respectivamente. As seis dúvidas de desenvolvimento e os três documentos relacionados à partição de treino permaneceram excluídos dos universos correspondentes. A seleção enriquecida por sinais técnicos limita inferências sobre a prevalência de aderência na coleção inteira.

Classificação com e sem pesos

A referência majoritária obteve acurácia de concordância 0,598 e F1 macro 0,249. As Tabelas 3 e 4 apresentam todas as configurações fixadas no desenvolvimento, preservando a condição original e a ponderada. Acurácia e demais métricas medem concordância com a referência assistida, e não precisão profissional validada em recrutamento.

Tabela 3 – Classificação na condição original sem pesos nos 97 casos

Método; Modelo; Acurácia; F1 macro; Precisão A; Recall A; AUC macro

TF-IDF; LR; 0,660; 0,366; 0,000; 0,000; 0,934

TF-IDF; SVM; 0,753; 0,483; 0,000; 0,000; 0,891

TF-IDF; XGB; 0,835; 0,557; 0,000; 0,000; 0,942

BGE; LR; 0,691; 0,419; 0,000; 0,000; 0,920

BGE; SVM; 0,722; 0,452; 0,000; 0,000; 0,925

BGE; XGB; 0,701; 0,440; 0,000; 0,000; 0,867

Qwen; LR; 0,608; 0,272; 0,000; 0,000; 0,902

Qwen; SVM; 0,598; 0,249; 0,000; 0,000; 0,940

Qwen; XGB; 0,784; 0,514; 0,000; 0,000; 0,932

Fonte: resultados experimentais do autor (2026).

LR = Regressão Logística; SVM = máquina de vetores de suporte linear; XGB = XGBoost; A = Adequado. AUC macro é complemento descritivo one-vs-rest, operacionalizado após a avaliação primária. Precisão zero pode decorrer da ausência de marcações Adequado.

Tabela 4 – Classificação na condição com pesos balanceados nos 97 casos

Método; Modelo; Acurácia; F1 macro; Precisão A; Recall A; AUC macro

TF-IDF; LR; 0,825; 0,550; 0,000; 0,000; 0,942

TF-IDF; SVM; 0,814; 0,544; 0,000; 0,000; 0,911

TF-IDF; XGB; 0,856; 0,759; 0,667; 0,500; 0,949

BGE; LR; 0,814; 0,743; 0,500; 0,750; 0,928

BGE; SVM; 0,814; 0,713; 0,500; 0,500; 0,916

BGE; XGB; 0,701; 0,450; 0,000; 0,000; 0,839

Qwen; LR; 0,804; 0,704; 0,375; 0,750; 0,911

Qwen; SVM; 0,845; 0,785; 1,000; 0,500; 0,912

Qwen; XGB; 0,825; 0,682; 1,000; 0,250; 0,942

Fonte: resultados experimentais do autor (2026).

LR = Regressão Logística; SVM = máquina de vetores de suporte linear; XGB = XGBoost; A = Adequado. AUC macro é complemento descritivo one-vs-rest, operacionalizado após a avaliação primária. Precisão zero pode decorrer da ausência de marcações Adequado.

Nas nove condições originais, nenhum dos quatro Adequados foi recuperado e nenhum modelo emitiu a classe Adequado. A melhor acurácia original, 0,835 em TF-IDF com XGBoost, coexistiu com recall zero nessa classe. Esse comportamento evidencia por que a acurácia isolada é insuficiente numa triagem em que recuperar candidatos aderentes é relevante.

O desenvolvimento continha apenas seis Adequados entre 294 exemplos. Sem ponderação, a contribuição dessa classe para o ajuste é pequena em relação às classes majoritárias. A baixa disponibilidade de exemplos, a separação aprendida pelas representações e a regra de decisão categórica são explicações compatíveis com o padrão observado. O experimento não isola cada fator nem demonstra que desbalanceamento é sua única causa; parte das evidências técnicas também pode estar fora da janela dos encoders densos.

Na condição ponderada, Qwen com SVM apresentou o maior F1 macro observado, 0,785, com acurácia 0,845. Recuperou dois dos quatro Adequados e realizou duas marcações dessa classe, ambas concordantes com a referência. Os outros dois Adequados foram classificados como Parciais. As duas marcações corretas não constituem demonstração de precisão perfeita em uso real, dado o suporte reduzido e a natureza assistida da referência.

A Tabela 5 detalha os 97 resultados da configuração Qwen com SVM e pesos. O principal contraste entre as classes majoritárias ocorre entre Inadequado e Parcialmente Adequado. Na classe rara, duas referências Adequado foram recuperadas e duas foram previstas como Parciais.

Tabela 5 – Matriz de confusão de Qwen com SVM e pesos

Referência / predito; Inadequado; Parcial; Adequado

Inadequado; 49; 9; 0

Parcialmente Adequado; 4; 31; 0

Adequado; 0; 2; 2

Fonte: predições registradas do experimento (2026). Linhas = referência assistida; colunas = predição. Classes e contagens preservadas.

Na referência original, os acertos de Qwen com SVM e pesos na classe Adequado foram 43311839 e 85101052, ambos sem conferência humana naquele momento. Posteriormente, 43311839 foi conferido como TOP-06 e permaneceu Adequado; 85101052 continua sem conferência. Os casos 23464505 e 10624813, ratificados anteriormente, foram previstos como Parciais. Essa conferência posterior não modifica as métricas primárias nem constitui validação humana independente.

No caso 23464505, a referência registra SQL, serviços SOAP/REST, Git e desenvolvimento de aplicações. Qwen com SVM e pesos produziu Parcialmente Adequado, enquanto BGE com Regressão Logística e pesos produziu Adequado. O documento integral tem 3.187 caracteres; as janelas visíveis alcançaram 2.155 e 2.240 caracteres, respectivamente. A divergência mostra que o resultado depende da combinação entre representação e classificador; não demonstra isoladamente que um dos modelos compreendeu melhor os requisitos.

No caso 10624813, a referência inclui PL/SQL, REST/SOAP, GitHub e desenvolvimento de comércio eletrônico. Qwen com SVM e pesos produziu Parcialmente Adequado e BGE com Regressão Logística e pesos produziu Inadequado. Dos 6.651 caracteres integrais, foram acessíveis 2.648 e 2.779, respectivamente. O truncamento é uma hipótese compatível com a perda de evidências, mas não foi isolado como causa desse erro.

O caso 62994611 ilustra um falso positivo em BGE com Regressão Logística e pesos: a referência Parcialmente Adequado registra SQL, integração de APIs e C#, sem confirmação de Git. O modelo previu Adequado. O escore aprendido não equivale à verificação lógica dos quatro requisitos. Os trechos e as decisões desses exemplos foram preservados antes da inspeção dos erros; a comparação entre modelos apresentada aqui é posterior à avaliação.

BGE com Regressão Logística e pesos recuperou três dos quatro Adequados, mas marcou seis casos como Adequado: três concordantes e três falsos positivos. Qwen com Regressão Logística e pesos também recuperou três, com oito marcações e cinco falsos positivos. Portanto, maior recuperação veio acompanhada de mais documentos encaminhados indevidamente à classe mais aderente. A escolha prática depende do custo de perder candidatos relevantes e do esforço disponível para conferência.

TF-IDF com XGBoost e pesos obteve a maior acurácia de concordância, 0,856, com F1 macro 0,759 e dois Adequados recuperados. A configuração de maior acurácia não foi a de maior F1 macro. Além disso, pesos não resolveram todos os casos: BGE com XGBoost permaneceu sem recuperar Adequados, apesar de emitir uma marcação incorreta dessa classe. Os achados não justificam atribuir desempenho a uma representação sem considerar o classificador e a condição de ajuste.

A ponderação foi comparada nas mesmas partições e com as mesmas referências, o que documenta o comportamento das duas condições. Ainda assim, não houve teste de significância ou validação externa. A ampliação do subconjunto, a revisão de rótulos e a ponderação são intervenções distintas; não se atribui toda diferença frente aos pilotos anteriores ao crescimento dos dados ou a uma única alteração.

Leitura da ROC-AUC complementar

A ROC-AUC foi prevista no texto inicial e calculada como análise complementar após os resultados primários, sem alterar a grade de modelos. As probabilidades e as AUCs por classe foram preservadas, juntamente com o protocolo dessa complementação. As previsões de todas as dezoito configurações coincidiram com os registros anteriores, confirmando que a análise não mudou as decisões já avaliadas.

Qwen com SVM original apresentou AUC macro 0,940 mesmo classificando os 97 documentos como Inadequado. Já a condição ponderada teve AUC macro 0,912 e recuperou dois Adequados. Não há contradição: a AUC examina a ordenação de escores em comparações one-vs-rest ao variar cortes; o recall descreve a classe efetivamente emitida. Uma boa ordenação de probabilidades não garante uma decisão categórica apropriada para a classe rara.

No SVM, as probabilidades são produzidas pelo procedimento interno habilitado por probability=True, que pode não preservar exatamente a decisão categórica do estimador. Não foi validada a calibração dessas probabilidades. AUCs altas, sobretudo com quatro positivos e rótulos assistidos, não substituem a inspeção de falsos positivos e falsos negativos. F1 macro e métricas por classe permanecem centrais na interpretação.

Qualidade do ranqueamento no conjunto julgado

A Tabela 6 utiliza os mesmos 97 documentos para todas as representações. Cada fila foi formada restringindo o ranking completo a esses documentos e reordenando seus escores. As posições indicadas e os valores de Precision@k pertencem a esse ranking julgado, sem representar o topo dos 2.483. Os documentos não julgados não foram considerados negativos.

Tabela 6 – Recuperação entre os 97 documentos julgados

Método; AP; NDCG; P@5; P@10; Posições dos Adequados

TF-IDF; 0,635; 0,934; 0,400; 0,200; 1, 2, 11 e 15

BGE; 0,479; 0,865; 0,600; 0,300; 2, 3, 5 e 27

QWEN; 0,254; 0,776; 0,200; 0,200; 3, 10, 11 e 19

Fonte: resultados experimentais do autor (2026).

TF-IDF apresentou as maiores AP e NDCG observadas, 0,635 e 0,934. BGE teve AP 0,479 e NDCG 0,865, mas colocou três Adequados nos cinco primeiros, contra dois do TF-IDF. Qwen apresentou AP 0,254 e NDCG 0,776, com um Adequado nos cinco primeiros. Os indicadores valorizam aspectos diferentes da ordenação, de modo que uma única medida não resume todas as prioridades de leitura.

Na conferência complementar posterior, o autor julgou os documentos das cinco primeiras posições dos três rankings completos: 15 posições e 12 identificadores distintos. O formulário ocultou método, posição, escores e rótulos anteriores e apresentou os textos em ordem aleatória. Apenas Adequado contou como relevante. TOP-02 teve adjudicação assistida pela rubrica. A ocultação no formulário não torna essa revisão do autor independente da pesquisa. A conferência posterior do top 5 completo incluiu 43311839 (TOP-06), antes não conferido, e 62994611 (TOP-07), já ratificado. Os rótulos coincidiram com a referência original; as métricas dos 97 foram preservadas. Essa revisão do autor não constitui avaliação humana independente nem valida os demais 91 casos sem conferência.

No ranking completo, o P@5 foi 0,60 (3/5) para TF-IDF, 0,80 (4/5) para BGE e 0,60 (3/5) para Qwen. Na adjudicação do caso TOP-02, o desenvolvimento em ASP e a migração do sistema legado sustentaram programação aplicada, mas não forneceram evidência explícita de API, serviço web ou integração entre serviços. O caso passou a Parcialmente Adequado. Duas versões semelhantes com identificadores distintos ocuparam posições no top 5 de BGE, de modo que o resultado se refere a documentos nas posições do ranking, sem agrupamento por candidato.

A vantagem lexical observada é compatível com uma vaga explicitamente descrita por tecnologias e serviços presentes nos currículos. Isso não demonstra que o TF-IDF compreende o contexto profissional nem que embeddings são dispensáveis. O falso positivo lexical do piloto ilustra um risco, enquanto o desempenho atual mostra que maior complexidade não garantiu melhor recuperação nessa consulta específica.

O resultado de Qwen na recuperação também não contradiz seu F1 macro com SVM ponderada. O primeiro mede cosseno direto com a vaga; o segundo usa uma fronteira supervisionada ajustada com os 294 rótulos de desenvolvimento. São tarefas e mecanismos distintos. Não foi proposta uma nova fila baseada em probabilidade dos classificadores nem ajustado um reranqueador pelos 97 casos.

Custo e dimensão na coleção completa

Tabela 7 – Processamento das três representações nos 2.483 textos

Método; Dimensão; Vetorização (s); Consulta e escores (ms); Dispositivo

TF-IDF; 652064; 4,464; 12,494; CPU

BGE; 1024; 121,825; 23,759; GPU RTX 4060

QWEN; 896; 150,410; 35,056; GPU RTX 4060

Fonte: resultados experimentais do autor (2026).

O TF-IDF foi medido em CPU pela mediana de três ajustes completos. BGE e Qwen tiveram uma passagem completa em GPU após aquecimento, excluindo download e carga. A consulta e o cálculo dos escores utilizaram a mediana de dez medições após descartar a primeira, sem incluir ordenação ou exportação. O equipamento possuía processador Intel Core i5-10400F, 12 CPUs lógicas e cerca de 40 GiB de RAM; os densos utilizaram uma NVIDIA GeForce RTX 4060. Esses resultados descrevem a execução local e não um benchmark normalizado entre algoritmos.

Tabela 8 – Armazenamento vetorial e memória observada

Método; Arquivo vetorial (MiB); Pico RSS amostrado (MiB); Pico GPU alocado (MiB)

TF-IDF; 15,249; 377,879; Não aplicável

BGE; 9,699; 1297,371; 1384,745

QWEN; 8,487; 3335,625; 2091,706

Fonte: resultados experimentais do autor (2026).

O TF-IDF foi armazenado em formato esparso NPZ comprimido; os vetores densos, em NPY float32. Os tamanhos de arquivo não equivalem diretamente à memória de trabalho nem isolam o custo de carregar os modelos. RSS é o valor absoluto do processo, amostrado a cada 20 ms; para TF-IDF, a tabela mostra o maior pico entre as três repetições. O pico GPU é a memória alocada registrada pelo framework, sem abranger toda a VRAM reservada ou a atividade do sistema. Logo, os valores não sustentam uma conclusão geral de economia de memória de um método.

O custo por configuração supervisionada também foi registrado para ajuste e inferência dos 97 casos, em uma passagem. Essas medidas são rastreáveis nos relatórios, mas não foram repetidas para comparação estatística. O custo de representação na coleção e o custo do classificador são etapas distintas e não devem ser somados a tempos que incluam operações diferentes.

Interpretabilidade e janela de leitura

Na Regressão Logística com TF-IDF e pesos, termos como application, net, java, web, framework e database tiveram coeficientes positivos expressivos no contraste Adequado–Inadequado. As contribuições locais dos cinco casos foram verificadas pela soma dos termos e do intercepto, reproduzindo a diferença de logits. O resultado mostra quais sinais o modelo usa, mas não representa uma implementação explícita da rubrica técnica e não explica isoladamente a comparação com Parcialmente Adequado.

A importância global do XGBoost complementa essa leitura, indicando atributos utilizados no treinamento, sem informar por si a direção de uma decisão individual. Não foram calculadas explicações SHAP ou LIME. A interpretação foi mantida no alcance das técnicas implementadas, evitando atribuir uma justificativa profissional a uma lista de pesos estatísticos.

Nos densos, a leitura dos cinco casos alcançou aproximadamente 2.155 a 3.079 caracteres, dependendo da tokenização; o currículo curto de 2.204 caracteres coube inteiro. Um documento com evidência de SQL ou Git depois da janela pode ter essa evidência considerada na anotação contextual e ausente do vetor. Essa diferença entre documento disponível e documento efetivamente lido é uma limitação concreta do experimento, sem permitir atribuir automaticamente cada erro ao truncamento.

Nas oitenta intervenções por máscara, uma oclusão alterou a classe de um caso BGE, e três alteraram a classe de dois casos Qwen. A inspeção reproduziu as previsões dos quatro modelos examinados nos 97 casos e conferiu os embeddings originais com o cache antes de aplicar as máscaras. Os exemplos vieram da auditoria definida antes das métricas, enquanto os modelos inspecionados foram escolhidos após a avaliação, sem novo ajuste.

As variações de margem e de cosseno registram sensibilidade local a uma intervenção artificial. No SVM, o valor OvR agregado não é probabilidade e pode responder às comparações entre classes. Ausência de mudança categórica não comprova robustez geral; presença de mudança também não demonstra causalidade ou competência profissional. As explicações não corrigem a falta de referência humana independente.

5.6.1 Análise complementar da janela de leitura equivalente

A análise complementar verifica se o padrão observado persiste quando as representações recebem o mesmo conteúdo inicial de cada currículo. As Tabelas 9 e 10 comparam as duas janelas, mantendo os casos e as configurações. As tabelas e previsões da avaliação primária foram preservadas; os novos relatórios foram armazenados separadamente em janela_equivalente_v1.

Tabela 9 – Recuperação nos mesmos 97 julgados com janela original e equivalente

Método; AP orig.; AP equiv.; NDCG orig.; NDCG equiv.; P@5 orig.; P@5 equiv.

TF-IDF; 0,635; 0,741; 0,934; 0,944; 0,400; 0,600

BGE; 0,479; 0,482; 0,865; 0,864; 0,600; 0,600

Qwen; 0,254; 0,252; 0,776; 0,775; 0,200; 0,200

Fonte: análise complementar do autor (2026). Orig. = janela primária; equiv. = conteúdo textual comum. AP e P@5 consideram somente Adequado como relevante; NDCG mantém graus 2/1/0. As métricas desta tabela se restringem aos 97 documentos.

TF-IDF passou de AP 0,635 para 0,741 e de NDCG 0,934 para 0,944, enquanto BGE e Qwen apresentaram pequenas variações. A vantagem lexical na recuperação dessa consulta persistiu sob conteúdo comum. Assim, o acesso a mais texto não é explicação suficiente para o padrão primário observado. O corte também altera vocabulário, frequências, IDF e normalização: os atributos de recuperação TF-IDF passaram de 652.064 para 351.304. Não se atribui a melhora exclusivamente à remoção de ruído nem se demonstra superioridade geral de uma representação.

Tabela 10 – F1 macro das dezoito configurações nas duas janelas

Método; Modelo; Sem pesos orig.; Sem pesos equiv.; Com pesos orig.; Com pesos equiv.

TF-IDF; LR; 0,366; 0,307; 0,550; 0,514

TF-IDF; SVM; 0,483; 0,447; 0,544; 0,525

TF-IDF; XGB; 0,557; 0,542; 0,759; 0,685

BGE; LR; 0,419; 0,407; 0,743; 0,734

BGE; SVM; 0,452; 0,419; 0,713; 0,639

BGE; XGB; 0,440; 0,469; 0,450; 0,475

Qwen; LR; 0,272; 0,272; 0,704; 0,704

Qwen; SVM; 0,249; 0,249; 0,785; 0,785

Qwen; XGB; 0,514; 0,504; 0,682; 0,544

Fonte: análise complementar do autor (2026). Cada linha reúne duas condições de ponderação; as nove linhas abrangem dezoito configurações em cada janela. LR = Regressão Logística; XGB = XGBoost.

A melhora na recuperação não se repetiu uniformemente na classificação. Todas as seis configurações TF-IDF tiveram redução de F1 macro; com XGB e pesos, o valor passou de 0,759 para 0,685, mantendo recall de Adequado em 0,50. Qwen com SVM e pesos manteve o maior F1 observado, 0,785, também com recall 0,50. BGE com LR e pesos passou de 0,743 para 0,734, mantendo recall 0,75. Qwen com XGB e pesos caiu de 0,682 para 0,544 e deixou de recuperar Adequados. Nas nove condições sem pesos, o recall dessa classe continuou zero. O conteúdo disponível afeta de forma distinta a ordenação direta e a fronteira supervisionada.

Separadamente, os top 5 dos novos rankings completos estavam integralmente cobertos pelos 12 documentos da conferência anterior do autor. Reutilizados esses julgamentos, sem inferir novos rótulos, o P@5 da coleção passou de 0,60 para 0,80 em TF-IDF e permaneceu 0,80 em BGE e 0,60 em Qwen. Esses valores se referem às cinco primeiras posições de cada ranking dos 2.483 documentos e não ao P@5 dos 97 da Tabela 9. Permanecem o julgamento pelo autor, a adjudicação assistida e a presença de versões semelhantes no top 5 BGE, sem agrupamento por candidato.

A janela equivalente reduz uma diferença de conteúdo entre as implementações, mas reutiliza os mesmos 97 casos já examinados, com somente quatro Adequados e a mesma referência assistida. Não houve teste de significância ou nova avaliação independente. Os tempos desta rodada foram preservados para auditoria, sem estimar ganho causal de eficiência diante de condições de execução distintas. A análise complementa a avaliação original e não substitui a revisão humana independente.

Limitações e ameaças à validade

Na referência original dos 97 casos, somente cinco tiveram ratificação humana assistida, com sugestões da IA visíveis; 92 ficaram sem conferência humana. A mesma IA participou dos rótulos de desenvolvimento e avaliação. Os indicadores medem concordância com essa referência, cuja correção não foi estabelecida de modo independente. A conferência posterior do top 5 completo incluiu 43311839 (TOP-06), antes não conferido, e 62994611 (TOP-07), já ratificado. Os rótulos coincidiram com a referência original; as métricas dos 97 foram preservadas. Essa revisão do autor não constitui avaliação humana independente nem valida os demais 91 casos sem conferência.

A avaliação foi concluída no escopo exploratório descrito, com referência assistida e conferência do autor nos casos discriminados no protocolo. Não houve revisão humana independente integral dos 97 currículos. Essa condição limita a validade das conclusões: os indicadores descrevem concordância com a referência disponível, sem estabelecer qualidade validada para decisões de contratação.

Apenas quatro Adequados compõem a avaliação. Além da variação de 25 pontos no recall por um caso, precisão e F1 dessa classe podem mudar substancialmente com poucos documentos. A seleção enriquecida por sinais técnicos, a única vaga adaptada ao vocabulário da coleção e o uso de currículos em inglês restringem validade externa. Não se generalizam os resultados a outras profissões, idiomas, empresas ou distribuições de candidatos.

A revisão de documentos semelhantes e as exclusões reduziram sobreposição conhecida entre partições. Contudo, o agrupamento lexical inicial não identificou todas as versões contextualmente semelhantes; a correção manual do histórico relacionado mostrou essa limitação. Não se afirma ausência absoluta de relações documentais remanescentes. Os registros permitem revisar a decisão em uma nova versão do experimento.

O truncamento de 8.000 caracteres e de 512 tokens nos densos pode excluir evidências relevantes. O controle complementar de conteúdo comum reduziu essa diferença de acesso, mas não avaliou leitura integral, outras janelas, objetivos de pré-treinamento ou estratégias de pooling. Reutilizou os mesmos 97 casos após a análise primária, sem resolver a dependência da referência assistida. Novas configurações não devem ser otimizadas repetidamente nesses casos como se constituíssem teste inédito.

Os custos refletem hardware misto e repetições distintas; a análise de interpretabilidade cobre cinco exemplos e modelos selecionados após a avaliação. Não houve teste de significância ou validação de calibração. Capturas atuais permitiram inspecionar a apresentação estática do protótipo em desktop; testes interativos completos e a conferência em telas menores permanecem pendentes. Essas restrições delimitam o alcance da demonstração e não devem ser ocultadas pela apresentação gráfica.

Síntese da discussão

Os resultados sustentam a comparação proposta em qualidade, custo e interpretabilidade, com conclusões condicionais. TF-IDF foi competitivo na recuperação da consulta avaliada; os classificadores ponderados alteraram a recuperação da classe rara; e o melhor resultado de classificação dependeu da combinação com o modelo supervisionado. A execução da coleção completa demonstrou o funcionamento das três representações em escala, enquanto os 97 documentos forneceram evidência exploratória de qualidade. A conclusão geral é a necessidade de avaliar tarefa, configuração, custo e confiabilidade da referência conjuntamente, sem eleger uma família de representações como universalmente superior.

CONCLUSÃO

O trabalho comparou TF-IDF, BGE e embeddings extraídos de Qwen na triagem de currículos para uma vaga de desenvolvimento backend/web, considerando qualidade, custo e interpretabilidade. Foram processados os 2.483 documentos utilizáveis, gerados três rankings completos, ajustados classificadores com 294 casos de desenvolvimento e avaliados 97 documentos separados do treino.

A implementação concretizou a comparação proposta com representações rastreáveis, três classificadores e duas condições de ponderação. A referência ampliada foi construída com apoio de um modelo de linguagem e conferência do autor nos casos discriminados no protocolo, em lugar de anotação integralmente manual. Essa alteração operacional limita a validação e foi explicitada, mantendo a pergunta comparativa e a identificação dos rótulos não conferidos.

Na avaliação exploratória dos 97 casos, TF-IDF obteve a maior AP (0,635) e o maior NDCG (0,934), enquanto Qwen com SVM e pesos obteve o maior F1 macro (0,785), recuperando dois dos quatro Adequados da referência. Na conferência humana complementar das primeiras posições do ranking completo, BGE obteve P@5 de 0,80 e TF-IDF e Qwen obtiveram 0,60. As duas avaliações mostram aspectos distintos da recuperação e da classificação para uma única vaga.

Na análise complementar de conteúdo equivalente, TF-IDF manteve a maior AP entre os 97, passando a 0,741, e alcançou P@5 de 0,80 no novo top 5 completo com julgamentos anteriores. Em contrapartida, seu F1 com XGB e pesos caiu para 0,685, enquanto Qwen com SVM e pesos manteve 0,785. O controle fortalece a interpretação de que a vantagem lexical observada na recuperação não depende apenas do acesso a mais texto, sem estabelecer um vencedor universal ou substituir a referência humana independente.

Não foi estabelecido um vencedor universal. O compromisso entre omissões e falsos positivos depende do contexto de uso, e a pequena quantidade de Adequados e a referência assistida impedem tratar a comparação como recomendação validada de contratação. Os custos também descrevem uma execução local, com dispositivos e repetições distintos, enquanto as explicações registram comportamento do modelo, sem comprovar competência profissional.

A coleção completa forneceu evidência de cobertura, ordenação e custo; os 97 casos forneceram evidência exploratória de concordância com referências disponíveis. O CurrículoRank integra esses níveis, abrindo o ranking com os 2.483 documentos e mantendo o subconjunto julgado como opção, com proveniência e limitações visíveis. A interface apoia a inspeção dos resultados e preserva a participação da coleção inteira no experimento.

Para uma empresa, a escolha da configuração deve partir do objetivo da triagem. Se a prioridade é ordenar uma fila para leitura humana com baixo custo, TF-IDF é um ponto de partida. Se a prioridade é encontrar mais perfis aderentes nas primeiras posições, vale comparar BGE e outras alternativas em vagas reais. Em processamento de grande volume, um custo adicional recorrente por currículo se acumula. Por exemplo, 10 ms a mais por documento correspondem a 1.000 s de processamento para 100 mil documentos em série. O tempo total em produção depende de fatores como execução em lote, paralelismo e hardware. A comparação empresarial deve medir também tempo de revisão e o risco de omitir perfis aderentes.

Como continuidade, propõe-se ampliar a referência humana independente, as vagas e os idiomas, e investigar documentos longos e outras estratégias de pooling. As seis dúvidas podem ser adjudicadas em versão posterior. Novas otimizações exigem outra separação de avaliação, sem reutilizar os 97 casos como teste inédito.
