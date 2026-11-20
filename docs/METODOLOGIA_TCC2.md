Fonte textual sincronizada com o Word combinado em 19/11/2026, após consolidação das conferências por identificador. A formatação final permanece no Word e PDF do Drive.

Metodologia

Visão Geral – Pipeline Experimental

A pesquisa adotou um delineamento experimental quantitativo e comparativo, de alcance exploratório, para examinar três representações textuais na triagem de currículos. O pipeline compreendeu preparação dos documentos, definição de uma vaga em inglês, construção de referências de aderência, vetorização, ranqueamento por cosseno, classificação supervisionada e análise de qualidade, custo e interpretabilidade. A Figura 7 apresenta a organização conceitual dessas etapas.

Figura 7 – Visão geral das etapas do pipeline experimental

Fonte: Apresentação de defesa do autor (2026, slide 5).

A Figura 7 foi apresentada na defesa inicial e documenta o encadeamento do pipeline. A expansão para Transformers nela indicada foi executada no TCC2 com BGE e Qwen. A extração, a vetorização e a avaliação foram realizadas por scripts; a aplicação apresenta suas saídas, sem substituir a execução experimental.

O conjunto inicial utilizado na pesquisa corresponde ao Resume Dataset, disponibilizado na plataforma Kaggle por Snehaan Bhawal. A base reúne currículos em língua inglesa, disponibilizados em formato textual e PDF, organizados por categorias profissionais. No conjunto considerado neste trabalho, foram identificados 2.484 currículos distribuídos em 24 categorias, como Information Technology, Accountant, Advocate, Arts, Banking, Chef, Teacher, Healthcare e Sales, entre outras. Segundo a descrição do dataset, os currículos foram obtidos a partir de exemplos disponíveis publicamente e organizados com identificador, conteúdo textual, conteúdo em HTML e categoria profissional. O dataset é disponibilizado sob a licença CC0: Public Domain, permitindo seu uso público para fins de pesquisa e experimentação, conforme informado na página de disponibilização da base consultada na data registrada nas referências deste trabalho.

O piloto do TCC1 utilizou 20 documentos e verificou o fluxo inicial com TF-IDF. Esse resultado foi preservado como histórico, sem constituir a comparação final. No TCC2, os 2.483 documentos utilizáveis receberam vetores e escores nas três representações. Portanto, a coleção completa participou do experimento de recuperação e da análise de custo, e não apenas da seleção de uma amostra.

Foi mantida uma única vaga de referência, Junior Software Developer (Backend / Web), escrita em inglês para compatibilidade com a coleção. A descrição solicita SQL e bancos relacionais, APIs REST ou serviços web, Git ou controle de versão e programação para desenvolvimento de aplicações. A formulação ampla contempla Java, Python, PHP, C#/.NET e linguagens semelhantes, evitando restringir a seleção a uma única tecnologia.

As referências de aderência foram construídas em três classes: Adequado, Parcialmente Adequado e Inadequado. A categoria profissional original foi mantida como metadado, sem funcionar como resposta correta. Experiência acima da faixa júnior não causa reprovação automática. O julgamento considera evidência de atuação ou habilidade do próprio candidato, distinguindo-a de tecnologias citadas apenas em vagas recrutadas ou descrições de terceiros.

O ranqueamento ordenou toda a coleção utilizável pela similaridade do cosseno entre cada representação do currículo e a vaga. A classificação teve desenho distinto: modelos ajustados no desenvolvimento produziram classes para os 97 casos da avaliação. Os rankings completos não foram gerados pelas probabilidades dos classificadores, e os indicadores das duas tarefas foram apresentados separadamente.

A avaliação de qualidade exige documentos com referência de aderência, razão pela qual foi delimitada a 97 casos separados do desenvolvimento. Essa delimitação não exclui os demais documentos do processamento experimental; define quais resultados podem ser comparados a rótulos. Sem referência revisada para toda a coleção, não foi estimada sua acurácia global nem a proporção real de candidatos adequados.

