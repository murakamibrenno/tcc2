# Análise complementar de janela de leitura equivalente

Execução concluída em 19/11/2026. Esta análise foi planejada depois de conhecidos os resultados originais. Reutiliza os 97 casos como avaliação exploratória, sem apresentá-los como teste novo, independente ou não examinado. O protocolo foi gravado antes da tokenização e da geração dos novos vetores, e os hashes das fontes originais foram conferidos antes e depois.

## O que foi controlado

Cada um dos 2.483 textos utilizáveis recebeu um único prefixo compartilhado por TF-IDF, BGE e Qwen. Partiu-se da entrada original de até 8.000 caracteres, escolheu-se o menor fim de offset acessível em tokenizações BGE/Qwen de até 512 tokens, e verificou-se novamente o prefixo. Se retokenizar ultrapassasse o limite, o fim recuava por caracteres. Somente espaços finais foram removidos. O corte é seguro para ambos; não se presume que o número de tokens seja monotônico ao acrescentar caracteres, nem que esse seja sempre o maior prefixo possível.

O controle é do conteúdo textual disponível, não da igualdade do número de tokens. Os tokenizadores podem produzir contagens diferentes para o mesmo texto. A vaga inteira coube nos dois: 151 tokens para BGE, contando o prefixo de instrução original, e 119 para Qwen. A instrução BGE não acrescenta requisitos à vaga e foi preservada, sem otimização de prompt.

Os prefixos tiveram de 707 a 3.125 caracteres, com mediana 2.589. Houve redução da entrada original em 2.322 dos 2.483 documentos. BGE não perdeu conteúdo adicional na tokenização efetiva, conferida contra as contagens do manifesto; Qwen foi executado sem truncamento adicional e recusaria lotes acima do limite. Os textos integrais e os vetores originais foram preservados.

Permaneceram a mesma vaga, os mesmos 294 casos de desenvolvimento e os mesmos 97 de avaliação, com as referências originais. Foram repetidas as 18 configurações anteriores, sem buscar hiperparâmetros ou limiares novos. O TF-IDF de classificação foi ajustado somente nos 294 textos de treino; o da recuperação utilizou a coleção sem rótulos. Os encoders permaneceram congelados nas revisões originais.

## Resultados da recuperação nos 97

- TF-IDF: AP 0,635 → 0,741; NDCG 0,934 → 0,944; P@5 do subconjunto 0,40 → 0,60; P@10 0,20 → 0,30.
- BGE: AP 0,479 → 0,482; NDCG 0,865 → 0,864; P@5 do subconjunto 0,60 → 0,60; P@10 0,30 → 0,30.
- Qwen: AP 0,254 → 0,252; NDCG 0,776 → 0,775; P@5 do subconjunto 0,20 → 0,20; P@10 0,20 → 0,20.

A vantagem observada de TF-IDF na AP e na NDCG persistiu sob conteúdo compartilhado; portanto, o acesso a mais texto não é explicação suficiente para essa vantagem nesta consulta. Isso não demonstra superioridade geral, nem identifica a causa da melhora lexical. Cortar o texto também altera o vocabulário, as frequências, os IDFs e a normalização: remover informação e alterar a representação são consequências acopladas dessa condição. Não se comprovou isoladamente uma hipótese de redução de ruído.

## Classificação e diferenças entre configurações

O F1 macro de TF-IDF com XGBoost e pesos passou de 0,759 para 0,685, mantendo recall de Adequado em 0,50. As seis condições TF-IDF tiveram F1 macro menor, apesar da melhora do ranking por cosseno. Isso mostra que melhor ordenação não implica melhor classificação.

BGE com Regressão Logística e pesos passou de F1 0,743 para 0,734 e manteve recall 0,75. Qwen com SVM e pesos manteve F1 0,785 e recall 0,50, maior F1 macro observado nas duas condições de entrada. Essa estabilidade não se estende a todos os classificadores: Qwen com XGBoost e pesos passou de F1 0,682 para 0,544 e recall 0,25 para zero; BGE com SVM e pesos passou de recall 0,50 para 0,25. Nas nove condições sem pesos, nenhum Adequado foi recuperado novamente.

A grade completa, sem esconder resultados desfavoráveis, está em `classificacao_comparada.csv` e `comparacao_original_equivalente.json`. Matrizes e métricas por classe estão em `classificacao.json`, com 18 arquivos de predições por ID. Não foi escolhida uma nova configuração para produção pelos resultados desta análise.

