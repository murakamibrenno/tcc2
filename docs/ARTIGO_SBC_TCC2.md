Avaliação Comparativa de Representações Textuais Aplicadas à Triagem Automática de Currículos: TF-IDF, Sentence-Transformers e Embeddings de LLMs

Brenno Murakami

Bacharelado em Ciência da Computação
Instituto Federal de São Paulo – Campus Presidente Epitácio
Presidente Epitácio – SP – Brasil

brenno.murakami@gmail.com

Abstract. This study compares TF-IDF, BGE and Qwen representations for one backend/web vacancy. All 2,483 usable résumés were processed; 294 cases supported development and 97 supported exploratory evaluation. Among eighteen conditions, weighted Qwen with SVM reached macro F1 of 0.785. TF-IDF achieved AP of 0.635 within the judged subset. Costs and lexical and occlusion-based inspections complemented the analysis. Five evaluation labels received assisted human ratification; 92 remained AI-only. These references, the four Adequate cases and text truncation restrict generalization and preclude independent human validation.

Resumo. Este estudo compara TF-IDF, BGE e representações de Qwen para uma vaga backend/web. Foram processados 2.483 currículos; 294 casos apoiaram o desenvolvimento e 97, a avaliação exploratória. Entre dezoito condições, Qwen com SVM e pesos atingiu F1 macro de 0,785. TF-IDF obteve AP de 0,635 no subconjunto julgado. Custos e inspeções lexicais e por oclusão complementaram a análise. Cinco rótulos da avaliação tiveram ratificação humana assistida; 92 permaneceram somente da IA. Essas referências, os quatro Adequados e o truncamento restringem a generalização e impedem alegar validação humana independente.

## 1. Introdução

A triagem textual de currículos envolve dois problemas relacionados: ordenar documentos segundo uma vaga e atribuir classes de aderência a partir de exemplos. Em Recuperação de Informação, a descrição da oportunidade funciona como consulta, enquanto os currículos formam a coleção. A proximidade entre os textos pode apoiar a priorização da leitura, mas não comprova as experiências declaradas ou a competência profissional dos candidatos [Manning et al. 2008].

O uso de representações densas não elimina a necessidade de comparação experimental. BEIR e MTEB mostram que o desempenho depende das tarefas e dos conjuntos avaliados [Thakur et al. 2021; Muennighoff et al. 2023]. Na triagem de currículos, termos técnicos podem favorecer correspondência lexical, enquanto descrições heterogêneas, menções a atividades de terceiros e documentos longos dificultam interpretar os escores. Assim, custo, qualidade e possibilidade de inspeção devem ser considerados conjuntamente.

Este trabalho investiga como TF-IDF, Sentence-Transformers com BGE e embeddings extraídos de Qwen se comportam no mesmo protocolo para uma vaga de desenvolvimento backend/web em inglês. A pergunta é delimitada: quais compromissos de classificação, ordenação, custo e interpretabilidade são observados nessas implementações? Não se pretende estabelecer um vencedor entre famílias de modelos ou validar uma decisão real de contratação.

A contribuição consiste na comparação rastreável das três representações na coleção utilizável, na avaliação de dezoito configurações supervisionadas e na integração dos relatórios ao CurrículoRank. A coleção completa participa da vetorização, do ranking e dos custos; as métricas de qualidade dependem de referências disponíveis em um subconjunto separado. A construção assistida dessas referências é uma limitação central, preservada na leitura de todos os resultados.

## 2. Fundamentação e trabalhos relacionados

TF-IDF combina frequência local e frequência inversa de documentos para representar textos por termos do vocabulário. Cada dimensão é inspecionável, mas a comparação depende da correspondência lexical. Sentence-BERT propõe codificar sentenças separadamente e reutilizar os vetores na busca por similaridade [Reimers e Gurevych 2019]. Neste estudo, BGE é um encoder especializado, executado pela biblioteca Sentence-Transformers; Qwen é um modelo generativo do qual são extraídos estados ocultos. Essas funções de treinamento distintas fazem parte das configurações avaliadas [BAAI s.d.; Qwen s.d.].