Foram comparadas as mesmas três representações com Regressão Logística, SVM linear e XGBoost em duas condições previamente definidas: original e com pesos balanceados. As dezoito configurações foram mantidas na avaliação, sem busca de hiperparâmetros, alteração de limiares ou nova seleção por seus resultados. A métrica primária foi F1 macro; medidas por classe, ranking e custos complementaram a interpretação.

O CurrículoRank consome os resultados pré-calculados e permite inspecionar os 2.483 documentos, os 97 casos avaliados, as configurações e as explicações. A aplicação não processa novas candidaturas em tempo real nem representa um sistema de contratação validado. Sua função no estudo é tornar as saídas rastreáveis e facilitar a análise comparativa.

Construção e anotação do dataset

O conjunto de dados adotado neste trabalho corresponde ao Resume Dataset, disponibilizado na plataforma Kaggle por Snehaan Bhawal. A base original reúne currículos em língua inglesa, disponibilizados em formato PDF e textual, organizados por categorias profissionais. No conjunto considerado neste trabalho, foram identificados 2.484 currículos distribuídos em 24 categorias, como Information Technology, Accountant, Advocate, Arts, Banking, Chef, Teacher, Healthcare e Sales, entre outras.

As categorias da coleção apoiaram sua descrição e a seleção documentada, sem impor rótulos de aderência. A rubrica operacional atribui Adequado quando há evidência dos quatro requisitos técnicos e de desenvolvimento de aplicações; Parcialmente Adequado quando dois ou três requisitos estão sustentados; e Inadequado quando há zero ou um. Menções vagas, listas descontextualizadas e ambiguidades foram verificadas por leitura de trechos e contexto, sem inferir habilidade pela categoria ou pelo tempo de experiência.

O piloto histórico de 20 currículos incluiu dez documentos de Information Technology e dez de outras áreas, com três Adequados, três Parciais e catorze Inadequados. A ampliação posterior não utilizou esses números como retrato da coleção. A seleção dos novos casos foi intencional e enriquecida por sinais técnicos para ampliar a disponibilidade de exemplos relevantes, com semente e manifestos registrados antes da avaliação.

A referência de desenvolvimento foi consolidada em 294 documentos: seis Adequados, 75 Parcialmente Adequados e 213 Inadequados. Sua construção reuniu 99 representantes da revisão anterior e 195 dos 201 novos casos examinados; seis novos documentos permaneceram excluídos por dúvida. Há 59 decisões ratificadas individualmente pelo autor e 235 anotações da IA sob autorização. A ratificação ocorreu com propostas e evidências visíveis, sem anotação humana cega.

A coorte inicialmente reservada continha 100 documentos, anotados pela mesma IA que participou do desenvolvimento. Na revisão de históricos semelhantes, três documentos foram excluídos da avaliação principal por relação substancial com um histórico do desenvolvimento, antes da consulta às predições. Os 97 restantes contêm quatro Adequados, 35 Parciais e 58 Inadequados. Na auditoria da avaliação primária, o autor ratificou cinco casos intencionalmente apresentados. A conferência posterior do top 5 incluiu outro documento dessa coorte, sem mudar sua referência.

O plano inicial previa anotação manual. Na execução ampliada, a referência de avaliação foi construída com apoio de um modelo de linguagem, mediante aplicação de uma rubrica explícita de aderência técnica, com conferência do autor nos casos discriminados no protocolo. Essa alteração operacional foi explicitada, sem atribuir autoria humana aos rótulos não conferidos. As referências não constituem padrão humano independente, e a participação da mesma IA nas duas etapas pode correlacionar erros. Foram preservados identificadores, textos, trechos de evidência, justificativas, decisões e exclusões para permitir auditoria.