## Topo da coleção completa

Os top 5 novos foram confrontados por ID com as decisões dos 12 documentos já conferidos pelo autor, incluindo a adjudicação assistida registrada anteriormente. Todos os cinco documentos de cada novo topo estavam nesse conjunto: não foi necessário presumir rótulos de documentos não julgados.

O P@5 completo foi recalculado pelas novas posições e pelos julgamentos existentes: TF-IDF 0,60 → 0,80 (3/5 → 4/5), BGE 0,80 → 0,80 e Qwen 0,60 → 0,60. A aplicação continua mostrando o experimento original; estes números são do controle complementar e não substituem os anteriores. Não se confundem com P@5 nos 97, cujos valores e posições são diferentes.

BGE continua com duas versões semelhantes em duas posições. A unidade é documento por identificador, sem agrupamento por candidato. Uma alteração de documento corresponde a 20 pontos percentuais no P@5. A revisão do autor, mesmo com as informações ocultas no formulário original, não constitui avaliação independente da pesquisa. A adjudicação de TOP-02 foi assistida; o histórico dessa decisão foi preservado.

## Custo e limites de interpretação

O vocabulário de recuperação de TF-IDF passou de 652.064 para 351.304 atributos. Os tempos desta rodada foram registrados nos arquivos de medição para auditoria. Não são usados para atribuir ganho ou perda de eficiência à janela: as execuções ocorreram em momentos distintos, com carga do computador não controlada, dispositivos mistos e poucas repetições. A etapa compartilhada de corte também é uma operação adicional, fora das medidas de vetorização.

O resultado fortalece a comparação técnica, mas não corrige a fragilidade da referência dos 97, os quatro Adequados, a seleção intencional, a vaga única ou a falta de revisão humana independente. Igualar o conteúdo não iguala pré-treinamento, arquitetura, pooling ou hardware. A condição continua lendo prefixos; não avalia segmentação ou compreensão de currículos completos. Diferenças são descritivas, sem teste de significância ou demonstração de causalidade isolada.

## Rastreabilidade e reprodução

O protocolo está em `protocolo_pre_execucao.json`; os hashes e comprimentos individuais, em `manifesto_prefixos.json`. `fontes_normalizadas_lf.json` complementa os hashes exatos dos bytes da execução com hashes UTF-8 normalizados somente para finais de linha, permitindo conferir checkouts Windows/Linux. O código executado é `piloto_tfidf/experimento_janela_equivalente.py`, cujo hash está congelado no protocolo. O cache de textos compartilhados e os vetores são regeneráveis e não entram no Git.

Utilize o ambiente do experimento original e as revisões de modelo registradas. Para preparar os snapshots locais, use `snapshot_download` de `huggingface_hub` para cada modelo e revisão do protocolo, com `cache_dir='.huggingface/hub'` a partir da raiz do repositório. Isso garante que o carregamento use os diretórios de snapshot explicitamente fixados. A execução utiliza os modelos locais, sem trocar automaticamente large por base ou outra revisão.

Execute da raiz do repositório, usando uma NOVA_PASTA, sem sobrescrever a pasta publicada:

```bash
python piloto_tfidf/experimento_janela_equivalente.py --etapa preparar --saida NOVA_PASTA
python piloto_tfidf/experimento_janela_equivalente.py --etapa representar --metodo tfidf --saida NOVA_PASTA
python piloto_tfidf/experimento_janela_equivalente.py --etapa representar --metodo bge --saida NOVA_PASTA
python piloto_tfidf/experimento_janela_equivalente.py --etapa representar --metodo qwen --saida NOVA_PASTA
python piloto_tfidf/experimento_janela_equivalente.py --etapa avaliar --saida NOVA_PASTA
python piloto_tfidf/experimento_janela_equivalente.py --etapa resumir --saida NOVA_PASTA
python -m unittest discover -s piloto_tfidf/tests -v
```

Os 63 testes Python passaram depois da execução, incluindo prefixos, fontes originais, matrizes, métricas, predições, ranking e cobertura dos julgamentos do top 5. Em caso de interrupção, uma representação sem arquivo final de medição pode ser retomada na mesma saída; métodos já concluídos não são sobrescritos. O diretório publicado deve permanecer como registro, sem reutilização para outra rodada.
