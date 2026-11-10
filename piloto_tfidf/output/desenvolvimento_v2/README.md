# Desenvolvimento ampliado e repetição dos experimentos

## Revisão dos 201 novos casos

A IA conferiu os 201 casos com buscas no texto integral e revisão contextual de trechos. Não equivale a leitura humana integral nem a nova referência humana independente. As evidências e os hashes estão em `validation/revisao_desenvolvimento_201_v1.json`. O consolidado verificável está em `data/desenvolvimento_revisado_v2/manifesto.json`.

Foram incluídos 195 casos: 3 Adequados, 48 Parcialmente Adequados e 144 Inadequados. Seis dúvidas foram excluídas do treino, sem receber rótulo definitivo. Com os 99 representantes anteriores, o desenvolvimento reúne 294 casos: 6 Adequados, 75 Parcialmente Adequados e 213 Inadequados. A proveniência dos incluídos é de 59 ratificações individuais do autor e 235 anotações de IA autorizadas.

Os três novos Adequados são 12144825 (MySQL, integração XML API, Git e desenvolvimento PHP), 22351830 (Oracle/MySQL, APIs REST/SOAP, Git-Stash e Java) e 18442517 (MySQL, web services, Git e aplicações JavaScript). A categoria e a senioridade não foram usadas como veto.

### Seis casos aguardando adjudicação

- 27606527: A configuração/codificação de propriedades e o uso de ferramentas de automação não identificam claramente uma linguagem de programação para aplicações.

- 12546838: Oracle basic aparece sem identificação clara de SGBD/SQL; a decisão entre um e dois requisitos precisa de adjudicação.

- 93349646: Menção isolada a c no inventário de habilidades; falta contexto para distinguir linguagem de outro token.

- 80679862: Há GitLab/GitHub e codificação em WordPress, mas a linguagem de programação não é identificada; pode haver somente HTML/CSS.

- 27152464: SQL, REST, Git e Python estão declarados, com automação de testes. Falta adjudicar se a evidência sustenta desenvolvimento de aplicações backend/web exigido para Adequado, sem usar o título QA como veto.

- 20824105: Oracle aparece entre ferramentas de rede; não é possível confirmar que se refere a competência de SQL/SGBD. Python está demonstrado.

## Protocolo executado

Três folds estratificados por grupos, seed 42. Cada treino contém 4 Adequados, 50 Parciais e 142 Inadequados; cada validação contém 2, 25 e 71, respectivamente. Os mesmos folds foram usados nas 18 avaliações: nove combinações originais e nove com pesos balanceados. Parâmetros históricos mantidos; nenhuma busca de hiperparâmetros. Pesos n/(3*n_classe) calculados somente no treino. TF-IDF ajustado somente no treino de cada fold; embeddings congelados e conferidos por hash. O protocolo e os folds foram escritos antes do primeiro ajuste.

A referência majoritária obteve acurácia de 72,45% e F1 macro de 0,280. A comparação de condições é interna ao desenvolvimento atual. Os números do piloto de 99 casos não constituem uma comparação pareada: documentos e composição mudaram.

## Resultados exploratórios

