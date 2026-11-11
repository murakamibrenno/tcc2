# CurrículoRank e experimento do TCC2

Avaliação comparativa de TF-IDF, BGE e embeddings de Qwen para triagem de currículos, com uma vaga de desenvolvedor backend/web em inglês. Estado de 10/11/2026 na branch `codex/validacao-pratica-tcc2-20261110`.

## Estado atual

A coleção foi processada nas três representações: 2.484 PDFs inventariados, 2.483 textos utilizáveis e um PDF em branco. Qualidade e classificação foram avaliadas num subconjunto distinto da coleção inteira. Categoria profissional e excesso de experiência não reprovam automaticamente: vale a aderência técnica documentada.

O desenvolvimento tem 294 casos (6 Adequados, 75 Parciais e 213 Inadequados), com seis dúvidas excluídas. A avaliação exploratória tem 97 casos (4 Adequados, 35 Parciais e 58 Inadequados), após excluir três históricos relacionados ao desenvolvimento. Cinco rótulos da avaliação receberam ratificação humana assistida; 92 continuam somente da IA. Não é teste humano independente. A mesma IA participou das duas anotações, com possível correlação de erros. A amostra enriquecida não estima a prevalência da coleção.

## Resultados e leitura

Foram mantidas as 18 condições previamente avaliadas no desenvolvimento: três representações, três classificadores e condições original/com pesos. Nenhum limiar ou hiperparâmetro foi calibrado pelos 97 casos. Qwen + SVM com pesos teve F1 macro observado 0,785 e recuperou 2/4 Adequados; BGE + Regressão Logística com pesos recuperou 3/4, com três falsos positivos. As nove condições originais recuperaram zero Adequados. Um caso equivale a 25 pontos de recall dessa classe; não há vencedor definitivo.

O ranking por cosseno foi medido somente entre os 97 julgados: AP de 0,635 / 0,479 / 0,254 para TF-IDF / BGE / Qwen. BGE colocou três Adequados nos cinco primeiros. Não julgados não são irrelevantes. AP considera apenas Adequado; NDCG usa relevância 2/1/0 com ganho exponencial. Uma vaga permite AP, não MAP entre consultas.

- [Resultados, matrizes, protocolo e limitações](piloto_tfidf/output/coorte97_v1/README.md).
- [Interpretabilidade: contribuições lexicais e oclusão densa](piloto_tfidf/output/interpretabilidade_atual_v1/README.md).
- [ROC-AUC complementar, sem alteração das previsões](piloto_tfidf/output/complemento_auc97_v1/README.md).
- [Checklist e etapas restantes](VALIDACAO_PRATICA_CHECKLIST.md).
- [Manifesto da coorte e proveniência](piloto_tfidf/data/coorte_97_v1/manifesto.json).

## CurrículoRank

```powershell
cd aplicacao_mockup
npm ci --ignore-scripts
npm test
npm run build
npm run dev -- --host 127.0.0.1
```

Usar Node 22.12 ou superior compatível com Vite 8. A aplicação mostra uma execução pré-calculada, com uma vaga, rankings dos 2.483 ou dos 97, filtros, comparação das 18 configurações, matrizes, custos, proveniência e interpretabilidade dos cinco casos. O ranking abre na coleção completa, com total visível e contagem após filtros; os 97 permanecem como opção para avaliar qualidade. Não executa novas inferências nem cadastro de novas vagas. O texto integral na inspeção é disponibilizado para os cinco casos; os demais textos estão em `curriculos_processados/extracted_text_en`.

A fonte ativa é `aplicacao_mockup/src/data/experimentoAtual.json`, exportada dos relatórios atuais com hashes conferidos. Páginas e JSONs do piloto anterior foram preservados, mas não são usados pelas rotas ativas. Não usar `metricasReais.json` para descrever a execução atual.

