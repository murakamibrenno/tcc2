# Complemento descritivo ROC-AUC nos 97 casos

A ROC-AUC estava prevista no texto original do artigo. Sua operacionalização foi adicionada depois dos resultados primários, como complemento exploratório, sem selecionar modelos, ajustar limiares ou mudar rótulos e parâmetros. F1 macro continua sendo a métrica primária do protocolo anterior, que foi preservado.

Os dezoito classificadores foram novamente ajustados somente nos 294 casos, com as mesmas configurações e sementes. Antes de calcular AUC, todas as previsões dos 97 foram comparadas aos arquivos publicados e reproduzidas exatamente. Caches densos, IDs e referências foram verificados por hash. Não se trata de uma nova avaliação independente.

`roc_auc_coorte97.json` contém AUC one-vs-rest por classe, média macro e média ponderada pelos suportes 58/35/4. `probabilidades_coorte97.json` preserva `predict_proba` na ordem Inadequado / Parcialmente Adequado / Adequado, por modelo e ID. As AUCs binárias também são verificadas no teste por comparações diretas entre escores de positivos e negativos, com meio crédito aos empates.

Uma AUC alta pode coexistir com recall zero na decisão categórica: ela mede ordenação dos escores para diferentes cortes. Qwen + SVM original, por exemplo, classificou todos os casos como Inadequado, apesar de apresentar AUC macro aproximadamente 0,940. A condição ponderada teve AUC macro aproximadamente 0,912 e recuperou dois Adequados. Não se escolheu um corte com os dados da coorte. As probabilidades internas de SVC não têm calibração validada nesta pesquisa e podem divergir da sua decisão categórica.

As limitações originais permanecem: referência da IA, cinco ratificações humanas assistidas e 92 casos sem conferência, quatro Adequados, seleção enriquecida e uma única vaga. AUC não transforma esses rótulos em referência humana independente nem valida desempenho profissional em recrutamento.

```powershell
cd piloto_tfidf
python complementar_auc_coorte97.py --escala CAMINHO_VETORES_V1 --saida NOVA_SAIDA
```

O programa recusa sobrescrever uma saída já iniciada. Os tempos dessa reexecução não substituem os custos registrados na avaliação primária. A interface exporta o complemento separadamente em `auc_complementar`, preservando os relatórios originais.
