# Redação final do artigo para revisão

Atualização de 10/11/2026. A proposta central foi mantida: comparar TF-IDF, Sentence-Transformers/BGE e embeddings extraídos de Qwen na triagem de currículos por qualidade, custo e interpretabilidade. O título e a fundamentação foram preservados, com ajustes pontuais de coerência verbal.

## Alterações realizadas

1. Resumo e abstract passaram a relatar o experimento executado, seus resultados e limitações.
2. Introdução e estrutura passaram a remeter à metodologia efetiva, ao capítulo de resultados e discussão e à conclusão.
3. Metodologia consolidada: 2.484 PDFs inventariados, 2.483 textos processados, 294 casos no desenvolvimento e 97 na avaliação. Mantidos parâmetros, condições e separação por grupos.
4. Mudança operacional da anotação manual prevista para referência assistida explicitada, incluindo 59 ratificações no desenvolvimento e cinco assistidas na coorte. Os 92 demais casos da coorte não foram promovidos a referência humana.
5. Janelas de 8.000 caracteres e 512 tokens, pooling, revisões dos modelos, protocolos de custo e prevenção de vazamento documentados no método executado.
6. Capítulo de aplicação atualizado para distinguir funcionalidades atuais e imagens históricas. O ranking inicia nos 2.483, com total destacado e opção dos 97 julgados.
7. Novo capítulo 5: participação da coleção, classificação com e sem pesos, ROC-AUC complementar, ranking no conjunto julgado, custo, interpretabilidade e ameaças à validade. Seis tabelas novas, mantendo o resultado histórico do piloto identificado separadamente.
8. Considerações parciais substituídas pela conclusão, com resposta ao objetivo original e continuidade condicionada à validação humana e a novos protocolos.
9. Referências primárias de BGE, Qwen e ROC-AUC incluídas; sumário, lista de figuras e lista de tabelas atualizados conforme a paginação renderizada.

## Rastreabilidade e limites

O capítulo de resultados, discussão e conclusão está em [ARTIGO_RESULTADOS_DISCUSSAO_CONCLUSAO.md](ARTIGO_RESULTADOS_DISCUSSAO_CONCLUSAO.md). O artigo editável é mantido no [Drive do autor](https://docs.google.com/document/d/1PmGy9EWf7Jtit6s31piz__LMz75dMi5o/edit), com a cópia anterior preservada no workspace. A nota de versão registra o hash do DOCX entregue.

Os resultados primários não foram substituídos. ROC-AUC foi operacionalizada como complemento posterior, previamente prevista no artigo, sem reotimização ou nova seleção pelos 97. As previsões das dezoito configurações foram reproduzidas e preservadas.

## Telas atuais incorporadas
+
+Foram recebidas e arquivadas doze capturas reais do autor. Seis imagens complementares compõem as Figuras 14–19, com parágrafos de apresentação, legendas e fonte: dashboard, ranking da coleção, matriz original TF-IDF com Regressão Logística, gráfico das dezoito condições, qualidade/custo e explicação lexical local. As Figuras 1–13 foram preservadas, mantendo a identificação histórica das telas do TCC1.
+
+Sumário e listas foram atualizados conforme a paginação renderizada. Os valores detalhados seguem nas tabelas editáveis do Capítulo 5. O comparativo recebido está na condição Original; não foi apresentado como resultado com pesos. Não houve mudança em modelos, rótulos, previsões ou métricas.
+
+A inspeção visual foi estática, sobre imagens fornecidas pelo autor. Testes interativos completos, telas menores, revisão do autor e orientador e conferência das normas permanecem pendentes. O navegador continuou recusando acesso na sessão; as capturas foram enviadas pelo autor, sem contorno dessa restrição. Os arquivos e hashes constam de [capturas atuais](capturas_curriculorank_20261110/README.md).
+