# Sincronização do trabalho, artigo SBC e CurrículoRank

Em 19/11/2026 foram corrigidas a apresentação do Word combinado e as divergências entre a redação, a conferência posterior do autor e a interface. A referência experimental original permanece congelada. Esta atualização não executa novos experimentos nem altera classificadores, parâmetros, vetores, rankings, rótulos primários ou métricas dos 97.

## Referência original e conferência posterior

A avaliação original dos 97 utilizou cinco ratificações humanas assistidas e 92 anotações então sem conferência humana. Na conferência posterior do top 5 completo, o autor enviou decisões de 12 documentos em formulário com método, posição, escores e rótulos anteriores ocultos. As 15 posições dos três métodos contêm 12 identificadores distintos.

Dois documentos pertencem também aos 97: 62994611 (TOP-07) já estava ratificado e 43311839 (TOP-06) foi conferido posteriormente. Seus rótulos coincidiram com os originais; não houve recálculo ou troca silenciosa da referência. Assim, os demais 91 casos não receberam conferência humana. A revisão posterior do próprio autor não constitui referência independente dos 97, e ocultar informações no formulário não assegura independência do revisor.

TOP-02 foi enviado como Adequado e passou a Parcialmente Adequado após adjudicação assistida, solicitada pelo autor: desenvolvimento ASP não comprova, isoladamente, API, serviço web ou integração. A decisão original e a adjudicação são preservadas separadamente.

O P@5 complementar é 0,60 para TF-IDF, 0,80 para BGE e 0,60 para Qwen. Somente Adequado conta como relevante. A unidade é documento por identificador; duas versões semelhantes ocupam duas posições no top 5 de BGE. Isso não mede cinco candidatos distintos nem qualidade de todos os 2.483. Um documento representa 20 pontos percentuais de P@5.

As fontes devolvidas, o mapa do formulário, a adjudicação e a consolidação estão em `piloto_tfidf/validation/top5_*_v1.json` e `conferencia_top5_autor_v1.json`. O relatório é espelhado em `aplicacao_mockup/src/data/revisaoTop5.json`. Os testes conferem hashes das fontes, a correspondência com as posições reais, as contagens e a preservação das métricas primárias.

## Aplicação

A página Resultados mostra as métricas dos 97 e o P@5 completo em seções distintas. A conferência complementar apresenta as decisões, evidências, a adjudicação e acesso aos textos completos. Ranking, detalhes e predições identificam a conferência posterior sem substituir a referência original. Os avisos e a metodologia agora informam a cronologia.

Os 2.483 textos integrais continuam disponíveis sob demanda. O botão Ver matriz continua abrindo a configuração selecionada e suas predições. Não foram adicionados uploads, novas vagas ou inferências em tempo real. A publicação na VPS depende de atualizar a branch e reconstruir `dist`, conforme `aplicacao_mockup/PUBLICAR_VPS.md`.

## Word combinado e SBC incorporado

O fundo azul repetido veio de uma forma de página no cabeçalho do arquivo recebido. Foi removida a forma e seu fallback, preservando o cabeçalho institucional. Após correção solicitada pelo autor, a capa azul, o texto branco e os elementos do cabeçalho foram recuperados diretamente do DOCX de referência fornecido. O fundo azul fica no corpo da capa, sem repetição nas páginas internas. A distribuição da capa mantém cidade e ano na primeira página. As linhas que enquadram o título da capa e da folha de rosto foram restauradas. O texto atualizado, as tabelas e a paginação interna permanecem preservados.

Foram mantidas a identificação do professor Vilson Francisco Maziero, a inclusão de Brenno Murakami na folha de aprovação e as 13 tabelas centralizadas. A descrição da aplicação agora corresponde aos textos integrais e ao P@5 complementar. Trabalho e SBC distinguem a referência original da revisão posterior; a análise dos acertos de Qwen foi corrigida para reconhecer a conferência de 43311839. As capturas de 10/11 continuam identificadas como registros daquela versão, sem apresentá-las como capturas da interface atualizada em 19/11.

As tabulações das listas e do sumário foram ajustadas para mostrar os números dentro da margem. O Word vigente permanece no mesmo ID do Drive: `1PmGy9EWf7Jtit6s31piz__LMz75dMi5o`. O SBC vigente é o Apêndice C desse arquivo. As cópias separadas antigas e os PDFs do Drive não foram atualizados nesta rodada.