A consolidação por identificador reuniu 72 documentos distintos com conferência registrada do autor: 65 pertencem aos 294 casos de desenvolvimento, seis aos 97 de avaliação e um corresponde à versão 26746496, excluída do desenvolvimento. Os registros compreendem 60 ratificações do piloto, cinco da auditoria primária e 12 documentos do top 5 posterior; cinco identificadores aparecem em mais de uma etapa e foram contados uma única vez. As análises recuperadas do chat “Avaliação de currículos”, candidatos #010 a #014, correspondem a documentos já presentes no formulário devolvido do top 5 e não acrescentaram novos identificadores. Essa contagem reúne etapas distintas, sem transformar a conferência assistida em revisão independente ou modificar a referência primária.

Extração e pré-processamento textual

Após a seleção da base de currículos, foi executada a etapa de extração textual dos documentos em PDF. Os arquivos originais foram processados individualmente com a biblioteca PyMuPDF, utilizada para extrair o conteúdo textual de cada página dos currículos. O resultado dessa etapa foi armazenado em arquivos de texto, preservando a correspondência entre o PDF original, sua categoria profissional e seu identificador numérico.

Na etapa histórica, foram produzidas versões limpas para leitura. Na execução ampliada, os arquivos de texto processado foram usados com correspondência verificável aos documentos e hashes UTF-8 com finais de linha normalizados. Os marcadores de página presentes nesses arquivos foram mantidos na entrada atual. Não foi aplicado um novo procedimento de limpeza após observar os resultados.

O piloto histórico empregou textos limpos com limite de 12.000 caracteres. Na execução comparativa atual, o texto integral foi preservado para revisão, mas a entrada dos modelos foi definida como os primeiros 8.000 caracteres após remoção de espaços nas extremidades. BGE e Qwen tiveram ainda limite de 512 tokens. Não houve segmentação e agregação do documento inteiro; a evidência anotada fora dessa janela pode não ser acessível ao modelo.

A vaga de referência também foi preparada em formato textual. Como os currículos do piloto estavam em inglês, a descrição da vaga foi redigida no mesmo idioma, buscando manter compatibilidade lexical entre a consulta e os documentos analisados. Essa decisão metodológica foi importante para evitar que diferenças de idioma interferissem diretamente no cálculo de similaridade lexical realizado pelo TF-IDF.

Vetorização dos documentos

As três representações foram calculadas a partir dos mesmos documentos utilizáveis e da mesma vaga. A comparação distingue a tarefa de recuperação sem rótulos da classificação supervisionada: a primeira gera escores para os 2.483 documentos; a segunda exige ajuste restrito ao conjunto de treinamento. As revisões dos modelos, a ordem dos identificadores e os hashes dos vetores foram registrados.

Na recuperação, o TfidfVectorizer foi ajustado nos 2.483 textos, sem consumir rótulos, e a vaga foi transformada no mesmo vocabulário. Na classificação, um novo vetorizador foi ajustado somente nos documentos de treino de cada partição e, na avaliação final, somente nos 294 casos de desenvolvimento. Assim, o TF-IDF de recuperação não foi reutilizado como entrada supervisionada ajustada na coleção inteira.

O ajuste na coleção produziu uma matriz esparsa de 2.483 linhas e 652.064 atributos. O vocabulário de classificação ajustado nos 294 documentos teve 144.570 atributos. Essa diferença decorre dos conjuntos de ajuste e deve ser considerada ao discutir dimensão, custo e interpretação.

Os vetores foram comparados à vaga por cosseno para gerar o ranking completo. Os registros exportados mantêm identificador, escore e posição na coleção. Para a avaliação de qualidade, os mesmos escores foram restritos aos 97 julgados e reordenados, preservando separadamente a posição original nos 2.483.

Dessa forma, a vetorização por TF-IDF desempenha dois papéis neste trabalho. Primeiro, atua como baseline interpretável e de baixo custo computacional para a triagem automatizada de currículos. Segundo, valida o fluxo experimental inicial, desde a preparação dos documentos até a geração de um ranking preliminar baseado em similaridade textual.