Embeddings de modelos generativos requerem decisões sobre camada, agregação e contexto disponível. SGPT discute adaptações para busca semântica com decodificadores [Muennighoff 2022]. A extração aqui examinada utiliza média mascarada do último estado oculto de Qwen, sem ajuste fino ou treinamento específico de recuperação. Seu resultado não representa todos os serviços de embeddings ou todas as formas de usar modelos de linguagem.

Na literatura de person-job fit, Qin et al. [2018] propõem relacionar requisitos e experiências por atenção hierárquica, utilizando históricos de candidaturas. Bian et al. [2019] examinam adaptação de domínio para correspondência entre pessoas e vagas sob escassez de rótulos. Ambos contextualizam a importância de modelar a relação entre os textos; este trabalho compara representações congeladas e classificadores para uma única vaga, sem reproduzir essas arquiteturas.

As métricas desses trabalhos não são comparadas numericamente às obtidas aqui, pois as coleções, as tarefas e as referências diferem. O estudo presente oferece evidência local sobre implementações acessíveis e uma coleção pública, com atenção à diferença entre cobertura operacional e qualidade julgada. A referência assistida e a baixa frequência de Adequados impõem alcance exploratório à comparação.

## 3. Metodologia

### 3.1. Coleção e universos experimentais

Foi utilizado o Resume Dataset, disponibilizado por Bhawal [2021] no Kaggle, com currículos em inglês distribuídos em 24 categorias profissionais. O inventário reuniu 2.484 PDFs. Um arquivo em branco, ID 12632728, permaneceu documentado sem texto, vetor ou rótulo artificial. Os outros 2.483 documentos foram processados nas três representações, produzindo escores e rankings completos.

Tabela 1. Universos e papéis no experimento

Universo; Quantidade; Papel

PDFs inventariados; 2.484; Cobertura e inspeção da coleção

Textos utilizáveis; 2.483; Três representações, rankings e custos

Desenvolvimento; 294; Treino e validação em três folds

Avaliação exploratória; 97; Qualidade de classificação e ranking

Ratificações assistidas; 5 dos 97; Auditoria intencional; sem independência

A seleção ampliada foi intencional e enriquecida por sinais técnicos, com manifesto e semente tcc2-20261110-v1 registrados antes da avaliação. Dos 300 casos inicialmente destinados ao desenvolvimento, seis dúvidas foram excluídas. Dos 100 reservados, três históricos relacionados a um documento de desenvolvimento foram excluídos antes da consulta às predições, restando 97. A categoria profissional foi mantida como metadado, sem funcionar como rótulo de aderência ou veto.

### 3.2. Vaga e construção das referências

A consulta foi uma vaga de referência adaptada, Junior Software Developer (Backend / Web), em inglês, com quatro grupos de requisitos: SQL e bancos relacionais; APIs REST ou serviços web; Git ou controle de versão; e programação para desenvolvimento de aplicações. A formulação admite Java, Python, PHP, C#/.NET e linguagens semelhantes. A experiência acima da faixa júnior não foi usada como reprovação automática; avaliou-se a evidência técnica contextual do próprio candidato.

A rubrica atribui Adequado quando os quatro requisitos e o desenvolvimento de aplicações estão sustentados; Parcialmente Adequado quando há dois ou três requisitos; e Inadequado quando há zero ou um. Citações de tecnologias em anúncios recrutados ou atividades de terceiros não foram tratadas automaticamente como experiência. Trechos, justificativas, grupos documentais, decisões de elegibilidade e hashes dos textos foram preservados por identificador.

O desenvolvimento contém seis Adequados, 75 Parciais e 213 Inadequados. A referência reúne 59 decisões ratificadas individualmente pelo autor, com sugestões da IA visíveis, e 235 anotações da IA sob autorização. Na avaliação, há quatro Adequados, 35 Parciais e 58 Inadequados; cinco rótulos tiveram ratificação humana assistida e 92 permaneceram sem conferência humana. A mesma IA participou das duas etapas, podendo produzir erros correlacionados.

O plano inicial previa anotação manual. O procedimento ampliado foi assistido por IA, com ratificação parcial do autor. Essa alteração limita a validação, embora preserve a pergunta comparativa. A amostra auditada foi escolhida intencionalmente antes das métricas e não permite estimar concordância humana geral. Os registros identificam o anotador como assistente_IA, sem um snapshot imutável do serviço ou um prompt integral único; a repetição exata dessa etapa não é assegurada.

