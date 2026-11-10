# Avaliação exploratória dos 97 casos

## Conferência humana registrada

O autor aprovou explicitamente os cinco casos apresentados: 23464505, 10624813, 62994611, 47603843 e 18297650. A mensagem e as decisões estão em `validation/auditoria_humana_5_casos_v1.json`. Trata-se de ratificação humana assistida de amostra intencional, com rótulos e evidências da IA visíveis. Não é anotação cega, julgamento independente ou confirmação dos demais 92 casos. O snapshot original dos 100 rótulos da IA foi preservado; a conferência foi registrada separadamente.

A coorte consolidada tem 97 registros: 58 Inadequados, 35 Parcialmente Adequados e 4 Adequados; cinco com ratificação assistida e 92 sem conferência humana. Os três casos relacionados ao histórico Nexio do desenvolvimento continuam excluídos. As seis dúvidas do desenvolvimento não foram incluídas no treino.

## Protocolo executado

Todas as configurações já avaliadas no desenvolvimento foram executadas: três representações × três classificadores × duas condições (original e pesos balanceados). Foram ajustadas em todos os 294 casos do desenvolvimento, com parâmetros e sementes anteriores, antes de inferir os 97. Pesos calculados somente no treino; TF-IDF ajustado somente nos 294 textos. Vetores densos, fontes e ordem dos IDs conferidos por hash. Não houve busca de hiperparâmetros, mudança de rótulo, ajuste de limiar ou nova condição depois de observar os 97.

O protocolo, os hashes das referências e a proveniência foram gravados antes do primeiro ajuste em `protocolo_pre_execucao.json`. Custos de ajuste e inferência são uma medição descritiva por configuração, não benchmark repetido nem teste de significância.

## Classificação contra a referência assistida

A referência majoritária atingiu acurácia/concordância de 0,598 e F1 macro de 0,249. As matrizes e métricas por classe estão em `classificacao_coorte97.json`; as predições por ID permanecem rastreáveis nos arquivos correspondentes.

| Condição | Representação | Classificador | Acurácia/concordância | F1 macro | Precisão Adequado | Recall Adequado | Recuperados / referência |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| original | TF-IDF | Regressão Logística | 0.660 | 0.366 | 0.000 | 0.000 | 0/4 |
| original | TF-IDF | SVM | 0.753 | 0.483 | 0.000 | 0.000 | 0/4 |
| original | TF-IDF | XGBoost | 0.835 | 0.557 | 0.000 | 0.000 | 0/4 |
| original | BGE | Regressão Logística | 0.691 | 0.419 | 0.000 | 0.000 | 0/4 |
| original | BGE | SVM | 0.722 | 0.452 | 0.000 | 0.000 | 0/4 |
| original | BGE | XGBoost | 0.701 | 0.440 | 0.000 | 0.000 | 0/4 |
| original | Qwen | Regressão Logística | 0.608 | 0.272 | 0.000 | 0.000 | 0/4 |
| original | Qwen | SVM | 0.598 | 0.249 | 0.000 | 0.000 | 0/4 |
| original | Qwen | XGBoost | 0.784 | 0.514 | 0.000 | 0.000 | 0/4 |
| pesos_balanceados | TF-IDF | Regressão Logística | 0.825 | 0.550 | 0.000 | 0.000 | 0/4 |
| pesos_balanceados | TF-IDF | SVM | 0.814 | 0.544 | 0.000 | 0.000 | 0/4 |
| pesos_balanceados | TF-IDF | XGBoost | 0.856 | 0.759 | 0.667 | 0.500 | 2/4 |
| pesos_balanceados | BGE | Regressão Logística | 0.814 | 0.743 | 0.500 | 0.750 | 3/4 |
| pesos_balanceados | BGE | SVM | 0.814 | 0.713 | 0.500 | 0.500 | 2/4 |
| pesos_balanceados | BGE | XGBoost | 0.701 | 0.450 | 0.000 | 0.000 | 0/4 |
| pesos_balanceados | Qwen | Regressão Logística | 0.804 | 0.704 | 0.375 | 0.750 | 3/4 |
| pesos_balanceados | Qwen | SVM | 0.845 | 0.785 | 1.000 | 0.500 | 2/4 |
| pesos_balanceados | Qwen | XGBoost | 0.825 | 0.682 | 1.000 | 0.250 | 1/4 |

O maior F1 macro observado foi 0,785, com Qwen + SVM e pesos. Foram recuperados 2 dos 4 Adequados da referência; as duas marcações Adequado concordaram com a referência. Os outros dois Adequados foram classificados como Parciais. Isso não equivale a precisão perfeita comprovada em uso real: houve apenas duas marcações dessa classe e a referência não é humana independente.