3.4.1 Vetorização com TF-IDF

A primeira abordagem de vetorização adotada neste trabalho é baseada em TF-IDF (Term Frequency–Inverse Document Frequency), técnica amplamente utilizada em Recuperação de Informação e classificação textual. Nesse método, cada currículo e cada descrição de vaga são representados como vetores esparsos, cujas dimensões correspondem aos termos presentes no vocabulário do corpus. Os valores atribuídos a essas dimensões refletem a frequência dos termos nos documentos e sua raridade relativa no conjunto analisado.

A implementação utilizou o TfidfVectorizer da biblioteca scikit-learn. O piloto inicial com 20 documentos foi preservado como referência histórica. Na comparação atual, a recuperação utilizou o vocabulário da coleção sem rótulos e a classificação ajustou seu próprio vocabulário exclusivamente no treino, conforme a separação descrita anteriormente.

Foram utilizados unigramas e bigramas, conversão para minúsculas, min_df=1, max_df=1,0, normalização L2, suavização de IDF padrão, sem stop words, sem limite max_features e sem transformação sublinear de frequência. Os parâmetros permaneceram fixos, sem seleção de vocabulário a partir dos 97 casos.

A similaridade do cosseno produziu o ranking lexical, usado como referência de comparação com BGE e Qwen. Os classificadores receberam os vetores TF-IDF ajustados no treino, mas suas previsões de classe não modificaram esse ranking de recuperação.

A adoção do TF-IDF se justifica por seu papel como representação simples, eficiente e interpretável. Como cada dimensão do vetor está associada a um termo do vocabulário, torna-se possível inspecionar quais palavras contribuíram para a aproximação entre currículo e vaga. Essa característica é relevante em sistemas de triagem, nos quais a transparência dos critérios utilizados pode auxiliar a análise dos resultados. Por outro lado, por depender fortemente de sobreposição lexical, o TF-IDF apresenta limitações na captura de similaridade semântica entre expressões distintas, o que motivou a comparação com representações densas.

3.4.2 Vetorização com Sentence-Transformers

A representação densa especializada utilizou BAAI/bge-large-en-v1.5 por meio da biblioteca Sentence-Transformers, com vetores de 1.024 dimensões, pooling CLS e normalização L2. A ficha técnica pública descreve seu uso para embeddings e recuperação (BAAI, s. d.). A revisão do modelo foi fixada no identificador d4aa6901d3a41ba39fb536a557fa166f842b0e09.

Os currículos foram codificados individualmente, em lotes de quatro, sem ajuste dos pesos do encoder. Para a consulta, foi utilizado o prefixo “Represent this job posting for retrieval: ” antes da descrição da vaga. O escore foi obtido pelo produto interno dos vetores normalizados, equivalente ao cosseno. O encoder permaneceu congelado também na classificação.

O limite operacional foi fixado em 512 tokens sobre a entrada inicial de até 8.000 caracteres. Não foi utilizada divisão em janelas nem agregação de diferentes páginas. Essa escolha facilita a execução reproduzível, mas restringe a leitura de currículos longos e pode descartar evidências técnicas disponíveis na referência contextual.

A execução densa foi realizada em GPU, com lotes de quatro e vetores float32. A ordem dos 2.483 identificadores foi preservada no cache e conferida antes de cada avaliação. O mesmo vetor congelado de cada documento foi usado nas combinações supervisionadas, mantendo o ajuste dos classificadores separado da geração dos embeddings.

3.4.3 Vetorização com embeddings de LLMs

A terceira representação foi extraída do modelo base Qwen/Qwen2.5-0.5B, de propósito generativo, e não de um encoder especializado em similaridade de sentenças (QWEN, s. d.). A revisão fixada foi 060db6499f32faf8b98477b0a26969ef7d8b9987. O estudo avalia essa extração específica de estados internos, sem representar todos os modelos de linguagem ou um serviço externo de embeddings.