### 3.3. Preparação e representações textuais

Os textos extraídos dos PDFs foram mantidos com correspondência por ID e hashes UTF-8 com finais de linha normalizados. Os marcadores de página foram preservados. A entrada operacional corresponde aos primeiros 8.000 caracteres após remoção de espaços nas extremidades; BGE e Qwen também têm limite de 512 tokens. Não houve segmentação e agregação do documento completo. A referência pode considerar evidências presentes no texto integral e ausentes do vetor.

Na recuperação, TfidfVectorizer foi ajustado nos 2.483 textos sem rótulos e gerou 652.064 atributos. Foram usados unigramas e bigramas, minúsculas, min_df=1, max_df=1,0, suavização de IDF padrão, normalização L2, sem stop words, sem limite de vocabulário e sem frequência sublinear. Na classificação, outro vetorizador foi ajustado apenas no treino de cada fold; o ajuste final nos 294 documentos gerou 144.570 atributos. O vocabulário global de recuperação não alimentou esse treinamento.

BGE utilizou BAAI/bge-large-en-v1.5 na revisão d4aa6901d3a41ba39fb536a557fa166f842b0e09, com pooling CLS, vetores normalizados de 1.024 dimensões e lotes de quatro. A consulta recebeu o prefixo “Represent this job posting for retrieval: ”. Qwen utilizou Qwen/Qwen2.5-0.5B na revisão 060db6499f32faf8b98477b0a26969ef7d8b9987, com média do último estado oculto ponderada pela máscara de atenção, seguida de normalização L2 e vetores de 896 dimensões. Ambos permaneceram congelados, com vetores float32.

O ranking usa cosseno entre cada currículo e a vaga. Os classificadores recebem os vetores dos documentos anotados para essa única vaga e produzem decisões categóricas; não são um modelo geral de correspondência entre múltiplas vagas e candidatos. As probabilidades desses classificadores não foram utilizadas para gerar ou recalibrar os rankings completos.

### 3.4. Classificadores e protocolo de avaliação

Foram comparados Regressão Logística (LR), SVM linear e XGBoost (XGB) [Pedregosa et al. 2011; Chen e Guestrin 2016] nas condições original e com pesos de classe, totalizando dezoito configurações. LR utiliza max_iter=2000 e semente 42; SVM utiliza kernel linear, probability=True e semente 42; XGB utiliza 50 árvores, profundidade 3, taxa de aprendizado 0,1, semente 42 e seis threads. Os demais parâmetros seguem as versões registradas. Não houve busca de hiperparâmetros ou ajuste de limiares pelos 97 casos.

No desenvolvimento, três folds estratificados por grupos, com semente 42, mantiveram históricos relacionados na mesma partição. Cada rodada contém quatro Adequados no treino e dois na validação. Na condição ponderada, os três classificadores recebem sample_weight igual a n/(3n_c), calculado apenas nas frequências do treino. Na avaliação reservada, cada configuração foi ajustada em todos os 294 documentos e aplicada aos mesmos 97. O agrupamento reduz a sobreposição conhecida, sem garantir ausência de relações não identificadas.

### 3.5. Métricas e medições complementares

F1 macro foi a métrica primária da classificação, acompanhada de acurácia de concordância, medidas por classe, suporte e matriz de confusão. Uma referência majoritária contextualiza o desbalanceamento. Com quatro Adequados, um caso representa 25 pontos percentuais de recall. Os rótulos assistidos são a referência operacional; concordar com eles não demonstra qualidade de uma decisão profissional real.

Para o ranking, os escores completos foram restritos aos mesmos 97 julgados e reordenados, com desempate por ID crescente. AP e Precision@5/@10 consideram somente Adequado como relevante. NDCG [Järvelin e Kekäläinen 2002] usa graus 2/1/0, ganho exponencial 2^grau−1 e desconto logarítmico na posição acrescida de uma unidade, nas 97 posições. Trata-se de qualidade dentro do subconjunto julgado; documentos sem referência não foram convertidos em irrelevantes. Uma única vaga permite reportar AP, sem média entre consultas distintas.

