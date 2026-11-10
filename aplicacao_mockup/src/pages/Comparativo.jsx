import React from 'react'
import {
  Box, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Alert, Divider,
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, ScatterChart, Scatter,
  ZAxis, ReferenceLine,
} from 'recharts'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import MethodCard from '../components/MethodCard'
import CabecalhoMetrica, { RotuloMetrica } from '../components/CabecalhoMetrica'
import { metodosComparativos } from '../data/metricasMock'
import metricasReais from '../data/metricasReais.json'
import {
  combinacoes,
  rankingReais,
  temDadosReais,
} from '../data/metricasReais'

const MEMCORES = { 'Baixa': '#059669', 'Média': '#D97706', 'Média/Alta': '#D97706', 'Alta': '#DC2626' }
const INTERPCORE = { 'Alta': '#059669', 'Média': '#D97706', 'Média/Alta': '#D97706', 'Baixa/Média': '#7C3AED', 'Baixa': '#DC2626' }

const FONTE_METRICA = temDadosReais
  ? '100 currículos, validação cruzada de 5 partes'
  : 'valores simulados'
const EIXO_METRICA = temDadosReais ? [0, 1] : [0.5, 1]

const REP_CORES = {
  'TF-IDF': '#0E7490',
  'Sentence-Transformers': '#D97706',
  'LLM Embeddings': '#7C3AED',
}

const ChartCard = ({ titulo, subtitulo, children }) => (
  <Card sx={{ p: 2.5, height: '100%' }}>
    <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '0.95rem', color: 'text.primary', mb: 0.25 }}>
      {titulo}
    </Typography>
    {subtitulo && (
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 2 }}>
        {subtitulo}
      </Typography>
    )}
    {children}
  </Card>
)

const SectionHeader = ({ icon: Icon, titulo, subtitulo }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Icon sx={{ fontSize: 20, color: '#0E7490' }} />
      <Typography
        sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.15rem', color: 'text.primary' }}
      >
        {titulo}
      </Typography>
    </Box>
    {subtitulo && (
      <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.6, ml: 3.5 }}>
        {subtitulo}
      </Typography>
    )}
  </Box>
)

// Tooltip customizado para gráficos de combinação
const CombinacaoTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px',
          p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.primary', mb: 0.75 }}>
          {label}
        </Typography>
        {payload.map((entry) => (
          <Box key={entry.dataKey} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.25 }}>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{entry.name || entry.dataKey}:</Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: entry.color || entry.fill }}>
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    )
  }
  return null
}

// Dados para gráfico de F1 por combinação
const dadosF1 = combinacoes.map((c) => ({ nome: c.labelCurto, F1: c.f1Score, cor: c.cor, rep: c.representacao }))
const dadosROCAUC = combinacoes.map((c) => ({ nome: c.labelCurto, 'ROC-AUC': c.rocAuc, cor: c.cor }))
const dadosMAPNDCG = rankingReais.map((r) => ({ nome: r.metodo, MAP: r.MAP, NDCG: r['NDCG@10'], cor: combinacoes.find((c) => c.representacao === r.metodo)?.cor ?? '#64748B' }))
const dadosTempo = combinacoes.map((c) => ({
  nome: c.labelCurto,
  Vetorização: c.tempoVetorizacao,
  Treinamento: c.tempoTreinamento ?? 0,
  Inferência: typeof c.tempoInferencia === 'number' ? c.tempoInferencia : 0,
  cor: c.cor,
}))
const dadosScatter = combinacoes.map((c) => ({
  nome: c.labelCurto,
  custo: c.tempoTotal,
  f1: c.f1Score,
  cor: c.cor,
  representacao: c.representacao,
  modelo: c.modelo,
}))
const custoMax = Math.max(...dadosScatter.map((d) => d.custo || 0), 1)
const eixoF1 = temDadosReais ? [0, 1] : [0.65, 0.95]
const eixoCusto = temDadosReais ? [0, Math.ceil(custoMax * 1.05)] : [0, 16]
const eixoRoc = temDadosReais ? [0, 1] : [0.6, 1]

// Dados da matriz experimental (3×3)
const REPRESENTACOES_MATRIZ = ['TF-IDF', 'Sentence-Transformers', 'LLM Embeddings']
const MODELOS_MATRIZ = ['Regressão Logística', 'SVM', 'XGBoost']