Foi carregado o modelo base com AutoModel, em modo de inferência, sem fine-tuning. O último estado oculto de cada token foi agregado por média ponderada pela máscara de atenção, excluindo posições de padding, seguido de normalização L2. Cada documento gerou um vetor de 896 dimensões em float32. A entrada foi truncada a 512 tokens sobre os primeiros 8.000 caracteres; não foram combinados segmentos posteriores.

Os vetores Qwen foram comparados à vaga por cosseno e utilizados como entrada dos mesmos três classificadores. A ausência de ajuste específico para recuperação e o pooling médio são características da implementação avaliada. Resultados favoráveis ou desfavoráveis dessa configuração não permitem concluir superioridade ou inferioridade geral de LLMs.

3.4.4 Considerações sobre as abordagens de vetorização

A comparação reúne uma representação esparsa lexical, um encoder denso especializado e uma extração de estados de um modelo generativo. Nenhuma representação foi considerada superior a priori. A capacidade de capturar relações contextuais é uma motivação técnica, cuja utilidade nesta tarefa deve ser examinada pelos resultados efetivamente observados.

A análise considerou classificação, ranking, dimensão, armazenamento, tempo e possibilidades de inspeção. Diferenças de função de treinamento, pooling e janela de leitura fazem parte das configurações comparadas; não foram isoladas como causas únicas do desempenho. Os resultados descrevem essas implementações, e não toda a família de modelos a que pertencem.

As três representações utilizaram os mesmos identificadores e a mesma referência de avaliação. O TF-IDF foi ajustado no treino supervisionado, e os encoders densos permaneceram pré-treinados e congelados. O processamento histórico do TCC1 foi mantido identificado separadamente, sem misturar suas métricas às da comparação atual.

Após a avaliação primária, executou-se uma análise complementar da janela de leitura equivalente. Para cada um dos 2.483 textos, partiu-se da entrada original de até 8.000 caracteres e selecionou-se um prefixo inicial que coubesse simultaneamente nos limites de 512 tokens dos tokenizadores BGE e Qwen, incluindo tokens especiais. O mesmo trecho textual foi fornecido ao TF-IDF. A retokenização foi verificada e o corte recuou quando necessário. Igualou-se o conteúdo disponível, sem exigir contagens idênticas de tokens entre modelos.

Os prefixos tiveram de 707 a 3.125 caracteres, com mediana de 2.589; 2.322 entradas foram encurtadas e 161 já cabiam na janela comum. Mantiveram-se a vaga inteira, as revisões e os procedimentos de pooling dos encoders, os 294 casos de desenvolvimento, os 97 de avaliação, os rótulos e os parâmetros das dezoito configurações. O TF-IDF de recuperação foi reajustado na coleção sem rótulos, e o da classificação somente no desenvolvimento. Não houve nova busca de hiperparâmetros ou ajuste de limiares. O protocolo foi registrado antes desta rodada, mas depois de conhecidos os resultados primários; portanto, não constitui teste independente.

Modelagem e treinamento

As representações foram utilizadas para classificar documentos em três níveis de aderência à única vaga de referência. Os exemplos de treinamento são currículos anotados para essa vaga; não se treinou um modelo geral com pares de múltiplas vagas. O delineamento permite examinar a combinação entre representação e classificador dentro desse contexto específico.

No desenvolvimento, foram executadas três partições estratificadas por grupos, com semente 42, mantendo históricos relacionados na mesma partição. Os seis Adequados permitiram dois exemplos dessa classe na validação e quatro no treino de cada rodada. Na avaliação dos 97 casos, cada classificador foi ajustado novamente nos 294 documentos de desenvolvimento, sem incorporar exemplos reservados ao treino.

