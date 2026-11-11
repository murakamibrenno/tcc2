# Apêndices do trabalho completo

## APÊNDICE A – Vaga e protocolo de anotação

A descrição abaixo é a consulta integral utilizada para gerar os escores nas três representações. Trata-se de uma vaga de referência adaptada para a pesquisa, sem vinculação a um processo de contratação real. Categoria profissional e experiência acima da faixa indicada não constituíram vetos automáticos.

Junior Software Developer (Backend and Web Applications). Build and maintain web services and backend components, integrate with relational databases, and work with multidisciplinary teams in agile environments. Required skills: SQL and relational databases (MySQL, PostgreSQL, Oracle, SQL Server); RESTful APIs, web services, or service integration; version control with Git or GitHub; programming experience in Java, Python, PHP, C#, or similar for application development. Desired: Spring, .NET, Docker, automated testing, microservices. Experience level: Junior to mid-level (0-3 years). Work mode: Hybrid.

A rubrica considera quatro grupos de evidência: SQL ou bancos relacionais; APIs REST, serviços web ou integração de serviços; Git ou controle de versão; e linguagem de programação aplicada ao desenvolvimento. Adequado exige os quatro grupos e evidência de desenvolvimento de aplicações; Parcialmente Adequado exige dois ou três; Inadequado corresponde a zero ou um. Tecnologias mencionadas em atividades de recrutamento ou em descrições de terceiros não foram atribuídas automaticamente ao candidato.

O procedimento registrado em protocolo_anotacao_teste_ia_v1.json foi: conferir evidências no texto integral e congelar decisões antes de consultar predições dos classificadores nos casos; não retreinar com a coorte. A revisão registrou por documento o atendimento de cada critério, trechos de evidência, justificativa, grupo documental, elegibilidade e hash do texto. A leitura de trechos da IA não equivale a julgamento humano independente.

A anotação foi realizada por um assistente de IA na sessão de trabalho de 10/11/2026. Os arquivos preservados identificam o anotador como assistente_IA, mas não registram um identificador imutável do modelo, sua versão de serviço, temperatura ou um prompt único integral para todas as decisões. Portanto, a rubrica e o procedimento aqui descritos documentam os registros existentes, sem apresentar uma reconstrução posterior como prompt original reproduzível. Essa lacuna restringe a repetição exata da etapa de anotação.

No desenvolvimento, 59 decisões tiveram ratificação individual assistida e 235 permaneceram anotadas pela IA sob autorização. Na coorte avaliada, 23464505, 10624813, 62994611, 47603843 e 18297650 foram ratificados com sugestões visíveis, abrangendo dois Adequados, dois Parciais e um Inadequado. A seleção foi intencional e anterior às métricas; os demais 92 casos não receberam conferência humana. O registro de auditoria posterior à revisão da IA é a fonte vigente da proveniência.

Como exemplos das evidências preservadas, 23464505 inclui “Design patterns, SQL, Pl/SQL”, “Consuming and producing SOAP and Restful web services” e “tomcat, JBOSS, Git”. Em 62994611 constam SQL, integração de APIs e desenvolvimento em C#, sem confirmação contextual de Git. Essas evidências sustentam a referência segundo a rubrica e não constituem certificação externa das competências declaradas.

A disponibilização pública da coleção e a licença declarada na fonte permitem contextualizar sua origem; não demonstram que as experiências declaradas foram verificadas. O estudo não avaliou equidade entre grupos demográficos, discriminação ou efeitos de decisões de recrutamento. Os resultados são destinados à análise experimental, com inspeção humana das evidências, e não a decisões automáticas sobre pessoas.

## APÊNDICE B – Reprodução e rastreabilidade

O código, os protocolos e os relatórios estão no repositório https://github.com/murakamibrenno/tcc2. A referência de execução consultada nesta revisão documental é o commit 3b3c41f4fa8bc3152e07f89b38f6ea1e42633058. As correções dos documentos e as análises descritivas posteriores não alteram o treinamento ou os rótulos dessa execução.

O ambiente registrado utiliza Python, NumPy 2.5.4, scikit-learn 1.9.1, XGBoost 3.4.1, Sentence-Transformers 6.2.0, Transformers 5.22.2 e PyTorch 2.14.1+cu130. Os requisitos instalados foram preservados em piloto_tfidf/requirements-experimento-v1.lock.txt. A interface utiliza Node compatível com Vite 8 e dependências fixadas em package-lock.json. As versões descrevem o ambiente medido; não garantem tempos idênticos em outro equipamento.

Os textos estão em curriculos_processados/extracted_text_en. Os manifestos ficam em piloto_tfidf/data/validacao_ampliada_v1, desenvolvimento_revisado_v2 e coorte_97_v1. Os resultados primários ficam em piloto_tfidf/output/coorte97_v1; ROC-AUC complementar e interpretabilidade estão em complemento_auc97_v1 e interpretabilidade_atual_v1. As matrizes e predições por ID permitem recalcular as medidas sem executar novamente os encoders.

A reprodução completa requer os textos, os manifestos e o cache vetorial, ou sua regeneração com executar_escala_v1.py e os modelos nas revisões fixadas. O cache de vetores não deve ser presumido como parte dos relatórios JSON. Na linha de comando, --help documenta as opções; os programas de avaliação exigem nova pasta de saída para preservar execuções anteriores.

python piloto_tfidf/avaliar_coorte_97.py --escala CAMINHO_CACHE_VETORIAL --saida NOVA_PASTA

python piloto_tfidf/interpretar_experimento_atual.py --escala CAMINHO_CACHE_VETORIAL --saida NOVA_PASTA_INTERPRETACAO

python -m unittest discover -s piloto_tfidf/tests -v

npm ci --ignore-scripts; npm test; npm run build (no diretório aplicacao_mockup)

CAMINHO_CACHE_VETORIAL e NOVA_PASTA são argumentos a substituir por diretórios locais. A conferência técnica registrada compreendeu 55 testes Python e nove testes da interface, além do build. As doze capturas fornecidas pelo autor documentam a apresentação desktop. Testes interativos completos de filtros, seletores, modal e navegação, bem como a conferência em telas menores, permanecem separados dessa evidência estática e devem ser registrados antes da demonstração final.
