# Protocolo de anotação manual — Piloto TF-IDF (base archive real)

## Fonte dos dados
- PDFs originais: `archive/data/data/{CATEGORIA}/*.pdf`
- Textos extraídos: `curriculos_processados/cleaned_text_en_readable/{categoria}/*.txt`
- Seleção do piloto: `data/selecao_piloto.csv` ← **edite aqui os currículos que você escolheu**

## Vaga de referência
**Junior Software Developer (Backend / Web)** — texto em inglês, vocabulário alinhado à base archive (Java, Spring, .NET, PHP, web services — não só Python).

### Requisitos obrigatórios (4 critérios)
1. **SQL** — aceitar SQL, MySQL, PostgreSQL, Oracle, SQL Server, PL/SQL, T-SQL
2. **REST / web services** — aceitar REST, RESTful, REST API, web services, microservices
3. **Git / controle de versão** — aceitar Git, GitHub, GitLab ou "version control" em contexto de desenvolvimento
4. **Linguagem de programação** — aceitar Java, Python, PHP, C#, .NET, JavaScript, Spring, Drupal (perfil dev)

### Requisitos desejáveis (não entram na regra do piloto)
Spring, .NET, Docker, automated testing, microservices

---

## Classes de anotação

| Classe | Definição operacional |
|--------|----------------------|
| **Adequado** | Atende os **4 requisitos obrigatórios** no texto extraído. Perfil de desenvolvimento backend ou full stack com experiência relevante. |
| **Parcialmente Adequado** | Atende **2 ou 3** requisitos, **ou** é IT genérico (sysadmin, suporte, gestão) com pouca evidência de desenvolvimento de aplicações. |
| **Inadequado** | Atende **0 ou 1** requisito **ou** perfil de outra área (contabilidade, cozinha, RH, etc.). |

---

## Checklist por currículo (preencher manualmente)

Use o `id` do arquivo PDF/TXT (ex.: `20674668`).

| ID | Categoria | SQL | REST/WS | Git | Lang | Total | Classe |
|----|-----------|-----|---------|-----|------|-------|--------|
| | | | | | | | |
| | | | | | | | |

Depois registre em `data/selecao_piloto.csv` na coluna `classificacao_confirmada`.

---

## Currículos sugeridos (substitua pelos seus)

A seleção inicial em `selecao_piloto.csv` é apenas **sugestão** com 10 perfis variados.
Para usar **os currículos que você escolheu**:

1. Abra `data/catalogo_archive.csv` (gere com `python gerar_catalogo_archive.py`)
2. Filtre por categoria (ex.: `information-technology`) ou por `hits_backend`
3. Copie os `id` escolhidos para `selecao_piloto.csv` com `incluir=1`
4. Rode `python montar_piloto_archive.py`

---

## Observação sobre idioma

A base **archive** contém currículos em **inglês**. Este piloto valida o pipeline
de extração + TF-IDF com dados reais. A avaliação em português entra na fase
posterior do TCC, com dataset próprio.