Foram utilizados Regressão Logística, SVM linear e XGBoost. A regressão foi configurada com max_iter=2000 e random_state=42; a SVM, com kernel linear, probability=True e random_state=42; e XGBoost, com 50 árvores, profundidade máxima 3, taxa de aprendizado 0,1, random_state=42 e seis threads. Os demais parâmetros permaneceram nos padrões das versões registradas. Não houve busca de hiperparâmetros.

Cada combinação foi executada na condição original e com pesos de classe n/(3n_c), calculados apenas nas frequências do treino. Os pesos foram fornecidos como sample_weight aos três classificadores. A condição ponderada aumenta a contribuição relativa da classe rara na função de ajuste, sem criar documentos ou mudar os rótulos. A mesma fórmula foi preservada nas partições de desenvolvimento e no ajuste final.

A Figura 8 ilustra a passagem de texto a representação, classificador e avaliação. Na execução atual, as três representações alimentaram os classificadores. Os pesos desenhados e a probabilidade 0,87 da figura são exemplos didáticos, sem correspondência com uma previsão medida.

Figura 8 – Fluxo técnico da representação textual à classificação e à avaliação

Fonte: Apresentação de defesa do autor (2026, slides 8, 15, 19 e 26).

O diagrama é conceitual. Os rankings foram gerados diretamente por cosseno, enquanto os classificadores produziram decisões categóricas. Escores e probabilidades não foram usados como garantia de aderência ou contratação, nem a classificação foi confundida com a posição no ranking.

Os rótulos permaneceram categóricos na classificação. Para NDCG, foram utilizados graus 2, 1 e 0; para AP e Precision@k, somente Adequado foi considerado relevante. Essa definição foi mantida para as três representações e não dependeu dos resultados observados.

Os mesmos grupos e partições de desenvolvimento foram usados entre as configurações. Na avaliação reservada, foram geradas matrizes de confusão e previsões por identificador para todos os 97 casos. A separação documental reduz vazamento por versões relacionadas, mas não assegura independência dos erros de anotação.

Todos os parâmetros e as condições original e ponderada foram definidos no desenvolvimento antes da avaliação dos 97. Não houve calibração de limiar a partir dessa coorte. A maior pontuação observada é relatada descritivamente, sem selecionar um vencedor validado ou usar o conjunto reservado como nova fonte de otimização.

A modelagem supervisionada complementou o ranking vetorial. As métricas dos classificadores descrevem concordância com a referência assistida; as métricas de recuperação descrevem a ordenação dos 97 julgados. Custos e interpretabilidade completam a comparação, sem fundir essas tarefas numa única medida de qualidade.

Protocolo experimental e prevenção de vazamento de dados

O protocolo distinguiu três universos: coleção completa para representação e recuperação, desenvolvimento para ajustar e examinar configurações e coorte reservada para avaliação exploratória. Os resultados do piloto histórico foram preservados separadamente. A execução em escala não foi interpretada como comprovação de acurácia em documentos sem julgamento.

A seleção ampliada foi registrada por manifesto com semente tcc2-20261110-v1, antes da avaliação dos modelos. Inicialmente foram separados 300 casos de desenvolvimento e 100 reservados, com identificação de documentos semelhantes por grupos e revisão contextual. Após as exclusões documentadas, permaneceram 294 e 97, respectivamente. A seleção enriquecida por sinais técnicos não corresponde a amostragem aleatória representativa de toda a coleção.

A referência dos casos reservados foi anotada pela mesma IA que participou do desenvolvimento. A auditoria primária utilizou casos intencionalmente selecionados, com sugestões visíveis; a abrangência consolidada da conferência do autor está discriminada na Seção 3.2. Três históricos relacionados ao desenvolvimento foram excluídos antes da consulta às predições. As composições finais e a origem das decisões estão descritas na Seção 3.2 e no Apêndice A.