ROC-AUC foi prevista no texto inicial e calculada como complemento posterior à análise primária, preservando previsões e configurações. Foram utilizadas probabilidades por classe no esquema one-vs-rest, com médias macro e ponderada pelos suportes. A medida descreve ordenação de escores, sem validar calibração [Scikit-learn Developers s.d.]. Custos e diferenças de desempenho são interpretados descritivamente, sem testes de significância ou intervalos que incorporem a incerteza da anotação.

A vetorização foi medida na coleção utilizável: TF-IDF em CPU, pela mediana de três ajustes; BGE e Qwen em uma passagem GPU após aquecimento, sem download ou carga. Consulta e escores correspondem à mediana de dez medições após descarte da primeira, excluindo ordenação e exportação. Registraram-se dimensões, arquivos vetoriais, RSS amostrado a cada 20 ms e memória GPU alocada pelo framework. Diferentes dispositivos e repetições impedem tratar esses tempos como benchmark normalizado.

## 4. Resultados

### 4.1. Classificação e efeito dos pesos

A referência majoritária obteve acurácia de concordância de 0,598 e F1 macro de 0,249. Nenhuma das nove condições originais emitiu a classe Adequado, apesar de a acurácia original chegar a 0,835 em TF-IDF com XGB. A Tabela 2 apresenta as nove combinações nas duas condições, com medidas da classe Adequado na condição ponderada. Os resultados abrangem as dezoito configurações, preservando os casos e as referências entre elas.

Qwen com SVM e pesos alcançou o maior F1 macro observado, 0,785, com acurácia 0,845. Recuperou dois dos quatro Adequados e realizou duas marcações dessa classe, ambas concordantes com a referência. TF-IDF com XGB e pesos apresentou a maior acurácia, 0,856, com F1 macro 0,759. Assim, o critério de maior acurácia não identifica a mesma configuração que o F1 macro.

BGE com LR e pesos recuperou três Adequados, mas marcou seis casos nessa classe: três concordantes e três falsos positivos. Qwen com LR também recuperou três, com oito marcações e cinco falsos positivos. O aumento de recuperação veio acompanhado de mais encaminhamentos indevidos à classe mais aderente. Pesos tampouco resolveram todas as combinações: BGE com XGB permaneceu sem recuperar Adequados e emitiu uma marcação incorreta.

Tabela 2. Classificação nos 97 casos: original e com pesos

Método; Modelo; F1 orig.; F1 pesos; Acurácia pesos; Precisão A pesos; Recall A pesos

TF-IDF; LR; 0,366; 0,550; 0,825; 0,000; 0,000

TF-IDF; SVM; 0,483; 0,544; 0,814; 0,000; 0,000

TF-IDF; XGB; 0,557; 0,759; 0,856; 0,667; 0,500

BGE; LR; 0,419; 0,743; 0,814; 0,500; 0,750

BGE; SVM; 0,452; 0,713; 0,814; 0,500; 0,500

BGE; XGB; 0,440; 0,450; 0,701; 0,000; 0,000

Qwen; LR; 0,272; 0,704; 0,804; 0,375; 0,750

Qwen; SVM; 0,249; 0,785; 0,845; 1,000; 0,500

Qwen; XGB; 0,514; 0,682; 0,825; 1,000; 0,250

A = Adequado; LR = Regressão Logística; XGB = XGBoost. F1 corresponde à média macro. Recall e precisão de Adequado são zero nas nove condições originais. Fonte: relatórios primários da execução de 10/11/2026.

Tabela 3. Matriz de Qwen com SVM e pesos nos 97 casos

Referência / predito; Inadequado; Parcial; Adequado

Inadequado; 49; 9; 0

Parcialmente Adequado; 4; 31; 0

Adequado; 0; 2; 2

Linhas = referência assistida; colunas = predição. Fonte: predições preservadas do experimento.

Na Tabela 3, treze casos das classes majoritárias foram confundidos entre Inadequado e Parcial, e dois Adequados foram previstos como Parciais. Os dois acertos de Adequado correspondem aos IDs 43311839 e 85101052, ainda sem conferência humana. Os Adequados 23464505 e 10624813, ratificados pelo autor, foram os dois falsos negativos. Esse recorte evidencia dependência dos rótulos da IA; não substitui a métrica agregada por uma estimativa humana baseada na pequena amostra intencional.

