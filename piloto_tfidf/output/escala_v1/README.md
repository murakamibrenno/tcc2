# Execução intermediária de 10 de novembro de 2026

As três representações processaram 2.483 textos utilizáveis dos 2.484 PDFs inventariados. O arquivo em branco continua no denominador. A janela inicial dos modelos é de 8.000 caracteres, com limite adicional de 512 tokens nos densos. Os textos integrais permanecem preservados. As revisões dos dois modelos e as versões do ambiente estão registradas.

TF-IDF levou 4,46 s (mediana de três ajustes, CPU); BGE large 121,82 s e Qwen 0.5B 150,41 s (uma passagem em GPU depois de aquecimento, excluindo carregamento). Consulta e cálculo de escores: medianas de 12,49 / 23,76 / 35,06 ms em dez repetições. Ordenação e exportação não estão nesses intervalos. Hardware e etapas diferem, portanto os números descrevem implementações, sem comparação estatística de superioridade. RSS é pico absoluto do processo amostrado a cada 20 ms; GPU registra pico alocado, não memória total da placa.

A classificação é exploratória: 99 representantes do piloto, referência de proveniência mista, três folds estratificados por grupos, semente 42, parâmetros históricos fixos. TF-IDF ajustado dentro de cada treino. Os nove classificadores foram executados; maior F1 macro observado 0,480 para TF-IDF + XGBoost, contra 0,274 da referência majoritária. Todos tiveram recall zero para os três Adequados. Não declarar validação final ou vencedor definitivo. O resultado identifica escassez de suporte, não justifica mudar a rubrica.

O manifesto `data/validacao_ampliada_v1/manifesto.json` congela 300 casos destinados ao desenvolvimento (99 revisados, 201 novos sem rótulos) e 100 casos reservados para revisão humana pelo autor. São 400 selecionados, não 400 anotados. Os 100 do teste não foram usados nesta classificação. Os sinais lexicais servem à amostragem enriquecida e não são rótulos nem estimativas de prevalência.

Dez pares atingiram Jaccard de palavras >=0,90, incluindo os três pares já conhecidos. Componentes conexos permanecem na mesma partição; só as três exclusões de versões já aprovadas foram aplicadas. A triagem não garante encontrar todas as versões.

## Repetir

1. Criar ambiente Python 3.12 com as versões de `requirements-experimento-v1.lock.txt`; para GPU, usar a distribuição CUDA de PyTorch registrada. Os caminhos de saída devem ser novos para preservar o histórico.
2. `python executar_escala_v1.py --metodo tfidf --saida CAMINHO_LOCAL`
3. Repetir para `--metodo bge` e `--metodo qwen` usando o mesmo caminho. O arquivo de revisões fica congelado antes do carregamento. Preservá-lo na reexecução para usar os mesmos pesos.
4. `python avaliar_desenvolvimento_v1.py --escala CAMINHO_LOCAL --saida CAMINHO_LOCAL`
5. `python preparar_teste_humano.py --saida FORMULARIO_LOCAL.html` gera o formulário cego. Os textos integrais precisam estar disponíveis em `curriculos_processados`.
6. Após a revisão do autor, `python preparar_teste_humano.py --respostas REVISAO.json --saida NAO_USADO` valida completude e evidências. Esse comando não executa nem libera automaticamente avaliação final.

Os vetores e rankings com scores completos ficam locais até terminar a anotação humana; não foram publicados para evitar expor escores dos casos reservados. Os relatórios agregados, parâmetros e folds de desenvolvimento estão versionados. Resultados históricos não foram sobrescritos. A UI ainda não consome esta execução nova.

## Checklist restante

- [x] Processar as três representações na coleção utilizável e registrar cobertura, revisões e custos.
- [x] Executar nove combinações e referência majoritária no desenvolvimento, com limitações explícitas.
- [x] Congelar seleção ampliada e separar teste por grupos não usados na revisão anterior.
- [x] Preparar formulário sem previsões, scores ou rótulos sugeridos.
- [ ] Revisar os 201 novos casos de desenvolvimento e verificar suporte das classes.
- [ ] Receber e conferir os 100 rótulos humanos do teste, sem recalibrar decisões a partir do resultado.
- [ ] Concluir teste final, ranking julgado, incerteza, interpretabilidade e análise de erros.
- [ ] Integrar a execução final ao CurrículoRank e concluir o artigo.
