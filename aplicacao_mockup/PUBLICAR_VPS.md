# Atualização do CurrículoRank na VPS

Execute a partir da raiz do clone que já está publicado. Use Node 22.12 ou superior compatível com Vite 8. Confira `git status` antes de atualizar. Se houver alterações locais, examine-as antes de continuar.

```bash
git status --short
git switch codex/validacao-pratica-tcc2-20261110
git pull --ff-only origin codex/validacao-pratica-tcc2-20261110
cd aplicacao_mockup
npm ci --ignore-scripts
npm test
npm run build
```

O build valida os textos contra o manifesto e inclui os 2.483 arquivos em `dist/curriculos`. O clone deve conter `curriculos_processados/extracted_text_en`. Um checkout parcial precisa incluir essa pasta e `piloto_tfidf/data/validacao_ampliada_v1/manifesto.json` antes do build.

Publique **todo o conteúdo de `dist/`**, inclusive `curriculos/`, no diretório que o servidor web já serve. Se a configuração atual aponta diretamente para `aplicacao_mockup/dist`, o build atualiza esse diretório. Caso a publicação copie o build para outra pasta, repita o procedimento de cópia que já está configurado na VPS.

Mantenha o fallback das rotas React para `index.html`. As respostas de `/curriculos/*.txt` precisam ser texto simples (`Content-Type: text/plain`). O controle de acesso existente do site deve abranger esses arquivos. A interface verifica o tipo da resposta para detectar uma configuração que devolva HTML no lugar do currículo.

## Conferência após a publicação

- Recarregue a página e abra um currículo que esteja fora dos cinco casos de interpretabilidade. Confira o texto até o fim e feche pelo botão **Fechar currículo**. Repita em outra página do ranking e no subconjunto dos 97.
- Em **Comparativo**, clique em **Ver matriz** de configurações diferentes. Confira o título, feche a janela e teste também a condição com pesos. Na lista de predições, abra um currículo e depois retorne à matriz.
- Em **Interpretabilidade**, use **Ver currículo completo** e confira o documento selecionado.
- Confira navegação por teclado, Escape e uma tela menor. Se o carregamento de texto falhar, a janela mostra uma mensagem e o botão **Tentar novamente**.

Os testes automatizados verificam os 2.483 textos integrais, os hashes, o carregamento e os erros HTTP. A conferência de interação no navegador local ficou bloqueada pela permissão de navegação da sessão de desenvolvimento e deve ser completada no endereço publicado.

## Sincronização de 19/11/2026

Após atualizar a mesma branch e reconstruir o site, a página **Resultados** deve mostrar duas avaliações: métricas originais dos 97 e **Conferência posterior do top 5 da coleção completa**, com P@5 de 0,60 / 0,80 / 0,60. Abra as decisões para ver as evidências e a adjudicação assistida de TOP-02. Os links levam ao texto completo dos documentos. O caso 43311839 identifica a conferência posterior e preserva sua referência original. Essas alterações não exigem novos experimentos.

Na sincronização com a monografia, **Dashboard** e **Metodologia** também mostram as 72 conferências consolidadas (65 do desenvolvimento, seis da avaliação e uma versão excluída). Em **Resultados**, confira o painel **Análise complementar — janela de leitura equivalente**: AP TF-IDF de 0,635 para 0,741; F1 TF-IDF/XGB com pesos de 0,759 para 0,685; Qwen/SVM com pesos mantém 0,785. O P@5 completo equivalente é 0,80 / 0,80 / 0,60 e fica separado do original e do P@5 entre os 97. Abra os documentos pelos botões do novo top 5.

As telas Ranking, Comparativo e Interpretabilidade e as medições de custo continuam na janela original. Os complementos foram acrescentados sem substituir `experimentoAtual.json`. O build atual tem 18 testes aprovados; os testes de dados e servidor não substituem a conferência dos cliques após publicar na VPS.

## Conferência da comparação guiada

Em Resultados, abra **Entenda os resultados: qualidade, tempo e recursos**. Na aba **Priorizar a leitura**, confira AP 0,635/0,479/0,254 e top 5 completo 3/5, 4/5, 3/5. Em **Classificar aderência**, alterne SVM, Regressão Logística e XGBoost, com e sem pesos; a seleção deve manter a mesma configuração nas três representações. SVM com pesos apresenta F1 macro 0,544/0,713/0,785. Em **Examinar recursos**, confira unidades MiB e a indicação de GPU não aplicável ao TF-IDF.

O painel usa os custos originais: 4,46/121,82/150,41 segundos para gerar os vetores e 12,49/23,76/35,06 milissegundos para consulta e escores da coleção. Esses tempos não incluem ordenar/exportar o ranking. As notas de CPU/GPU e limites devem permanecer visíveis. Em tela menor, confira a rolagem das abas e das tabelas. Esses cliques devem ser conferidos depois da publicação; a validação local registrou 18 testes, build e captura desktop da aba inicial.
