import React from 'react'
import {
  Box, Grid, Typography, Card, CardContent, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Chip,
} from '@mui/material'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import WorkRoundedIcon from '@mui/icons-material/WorkRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded'
import TimerRoundedIcon from '@mui/icons-material/TimerRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import MetricCard from '../components/MetricCard'
import MethodComparisonChart from '../components/MethodComparisonChart'
import StatusChip from '../components/StatusChip'
import { dadosDashboard, dadosGraficoF1, dadosGraficoTempo } from '../data/metricasMock'
import {
  dadosDashboardReais,
  dadosGraficoF1Reais,
  dadosGraficoTempoReais,
  temDadosReais,
} from '../data/metricasReais'
import { getTop5Candidatos, getAderenciaPiloto } from '../utils/rankingUtils'
import { formatCosseno, getInitials, getAvatarColor } from '../utils/formatters'

const top5 = getTop5Candidatos()
const dash = dadosDashboardReais ?? dadosDashboard
const grafF1 = dadosGraficoF1Reais ?? dadosGraficoF1
const grafTempo = dadosGraficoTempoReais ?? dadosGraficoTempo

export default function Dashboard() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Dashboard de Triagem Automatizada
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comparação de representações textuais aplicadas à triagem automatizada de currículos em inglês
        </Typography>
      </Box>

      {/* Banner de aviso */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="small" />}
        sx={{
          mb: 3,
          borderRadius: '10px',
          bgcolor: '#E0F2F7',
          color: '#0C6177',
          border: '1px solid #BAE6FD',
          '& .MuiAlert-icon': { color: '#0E7490' },
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.85rem',
        }}
      >
        {temDadosReais
          ? `Experimento real: ${dash.totalCurriculos} currículos em inglês, 3 representações e 9 combinações. Métricas calculadas nos scripts Python.`
          : 'Explore vagas, currículos e rankings; execute o pipeline para carregar métricas reais.'}
      </Alert>

      {/* Cards de indicadores */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            titulo="Currículos Analisados"
            valor={dash.totalCurriculos}
            subtitulo="Total na base atual"
            icone={<DescriptionRoundedIcon fontSize="small" />}
            corAccent="#0E7490"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            titulo="Vagas Cadastradas"
            valor={dash.vagasCadastradas}
            subtitulo="Vaga piloto (3 métodos reais)"
            icone={<WorkRoundedIcon fontSize="small" />}
            corAccent="#D97706"
            delay={60}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            titulo="Melhor F1 (CV)"
            valor={temDadosReais ? dash.melhorF1.toFixed(2) : '—'}
            subtitulo={temDadosReais ? `Melhor combo no piloto (macro-F1)` : 'Execute pipeline'}
            icone={<EmojiEventsRoundedIcon fontSize="small" />}
            corAccent="#7C3AED"
            delay={120}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            titulo="Melhor Combo"
            valor={temDadosReais ? dash.melhorMetodo.split('+').pop()?.trim() || 'XGBoost' : '—'}
            subtitulo={temDadosReais ? dash.melhorMetodo : 'Pipeline pendente'}
            icone={<SpeedRoundedIcon fontSize="small" />}
            corAccent="#059669"
            delay={180}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            titulo="Menor Tempo"
            valor={
              temDadosReais && grafTempo.length
                ? grafTempo.reduce((a, b) => (a.valor < b.valor ? a : b)).nome
                : 'TF-IDF'
            }
            subtitulo={
              temDadosReais && grafTempo.length
                ? `${grafTempo.reduce((a, b) => (a.valor < b.valor ? a : b)).valor}s (média piloto)`
                : 'Inferência mais rápida'
            }
            icone={<TimerRoundedIcon fontSize="small" />}
            corAccent="#0E7490"
            delay={240}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            titulo="Adequados"
            valor={dash.curriculosAdequados}
            subtitulo="Ground truth no corpus piloto"
            icone={<CheckCircleRoundedIcon fontSize="small" />}
            corAccent="#059669"
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography
              sx={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              F1-Score por Método
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.8rem' }}>
              {temDadosReais ? 'F1 macro por representação (melhor classificador)' : 'Valores ilustrativos'}
            </Typography>
            <MethodComparisonChart
              dados={grafF1.map((d) => ({ ...d, valor: d.valor ?? d.F1 }))}
              valorKey="valor"
              nomeKey="nome"
              corKey="cor"
              yDomain={temDadosReais ? [0, 1] : [0.6, 1]}
              altura={220}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography
              sx={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              Tempo Médio de Inferência
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.8rem' }}>
              {temDadosReais ? 'Tempo de vetorização nos 100 currículos' : 'Custo computacional ilustrativo'}
            </Typography>
            <MethodComparisonChart
              dados={grafTempo}
              valorKey="valor"
              nomeKey="nome"
              corKey="cor"
              yDomain={[0, 4]}
              suffix="s"
              altura={220}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Top 5 candidatos */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'text.primary',
                mb: 0.25,
              }}
            >
              Top 5 Candidatos — Piloto TF-IDF
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Ordenados pela similaridade cosseno TF-IDF (dados reais da base archive)
            </Typography>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '10px' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 50 }}>#</TableCell>
                  <TableCell>Candidato</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Área</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Classificação</TableCell>
                  <TableCell align="center">Sim. cosseno</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {top5.map((c) => {
                  const aderencia = getAderenciaPiloto(c)
                  const AREA_COLORS = {
                    Backend: { bg: '#DBEAFE', color: '#1E40AF' },
                    Dados: { bg: '#FEF3C7', color: '#92400E' },
                    Frontend: { bg: '#F3E8FF', color: '#6B21A8' },
                    'Tecnologia da Informação': { bg: '#DBEAFE', color: '#1E40AF' },
                  }
                  const areaStyle = AREA_COLORS[c.area] || { bg: '#F3F4F6', color: '#374151' }

                  return (
                    <TableRow key={c.id} hover>
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: "'Fraunces', serif",
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: c.posicao <= 3 ? '#D97706' : 'text.secondary',
                          }}
                        >
                          {c.posicao}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar
                            sx={{
                              width: 30, height: 30, fontSize: '0.68rem', fontWeight: 700,
                              bgcolor: getAvatarColor(c.nome),
                            }}
                          >
                            {getInitials(c.nome)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }} noWrap>
                              {c.nome.length > 44 ? `${c.nome.slice(0, 44)}…` : c.nome}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>ID {c.id}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Chip
                          label={c.area}
                          size="small"
                          sx={{
                            bgcolor: areaStyle.bg, color: areaStyle.color,
                            fontWeight: 700, fontSize: '0.7rem', borderRadius: '5px', height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <StatusChip label={c.classificacaoManual} type="classificacao" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: "'Fraunces', serif",
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: aderencia.hex,
                          }}
                        >
                          {formatCosseno(c.scoreFinal)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
