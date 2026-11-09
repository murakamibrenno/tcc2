import React from 'react'
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
} from '@mui/material'
import metricasReais from '../data/metricasReais.json'
import corpusMeta from '../data/corpusMeta.json'
import corpusCompleto from '../data/corpusCompletoMeta.json'
import MethodComparisonChart from '../components/MethodComparisonChart'
import CabecalhoMetrica from '../components/CabecalhoMetrica'

const NOMES = {
  '10138632': 'Sales Manager',
  '16186411': 'Database Programmer / .NET',
  '20674668': 'IT Specialist (Drupal)',
  '26746496': 'Database Programmer / .NET',
  '83816738': 'IT Intern (automação de testes)',
}

const COR = {
  'TF-IDF': '#0E7490',
  'Sentence-Transformers': '#D97706',
  'LLM Embeddings': '#7C3AED',
  Adequado: '#059669',
  'Parcialmente Adequado': '#D97706',
  Inadequado: '#6B7280',
}

function num(v, casas = 2) {
  if (typeof v !== 'number') return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

function tempo(seg) {
  if (typeof seg !== 'number') return '—'
  if (seg < 90) return `${num(seg, seg < 1 ? 2 : 0)} s`
  return `${num(seg / 60, 1)} min`
}

function melhorPorRepresentacao(linhas) {
  const grupos = {}
  linhas.forEach((linha) => {
    const atual = grupos[linha.representacao]
    if (!atual || linha.f1_macro > atual.f1_macro) grupos[linha.representacao] = linha
  })
  return ['TF-IDF', 'Sentence-Transformers', 'LLM Embeddings'].map((nome) => grupos[nome]).filter(Boolean)
}

const ranking = metricasReais.ranking ?? []
const casos = metricasReais.casosDestaqueRanking ?? []
const correlacao = metricasReais.correlacaoRankings ?? []
const rigorosa = metricasReais.classificacaoRigorosa ?? []
const holdout = metricasReais.holdout
const revisao = metricasReais.revisaoAmostra
const melhores = melhorPorRepresentacao(rigorosa)
const dist100 = corpusMeta.distribuicao
const distTodos = corpusCompleto.distribuicao

const st = ranking.find((r) => r.metodo === 'Sentence-Transformers')
const tfidf = ranking.find((r) => r.metodo === 'TF-IDF')
const llm = ranking.find((r) => r.metodo === 'LLM Embeddings')
const sales = casos.find((c) => c.id === '10138632')
const rhoStLlm = correlacao.find(
  (c) => c.metodo_a === 'Sentence-Transformers' && c.metodo_b === 'LLM Embeddings',
)

export default function Resultados() {
  return (
    <Box>
      <Box sx={{ mb: 3, maxWidth: 820 }}>
        <Typography variant="h2" sx={{ mb: 0.75, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Resultados e discussão
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Esta página lê o experimento do começo ao fim. A pergunta é qual representação
          de texto entrega a melhor triagem de currículos para uma vaga de desenvolvedor
          backend, quando se olha a fila de leitura, o custo e a chance de explicar a ordem.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          ['1. Começo', 'Uma pilha real tem milhares de currículos e quase nenhum perfil da vaga. O filtro usado nas empresas ainda é, em geral, a palavra da vaga.'],
          ['2. Medição', 'Três representações ordenam os mesmos 100 currículos. Ranking, classificação, tempo e um caso lido à mão medem a diferença.'],
          ['3. Discussão', 'O modelo treinado para busca ordena melhor. A contagem de palavras é barata e se engana. O vetor de um LLM generativo não substitui os dois.'],
        ].map(([titulo, texto]) => (
          <Grid item xs={12} md={4} key={titulo}>
            <Paper elevation={0} sx={{ p: 2.25, height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, mb: 0.75 }}>{titulo}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>{texto}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Section
        kicker="Começo"
        titulo="Por que a parte prática existe"
      >
        <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 2 }}>
          Em empresas de médio e grande porte, o currículo entra primeiro num sistema de
          triagem (ATS). O corte inicial costuma ser lexical: o texto precisa conter as
          palavras da vaga, como SQL, Java ou Git. Esse filtro é a mesma família do TF-IDF.
          Produtos mais novos passaram a oferecer uma segunda camada, que compara o sentido
          do currículo com o sentido da vaga. A parte prática mede essas duas ideias, e uma
          terceira: tirar um vetor de um modelo generativo que não foi treinado para busca.
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 2.5 }}>
          A base pública tem {corpusCompleto.total.toLocaleString('pt-BR')} currículos em inglês,
          de 24 profissões. Com a mesma regra usada no experimento, a aderência à vaga de
          desenvolvedor backend fica assim. A triagem real é achar poucos currículos no meio
          de muitos que não servem.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Distribuicao
              titulo={`Base inteira · ${corpusCompleto.total.toLocaleString('pt-BR')}`}
              dist={distTodos}
              nota="Retrato da pilha. Não é o conjunto em que as representações foram comparadas."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Distribuicao
              titulo={`Comparação · ${corpusMeta.total}`}
              dist={dist100}
              nota="60 de tecnologia e 40 de outras áreas, para existir o que distinguir. Vinte rótulos são manuais."
            />
          </Grid>
        </Grid>
      </Section>

      <Section
        kicker="Medição"
        titulo="O que cada número responde"
      >
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            ['P@5 e P@10', 'Dos primeiros currículos da fila, quantos são Adequados ou Parciais. É a precisão da leitura inicial.'],
            ['MAP', 'Só os Adequados. Vale 1,00 quando os três Adequados ocupam as três primeiras posições.'],
            ['NDCG@10', 'Os dez primeiros, com peso maior para Adequado do que para Parcial.'],
            ['Tempo', 'Quanto a máquina levou para transformar os 100 textos em vetores, nesta CPU.'],
          ].map(([titulo, texto]) => (
            <Grid item xs={12} sm={6} key={titulo}>
              <Paper elevation={0} sx={{ p: 2, height: '100%', borderRadius: '10px', bgcolor: '#F8F6F2' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', mb: 0.5 }}>{titulo}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{texto}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>NDCG@10</Typography>
              <MethodComparisonChart
                dados={ranking.map((r) => ({ nome: r.metodo === 'Sentence-Transformers' ? 'ST' : r.metodo === 'LLM Embeddings' ? 'Qwen' : 'TF-IDF', valor: r['NDCG@10'], cor: COR[r.metodo] }))}
                yDomain={[0, 1]}
                altura={200}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Precision@5</Typography>
              <MethodComparisonChart
                dados={ranking.map((r) => ({ nome: r.metodo === 'Sentence-Transformers' ? 'ST' : r.metodo === 'LLM Embeddings' ? 'Qwen' : 'TF-IDF', valor: r['P@5'], cor: COR[r.metodo] }))}
                yDomain={[0, 1]}
                altura={200}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Tempo de vetorização</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Segundos nos 100 currículos.</Typography>
              <MethodComparisonChart
                dados={ranking.map((r) => ({ nome: r.metodo === 'Sentence-Transformers' ? 'ST' : r.metodo === 'LLM Embeddings' ? 'Qwen' : 'TF-IDF', valor: r.tempo_vetorizacao_seg, cor: COR[r.metodo] }))}
                yDomain={[0, Math.ceil(Math.max(...ranking.map((r) => r.tempo_vetorizacao_seg)) * 1.08)]}
                suffix=" s"
                altura={180}
              />
            </Paper>
          </Grid>
        </Grid>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <CabecalhoMetrica id="representacao">Representação</CabecalhoMetrica>
                <CabecalhoMetrica id="p5">P@5</CabecalhoMetrica>
                <CabecalhoMetrica id="p10">P@10</CabecalhoMetrica>
                <CabecalhoMetrica id="map">MAP</CabecalhoMetrica>
                <CabecalhoMetrica id="ndcg">NDCG@10</CabecalhoMetrica>
                <CabecalhoMetrica id="tempo">Tempo</CabecalhoMetrica>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.map((r) => (
                <TableRow key={r.metodo}>
                  <TableCell sx={{ color: COR[r.metodo], fontWeight: 700 }}>{r.metodo}</TableCell>
                  <TableCell>{num(r['P@5'])}</TableCell>
                  <TableCell>{num(r['P@10'])}</TableCell>
                  <TableCell>{num(r.MAP)}</TableCell>
                  <TableCell>{num(r['NDCG@10'])}</TableCell>
                  <TableCell>{tempo(r.tempo_vetorizacao_seg)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, mb: 1.25 }}>
          Cinco currículos, três filas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.65 }}>
          A posição 1 é o primeiro currículo que o recrutador leria. ST é o Sentence-Transformers.
          Dois perfis compartilham o título de programador .NET; o identificador separa os dois.
        </Typography>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <CabecalhoMetrica id="curriculo" sx={{ whiteSpace: 'nowrap' }}>Currículo</CabecalhoMetrica>
                <CabecalhoMetrica id="rotulo" sx={{ whiteSpace: 'nowrap' }}>Rótulo</CabecalhoMetrica>
                <CabecalhoMetrica id="tfidf" align="center" sx={{ whiteSpace: 'nowrap' }}>TF-IDF</CabecalhoMetrica>
                <CabecalhoMetrica id="st" align="center" sx={{ whiteSpace: 'nowrap' }}>ST</CabecalhoMetrica>
                <CabecalhoMetrica id="qwen" align="center" sx={{ whiteSpace: 'nowrap' }}>Qwen</CabecalhoMetrica>
              </TableRow>
            </TableHead>
            <TableBody>
              {casos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{NOMES[c.id] || c.id}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{c.id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={c.classe}
                      sx={{ bgcolor: `${COR[c.classe]}18`, color: COR[c.classe], fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>{c['pos_TF-IDF']}</TableCell>
                  <TableCell>{c['pos_Sentence-Transformers']}</TableCell>
                  <TableCell>{c['pos_LLM Embeddings']}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Section
        kicker="Discussão"
        titulo="O que esses números dizem"
      >
        <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 2 }}>
          O Sentence-Transformers é a melhor fila de leitura. O MAP de {num(st?.MAP)} significa
          que os três Adequados ocupam as três primeiras posições. O P@5 de {num(st?.['P@5'])} significa
          que os cinco primeiros são, no mínimo, parciais. A vetorização dos 100 textos levou {tempo(st?.tempo_vetorizacao_seg)}.
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 2 }}>
          O TF-IDF responde em {tempo(tfidf?.tempo_vetorizacao_seg)} e é o único que mostra as palavras
          responsáveis pela nota. O custo dessa transparência está no Sales Manager, rótulo Inadequado,
          na {sales?.['pos_TF-IDF']}ª posição. O currículo de vendas compartilha vocabulário com a vaga
          sem ser um perfil de desenvolvimento. No Sentence-Transformers ele cai para a {sales?.['pos_Sentence-Transformers']}ª;
          no Qwen, para a {sales?.['pos_LLM Embeddings']}ª.
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 2 }}>
          O Qwen fica entre os dois no NDCG@10 ({num(llm?.['NDCG@10'])}) e atrás dos dois no MAP
          ({num(llm?.MAP)}). Os três Adequados não ficam juntos no topo: um está em 1º, os outros
          mais abaixo. O tempo foi {tempo(llm?.tempo_vetorizacao_seg)}. Além disso, a nota engana.
          O Sales Manager, na {sales?.['pos_LLM Embeddings']}ª posição, ainda recebe cosseno {num(sales?.['score_LLM Embeddings'])},
          contra {num(casos.find((c) => c.id === '83816738')?.['score_LLM Embeddings'])} do primeiro colocado.
          Um corte por nota alta deixaria passar gente fora do perfil. A ordem é que separa.
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 2 }}>
          As filas não contam a mesma história. A correlação de Spearman entre TF-IDF e os modelos
          densos fica em torno de 0,52. Entre Sentence-Transformers e Qwen ela sobe para {num(rhoStLlm?.spearman_rho)}.
          Os dois vetores densos concordam mais entre si do que com a contagem de palavras, e mesmo
          assim o Qwen não replica a fila do modelo treinado para busca.
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
          Para uma empresa, a leitura operacional é direta. O filtro por palavra, o que o ATS já faz,
          é barato e promove currículos que apenas soam como a vaga. A representação treinada para
          aproximar textos de mesmo sentido protege o tempo de quem vai ler os primeiros nomes.
          Extrair um embedding de um LLM generativo, sem treino de recuperação, não entrega esse
          ganho: custa mais, comprime as notas e deixa Adequados fora das primeiras posições.
        </Typography>
      </Section>

      <Section
        kicker="Classificação"
        titulo="A nota de classe é um resultado secundário"
      >
        <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 2 }}>
          Além da fila, cada representação alimentou regressão logística, SVM e XGBoost, em
          validação cruzada de 5 folds. Com 3 Adequados em 100 currículos, logística e SVM não
          encontram essa classe: precisão e recall de Adequado ficam em zero, e o F1 macro cai
          para 0,29 nas três representações. Só o XGBoost marca Adequado. O melhor F1 de cada
          representação, abaixo, é sempre o do XGBoost.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {melhores.map((linha) => (
            <Grid item xs={12} md={4} key={linha.id}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: `1px solid ${COR[linha.representacao]}55` }}>
                <Typography sx={{ color: COR[linha.representacao], fontWeight: 700, fontSize: '0.85rem' }}>
                  {linha.representacao}
                </Typography>
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 600, lineHeight: 1.2, my: 0.5 }}>
                  {num(linha.f1_macro)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  F1 macro com {linha.classificador}. Acurácia {num(linha.acuracia)}.
                  Precisão de Adequado {num(linha.precision_adequado)}.
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {holdout && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Numa medida em separado, o classificador aprende em {holdout.n_treino} currículos e é avaliado
            uma vez em {holdout.n_teste}. Essa fatia tem um único Adequado, então o F1 oscila: o maior
            valor entre as nove combinações é {num(Math.max(...holdout.linhas.map((l) => l.f1_macro)))}.
            Esse número não substitui a validação cruzada nem o ranking.
          </Typography>
        )}
      </Section>

      <Section
        kicker="Limite"
        titulo="Até onde esta leitura vale"
      >
        <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 1.5 }}>
          Os rótulos dos 80 currículos automáticos seguem uma regra de quatro critérios: SQL,
          REST ou web services, Git e uma linguagem de programação. Uma segunda leitura de 20
          desses 80 concordou em {revisao ? `${num(revisao.concordancia * 100, 0)}%` : '—'}.
          {revisao?.divergencias?.[0]
            ? ` A divergência é o currículo ${revisao.divergencias[0].id}: a pasta da base é banking, a regra marcou ${revisao.divergencias[0].automatico}, e o texto é de quem desenvolve, então a releitura marcou ${revisao.divergencias[0].revisado}.`
            : ''}
          {' '}A mesma regra, aplicada aos {corpusCompleto.total.toLocaleString('pt-BR')}, herda esse limite.
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
          O corpus é só em inglês. Há três Adequados, então qualquer métrica de classificação
          dessa classe é instável. O Qwen usado aqui é o 2.5 de 0,5 bilhão de parâmetros, com
          média do último hidden state, sem ajuste para recuperação. Outro modelo generativo,
          treinado para busca, seria outro braço do experimento. Backend, upload de PDF e corpus
          em português não entram nesta comparação.
        </Typography>
      </Section>
    </Box>
  )
}

function Section({ kicker, titulo, children }) {
  return (
    <Box sx={{ mb: 4.5 }}>
      <Typography
        sx={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#0E7490',
          mb: 0.5,
        }}
      >
        {kicker}
      </Typography>
      <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '1.35rem', mb: 1.5 }}>
        {titulo}
      </Typography>
      {children}
    </Box>
  )
}

function Distribuicao({ titulo, dist, nota }) {
  const itens = [
    ['Adequado', dist.Adequado],
    ['Parcialmente Adequado', dist['Parcialmente Adequado']],
    ['Inadequado', dist.Inadequado],
  ]
  return (
    <Paper elevation={0} sx={{ p: 2.25, height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{titulo}</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
        {itens.map(([nome, valor]) => (
          <Box key={nome} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2" sx={{ color: COR[nome], fontWeight: 700 }}>{nome}</Typography>
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {valor.toLocaleString('pt-BR')}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{nota}</Typography>
    </Paper>
  )
}