| Condição | Representação | Classificador | Acurácia | F1 macro | Precisão Adequado | Recall Adequado |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| original | TF-IDF | Regressão Logística | 0.738 | 0.316 | 0.000 | 0.000 |
| original | TF-IDF | SVM | 0.786 | 0.416 | 0.000 | 0.000 |
| original | TF-IDF | XGBoost | 0.833 | 0.520 | 0.000 | 0.000 |
| original | BGE | Regressão Logística | 0.769 | 0.388 | 0.000 | 0.000 |
| original | BGE | SVM | 0.752 | 0.348 | 0.000 | 0.000 |
| original | BGE | XGBoost | 0.752 | 0.407 | 0.000 | 0.000 |
| original | Qwen | Regressão Logística | 0.731 | 0.307 | 0.000 | 0.000 |
| original | Qwen | SVM | 0.724 | 0.280 | 0.000 | 0.000 |
| original | Qwen | XGBoost | 0.816 | 0.644 | 0.667 | 0.333 |
| pesos_balanceados | TF-IDF | Regressão Logística | 0.823 | 0.511 | 0.000 | 0.000 |
| pesos_balanceados | TF-IDF | SVM | 0.816 | 0.514 | 0.000 | 0.000 |
| pesos_balanceados | TF-IDF | XGBoost | 0.840 | 0.616 | 0.500 | 0.167 |
| pesos_balanceados | BGE | Regressão Logística | 0.748 | 0.635 | 0.500 | 0.500 |
| pesos_balanceados | BGE | SVM | 0.728 | 0.633 | 1.000 | 0.333 |
| pesos_balanceados | BGE | XGBoost | 0.752 | 0.433 | 0.000 | 0.000 |
| pesos_balanceados | Qwen | Regressão Logística | 0.776 | 0.628 | 0.278 | 0.833 |
| pesos_balanceados | Qwen | SVM | 0.769 | 0.637 | 0.375 | 0.500 |
| pesos_balanceados | Qwen | XGBoost | 0.776 | 0.574 | 0.286 | 0.333 |

O maior F1 macro observado foi 0,644 com Qwen + XGBoost original. Esse modelo recuperou 2 dos 6 Adequados e acertou 2 das 3 marcações dessa classe. Com pesos, Qwen + Regressão Logística recuperou 5 de 6, mas só 5 das 18 marcações Adequado estavam corretas (13 falsos positivos; precisão 27,8%). BGE + Regressão Logística com pesos recuperou 3 de 6 e acertou 3 das 6 marcações (precisão 50%). Pesos não melhoraram todas as combinações; BGE + XGBoost com pesos produziu uma marcação Adequado incorreta e não recuperou nenhum positivo.

A classe rara deixou de ter recall zero em algumas condições. Isso não demonstra que o problema foi resolvido: são seis positivos de referência mista, selecionados em amostra enriquecida e sem teste humano final. Não declarar vencedor definitivo, melhoria causal apenas pelo aumento de dados, qualidade da população de 2.484 ou robustez estatística com esse suporte. Os classificadores continuam dependentes da janela textual de entrada.

## Teste humano reservado

O manifesto original e os 100 casos de teste não foram alterados. Nenhuma resposta humana de teste foi consumida para escolher as condições. O formulário produzido por `preparar_teste_humano.py` mostra texto integral e campos em branco, sem scores, previsões ou rótulos sugeridos. Os rankings completos com scores continuam locais até terminar a anotação. As predições publicadas nesta pasta contêm somente os 294 casos de desenvolvimento.

## Repetir

```powershell
python consolidar_desenvolvimento_v2.py
python avaliar_desenvolvimento_v2.py --escala CAMINHO_DOS_VETORES_V1 --saida NOVA_SAIDA
python preparar_teste_humano.py --saida FORMULARIO_LOCAL.html
python -m unittest discover -s tests -q
```

## Checklist

- [x] Conferir os 201 casos e registrar evidências/proveniência.
- [x] Consolidar 195 novas decisões; excluir seis dúvidas do treino.
- [x] Repetir as nove combinações originais e a condição com pesos, sem consumir teste humano.
- [x] Preservar os resultados anteriores e o manifesto de seleção.
- [x] Preparar formulário para os 100 casos de teste.
- [ ] Adjudicar as seis dúvidas de desenvolvimento antes do treino final.
- [ ] Receber as anotações humanas e conferir consistência/suporte do teste.
- [ ] Fixar decisões no desenvolvimento, executar teste final e concluir ranking julgado, análise de erros, incerteza e interpretabilidade.
- [ ] Integrar resultados finais ao CurrículoRank e concluir o artigo.
