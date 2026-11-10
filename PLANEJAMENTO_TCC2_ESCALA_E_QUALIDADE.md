# Continuidade do experimento do TCC2

Atualização vigente: os cinco casos foram aprovados pelo autor como ratificação humana assistida, e a avaliação exploratória dos 97 foi executada sem recalibrar os modelos. Há cinco casos ratificados e 92 rótulos da IA sem conferência; não é teste humano independente. [Resultados e limitações](piloto_tfidf/output/coorte97_v1/README.md). Os estados anteriores abaixo são históricos.

Atualização vigente: o autor autorizou a IA a anotar os 100 casos reservados, com auditoria humana limitada de cinco casos ainda pendente. Foram anotados 4 Adequados, 38 Parciais e 58 Inadequados; três versões relacionadas ao desenvolvimento ficaram fora da avaliação principal, com 97 elegíveis. Isso não constitui teste humano independente. [Método, evidências e limitações](piloto_tfidf/validation/REVISAO_TESTE_IA_E_AUDITORIA.md). Os estados anteriores abaixo são históricos.

Estado atualizado em 10/11/2026: três representações executadas em 2.483 textos utilizáveis; 201 novos casos de desenvolvimento conferidos por IA, com 195 rótulos e seis dúvidas excluídas. O desenvolvimento atual tem 294 casos (6 Adequados, 75 Parciais, 213 Inadequados), com proveniência mista. Nove combinações originais e nove com pesos foram executadas exploratoriamente. Os 100 casos de teste seguem reservados para revisão humana pelo autor. Resultados e pendências vigentes: [desenvolvimento ampliado](piloto_tfidf/output/desenvolvimento_v2/README.md). Os números e tarefas abaixo preservam a evolução do planejamento e devem ser lidos à luz dessa atualização.

Decisão do autor em 10/11/2026: processar a coleção de 2.484 documentos e avaliar qualidade em um subconjunto revisado, preservando a modalidade e os objetivos do artigo pós-TCC1.

## Compromissos mantidos

O trabalho continua sendo uma avaliação experimental comparativa de TF-IDF, Sentence-Transformers e embeddings de LLMs aplicados à triagem de currículos. Permanecem as combinações com Regressão Logística, SVM e XGBoost, classificação em três níveis, ranking, custo computacional, interpretabilidade e visualização no CurrículoRank. A execução em escala complementa essas tarefas; não substitui avaliação preditiva por um teste apenas de infraestrutura.

O artigo já prevê um subconjunto anotado e separação de treinamento, validação e teste nas seções de construção do dataset, modelagem e prevenção de vazamento. A atualização especifica seus universos de avaliação e não afirma que os 2.484 receberam revisão humana. O piloto histórico de 20 documentos e o snapshot posterior de 100 continuam separados dos resultados finais.

## Universos e alcance das conclusões

**Coleção completa:** todos os 2.484 arquivos serão contabilizados, inclusive falhas de extração. Cada representação deverá gerar vetores e escores nos documentos utilizáveis sob configuração registrada. Medir preparação, vetorização, consulta nova, inferência, memória e armazenamento com repetição e hardware identificados. Relatar o denominador tentado e o efetivamente concluído por método. Uma falha não desaparece do total.

**Conjunto de desenvolvimento:** os 100 documentos do piloto ampliado, agora com revisão concluída, são material de calibração e desenvolvimento. As 60 decisões ratificadas caso a caso e as 40 classificações da IA sob autorização antecipada não constituem um teste final independente. O documento 26746496 foi excluído da avaliação principal como versão relacionada a 16186411; ambos os originais permanecem preservados.

**Subconjunto revisado ampliado:** preparar uma seleção reproduzível além dos 100, com meta operacional inicial de cerca de 400 documentos revisados no total. Esse número é uma meta de trabalho, não um tamanho final congelado nem garantia de precisão estatística. Aumentar ou rever a seleção se o suporte das classes ou dos grupos independentes for insuficiente. A coleção tem apenas 120 arquivos na categoria Information Technology; escolher mais documentos aleatoriamente não garante positivos. A seleção pode considerar categorias e sinais textuais para aumentar a cobertura técnica, mas esses sinais nunca serão rótulos finais. Declarar o enriquecimento e não extrapolar prevalências ou métricas para a população inteira.

**Teste final:** selecionar grupos ainda não usados na calibração; registrar IDs, semente, critérios de amostragem e composição antes de comparar resultados. O autor deverá anotar as evidências sem scores, previsões ou rótulos antigos. Definir previamente o tratamento de classes sem suporte. Não alterar a rubrica para favorecer o desempenho observado. Todas as nove combinações usarão os mesmos grupos. Uma rodada no teste não será usada para escolher hiperparâmetros.

**Treinamento e validação:** usar somente os pares revisados destinados a desenvolvimento. TF-IDF ajustado dentro de cada partição de treino; embeddings congelados conforme configuração declarada. Ajustes e escolha do número de folds dependem do desenvolvimento e dos grupos, sem exigir cinco folds de uma classe rara. Rótulos automáticos não entram como verdade de teste. Qualquer uso futuro de supervisão fraca em treino exigirá uma condição experimental separada e explícita.