TF-IDF de classificação é ajustado apenas no treino; o TF-IDF de recuperação usa a coleção sem rótulos. Textos entram com até 8.000 caracteres; BGE e Qwen têm também limite de 512 tokens. Os modelos densos e suas revisões estão fixados nos protocolos. Custos de CPU e GPU, repetições diferentes e exclusão de download/carga devem ser apresentados juntos, sem comparação normalizada de hardware.

## Verificação e limites da entrega

```powershell
python -m unittest discover -s piloto_tfidf/tests -v
python -m compileall -q piloto_tfidf
```

Foram executados 55 testes Python e 9 testes de interface, incluindo integridade dos universos, ordenação e renderização das páginas em servidor; build de produção aprovado. Dependências atualizadas e auditoria npm sem vulnerabilidades reportadas na execução. A apresentação desktop foi conferida estaticamente em 12 capturas fornecidas pelo autor; seis telas atuais foram integradas ao artigo. [Capturas e limites da conferência](docs/capturas_curriculorank_20261110/README.md). Testes interativos completos e a conferência em telas menores permanecem pendentes. SSR/build e capturas não substituem esses testes. O pacote de produção ainda gera aviso de tamanho de chunk.

A redação final foi integrada no artigo editável para revisão do autor e orientador: resumo e abstract, método executado, resultados e discussão, conclusão, referências e índices. Ver [alterações específicas](docs/ALTERACOES_ARTIGO_TCC2.md) e [resultados e discussão](docs/ARTIGO_RESULTADOS_DISCUSSAO_CONCLUSAO.md). As Figuras 14–19 agora documentam a interface atual. Permanecem os testes interativos completos, a conferência em telas menores e a revisão institucional. Validação humana independente mais ampla é trabalho posterior, salvo nova exigência do orientador. Seis dúvidas podem permanecer excluídas com justificativa; eventual inclusão exige nova versão do protocolo e não transforma os 97 em teste novo.

Os snapshots históricos permanecem no Git e nos diretórios anteriores. Seus números e critérios não descrevem o protocolo atual. Os documentos editáveis e os PDFs são mantidos no Drive do autor, fora deste repositório público.

## Documentos para revisão

- [Trabalho completo revisado — Word, 78 páginas](https://docs.google.com/document/d/1PmGy9EWf7Jtit6s31piz__LMz75dMi5o/edit?usp=drivesdk&ouid=116276678962502189456&rtpof=true&sd=true) e [PDF](https://drive.google.com/file/d/1iA4j6wWVEMBc0nIlRrO_sL0tG1NkxoQT/view?usp=drivesdk).
- [Artigo SBC — Word, 11 páginas](https://docs.google.com/document/d/1m0Rzhm0aKedYz9EaDBdpj03psNt5YE6R/edit?usp=drivesdk&ouid=116276678962502189456&rtpof=true&sd=true) e [PDF](https://drive.google.com/file/d/14Y5ynOV11moERIKvCwJdEIp2yoB3zcVZ/view?usp=drivesdk).

O artigo SBC contém as referências nas onze páginas. Os dois textos mantêm os mesmos universos, resultados e limitações. Correções da revisão crítica incluem equações, diagramas teóricos legíveis, trabalhos relacionados, matriz de confusão, análise de erros e apêndices de anotação e reprodução. O e-mail foi indicado pelo autor; eventual coautoria do orientador será combinada entre eles.

Fontes e verificação: [artigo SBC](docs/ARTIGO_SBC_TCC2.md), [resultados do trabalho completo](docs/ARTIGO_RESULTADOS_DISCUSSAO_CONCLUSAO.md), [apêndices](docs/APENDICES_TCC2.md), [alterações](docs/ALTERACOES_ARTIGO_TCC2.md), [conferência](docs/conferencia_documentos_tcc2.json) e [arquivos e hashes](docs/versao_artigo_tcc2.json). Revisão e aceite institucional permanecem com o autor e orientador.
