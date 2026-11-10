# Coorte anotada por IA e auditoria humana limitada

Atualização posterior: o autor aprovou os cinco casos apresentados, sem correções. A ratificação assistida está registrada em `auditoria_humana_5_casos_v1.json`; a referência original da IA continua preservada. A avaliação dos 97 foi executada; ver [resultados](../output/coorte97_v1/README.md). O texto abaixo descreve o estado anterior à aprovação.

## Alteração autorizada pelo autor

O autor substituiu a revisão humana integral planejada dos 100 casos por anotação da IA, seguida de conferência de uma amostra pequena. Esta decisão altera a proveniência da referência de avaliação. O desenho comparativo de representações e classificadores permanece, mas a evidência obtida será exploratória e não uma validação humana independente.

O protocolo foi registrado antes da anotação em `protocolo_anotacao_teste_ia_v1.json`. A revisão está congelada em `revisao_teste_ia_100_v1.json`, com evidências conferidas no texto fonte e hashes. A IA utilizou busca no texto integral e conferência contextual, com leitura ampliada de casos técnicos e ambíguos. Não alegar leitura humana integral, dois avaliadores independentes ou 100 rótulos ratificados pelo autor.

## Resultado da anotação

Foram anotados 100 casos: 4 Adequados, 38 Parcialmente Adequados e 58 Inadequados. A mesma rubrica foi mantida: quatro requisitos técnicos com desenvolvimento de aplicações para Adequado, dois ou três para Parcial, zero ou um para Inadequado. Categoria e excesso de experiência não vetam. Tecnologias citadas apenas como competências de pessoas recrutadas não comprovam domínio técnico do candidato; nomes de produtos, empresas ou normas não são automaticamente competências de SQL, serviços ou programação.

Há **zero confirmações humanas nesta rodada**. A autoria dos 100 rótulos permanece IA.

## Relação documental encontrada na revisão

11981094, 28078163 e 31677347 repetem substancialmente projetos, equipes e histórico presentes em 28762662 do desenvolvimento. O grupo também inclui 64468610, fora do subconjunto. A evidência está em `correcao_grupo_nexio_v1.json`. A revisão contextual identificou uma relação não inteiramente capturada pelo limiar automático original de Jaccard >=0,90.

Os 100 IDs e a seleção original permanecem preservados. Os três casos relacionados foram excluídos da avaliação principal, restando **97 elegíveis: 4 Adequados, 35 Parciais e 58 Inadequados**. A correção ocorreu antes de consultar predições nessa coorte; não decorre de erros/acertos dos modelos. O desenvolvimento e os resultados anteriores não foram retreinados nem sobrescritos. Eventual avaliação nova deve aplicar esta elegibilidade corrigida a todas as combinações.

## Auditoria humana proposta

Cinco casos intencionais, com sugestões e evidências da IA visíveis:

- 23464505: Adequado; Java Intern, quatro requisitos e desenvolvimento de aplicações.
- 10624813: Adequado; Engineering Operations Director, quatro requisitos; senioridade não é veto.
- 62994611: Parcialmente Adequado; SQL, APIs e programação, sem Git confirmado.
- 47603843: Parcialmente Adequado; experiência declarada com Google APIs e desenvolvimento Android em Java; SQL e Git não confirmados. A interpretação do requisito de serviços merece conferência.
- 18297650: Inadequado; as tecnologias descrevem competências de profissionais recrutados, sem prática técnica própria comprovada.

A seleção cobre classes e dificuldades, sem consultar erros dos classificadores. Não é uma amostra aleatória representativa. A concordância do autor, se recebida, será registrada somente nesses casos, como ratificação assistida e não como anotação cega. Não extrapolar uma taxa de concordância para os 100, calcular concordância entre avaliadores independentes ou promover os demais 95 rótulos a humanos.

## Limitação e próxima etapa

A mesma IA participou das anotações de desenvolvimento e avaliação, podendo reproduzir erros e interpretações nas duas referências. A separação de documentos e o congelamento antes de predições não eliminam essa dependência. Métricas futuras nesta coorte medirão concordância exploratória com a referência assistida por IA, não acurácia contra verdade humana independente. O suporte de apenas quatro Adequados e o enriquecimento da seleção também limitam conclusões.

Nesta etapa **não foram calculadas métricas dos classificadores na coorte de 97**; os números publicados de classificação continuam referentes à validação cruzada no desenvolvimento. Aguardar a auditoria proposta, registrar eventuais correções com fonte e autoria e só então consolidar a referência para comparação exploratória, sem ajustar modelos a partir de seus resultados.

## Reproduzir a validação e a amostra

```powershell
python preparar_auditoria_teste_ia.py --saida CAMINHO_LOCAL_AUDITORIA
python -m unittest discover -s tests -q
```

O comando confere IDs, hashes, evidências, rubrica, proveniência, exclusões e ausência de grupos do desenvolvimento entre os elegíveis. Gera uma página com cinco propostas e textos integrais. Não grava concordâncias humanas automaticamente. O formulário antigo para revisão integral continua histórico; o procedimento vigente é esta auditoria limitada.
