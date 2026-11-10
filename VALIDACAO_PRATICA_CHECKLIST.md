# Validação da parte prática do TCC2

Atualização aprovada em 10/11/2026: execução na coleção de 2.484 documentos e qualidade em subconjunto revisado independente, preservando o desenho comparativo do artigo. O detalhamento vigente está em PLANEJAMENTO_TCC2_ESCALA_E_QUALIDADE.md. O diagnóstico abaixo permanece como histórico; não representa resultados novos.

Rodada técnica de 10/11/2026. Snapshot científico preservado: `7431ceaa8ed3ea2058562b816c12daf20d552790`.

## Resultado desta rodada

A infraestrutura de validação e as correções técnicas abaixo foram implementadas. A avaliação científica final **continua pendente**. Os 100 rótulos, os rankings CSV e os números de `metricasReais.json` não foram alterados. Nenhum modelo foi retreinado ou baixado nesta rodada.

O relatório reproduzível está em [piloto_tfidf/validation/relatorio_validacao.json](piloto_tfidf/validation/relatorio_validacao.json). Seus valores de sensibilidade usam apenas uma revisão de rótulo registrada; não são resultados finais novos. O status da interface é um snapshot gerado explicitamente, não uma consulta em tempo real ao corpus Python.

## Checklist executado

- [x] Verificar recuperação após a interrupção: arquivos do artigo/plano íntegros e build anterior concluído na área de análise.
- [x] Trabalhar em branch própria, sem modificar a main durante a validação.
- [x] Criar auditoria sem dependência de Torch, Transformers, pandas ou execução dos modelos.
- [x] Conferir IDs, textos, classes, cobertura e sobreposição das partições.
- [x] Detectar documentos muito próximos por Jaccard de palavras; indicar quando atravessam partições. A semelhança não prova identidade do candidato.
- [x] Identificar revisão de rótulo ainda não adjudicada, quantidade de rótulos automáticos e configuração de folds incompatível com presença de todas as classes nos testes.
- [x] Recalcular AP, P@5, P@10 e NDCG@10 dos rankings salvos e conferir CSV/JSON da interface.
- [x] Identificar classificadores que preveem uma única classe e registrar baseline majoritário analítico.
- [x] Gerar manifesto com IDs ordenados e hashes separados de textos e rótulos.
- [x] Criar formulário de revisão com texto completo e campos vazios, sem mostrar classe anterior, categoria ou ranking; recusar sobrescrita de formulário existente.
- [x] Bloquear as entradas principais de treino, geração de ranking e medição enquanto os bloqueios dos dados permanecem. O bloqueio ocorre antes de escrita experimental e carregamento de modelos, após os imports normais de cada script.
- [x] Substituir `run_pipeline_demo.ps1` por preflight seguro. Ele não reescolhe os 100 documentos, não treina e não sobrescreve números.
- [x] Validar cache por conteúdo integral ordenado, modelo e configuração; rejeitar cache legado sem identidade completa, forma incompatível, NaN/Inf ou arquivo alterado.
- [x] Gravar NPY e JSON por arquivo temporário e substituição atômica, com hash do NPY. Uma interrupção entre os dois arquivos faz o par ser recusado, em vez de aceito silenciosamente.
- [x] Remover o consumo de cache Qwen por nome histórico fixo dos scripts de custo e interpretabilidade.
- [x] Desativar fallback silencioso de BGE-large para BGE-base.
- [x] Centralizar entrada de 8.000 caracteres e instrução BGE para próximas execuções; alinhar TF-IDF do ranking e manter precisão completa antes do desempate por ID. Isso muda o próximo protocolo e exige reavaliação; não altera retrospectivamente o snapshot publicado.
- [x] Corrigir detecção lexical de C#, .NET/ASP.NET e C++, sem reaplicar automaticamente a regra aos rótulos existentes. A regra continua limitada quanto a contexto, negação e categorias.
- [x] Corrigir score do método ativo e total dinâmico nos modais, distinguindo rótulo automático, anotação do piloto e revisão pendente.
- [x] Substituir a interpretação genérica de falso positivo lexical por inversão no ranking, sem atribuir causalidade nem confundir com classe prevista.
- [x] Apresentar AP/NDCG das três representações no gráfico, em vez de repetir nove barras de classificadores.
- [x] Mostrar aviso global sobre validação pendente; remover fallback das combinações reais para números simulados.
- [x] Explicitar que o RSS do medidor é máximo observado em leituras pontuais, não monitoramento contínuo do pico.
- [x] Executar 20 testes Python e 7 testes da interface; verificar sintaxe de todos os scripts Python e build de produção.
- [x] Conferir ausência de alterações no corpus, nos CSVs de resultados e nos quatro JSONs que contêm os números publicados da UI.