Apenas seis Adequados compõem o desenvolvimento. Sem ponderação, essa classe contribui pouco para a função de ajuste diante das demais. A baixa disponibilidade de exemplos, a separação aprendida e a regra categórica são explicações compatíveis com o resultado, mas não foram isoladas causalmente. A comparação usa as mesmas referências para as duas condições; diferenças frente a pilotos anteriores não podem ser atribuídas apenas a pesos ou crescimento dos dados.

### 4.2. Ordenação dos documentos julgados

As métricas da Tabela 4 descrevem a ordenação dos mesmos 97 julgados. As posições dos Adequados nesse subconjunto foram 1, 2, 11 e 15 no TF-IDF; 2, 3, 5 e 27 no BGE; e 3, 10, 11 e 19 no Qwen. Elas não correspondem necessariamente às posições da coleção completa. Os arquivos exportados mantêm as duas posições para evitar essa confusão.

Tabela 4. Qualidade de recuperação entre os 97 julgados

Representação; AP; NDCG; P@5; P@10

TF-IDF; 0,635; 0,934; 0,400; 0,200

BGE; 0,479; 0,865; 0,600; 0,300

Qwen; 0,254; 0,776; 0,200; 0,200

TF-IDF obteve as maiores AP e NDCG observadas, enquanto BGE concentrou mais Adequados nos cinco primeiros: três contra dois. As métricas valorizam aspectos distintos da ordenação. Qwen obteve menor AP por cosseno direto com a vaga, embora tenha alcançado maior F1 macro com SVM e pesos. Não há contradição: a primeira tarefa usa proximidade vetorial direta; a segunda depende de uma fronteira supervisionada ajustada nos 294 rótulos de desenvolvimento.

A descrição da vaga explicita tecnologias e serviços presentes nos currículos, o que é compatível com a vantagem lexical observada. Essa interpretação não comprova compreensão do contexto por TF-IDF, nem demonstra que representações densas são dispensáveis. Uma consulta e uma referência assistida não permitem extrapolar a ordem dos métodos a outras vagas, idiomas ou distribuições profissionais.

### 4.3. Custo na coleção utilizável

Tabela 5. Processamento dos 2.483 textos nas três representações

Método; Dimensão; Vetorização (s); Consulta e escores (ms); Dispositivo

TF-IDF; 652.064; 4,464; 12,494; CPU

BGE; 1.024; 121,825; 23,759; GPU RTX 4060

Qwen; 896; 150,410; 35,056; GPU RTX 4060

O equipamento registrado possui Intel Core i5-10400F, 12 CPUs lógicas e cerca de 40 GiB de RAM, com GPU NVIDIA GeForce RTX 4060 para os densos. A geração TF-IDF foi mais rápida nesta execução, mesmo sendo realizada em CPU. Contudo, a comparação envolve etapas e repetições distintas; os números descrevem a execução local, sem medir vantagem normalizada de hardware ou distribuição estatística dos tempos.

Os arquivos vetoriais ocuparam 15,249 MiB para TF-IDF em NPZ esparso comprimido, 9,699 MiB para BGE e 8,487 MiB para Qwen em NPY float32. Os picos RSS absolutos amostrados foram 377,879, 1.297,371 e 3.335,625 MiB, respectivamente; para TF-IDF, reporta-se o maior pico das três repetições. Os picos GPU alocados foram 1.384,745 e 2.091,706 MiB para BGE e Qwen. Tamanho de arquivo, RSS e alocação GPU são medidas distintas, sem equivalência direta com memória incremental ou VRAM total do sistema.

### 4.4. ROC-AUC complementar e interpretabilidade

Qwen com SVM original apresentou ROC-AUC macro de 0,940 mesmo classificando os 97 casos como Inadequado. Com pesos, a AUC macro foi 0,912 e dois Adequados foram recuperados. AUC considera a ordenação dos escores em comparações one-vs-rest; recall considera as classes efetivamente emitidas. No SVM, probability=True habilita probabilidades internas que podem não preservar exatamente a decisão categórica. Sua calibração não foi validada, e AUC elevada não corrige a ausência de recuperação da classe rara.

A interpretação lexical examinou LR e XGB com TF-IDF e pesos. Na LR, o produto entre TF-IDF e o contraste dos coeficientes de Adequado e Inadequado produz contribuições locais; sua soma com o intercepto reproduziu a diferença de logits nos cinco casos, com tolerância absoluta de 1e−9. Entre os termos de maior coeficiente positivo aparecem application, net, java, web e database. A decisão completa, porém, envolve também Parcialmente Adequado. Importâncias globais do XGB não indicam direção nem explicam isoladamente uma predição; não foram utilizadas explicações SHAP ou LIME.