Na classificação, o vocabulário e o IDF foram ajustados somente nos dados de treino de cada fold e, no ajuste final, somente nos 294 documentos. Os textos reservados foram transformados com esse vetorizador. O ajuste do TF-IDF de recuperação na coleção inteira não usou rótulos e foi mantido separado, sem alimentar o treinamento supervisionado com esse vocabulário global.

Os encoders permaneceram congelados e os classificadores foram ajustados somente no desenvolvimento. O agrupamento documental reduz a sobreposição conhecida entre partições, sem garantir a ausência de versões relacionadas não identificadas. A participação da mesma IA nas duas referências também pode correlacionar erros, razão pela qual as métricas indicam concordância exploratória com as anotações disponíveis.

A comparação no desenvolvimento foi registrada em três folds por grupos. Seus resultados orientaram a documentação das condições, e a mesma grade foi executada nos 97 casos sem novas combinações. O protocolo, as versões e os hashes foram gravados antes do primeiro ajuste da avaliação reservada.

A única vaga foi tratada como consulta. Os indicadores de ranking foram calculados depois de restringir os escores aos mesmos 97 documentos julgados, com desempate por identificador crescente. São, portanto, métricas de um ranking no subconjunto julgado, e não Precision@k das primeiras posições da coleção completa. Os documentos sem julgamento não foram convertidos em irrelevantes. Com uma consulta, foi reportada AP; MAP exigiria média entre consultas distintas.

Os arquivos de referência, a ordem dos vetores e os textos foram conferidos por hashes antes da execução. As previsões e posições exportadas permitem rastrear os resultados por ID. O CurrículoRank apresenta esses snapshots; os dados simulados do protótipo inicial foram preservados como histórico e não integram as métricas atuais.

Métricas de avaliação

A avaliação distinguiu o resultado categórico dos classificadores da recuperação por similaridade. O F1 macro foi a métrica primária da classificação, acompanhado de acurácia de concordância, precisão, recall, F1 e suporte por classe, médias macro e ponderada e matrizes de confusão. A referência majoritária forneceu um ponto de comparação para o desbalanceamento.

Na recuperação, a qualidade foi examinada pela AP, NDCG e Precision@5 e @10 dentro dos 97 julgados. Na coleção de 2.483, foram apresentados cobertura, vetores, escores, ordenação e custo, sem atribuir qualidade global a documentos sem referência. A distinção entre posição na coleção e posição no subconjunto foi preservada nos arquivos de ranking.

Precisão e recall foram interpretados em relação à referência assistida, sem assumir que seus rótulos são verdade humana independente. Para Adequado, a precisão indica a proporção das marcações do modelo que coincide com a referência, e o recall indica quantos dos quatro casos da referência foram recuperados. Quando não houve predição da classe, precisão e F1 foram reportados como zero, com essa condição identificada.

A média macro atribui o mesmo peso às três classes, enquanto a ponderada considera suas frequências. Com quatro Adequados, um acerto adicional altera o recall da classe em 25 pontos percentuais. As proporções 58/35/4 da avaliação resultam da seleção documentada e não estimam a composição real dos 2.483 currículos.

A Precision@k foi calculada como o número de Adequados entre os primeiros k julgados dividido por k, para k=5 e k=10. Parcialmente Adequado não foi contado como positivo nessa medida binária. A definição foi explicitada porque critérios distintos de relevância produzem indicadores diferentes.

A AP sintetizou as precisões nas posições ocupadas pelos quatro Adequados, divididas pelo número de Adequados julgados. Uma única consulta não permite interpretar a medida como MAP entre vagas. A ordenação dos 97 reutilizou os escores de recuperação já gerados, sem ajuste pelos rótulos.

A NDCG considerou todos os 97 julgados e relevância graduada: Adequado=2, Parcial=1 e Inadequado=0. Foi utilizado ganho 2^grau−1 e desconto logarítmico por posição, com normalização pela ordenação ideal do mesmo conjunto. Assim, o indicador reconhece aderência parcial, diferentemente da AP e da Precision@k binárias.