**Ranking:** produzir o ranking operacional completo, mas calcular AP, P@k e NDCG no mesmo conjunto integralmente revisado para todas as representações. Isso avalia ranking dentro desse conjunto. Não remover documentos não julgados do ranking completo e apresentar o resultado como se fosse uma avaliação integral dos 2.484. Não julgados não equivalem a irrelevantes. AP refere-se à vaga única; MAP exige múltiplas consultas. Manter explícitas relevância binária de AP/P@k e relevância graduada de NDCG.

## Preparação já executada

- [x] Inventariar e extrair novamente os 2.484 PDFs completos, sem truncar o texto armazenado e sem consumir rótulos.
- [x] Registrar hashes de PDF e de texto normalizado, páginas, tamanho e tempo de extração por documento.
- [x] Identificar 2.483 PDFs com texto e um sem texto extraível: 12632728, Business Development. A página foi conferida visualmente e está em branco. O arquivo permanece no denominador de cobertura, sem receber classe Inadequado nem entrada textual artificial.
- [x] Encontrar dois pares adicionais com texto normalizado idêntico: 16850314/37473139 e 19147603/28398216. São grupos de prevenção de vazamento; ainda não houve decisão humana de exclusão de versões nesses pares.
- [x] Preservar o grupo adjudicado 16186411/26746496 e a exclusão aprovada.
- [x] Adicionar inventário reproduzível e testes da normalização/agrupamento, incluindo preservação da diferença entre C e C#.
- [x] Preparar revisão localizada do artigo nas seções existentes, mantendo objetivos, famílias de modelos e figuras.

O relatório do inventário é uma medição de preparação de dados. Não mede custo comparativo dos modelos, acurácia nem conclusão do experimento completo. A detecção implementada cobre igualdade textual normalizada e o par adjudicado; quase duplicatas adicionais ainda precisam de triagem antes das partições finais.

## Próxima execução

1. Concluir a calibração da rubrica com os lotes pendentes; registrar as decisões aprovadas.
2. Conferir os novos pares; o PDF sem texto já foi identificado como página em branco. Completar triagem de quase duplicatas na base e fixar grupos/representantes.
3. Preparar seleção adicional por grupos, separando desenvolvimento e teste; salvar um manifesto versionado antes de comparar modelos.
4. Revisar os novos casos em lotes maiores quando a rubrica estiver estável; manter evidências, autoria, data e pendências. A revisão por IA com decisão do autor não será descrita como dois avaliadores humanos independentes.
5. Fixar janela textual e tokens, versões, modelos, sementes e hardware. A anotação do PDF completo pode identificar competência fora da janela do modelo; medir/documentar essa perda, sem alterar rótulos para acomodar o truncamento.
6. Implementar partições por grupos, baseline DummyClassifier e métricas por classe. Liberar treino somente após revisão e conferência dos grupos e suporte.
7. Executar as três representações na coleção utilizável e as nove combinações no conjunto revisado. Medir custos por etapa, com falhas e denominadores identificados.
8. Calcular qualidade no teste reservado e ranking no conjunto julgado definido; apresentar incerteza/limitações, sem declarar um vencedor se os dados não sustentarem.
9. Sincronizar relatórios, interface e capítulos de resultados/discussão. A revisão atual do artigo descreve planejamento; números novos só entrarão depois da execução verificada.

## Como repetir o inventário

Na pasta piloto_tfidf, com PyMuPDF instalado no ambiente de execução:

```powershell
python inventariar_base.py --raiz-pdfs ../archive/data/data --saida validation/base_completa
python -m unittest discover -s tests -v
```

O diretório de saída contém inventario.json e textos_completos.jsonl. Os textos integrais e temporários são artefatos locais; não são adicionados ao Git automaticamente. O resumo versionado está em piloto_tfidf/validation/inventario_base_resumo.json. Código 2 indica que ao menos um documento precisa de tratamento; não significa que os demais arquivos foram perdidos.

Prazo informado: aproximadamente 15/11. O cronograma precisa priorizar dados e avaliação comparativa prevista no artigo. Uma eventual limitação de execução será relatada; não será convertida em uma promessa de estudo diferente.

## Textos processados disponíveis

A pasta curriculos_processados foi publicada na main em 10/11/2026 (5fbdaee). As três versões completas foram conferidas por hash de árvore Git. Usar readable para leitura e extraído para conferência; cinco textos limpos exigem atenção adicional. O relatório e as propostas de dois novos pares e dos lotes 6/7 estão em piloto_tfidf/validation/REVISAO_PENDENTE_LOTES_6_E_7.md. Essas propostas aguardam decisão do autor. O arquivo sem texto permanece sem rótulo artificial.

## Revisão do piloto encerrada em 10/11/2026

Os lotes foram concluídos. A referência de desenvolvimento contém 99 representantes, com 3 adequados, 27 parcialmente adequados e 69 inadequados. Sessenta dos 100 casos foram ratificados individualmente e quarenta foram classificados pela IA sob autorização antecipada do autor. A distinção está registrada no artigo, no manifesto e na auditoria. Não equivale a 100 anotações humanas nem libera um teste final independente. A execução ampliada, o suporte da classe rara e a seleção do teste ainda precisam ser consolidados. O histórico de lotes pendentes acima é substituído pelo estado final em piloto_tfidf/validation/REVISAO_LOTE_ATUAL.md.
