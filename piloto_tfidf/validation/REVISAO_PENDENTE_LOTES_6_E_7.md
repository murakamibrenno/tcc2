# Revisão pendente dos lotes 6 e 7

Conferência de 10/11/2026. Os 25 documentos já aprovados permanecem registrados. Os itens abaixo são propostas da IA, aguardando decisão do autor. Não foram aplicados ao corpus nem aos resultados.

## Textos publicados na main

A pasta curriculos_processados está no commit 5fbdaee93e7b53abc6013edbee3e47d7d29daf24. Foram conferidos os hashes das três árvores Git completas: as cópias locais correspondem aos arquivos publicados após normalizar CRLF para LF. O git fetch por shell falhou por DNS; a versão remota foi conferida pelo conector GitHub, sem afirmar que houve pull de commits na cópia de análise.

Cada versão contém 2.484 TXT e os mesmos IDs do inventário. O arquivo 12632728 contém somente marcador de página, coerente com o PDF em branco. Nos outros 2.483, extracted_text_en preserva 100% do multiconjunto de tokens alfanuméricos, + e # da extração de referência. A versão readable preserva pelo menos 99% em 2.478 documentos e fica entre 96,64% e 99% em outros cinco. Isso é uma verificação lexical, não uma prova de fidelidade semântica: ordem, negações e contexto continuam exigindo leitura.

Usar cleaned_text_en_readable para revisão, extracted_text_en como referência e PDF em ambiguidades. Conferir no bruto os IDs 34304175, 83338413, 25953797, 95085510 e 10840430. Os textos integrais evitam repetir extração de PDF e não sofrem o corte de 12 mil caracteres do corpus histórico. A janela dos modelos permanece uma decisão experimental separada.

## Novos pares verificados

### 16850314 e 37473139

STOREKEEPER II. Leitura dos textos completos e inspeção visual das duas páginas. Conteúdo textual e apresentação iguais; PDFs têm bytes diferentes. Os TXT readable são idênticos entre si.

Proposta: manter 16850314 e excluir 37473139 da avaliação principal, preservando o original. Conteúdo equivalente: menor ID numérico como desempate determinístico, sem usar ranking. Rótulo sugerido para ambos: **Inadequado**. Atividades de estoque, compras e uso de PeopleSoft/Excel, sem evidências de SQL, linguagem de programação, Git ou APIs/web services.

Status: aguarda aprovação. Esses casos examinados entram no desenvolvimento, não no teste independente.

### 19147603 e 28398216

FINANCE OFFICER. Leitura dos textos completos e inspeção visual das quatro páginas. Conteúdo textual e apresentação iguais; PDFs têm bytes diferentes. Os TXT readable são idênticos entre si.

Proposta: manter 19147603 e excluir 28398216 da avaliação principal, preservando o original. Conteúdo equivalente: menor ID numérico como desempate determinístico, sem usar ranking. Rótulo sugerido para ambos: **Inadequado**. Contabilidade, orçamento e uso de aplicativos de escritório, sem os quatro requisitos. Assembly refere-se à United Nations General Assembly (UNGA), não à linguagem de programação.

Status: aguarda aprovação. Esses casos examinados entram no desenvolvimento, não no teste independente.

## Lote 6 aguardando aprovação

1. **28126340 — Parcialmente Adequado**. Transact SQL, PL/SQL; MS SQL Server, MySQL, Oracle; Client/Server developer ... JavaScript; Classic ASP/ASP.net ... PHP. SQL e programação evidenciados; não identificados Git ou APIs/web services. Aplicações web não comprovam automaticamente integração por serviços.

2. **33381211 — Parcialmente Adequado**. SQL server; distributed architecture using .NET C#; design & implementation of new services layer with restful APIs; WCF services. Três requisitos evidenciados; sem Git identificado. Experiência declarada é principalmente de liderança técnica e arquitetura, sem inferir execução pessoal de todo o código. Cargo executivo não causa exclusão.

3. **37242217 — Parcialmente Adequado**. MySQL, MS SQL, Oracle 11i; PHP, JavaScript, Java, C++, Microsoft Visual Basic; Web designer, developer ... over 30 client domains. SQL e programação evidenciados; sem Git ou APIs/web services identificado. Administração de servidores web não comprova desenvolvimento de serviços.

4. **15651486 — Inadequado**. SQL Database; Cisco ... network infrastructure ... VoIP. SQL declarado, mas sem linguagem, Git ou serviços/APIs evidenciados. Integração de telefonia e redes não comprova o requisito de serviços de aplicações.

5. **18301617 — Inadequado**. Microsoft SQL; Microsoft SQL Server. Apenas SQL declarado entre os quatro requisitos. Instalação/migração de servidores e infraestrutura não comprova programação, Git ou APIs/web services.

## Lote 7 aguardando aprovação

1. **20674668 — Parcialmente Adequado**. SQL, PL/SQL, Oracle Database; C++, Java, JavaScript, PHP, Python; Lead Drupal Developer. SQL e programação evidenciados. Versioning management systems sem Git explicitado; sem API/web services demonstrado. Serviços de implantação Drupal não comprovam integração por serviços.

2. **24889109 — Inadequado**. LAN/WAN; Technical Support; routers/firewalls; Windows 7. Atuação em infraestrutura sem os quatro requisitos técnicos evidenciados. FTP/TCP/IP e telecomunicações não são serviços de aplicações.

3. **20001721 — Parcialmente Adequado**. Structured query language (SQL) expert; SQL Server; Used object-oriented design/programming ... stand-alone application; VBA. SQL e programação sustentados por formação, declaração de competência e projeto; sem Git/serviços. Ser estudante não causa reprovação.

4. **18187364 — Parcialmente Adequado**. Wrote extensive SQL and PL/SQL programs; Wrote PL/SQL ... custom routines; custom ... UNIX shell scripts. SQL e programação de rotinas/scripts explicitamente desenvolvidos. Não inferir linguagem C apenas da letra isolada no bloco de skills. Sem Git e APIs/web services identificado.

5. **10553553 — Inadequado**. SQL Administration; Administered SQL 2005 database; Migrated ... Exchange ... with PowerShell. SQL evidenciado. Usar PowerShell em migração sem descrever criação de scripts não comprova programação. Sem Git/serviços.

## Efeito no artigo

Depois da aprovação, registrar a versão adjudicada, fechar grupos/partições e recalcular as métricas. Atualizar método, resultados e discussão com os mesmos artefatos. Estas propostas não são números finais nem aprovação humana concluída. Preservar o desenho comparativo do artigo.