As fontes textuais em `ARTIGO_SBC_TCC2.md`, `ARTIGO_RESULTADOS_DISCUSSAO_CONCLUSAO.md` e `APENDICES_TCC2.md` foram extraídas da versão corrigida. A formatação final permanece no Word, não nessas transcrições.

## Verificação e pendências

Os 13 testes da interface passaram, incluindo hashes dos 2.483 textos, integridade dos universos, métricas originais, top 5 complementar e renderização em servidor. O build de produção passou, com o aviso já existente de tamanho do pacote. Os testes não substituem a conferência de cliques e telas menores na VPS. A redação continua declarando essa limitação.

A inspeção do documento verifica o fundo branco, a identificação do orientador, as tabelas, os índices e a extensão do SBC. O manifesto `sincronizacao_documental_20261119.json` registra o hash do Word e a paginação verificada.

Na sincronização inicial, permaneciam para etapa posterior a revisão humana independente dos 97 e os experimentos sobre janelas de leitura, regras e agrupamento de versões semelhantes. O controle de janela equivalente foi executado e integrado posteriormente, conforme o registro abaixo; as demais pendências não foram apresentadas como concluídas.

## Retificação das linhas do título

As quatro linhas em volta dos títulos da capa e da folha de rosto foram tornadas horizontais a pedido do autor. A correção partiu da versão mais recente do Word do Drive e preservou seus textos, imagens, cores, cabeçalho e as demais partes do arquivo. A conferência manteve 93 páginas físicas e 11 páginas no SBC incorporado.

## Integração da análise complementar de janela equivalente

A versão vigente incorpora o controle de conteúdo comum no método (3.4.4), nos resultados (5.6.1, Tabelas 9 e 10), nas limitações e na conclusão. O SBC incorporado apresenta o método em 3.3 e a comparação em 4.5 (Tabela 6), com síntese na conclusão. As métricas e tabelas primárias permanecem preservadas. O controle reutiliza os mesmos 97 casos já examinados, sem nova referência humana independente. O P@5 completo usa os julgamentos anteriores disponíveis, sem confundir os cinco primeiros da coleção com os cinco primeiros entre os 97. A aplicação continua mostrando o snapshot primário.

O Word possui 95 páginas físicas; o SBC ocupa 12, começando na página física 84. Os índices e a lista de tabelas foram atualizados. As 13 tabelas anteriores foram mantidas integralmente e três novas tabelas foram acrescentadas, todas centralizadas. Capa, cabeçalhos, cores, estilos, imagens e demais partes externas ao corpo são idênticos à versão de entrada do Drive. O experimento complementar tem 63 testes Python aprovados; não houve nova alteração de código da aplicação nesta integração documental.

## Versão de entrega no escopo exploratório

A recomendação temporal de revisão independente antes da defesa foi substituída pela descrição de trabalho futuro. Mantém-se explícito que essa revisão não foi realizada. A referência original e a conferência posterior do autor permanecem discriminadas, sem alterações de rótulos, predições ou métricas. O SBC já apresentava a ampliação da referência humana independente como continuidade; seu texto foi preservado. A aplicação descreve o escopo exploratório concluído no Dashboard e em Metodologia e mantém os avisos de proveniência.

O Word continua no mesmo ID do Drive, com 95 páginas e 12 no SBC. Apenas a página física 74 mudou visualmente; as outras 94 páginas são idênticas à renderização anterior. Todas as tabelas, mídias, estilos, cabeçalhos e capas foram preservados. Os 13 testes da aplicação e o build passaram. Essa organização da versão de entrega não equivale à revisão humana solicitada nem ao aceite pelo orientador ou pela instituição.

## Redação final da construção da referência

Trabalho completo e SBC passaram a descrever a construção com apoio de um modelo de linguagem, aplicação de rubrica explícita de aderência técnica e conferência do autor nos casos discriminados no protocolo. A conclusão do trabalho usa a mesma terminologia. A limitação registra que o estudo foi concluído no escopo exploratório e que não houve revisão humana independente integral; os números e a proveniência dos rótulos permanecem explícitos. Não se atribuiu conferência integral nem aceite institucional. A expressão de trabalho futuro foi retirada desse parágrafo de limitações, sem afirmar que a revisão ocorreu. Mantêm-se 95 páginas e 12 no SBC, os índices, todas as tabelas e as partes externas ao corpo. A aplicação não mudou nesta rodada.