Nos densos, BGE com LR e Qwen com SVM, ambos com pesos, foram inspecionados por oclusão. Oito blocos contíguos de tokens foram mascarados separadamente por caso, totalizando oitenta intervenções nos cinco documentos auditados. Preservaram-se IDs, posições, primeiro token e a janela original, sem revelar trechos posteriores; a média Qwen utilizou a máscara modificada. Houve mudança de classe em uma intervenção BGE e em três Qwen, envolvendo um e dois casos, respectivamente. Essas observações medem sensibilidade local a máscaras artificiais, não causalidade profissional ou robustez geral.

## 5. Análise de erros e ameaças à validade

O caso 23464505, JAVA INTERN, possui referência Adequado com evidências de SQL, serviços SOAP/REST, Git e desenvolvimento de aplicações. Qwen com SVM e pesos produziu Parcialmente Adequado; BGE com LR e pesos produziu Adequado. Dos 3.187 caracteres integrais, os limites visíveis foram 2.155 e 2.240. A divergência entre modelos mostra que a resposta depende da configuração, sem isolar um mecanismo de compreensão semântica.

Em 10624813, a referência reúne PL/SQL, REST/SOAP, GitHub e desenvolvimento de comércio eletrônico. Qwen produziu Parcialmente Adequado e BGE com LR produziu Inadequado. Suas janelas alcançaram 2.648 e 2.779 dos 6.651 caracteres do documento. Em 62994611, a referência Parcial registra SQL, APIs e C#, sem confirmação contextual de Git, enquanto BGE com LR produziu Adequado. Os casos ilustram omissão e falso positivo em relação à rubrica, sem provar que cada erro decorre do truncamento.

A ameaça principal é a construção da referência pela mesma IA nas etapas de desenvolvimento e avaliação. Um modelo pode concordar com erros dessa referência. As cinco ratificações assistidas, intencionais e com sugestões visíveis, não validam os demais 92 rótulos e não constituem avaliação por anotadores independentes. O pequeno suporte de Adequado amplia a instabilidade: a precisão 1,000 de Qwen com SVM representa somente duas marcações concordantes, ainda sem conferência humana.

A seleção enriquecida não estima prevalência na coleção; a vaga única restringe validade externa. O agrupamento e as exclusões reduzem versões relacionadas conhecidas, mas a revisão contextual identificou relações que a etapa lexical inicial não havia capturado. Não se assegura ausência absoluta de outras relações. Também não houve avaliação de equidade demográfica, verificação externa das experiências declaradas ou mensuração de decisões reais de contratação.

As janelas de leitura, os objetivos de pré-treinamento e o pooling diferem entre representações. Sem ablações sistemáticas, esses fatores não podem ser isolados como causas do desempenho. Custos usam hardware misto e repetições distintas; explicações cobrem cinco exemplos e modelos escolhidos após a avaliação. Novas configurações exigem outra separação de avaliação, sem otimizar repetidamente os mesmos 97 casos e reapresentá-los como teste inédito.

## 6. Integração e reprodução no CurrículoRank

O CurrículoRank apresenta um snapshot exportado dos relatórios e manifestos por uma aplicação React/Vite. O ranking abre na coleção utilizável de 2.483 currículos, com total destacado e opção dos 97 julgados. As telas distinguem cosseno, referência, proveniência, predições, custos e explicações. Filtrar a exibição não recalcula as métricas de qualidade nem atribui referência aos documentos não julgados. A interface não executa treinamento ou inferência de novas candidaturas em tempo real.

Figura 1. Ranking da coleção utilizável no CurrículoRank. Fonte: aplicação própria; captura fornecida pelo autor em 10/11/2026.

Os scripts, os protocolos e os relatórios estão em https://github.com/murakamibrenno/tcc2. A referência da execução é o commit 3b3c41f4fa8bc3152e07f89b38f6ea1e42633058. Os manifestos identificam a seleção, as exclusões, a ordem dos vetores e os hashes; as previsões por ID permitem recalcular as métricas. Os textos processados estão disponíveis no repositório. A reprodução completa dos encoders requer o cache vetorial ou sua regeneração com as revisões de modelo fixadas.