## Bloqueios que continuam abertos

- [ ] **Anotação:** revisar/adjudicar os rótulos dos 100 currículos, ou delimitar formalmente uma avaliação com supervisão fraca. A divergência `21297521` não foi resolvida automaticamente.
- [ ] **Documentos próximos:** conferir os PDFs `26746496` e `16186411`, escolher unidade documento/candidato e política de exclusão/agrupamento.
- [ ] **Partições:** refazer o desenho de validação após a revisão. Esta rodada ainda não implementa CV por grupos nem considera um campo `grupo_documental` preenchido como suficiente para liberar os documentos próximos; a liberação exige uma política efetivamente implementada e testada.
- [ ] **Classe rara:** escolher número de folds conforme classes e perfis independentes. A regra de cinco folds foi mantida e agora falha explicitamente com o corpus atual; não foi trocada arbitrariamente por três folds.
- [ ] **Baseline experimental:** acrescentar `DummyClassifier` e configurações simples com ponderação de classes no protocolo final. O baseline desta auditoria é uma conta analítica, não um novo treino.
- [ ] **Reexecução:** validar/migrar ou regenerar explicitamente caches legados depois de estabilizar textos/modelos. Eles não foram apagados, mas deixam de ser confiáveis para reutilização automática nesta branch.
- [ ] **Resultados finais:** recalcular classificação, rankings e custos sob uma única configuração; preservar o snapshot anterior e documentar a alteração de protocolo.
- [ ] **Recursos:** registrar hardware, versões, threads, repetições e preparação versus consulta nova. Monitoramento contínuo de RSS não foi implementado nesta fase.
- [ ] **Interface ao vivo:** realizar teste visual das rotas e capturar as telas depois da consolidação. Esta rodada verificou build e lógica de dados, sem nova inspeção visual completa no navegador.
- [ ] **Artigo:** atualizar método, resultados, discussão, limitações e conclusões somente com os artefatos finais; o artigo não foi modificado nesta rodada.

## Como verificar sem recalcular os modelos

Na pasta `piloto_tfidf`, com seu Python configurado:

```powershell
python validar_experimento.py --saida validation/relatorio_validacao.json
python -m unittest discover -s tests -v
```

O primeiro comando retorna **2** quando há bloqueios científicos/integridade, como no corpus atual. Isso é um diagnóstico esperado, não uma interrupção da execução nem indicação de arquivo perdido. Retorno 1 indica erro de execução; 0 significa ausência dos bloqueios detectados, não aprovação institucional.

Para atualizar explicitamente a proveniência e o aviso da UI:

```powershell
python validar_experimento.py --publicar-status-ui --saida validation/relatorio_validacao.json
```

Para preparar a anotação, sem alterar o corpus:

```powershell
python validar_experimento.py --preparar-revisao validation/revisao_humana.csv
```

O CSV começa sem respostas. O autor/avaliador deve preencher rótulo, justificativa, nome e data após leitura do texto e aplicação da rubrica. O arquivo de trabalho não é adicionado ao Git automaticamente. O comando não aplica o formulário preenchido ao corpus; essa aplicação exige adjudicação e revisão separada.

Na pasta `aplicacao_mockup`:

```powershell
npm ci --ignore-scripts
npm test
npm run build
npm run dev
```

O build tem um aviso de bundle maior que 500 kB; ele não impede a compilação. Otimização do bundle não foi priorizada sobre a correção metodológica.

## Retomada depois de falta de energia

1. Execute `git status` e o preflight; não comece pelo antigo fluxo que reescolhia o corpus.
2. Um `.tmp` é uma escrita incompleta, não uma nova versão válida. Os leitores usam somente os arquivos oficiais e verificam hash/identidade.
3. Cache sem manifesto novo não é automaticamente descartado do disco; é recusado para leitura. Preserve uma cópia antes de regenerar os vetores.
4. Não execute os classificadores só para remover o aviso. Resolva primeiro rótulos, documentos próximos e desenho de avaliação.
5. Depois da reexecução aprovada, sincronize relatórios, UI e artigo com a mesma versão do corpus.

## Próxima ordem de trabalho

1. Fechar rubrica e adjudicação humana, começando pela divergência e pelos documentos próximos.
2. Implementar e testar a política final de grupos/partições e o baseline experimental.
3. Consolidar versões/configuração e só então executar os modelos necessários.
4. Sincronizar interface, conferir resultados e redigir o capítulo de resultados do TCC2.

O prazo informado é aproximadamente 15/11. Essa rodada entrega a proteção técnica e evidencia o que falta; não transforma automaticamente o estudo atual em uma validação científica concluída.
