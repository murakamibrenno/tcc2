# Revisão do lote 7

Atualização de 10/11/2026. Lote 6 e escolhas dos dois pares aprovados pelo autor. Há 30 dos 100 documentos do piloto com rótulos aprovados, além de quatro documentos dos pares complementares. Restam 70 do piloto: sete lotes de dez, incluindo o lote abaixo. A ampliação para além do piloto terá contagem própria após a seleção.

## Textos publicados na main

A pasta curriculos_processados está no commit 5fbdaee93e7b53abc6013edbee3e47d7d29daf24. Foram conferidos os hashes das três árvores Git completas: as cópias locais correspondem aos arquivos publicados após normalizar CRLF para LF. O git fetch por shell falhou por DNS; a versão remota foi conferida pelo conector GitHub, sem afirmar que houve pull de commits na cópia de análise.

Cada versão contém 2.484 TXT e os mesmos IDs do inventário. O arquivo 12632728 contém somente marcador de página, coerente com o PDF em branco. Nos outros 2.483, extracted_text_en preserva 100% do multiconjunto de tokens alfanuméricos, + e # da extração de referência. A versão readable preserva pelo menos 99% em 2.478 documentos e fica entre 96,64% e 99% em outros cinco. Isso é uma verificação lexical, não uma prova de fidelidade semântica: ordem, negações e contexto continuam exigindo leitura.

Usar cleaned_text_en_readable para revisão, extracted_text_en como referência e PDF em ambiguidades. Conferir no bruto os IDs 34304175, 83338413, 25953797, 95085510 e 10840430. Os textos integrais evitam repetir extração de PDF e não sofrem o corte de 12 mil caracteres do corpus histórico. A janela dos modelos permanece uma decisão experimental separada.

## Pares complementares aprovados

- 16850314 / 37473139: ambos Inadequados. Manter 16850314; excluir 37473139 da avaliação principal. Preservar os originais. Atividades de estoque, compras e uso de PeopleSoft/Excel, sem evidências de SQL, linguagem de programação, Git ou APIs/web services.

- 19147603 / 28398216: ambos Inadequados. Manter 19147603; excluir 28398216 da avaliação principal. Preservar os originais. Contabilidade, orçamento e uso de aplicativos de escritório, sem os quatro requisitos. Assembly refere-se à United Nations General Assembly (UNGA), não à linguagem de programação.

## Lote 7 aguardando aprovação

1. **20674668 — Parcialmente Adequado**. SQL, PL/SQL, Oracle Database; C++, Java, JavaScript, PHP, Python; Lead Drupal Developer. SQL e programação evidenciados. Versioning management systems sem Git explicitado; sem API/web services demonstrado. Serviços de implantação Drupal não comprovam integração por serviços.

2. **24889109 — Inadequado**. LAN/WAN; Technical Support; routers/firewalls; Windows 7. Atuação em infraestrutura sem os quatro requisitos técnicos evidenciados. FTP/TCP/IP e telecomunicações não são serviços de aplicações.

3. **20001721 — Parcialmente Adequado**. Structured query language (SQL) expert; SQL Server; Used object-oriented design/programming ... stand-alone application; VBA. SQL e programação sustentados por formação, declaração de competência e projeto; sem Git/serviços. Ser estudante não causa reprovação.

4. **18187364 — Parcialmente Adequado**. Wrote extensive SQL and PL/SQL programs; Wrote PL/SQL ... custom routines; custom ... UNIX shell scripts. SQL e programação de rotinas/scripts explicitamente desenvolvidos. Não inferir linguagem C apenas da letra isolada no bloco de skills. Sem Git e APIs/web services identificado.

5. **10553553 — Inadequado**. SQL Administration; Administered SQL 2005 database; Migrated ... Exchange ... with PowerShell. SQL evidenciado. Usar PowerShell em migração sem descrever criação de scripts não comprova programação. Sem Git/serviços.

6. **12635195 — Inadequado**. Taught courses concerning ... Python, Visual Basic, and C#; Developed mobile applications with student body. Programação evidenciada, sem SQL, Git ou APIs/web services identificados. Docência não causa reprovação; apenas um dos quatro requisitos.

7. **31111279 — Parcialmente Adequado**. Programmed in SQL ... developed various hospital reports; MS SQL 7.0; making changes ... in VB/VBA code; API Software tools (HR/Payroll, Security, Scheduling and timekeeping systems). SQL e programação explícitos. API é usado no nome de software de gestão de pessoal; não comprova desenvolvimento de interface de programação. Sem Git e web services/REST identificado.

8. **27295996 — Inadequado**. Performance monitoring ... Microsoft SQL Databases; Introduction to SQL. SQL evidenciado; atividades de suporte, migração e implantação sem linguagem, Git ou APIs/web services comprovados.

9. **27536013 — Inadequado**. Upgrade of databases from MS SQL to Oracle; SQL databases. SQL evidenciado; gestão de BI/SharePoint e reporting sem linguagem, Git ou serviços/APIs explicitados. BI Program refere-se ao programa organizacional.

10. **32959732 — Inadequado**. Microsoft SQL server; IDERA SQL Management; Oversaw an off-shore development team ... SharePoint; Amazon Web Services. SQL declarado, sem linguagem ou Git. Coordenar integrações e listar Amazon Web Services não comprova implementação de APIs/web services.

## Integração aos resultados e ao artigo

As decisões aprovadas estão no registro adjudicado separado. Corpus, partições e métricas históricas permanecem preservados até a consolidação e reexecução. Os novos itens do lote 7 são propostas, não decisões humanas. Método, resultados e discussão do artigo receberão os artefatos da mesma versão depois da avaliação.