Foram registrados NumPy 2.5.4, scikit-learn 1.9.1, XGBoost 3.4.1, Sentence-Transformers 6.2.0, Transformers 5.22.2 e PyTorch 2.14.1+cu130. Os comandos dos scripts e os requisitos estão preservados junto do código. Cinquenta e cinco testes Python, nove testes de interface e o build verificaram integração técnica. As capturas fornecidas pelo autor permitiram inspeção estática desktop; testes interativos completos e a conferência em telas menores permanecem pendentes e não são substituídos por essas verificações.

## 7. Conclusão

A comparação executada preservou a participação dos 2.483 documentos utilizáveis e distinguiu processamento da coleção e avaliação exploratória de qualidade. TF-IDF foi competitivo na recuperação da vaga avaliada; BGE concentrou mais Adequados entre os cinco primeiros julgados. Na classificação, Qwen com SVM e pesos alcançou maior F1 macro observado e recuperou dois dos quatro Adequados, enquanto nenhuma condição original recuperou essa classe. O resultado depende da combinação entre representação, classificador e condição de ajuste.

O estudo fornece evidência sobre as implementações examinadas, com custos locais e explicações rastreáveis. Referências assistidas, poucos Adequados, seleção intencional, vaga única e truncamento impedem concluir superioridade geral ou qualidade validada para contratação. A continuidade requer referência humana independente mais ampla, múltiplas vagas e investigação de documentos longos e estratégias de agregação, com nova avaliação reservada. O CurrículoRank apoia a inspeção desses resultados e de seus limites.

## Referências

BAAI (s.d.). BGE large English v1.5. Hugging Face. https://huggingface.co/BAAI/bge-large-en-v1.5. Acesso em 10/11/2026.

Bhawal, S. (2021). Resume Dataset. Kaggle. https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset. Acesso em 08/04/2026.

Bian, S., Zhao, W. X., Song, Y., Zhang, T. e Wen, J.-R. (2019). Domain Adaptation for Person-Job Fit with Transferable Deep Global Match Network. In EMNLP-IJCNLP, p. 4810–4820. DOI: 10.18653/v1/D19-1487.

Chen, T. e Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. In KDD, p. 785–794. DOI: 10.1145/2939672.2939785.

Järvelin, K. e Kekäläinen, J. (2002). Cumulated gain-based evaluation of IR techniques. ACM Transactions on Information Systems, 20(4):422–446. DOI: 10.1145/582415.582418.

Manning, C. D., Raghavan, P. e Schütze, H. (2008). Introduction to Information Retrieval. Cambridge University Press. https://nlp.stanford.edu/IR-book/.

Muennighoff, N. (2022). SGPT: GPT Sentence Embeddings for Semantic Search. arXiv:2202.08904. https://arxiv.org/abs/2202.08904.

Muennighoff, N., Tazi, N., Magne, L. e Reimers, N. (2023). MTEB: Massive Text Embedding Benchmark. In EACL, p. 2014–2037. https://aclanthology.org/2023.eacl-main.148/.

Pedregosa, F. et al. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12:2825–2830. https://jmlr.org/papers/v12/pedregosa11a.html.

Qin, C., Zhu, H., Xu, T., Zhu, C., Jiang, L., Chen, E. e Xiong, H. (2018). Enhancing Person-Job Fit for Talent Recruitment: An Ability-aware Neural Network Approach. In SIGIR, p. 25–34. DOI: 10.1145/3209978.3210025.

Qwen (s.d.). Qwen2.5-0.5B. Hugging Face. https://huggingface.co/Qwen/Qwen2.5-0.5B. Acesso em 10/11/2026.

Reimers, N. e Gurevych, I. (2019). Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks. In EMNLP-IJCNLP, p. 3982–3992. https://aclanthology.org/D19-1410/.

Scikit-learn Developers (s.d.). roc_auc_score. Scikit-learn documentation. https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html. Acesso em 10/11/2026.

Thakur, N., Reimers, N., Rücklé, A., Srivastava, A. e Gurevych, I. (2021). BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models. arXiv:2104.08663. https://arxiv.org/abs/2104.08663.