const getCombinacao = (rep, mod) =>
  combinacoes.find((c) => c.representacao === rep && c.modelo === mod)

const BarraMetrica = ({ valor, max = 1, cor }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Box
      sx={{
        height: 4, width: `${(valor / max) * 60}px`, minWidth: 4,
        bgcolor: cor, borderRadius: 2, flexShrink: 0,
      }}
    />
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: cor, fontFamily: "'Fraunces', serif" }}>
      {valor.toFixed(2)}
    </Typography>
  </Box>
)

export default function Comparativo() {
  return (
    <Box>
      {/* Header */}
      <Alert
        severity={temDadosReais ? 'success' : 'info'}
        sx={{ mb: 3, borderRadius: '10px' }}
      >
        {temDadosReais ? (
          <>
            Ranking e classificação calculados nos <strong>100 currículos</strong> em inglês.
            Os gráficos vêm primeiro. As tabelas detalham cada número. A classe Adequado tem 3 currículos, por isso regressão logística e SVM ficam com F1 macro baixo.
          </>
        ) : (
          <>Carregando métricas reais — execute o pipeline Python.</>
        )}
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Comparativo de Métodos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Matriz experimental: 3 representações textuais × 3 modelos supervisionados = 9 combinações
        </Typography>
      </Box>

      {temDadosReais && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {(metricasReais.ranking || []).map((m) => (
            <Grid item xs={12} md={4} key={m.metodo}>
              <Card sx={{ p: 2, height: '100%', border: '1px solid #A7F3D0', bgcolor: '#ECFDF5' }}>
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, mb: 1 }}>{m.metodo}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  NDCG@10: <strong>{m['NDCG@10']}</strong> | P@5: <strong>{m['P@5']}</strong>
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  AP: <strong>{m.MAP}</strong> | Tempo vet.: <strong>{m.tempo_vetorizacao_seg}s</strong>
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 1 }}>
                  Sales Manager: pos. {m.pos_sales_manager ?? '—'}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!temDadosReais && (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="small" />}
          sx={{
            mb: 3, borderRadius: '10px',
            bgcolor: '#E0F2F7', color: '#0C6177', border: '1px solid #BAE6FD',
            '& .MuiAlert-icon': { color: '#0E7490' }, fontSize: '0.82rem',
          }}
        >
          Modo demonstrativo: valores simulados. Execute <code>run_pipeline_demo.ps1</code> para métricas reais.
        </Alert>
      )}

      {/* ── SEÇÃO 1: Representações Textuais (só no modo simulado) ── */}
      {!temDadosReais && <Box sx={{ mb: 4 }}>
        <SectionHeader
          icon={InfoOutlinedIcon}
          titulo="Seção 1 — Representações Textuais (visão agregada)"
          subtitulo="Esta seção apresenta uma visão agregada das representações textuais, mostrando a melhor combinação dentro de cada representação. A avaliação principal do experimento considera as combinações entre cada representação e cada modelo supervisionado."
        />
        <Grid container spacing={2.5}>
          {metodosComparativos.map((m) => (
            <Grid item xs={12} md={4} key={m.id}>
              <MethodCard metodo={m} />
            </Grid>
          ))}
        </Grid>
      </Box>}

      <Divider sx={{ mb: 4 }} />

      {/* ── SEÇÃO 3: Gráficos por combinação ── */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          icon={ScienceOutlinedIcon}
          titulo="Gráficos comparativos"
          subtitulo="Visão geral das nove combinações antes da tabela. Passe o cursor nos títulos das colunas, mais abaixo, para a definição de cada métrica."
        />

        <Grid container spacing={2.5}>
          {/* F1-Score por combinação */}
          <Grid item xs={12} md={6}>
            <ChartCard titulo="F1-Score por Combinação" subtitulo={`Desempenho de classificação (${FONTE_METRICA})`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dadosF1} margin={{ top: 8, right: 8, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="nome"
                    tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fill: '#6B7280' }}
                    axisLine={false} tickLine={false} angle={-35} textAnchor="end"
                  />
                  <YAxis domain={EIXO_METRICA} tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CombinacaoTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="F1" name="F1-Score" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {dadosF1.map((e, i) => <Cell key={i} fill={e.cor} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* ROC-AUC por combinação */}
          <Grid item xs={12} md={6}>
            <ChartCard titulo="ROC-AUC por Combinação" subtitulo={`Capacidade discriminativa (${FONTE_METRICA})`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dadosROCAUC} margin={{ top: 8, right: 8, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="nome"
                    tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fill: '#6B7280' }}
                    axisLine={false} tickLine={false} angle={-35} textAnchor="end"
                  />
                  <YAxis domain={eixoRoc} tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CombinacaoTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="ROC-AUC" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {dadosROCAUC.map((e, i) => <Cell key={i} fill={e.cor} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Três rankings por representação; não nove classificadores. */}
          <Grid item xs={12} md={6}>
            <ChartCard titulo="AP e NDCG por Representação" subtitulo={`Uma vaga; três rankings por cosseno, independentes dos classificadores`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dadosMAPNDCG} margin={{ top: 8, right: 8, left: -20, bottom: 40 }} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="nome"
                    tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fill: '#6B7280' }}
                    axisLine={false} tickLine={false} angle={-35} textAnchor="end"
                  />
                  <YAxis domain={EIXO_METRICA} tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CombinacaoTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Legend wrapperStyle={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="MAP" name="AP da vaga" radius={[3, 3, 0, 0]} maxBarSize={22}>
                    {dadosMAPNDCG.map((e, i) => <Cell key={i} fill={e.cor} />)}
                  </Bar>
                  <Bar dataKey="NDCG" radius={[3, 3, 0, 0]} maxBarSize={22}>
                    {dadosMAPNDCG.map((e, i) => <Cell key={i} fill={`${e.cor}80`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Tempo total por combinação */}
          <Grid item xs={12} md={6}>
            <ChartCard titulo="Custo Computacional — Tempo Total" subtitulo={`Vetorização + treinamento + inferência, em segundos (${FONTE_METRICA})`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dadosTempo} margin={{ top: 8, right: 8, left: -20, bottom: 40 }} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="nome"
                    tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fill: '#6B7280' }}
                    axisLine={false} tickLine={false} angle={-35} textAnchor="end"
                  />
                  <YAxis tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CombinacaoTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Legend wrapperStyle={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="Vetorização" radius={[0, 0, 0, 0]} maxBarSize={22} stackId="a">
                    {dadosTempo.map((e, i) => <Cell key={i} fill={e.cor} />)}
                  </Bar>
                  <Bar dataKey="Treinamento" radius={[0, 0, 0, 0]} maxBarSize={22} stackId="a">
                    {dadosTempo.map((e, i) => <Cell key={i} fill={`${e.cor}99`} />)}
                  </Bar>
                  <Bar dataKey="Inferência" radius={[3, 3, 0, 0]} maxBarSize={22} stackId="a">
                    {dadosTempo.map((e, i) => <Cell key={i} fill={`${e.cor}55`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Scatter: trade-off desempenho × custo */}
          <Grid item xs={12}>
            <ChartCard
              titulo="Trade-off: Desempenho × Custo Computacional"
              subtitulo="Eixo X: tempo total (s) | Eixo Y: F1-Score. Combinações no canto superior esquerdo oferecem melhor relação desempenho/custo."
            >
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                {[
                  { label: 'TF-IDF', cor: '#0E7490' },
                  { label: 'Sentence-Transformers (ST)', cor: '#D97706' },
                  { label: 'LLM Embeddings', cor: '#7C3AED' },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.cor }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="custo"
                    name="Custo total (s)"
                    type="number"
                    domain={eixoCusto}
                    tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={false} tickLine={false}
                    label={{ value: 'Tempo total (s)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9CA3AF' }}
                  />
                  <YAxis
                    dataKey="f1"
                    name="F1-Score"
                    type="number"
                    domain={eixoF1}
                    tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={false} tickLine={false}
                    label={{ value: 'F1-Score', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9CA3AF' }}
                  />
                  <ZAxis range={[80, 80]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        return (
                          <Box sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, mb: 0.5 }}>{d.nome}</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>F1-Score: <strong>{d.f1.toFixed(2)}</strong></Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Custo: <strong>{d.custo.toFixed(1)}s</strong></Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{d.representacao} + {d.modelo}</Typography>
                          </Box>
                        )
                      }
                      return null
                    }}
                  />
                  {/* TF-IDF */}
                  <Scatter
                    data={dadosScatter.filter((d) => d.representacao === 'TF-IDF')}
                    fill="#0E7490"
                  />
                  {/* Sentence-Transformers */}
                  <Scatter
                    data={dadosScatter.filter((d) => d.representacao === 'Sentence-Transformers')}
                    fill="#D97706"
                  />
                  {/* LLM Embeddings */}
                  <Scatter
                    data={dadosScatter.filter((d) => d.representacao === 'LLM Embeddings')}
                    fill="#7C3AED"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />


      {/* ── SEÇÃO 2: Matriz Experimental ── */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          icon={ScienceOutlinedIcon}
          titulo="Matriz das nove combinações"
          subtitulo="Cada célula representa uma combinação entre uma representação textual e um modelo supervisionado, com as principais métricas de avaliação."
        />

        <Card>
          <CardContent sx={{ p: 2.5, overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700, fontSize: '0.8rem', bgcolor: '#F9FAFB',
                      borderBottom: '2px solid #E5E7EB', minWidth: 170,
                    }}
                  >
                    <RotuloMetrica id="representacao">Representação</RotuloMetrica>
                  </TableCell>
                  {MODELOS_MATRIZ.map((mod) => (
                    <TableCell
                      key={mod}
                      align="center"
                      sx={{
                        fontWeight: 700, fontSize: '0.8rem', bgcolor: '#F9FAFB',
                        borderBottom: '2px solid #E5E7EB', minWidth: 180,
                      }}
                    >
                      <RotuloMetrica id="modelo">{mod}</RotuloMetrica>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {REPRESENTACOES_MATRIZ.map((rep) => {
                  const repCor = REP_CORES[rep]
                  return (
                    <TableRow key={rep}>
                      <TableCell
                        sx={{
                          borderRight: `3px solid ${repCor}30`,
                          bgcolor: `${repCor}06`,
                          verticalAlign: 'middle',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: repCor, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: repCor }}>
                            {rep}
                          </Typography>
                        </Box>
                      </TableCell>
                      {MODELOS_MATRIZ.map((mod) => {
                        const comb = getCombinacao(rep, mod)
                        if (!comb) return <TableCell key={mod} />
                        return (
                          <TableCell
                            key={mod}
                            sx={{ verticalAlign: 'top', borderRight: '1px solid #F3F4F6', p: 1.5 }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {[
                                { label: 'F1', valor: comb.f1Score },
                                { label: 'ROC-AUC', valor: comb.rocAuc },
                                { label: 'MAP', valor: comb.map },
                                { label: 'NDCG', valor: comb.ndcg },
                              ].map(({ label, valor }) => (
                                <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                  <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', width: 52, flexShrink: 0 }}>
                                    {label}
                                  </Typography>
                                  <BarraMetrica valor={valor} cor={repCor} />
                                </Box>
                              ))}
                              <Divider sx={{ my: 0.25 }} />
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                <Chip
                                  label={`${comb.tempoTotal.toFixed(1)}s total`}
                                  size="small"
                                  sx={{ bgcolor: '#F3F4F6', color: '#6B7280', fontSize: '0.62rem', height: 18, borderRadius: '4px' }}
                                />
                                <Chip
                                  label={comb.consumoMemoria}
                                  size="small"
                                  sx={{
                                    bgcolor: `${MEMCORES[comb.consumoMemoria]}18`,
                                    color: MEMCORES[comb.consumoMemoria],
                                    fontSize: '0.62rem', height: 18, borderRadius: '4px', fontWeight: 700,
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ── SEÇÃO 4: Tabela Comparativa Completa ── */}
      <Box>
        <SectionHeader
          icon={TableChartOutlinedIcon}
          titulo="Tabela completa"
          subtitulo={`Métricas de desempenho e custo das 9 combinações (${FONTE_METRICA}).`}
        />

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1100 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                    {[
                      ['representacao', 'Representação', 'left'],
                      ['modelo', 'Modelo', 'left'],
                      ['f1', 'F1', 'center'],
                      ...(!temDadosReais ? [['precisao', 'Precisão', 'center'], ['recall', 'Recall', 'center']] : []),
                      ['roc', 'ROC-AUC', 'center'],
                      ['map', 'MAP', 'center'],
                      ['ndcgCurto', 'NDCG', 'center'],
                      ...(!temDadosReais ? [['pk', 'P@k', 'center']] : []),
                      ['tvetor', 'T. vetor.', 'center'],
                      ['ttreino', 'T. treino', 'center'],
                      ['tinfer', 'T. infer.', 'center'],
                      ['memoriaAjuste', 'Δ RSS', 'center'],
                      ...(!temDadosReais ? [['interpretabilidade', 'Leitura', 'center']] : []),
                    ].map(([id, rotulo, align]) => (
                      <CabecalhoMetrica
                        key={id}
                        id={id}
                        align={align}
                        sx={{ fontSize: '0.72rem', color: 'text.secondary', borderBottom: '2px solid #E5E7EB', whiteSpace: 'nowrap', bgcolor: '#F9FAFB' }}
                      >
                        {rotulo}
                      </CabecalhoMetrica>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {combinacoes.map((c, i) => (
                    <TableRow
                      key={c.id}
                      sx={{
                        bgcolor: i % 2 === 0 ? '#FAFAFA' : '#FFF',
                        borderLeft: `3px solid ${c.cor}`,
                        '&:hover': { bgcolor: `${c.cor}08` },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: REP_CORES[c.representacao] ?? c.cor }} />
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{c.representacao}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.78rem' }}>{c.modelo}</Typography>
                      </TableCell>
                      {(temDadosReais
                        ? [c.f1Score, c.rocAuc, c.map, c.ndcg]
                        : [c.f1Score, c.precisao, c.recall, c.rocAuc, c.map, c.ndcg, c.precisionAtK]
                      ).map((val, j) => (
                        <TableCell key={j} align="center">
                          <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.85rem', color: c.cor }}>
                            {typeof val === 'number' ? val.toFixed(2) : '—'}
                          </Typography>
                        </TableCell>
                      ))}
                      {[c.tempoVetorizacao, c.tempoTreinamento, c.tempoInferencia].map((val, j) => (
                        <TableCell key={j} align="center">
                          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                            {typeof val === 'number' ? `${val.toFixed(val >= 10 ? 0 : 2)}s` : '—'}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                          {typeof c.memoriaRssDeltaMib === 'number' ? c.memoriaRssDeltaMib.toFixed(2) : '—'}
                        </Typography>
                      </TableCell>
                      {!temDadosReais && (
                        <TableCell align="center">
                          <Chip
                            label={c.interpretabilidade || '—'}
                            size="small"
                            sx={{
                              bgcolor: `${INTERPCORE[c.interpretabilidade] || '#64748B'}18`,
                              color: INTERPCORE[c.interpretabilidade] || '#64748B',
                              fontWeight: 700, fontSize: '0.68rem', borderRadius: '5px', height: 20,
                            }}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ mt: 2.5, p: 2, bgcolor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.6 }}>
                {temDadosReais
                  ? 'Passe o cursor no título de cada coluna para a definição. Os tempos estão em segundos, nos 100 currículos.'
                  : 'Valores ilustrativos, usados só quando a avaliação ainda não foi exportada.'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {temDadosReais && metricasReais.holdout?.linhas && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
            Medida em separado
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1.5 }}>
            O classificador aprende em {metricasReais.holdout.n_treino} currículos e é medido uma vez nos {metricasReais.holdout.n_teste} restantes.
            Outros {metricasReais.holdout.n_validacao_nao_usada} ficam de fora. Essa fatia tem um único Adequado, então o F1 oscila.
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <CabecalhoMetrica id="representacao" sx={{ fontSize: '0.72rem' }} />
                <CabecalhoMetrica id="modelo" sx={{ fontSize: '0.72rem' }} />
                <CabecalhoMetrica id="f1" sx={{ fontSize: '0.72rem' }}>F1 macro</CabecalhoMetrica>
                <CabecalhoMetrica id="acuracia" sx={{ fontSize: '0.72rem' }}>Acurácia</CabecalhoMetrica>
                <CabecalhoMetrica id="roc" sx={{ fontSize: '0.72rem' }}>ROC-AUC</CabecalhoMetrica>
              </TableRow>
            </TableHead>
            <TableBody>
              {metricasReais.holdout.linhas.map((l) => (
                <TableRow key={`${l.representacao}-${l.classificador}`}>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{l.representacao}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{l.classificador}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{Number(l.f1_macro).toFixed(2)}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{Number(l.acuracia).toFixed(2)}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{l.roc_auc_macro == null ? '—' : Number(l.roc_auc_macro).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

    </Box>
  )
}
