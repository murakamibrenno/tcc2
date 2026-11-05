# Guia passo a passo — Piloto TF-IDF com base archive REAL

Este piloto usa currículos **reais** da pasta `archive/`, com textos já extraídos
em `curriculos_processados/`. Os exemplos sintéticos do mock da interface **não**
são mais a fonte principal.

---

## Estrutura da base archive

```
archive/
├── data/data/                    ← PDFs originais (2.484 currículos)
│   ├── INFORMATION-TECHNOLOGY/   ← 120 PDFs (melhor categoria p/ backend)
│   ├── ENGINEERING/
│   ├── ACCOUNTANT/
│   └── ... (24 categorias)
└── Resume/Resume.csv             ← Dataset alternativo em CSV (inglês)

curriculos_processados/
├── extracted_text_en/            ← Texto bruto extraído dos PDFs
├── cleaned_text_en/              ← Texto limpo
├── cleaned_text_en_readable/     ← Texto limpo + legível (USE ESTE)
└── logs/extraction_log.csv       ← Log da extração (status ok/erro)
```

**Total extraído:** 2.484 currículos em 24 categorias (todos com `.txt` disponível).

**Idioma:** inglês (importante declarar no TCC).

---

## Pasta piloto_tfidf/

```
piloto_tfidf/
├── data/
│   ├── vaga_referencia.json
│   ├── selecao_piloto.csv        ← VOCÊ EDITA: quais currículos entram
│   ├── catalogo_archive.csv      ← gerado automaticamente (inventário completo)
│   └── curriculos_piloto.json    ← gerado a partir da seleção
├── gerar_catalogo_archive.py     ← lista todos os currículos disponíveis
├── montar_piloto_archive.py      ← monta JSON a partir da seleção
├── tfidf_piloto.py               ← executa TF-IDF
├── protocolo_anotacao.md
└── output/                       ← resultados
```

---

## Fluxo completo (ordem correta)

### Passo A — Gerar catálogo (1 min)

```powershell
cd c:\Users\brenn\Downloads\TCC\TCC\piloto_tfidf
.venv\Scripts\activate
python gerar_catalogo_archive.py
```

Abra `data/catalogo_archive.csv` no Excel ou LibreOffice.

Colunas úteis para escolher currículos:
- `categoria` — área do currículo (ex.: information-technology)
- `titulo_detectado` — primeira linha do CV
- `hits_backend` — quantos termos (python, sql, git, api...) aparecem
- `tem_python`, `tem_sql`, `tem_git`, `tem_api_rest`
- `caminho_txt` — arquivo de texto para conferir

### Passo B — Escolher SEUS currículos (manual — 20–40 min)

1. Abra `data/selecao_piloto.csv`
2. **Substitua** a sugestão pelos IDs que você escolheu da base
3. Para cada linha que entra no piloto: `incluir=1`
4. Para remover: `incluir=0` ou apague a linha

Formato do CSV:
```csv
id,categoria,incluir,classificacao_referencia,classificacao_confirmada,observacao
20674668,information-technology,1,,,escolhi este da categoria IT
```

> A coluna `categoria` deve bater com a pasta em `cleaned_text_en_readable`
> (ex.: `information-technology`, `accountant`, `chef` — tudo minúsculo).

### Passo C — Montar o dataset do piloto (10 s)

```powershell
python montar_piloto_archive.py
```

Isso recria `data/curriculos_piloto.json` com os textos reais extraídos.

### Passo D — Anotar manualmente (Etapa 3)

1. Leia cada texto em `curriculos_piloto.json` ou abra o `.txt` original
2. Use `protocolo_anotacao.md` para classificar
3. Registre em `selecao_piloto.csv` → coluna `classificacao_confirmada`
4. Rode de novo: `python montar_piloto_archive.py`

### Passo E — Executar TF-IDF (Etapa 4)

```powershell
python tfidf_piloto.py
```

Resultados em `output/ranking_tfidf_piloto.csv`.

### Passo F — Exportar para a interface CurrículoRank

```powershell
python exportar_piloto_ui.py
```

Gera `aplicacao_mockup/src/data/pilotoTfidf.json`, consumido pela vaga
**"Piloto — Desenvolvedor de Software (Backend/Web)"** (id 4) na tela de Ranking.

> Sempre que alterar a seleção ou a anotação, rode os três na ordem:
> `montar_piloto_archive.py` → `tfidf_piloto.py` → `exportar_piloto_ui.py`.
> Depois recarregue a interface (`npm run dev` em `aplicacao_mockup`).

---

## O que já vem pronto vs. o que é seu

| Item | Quem faz |
|------|----------|
| PDFs e textos extraídos | Já existem (archive + curriculos_processados) |
| Catálogo completo | `gerar_catalogo_archive.py` |
| Seleção dos currículos | **VOCÊ** edita `selecao_piloto.csv` |
| Anotação manual | **VOCÊ** preenche `classificacao_confirmada` |
| TF-IDF | `tfidf_piloto.py` |

---

## Sugestão inicial (pode trocar)

O `selecao_piloto.csv` traz **20 currículos** (10 de IT + 10 de áreas distantes):

**10 × information-technology** (perfis variados: dev forte, .NET, manager, sysadmin…)

**10 × outras áreas** (accountant, chef, teacher, advocate, apparel, agriculture, healthcare, hr, sales, fitness) — candidatos claramente fora do perfil backend, para contrastar no ranking TF-IDF.

---

## Conferir um currículo manualmente

Exemplo — abrir o texto extraído no Bloco de Notas:

```
c:\Users\brenn\Downloads\TCC\TCC\curriculos_processados\cleaned_text_en_readable\information-technology\20674668.txt
```

PDF original correspondente:

```
c:\Users\brenn\Downloads\TCC\TCC\archive\data\data\INFORMATION-TECHNOLOGY\20674668.pdf
```

---

## Declaração sugerida para o TCC

> O piloto inicial utilizou subconjunto de currículos reais de dataset público
> em inglês (archive), com textos extraídos via PyMuPDF e limpeza automatizada.
> A vaga de referência foi redigida em inglês para compatibilidade lexical com
> os documentos. A avaliação em português permanece como etapa posterior.

---

## Próximo passo

1. Rode `python gerar_catalogo_archive.py`
2. Escolha seus currículos em `selecao_piloto.csv`
3. Me envie a lista de IDs que escolheu — eu te ajudo a validar a anotação