A ROC-AUC, prevista no texto inicial, foi operacionalizada como complemento descritivo após a avaliação primária, sem alterar modelos ou selecionar configurações. Foram utilizadas as probabilidades de cada classe no esquema one-vs-rest, com AUC binária por classe, média macro e média ponderada pelos suportes (SCIKIT-LEARN DEVELOPERS, s. d.b). As previsões das dezoito configurações foram reproduzidas antes do cálculo. A medida avalia ordenação dos escores e não valida calibração, nem substitui o recall da decisão categórica.

Todas as medidas foram interpretadas descritivamente. Não foram realizados testes de significância nem produzidos intervalos que incorporem a incerteza dos rótulos da IA. Diferenças numéricas não estabelecem superioridade geral, e custos medidos em dispositivos e protocolos de repetição distintos não foram tratados como benchmark normalizado.

Custo computacional e interpretabilidade

Além das métricas de desempenho, este trabalho considera critérios complementares relacionados ao custo computacional e à interpretabilidade das abordagens avaliadas. Essa análise é relevante porque, em sistemas de triagem automatizada de currículos, a escolha de uma técnica não depende apenas da qualidade dos resultados, mas também da viabilidade de processamento, armazenamento e compreensão dos critérios utilizados.

O custo foi registrado para a geração das três representações nos 2.483 textos utilizáveis, além do ajuste e da inferência dos classificadores. O TF-IDF foi executado em CPU; BGE e Qwen utilizaram GPU. A geração vetorial exclui download e carregamento dos modelos. As medições de consulta incluem codificação e escores, mas não ordenação nem exportação. Diferentes dispositivos e números de repetições impedem interpretar esses tempos como comparação normalizada de eficiência. Os registros de memória correspondem às definições operacionais do protocolo, sem equivaler ao consumo incremental total do sistema.

A interpretabilidade do TF-IDF foi examinada nos modelos com pesos por meio dos coeficientes da Regressão Logística e das importâncias globais do XGBoost. Na regressão, cada contribuição local é o produto do valor TF-IDF pelo contraste entre os coeficientes de Adequado e Inadequado; a soma de todos os termos e do intercepto reproduz a diferença entre os logits dessas duas classes, com tolerância absoluta de 10⁻⁹. São mostrados os quinze termos de maior contribuição absoluta e a soma dos demais. O contraste não explica isoladamente a decisão entre as três classes. A importância global do XGBoost não tem direção e não constitui explicação local.

Para os vetores densos, foi realizada inspeção por oclusão em BGE com Regressão Logística e Qwen com SVM, ambos com pesos. Nos cinco casos previamente selecionados para auditoria, os tokens acessíveis foram divididos em oito blocos contíguos. Cada intervenção zerou a máscara de atenção de um bloco, preservando IDs, posições e o primeiro token; a média dos estados do Qwen empregou a mesma máscara. Foram oitenta intervenções, sem revelar conteúdo além dos 512 tokens originais. Registraram-se a variação do cosseno com a vaga, a mudança de classe e a diferença entre a margem original e a margem com máscara. A margem da regressão corresponde ao logit Adequado; a do SVM é o valor agregado OvR, não uma probabilidade.

Essas inspeções foram realizadas após a avaliação para descrever modelos já fixados, sem alterar rótulos, parâmetros ou limiares. Os exemplos são os mesmos da auditoria definida antes das métricas, enquanto a escolha dos quatro modelos inspecionados é posterior à avaliação. As predições desses modelos nos 97 casos foram reproduzidas, e as reencodificações originais conferidas com o cache. A oclusão mede sensibilidade a uma intervenção artificial, sem provar causalidade, competência profissional ou validade da referência assistida. A análise conjunta de qualidade, custo e transparência permanece descritiva.
