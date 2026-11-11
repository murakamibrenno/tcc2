# Correções do trabalho completo e artigo SBC

A proposta original permanece: comparar TF-IDF, Sentence-Transformers/BGE e embeddings extraídos de Qwen por qualidade, custo e interpretabilidade. Esta rodada é documental: nenhum rótulo, modelo, previsão ou resultado primário foi alterado.

## Trabalho completo revisado

- Fundamentação: doze equações nativas corrigidas, incluindo atenção, IDF suavizado implementado e DCG com ganho exponencial. Distinção entre AP para uma vaga e MAP para várias consultas.
- Figuras 4 e 5: esquemas conceituais originais de SVM e boosting, com fontes teóricas identificadas e versões SVG editáveis. Diagramas substituídos estavam em baixa qualidade; cópia anterior preservada no workspace. Demais figuras e seis telas atuais mantidas (19 figuras no total).
- Seção 2.10: trabalhos relacionados de Qin et al. (2018) e Bian et al. (2019), delimitando a diferença de tarefa e impossibilidade de comparação direta das métricas.
- Método: preservada a distinção entre 2.484 PDFs, 2.483 textos utilizáveis, 294 casos de desenvolvimento e 97 de avaliação; agrupamento reduz sobreposição conhecida, sem garantia absoluta.
- Resultados: nova Tabela 5 com matriz de Qwen/SVM ponderada e leitura dos falsos negativos. Os dois acertos de Adequado são referências apenas da IA; os dois falsos negativos foram ratificados com assistência. Precisão 1,000 corresponde a duas marcações, sem validação humana independente.
- Análise contextual dos IDs 23464505, 10624813 e 62994611, contrastando evidências, previsões e janelas efetivamente lidas, sem atribuição causal automática ao truncamento.
- Apêndice A: consulta integral, rubrica, procedimento e proveniência da anotação, exemplos e lacunas dos registros de IA; nenhum prompt original foi inventado.
- Apêndice B: commit da execução, requisitos, arquivos, cache vetorial, comandos de reprodução e limites da conferência da aplicação.
- Referências normalizadas, página em branco removida, oito tabelas legendadas e 79 entradas do sumário/listas atualizadas pela numeração impressa. Trabalho com 78 páginas físicas.

## Artigo separado no modelo SBC

Onze páginas físicas, incluindo referências; A4, uma coluna, Times New Roman 12 no corpo, margens 3/3/3,5/2,5 cm, resumo e abstract na primeira página, sem cabeçalho/rodapé/paginação. Regras do modelo oficial publicado pela SBC: https://www.overleaf.com/latex/templates/sbc-conferences-template/blbxwjwzdngr . Não houve redução artificial da fonte para atingir a extensão.

Cinco tabelas nativas sintetizam universos, as dezoito condições, matriz, qualidade de recuperação e custo. Uma captura real atual ilustra o ranking com 2.483. Conteúdo integral legível em [ARTIGO_SBC_TCC2.md](ARTIGO_SBC_TCC2.md). E-mail indicado pelo autor: brenno.murakami@gmail.com. Brenno Murakami consta como autor; Vilson Francisco Maziero permanece como orientador no trabalho completo. Eventual coautoria depende de acordo entre eles.

## Coerência e limites

As tabelas e a matriz foram conferidas contra os relatórios preservados. Os dois documentos mantêm as mesmas contagens, resultados e limitações: referência predominantemente da IA, cinco ratificações assistidas, quatro Adequados, amostra intencional, uma vaga, janelas limitadas e custo local em hardware misto. ROC-AUC continua complementar e posterior, sem reotimização. O ranking operacional usa a coleção completa; qualidade foi medida somente nos 97 julgados.

As doze capturas reais foram arquivadas e seis telas atuais integram o trabalho completo. A conferência visual foi estática em desktop. Testes interativos completos e telas menores seguem pendentes. Os documentos estão preparados para revisão do autor e orientador; isso não representa aprovação institucional.