BGE + Regressão Logística e pesos recuperou 3 dos 4, com três falsos positivos (3 acertos entre 6 marcações). Qwen + Regressão Logística e pesos também recuperou 3 de 4, mas com cinco falsos positivos (3 entre 8). Todas as nove combinações originais, sem pesos, tiveram recall zero para Adequado. Pesos não resolveram todas as combinações, como BGE + XGBoost, que continuou com recall zero. A maior acurácia/concordância foi de TF-IDF + XGBoost com pesos (0,856), diferente da configuração de maior F1 macro.

Os números não estabelecem um vencedor definitivo nem justificam escolher hiperparâmetros pelo teste. São resultados descritivos das condições já fixadas, contra uma referência assistida. Aumento de dados, composição da amostra e pesos são fatores distintos; não atribuir causalmente toda diferença ao crescimento do subconjunto.

## Ranqueamento dentro dos 97 julgados

Uma vaga de referência: reportar AP, não MAP. Para AP e P@k, apenas Adequado é relevante; para NDCG, os graus são 2/1/0, com ganho 2^grau−1. Empates por ID crescente. Os escores foram calculados antes dos rótulos da coorte; nenhuma ordenação foi ajustada para favorecer a referência.

| Representação | AP Adequado | NDCG graduado | P@5 | P@10 | Posições dos quatro Adequados nos 97 |
| --- | ---: | ---: | ---: | ---: | --- |
| TF-IDF | 0.635 | 0.934 | 0.400 | 0.200 | 1, 2, 11, 15 |
| BGE | 0.479 | 0.865 | 0.600 | 0.300 | 2, 3, 5, 27 |
| Qwen | 0.254 | 0.776 | 0.200 | 0.200 | 3, 10, 11, 19 |

TF-IDF apresentou maior AP e NDCG observados; BGE colocou três Adequados entre os cinco primeiros, contra dois do TF-IDF. Os indicadores medem aspectos diferentes: posição global dos quatro positivos, graus de aderência e um corte inicial. Nenhum deles representa avaliação integral dos 2.483 currículos utilizáveis.

Os CSVs `ranking_julgado97_*` identificam separadamente posição no subconjunto de 97 e posição na coleção de 2.483. Documentos não julgados não foram considerados irrelevantes. O TF-IDF de recuperação foi ajustado na coleção utilizável inteira, sem rótulos, e é distinto do TF-IDF de classificação ajustado apenas no desenvolvimento.

## Limitações e interpretação

A mesma IA participou da anotação de desenvolvimento e avaliação; erros de interpretação podem estar correlacionados. As cinco ratificações assistidas, de seleção intencional, não validam os demais 92 rótulos, não estimam uma taxa de concordância geral e não correspondem a dois avaliadores independentes. Não calcular concordância interavaliadores independentes nem chamar a coorte de teste humano independente.

Há apenas quatro Adequados: um único caso altera o recall dessa classe em 25 pontos percentuais. A seleção é enriquecida por sinais técnicos, portanto proporções e métricas não estimam a população completa. Não foram realizados testes de significância ou obtidos intervalos que incorporem a incerteza dos rótulos. Os resultados sustentam somente comparação exploratória dentro desta referência e configuração.

## Reproduzir

```powershell
python consolidar_coorte_97.py --saida NOVO_MANIFESTO
python avaliar_coorte_97.py --escala CAMINHO_DOS_VETORES_V1 --saida NOVA_SAIDA
python -m unittest discover -s tests -q
```

O segundo comando utiliza o manifesto versionado em `data/coorte_97_v1/manifesto.json`. Saídas já iniciadas não são sobrescritas; a consolidação para outra saída permite conferir a igualdade dos registros sem apagar o snapshot existente.

## Checklist

- [x] Registrar a aprovação explícita somente nos cinco casos auditados.
- [x] Consolidar 97 casos, mantendo proveniência, hashes e exclusões.
- [x] Executar as 18 configurações já fixadas e a referência majoritária, sem ajuste pelos 97.
- [x] Avaliar três rankings no mesmo conjunto julgado, com AP e relevância explicitadas.
- [x] Documentar limites da IA, da auditoria e da classe rara.
- [ ] Adjudicar seis dúvidas de desenvolvimento para uma eventual versão posterior; não reinseri-las e reotimizar com os mesmos 97 como se fossem teste novo.
- [x] Concluir interpretabilidade e integração dos dados ao CurrículoRank; ver relatório de interpretabilidade.
- [ ] Conferir visualmente a interface e concluir a revisão integral do artigo.
- [ ] Em trabalho posterior, obter referência humana independente mais ampla para validação externa.
