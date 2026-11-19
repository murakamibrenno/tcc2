Estado em 19/11/2026: integração concluída no Word combinado do Drive (mesmo ID). Método 3.4.4, resultados 5.6.1 e Tabelas 9/10 no trabalho; método 3.3 e resultados 4.5/Tabela 6 no SBC, com 12 páginas. As conclusões e limitações foram atualizadas. O roteiro abaixo registra o planejamento anterior; a seção SBC 4.5 foi usada para preservar a numeração das tabelas originais.

# Integração proposta da análise de janela equivalente

Os resultados originais permanecem a avaliação principal. A análise adicional deve ser identificada como complementar, planejada após os resultados iniciais e feita nos mesmos 97 documentos, sem alegar novo teste independente. Nesta rodada, o Word recebeu somente a correção visual das quatro linhas do título; os novos resultados estão documentados separadamente para integração coerente.

## Trabalho completo

Na Seção 3.4.4, acrescentar o procedimento de conteúdo comum, revisões preservadas e limite verificado após retokenização. Na Seção 5.6, acrescentar a comparação pareada do ranking e das 18 configurações, mantendo tabelas originais. Pode ser criada uma subseção intitulada Análise complementar da janela de leitura, com duas tabelas: recuperação nos 97 e F1 macro antes/depois das 18 configurações. A comparação do top 5 completo deve ter linha própria e fonte nos julgamentos já disponíveis, sem misturar seus denominadores com os 97.

Texto proposto para o método:

Após a análise primária, executou-se um controle exploratório do conteúdo disponível às representações. Para cada um dos 2.483 textos, selecionou-se um prefixo inicial que coubesse simultaneamente nas tokenizações BGE e Qwen de até 512 tokens, incluindo tokens especiais. O mesmo prefixo foi fornecido ao TF-IDF. A retokenização foi conferida e o corte recuou quando necessário; os prefixos tiveram mediana de 2.589 caracteres. A vaga inteira, as revisões dos encoders, os 294 casos de desenvolvimento, os 97 de avaliação e os parâmetros das dezoito configurações foram preservados. A análise reutiliza casos já examinados e não constitui novo teste independente.

Texto proposto para resultados e discussão:

Com conteúdo equivalente, a AP de TF-IDF nos 97 documentos passou de 0,635 para 0,741, enquanto BGE passou de 0,479 para 0,482 e Qwen de 0,254 para 0,252. A vantagem lexical nessa consulta persistiu, de modo que o acesso a mais texto não é explicação suficiente para o padrão observado. Entretanto, o F1 macro de TF-IDF com XGBoost e pesos caiu de 0,759 para 0,685, enquanto Qwen com SVM e pesos manteve 0,785. A melhora na ordenação não implicou melhora na classificação. Os novos top 5 completos estavam cobertos pelos julgamentos existentes; o P@5 recalculado foi 0,80 para TF-IDF, 0,80 para BGE e 0,60 para Qwen, por documento e sem deduplicação de candidatos. Os resultados não substituem os originais nem demonstram superioridade geral. O corte altera também o vocabulário e a ponderação lexical, e as limitações da referência assistida permanecem.

Na conclusão, incluir apenas a síntese de que a comparação adicional preservou a vantagem lexical na recuperação e mostrou sensibilidade da classificação ao conteúdo disponível. Não substituir as métricas da avaliação principal no resumo nem transformar a nova rodada em seleção de um vencedor validado.

## Artigo SBC

Na Seção 3.3, incluir um parágrafo curto sobre o controle. Na Seção 4.2, uma tabela compacta com AP original/equivalente das três representações, seguida do contraste entre recuperação e classificação. Nas ameaças à validade, registrar explicitamente que a análise é posterior aos resultados e reutiliza os 97. Preservar o limite institucional de 10 a 12 páginas na renderização final; o apêndice atual tem 11.

Parágrafo compacto proposto:

Em análise complementar pós-avaliação, os três métodos receberam o mesmo prefixo de cada currículo, verificado para caber em até 512 tokens nos dois encoders. Mantidos os casos e parâmetros, a AP nos 97 passou de 0,635 para 0,741 em TF-IDF, de 0,479 para 0,482 em BGE e de 0,254 para 0,252 em Qwen. Em contrapartida, TF-IDF com XGB e pesos teve F1 macro reduzido de 0,759 para 0,685; Qwen com SVM e pesos manteve 0,785. A vantagem lexical no ranking persistiu sob conteúdo compartilhado, mas o encurtamento não melhorou todas as tarefas. Essa análise reutiliza casos já examinados e não resolve a incerteza das referências assistidas.

Os números completos e os arquivos por ID estão em `piloto_tfidf/output/janela_equivalente_v1`. A redação final deve conservar a distinção entre AP/P@5 nos 97 e P@5 das primeiras posições da coleção completa.
