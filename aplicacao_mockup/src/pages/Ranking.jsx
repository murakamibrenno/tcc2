import React, { useState, useMemo, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Grid,
  FormControl, InputLabel, Select, MenuItem,
  Paper, Chip, Divider, Alert,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded'
import { useLocation } from 'react-router-dom'
import RankingTable from '../components/RankingTable'
import { vagas } from '../data/vagasMock'
import {
  getRankingParaVaga, getAderencia,
  isVagaPiloto, getAderenciaPiloto, getPilotoMeta, PILOTO_VAGA_ID, REPRESENTACOES,
} from '../utils/rankingUtils'
import { formatScore, formatCosseno } from '../utils/formatters'
import metricasReais from '../data/metricasReais.json'

const posSales = (metodo) =>
  (metricasReais.ranking || []).find((r) => r.metodo === metodo)?.pos_sales_manager

const REPRESENTACAO_OPTIONS = [
  { value: 'tfidf', label: 'TF-IDF', cor: '#0E7490' },
  { value: 'sentenceTransformers', label: 'Sentence-Transformers', cor: '#D97706' },
  { value: 'llmEmbeddings', label: 'LLM Embeddings', cor: '#7C3AED' },
]

const MODELO_OPTIONS = [
  { value: 'logisticRegression', label: 'Regressão Logística', cor: '#059669' },
  { value: 'svm', label: 'SVM', cor: '#DC2626' },
  { value: 'xgboost', label: 'XGBoost', cor: '#D97706' },
]

export default function Ranking() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const vagaIdParam = params.get('vagaId')

  const [vagaId, setVagaId] = useState(vagaIdParam ? parseInt(vagaIdParam) : PILOTO_VAGA_ID)
  const [representacao, setRepresentacao] = useState('tfidf')
  const [modelo, setModelo] = useState('xgboost')

  useEffect(() => {
    if (vagaIdParam) setVagaId(parseInt(vagaIdParam))
  }, [vagaIdParam])

  const piloto = isVagaPiloto(vagaId)
  const pilotoMeta = piloto ? getPilotoMeta(representacao) : null

  const ranking = useMemo(
    () => getRankingParaVaga(vagaId, representacao, modelo),
    [vagaId, representacao, modelo]
  )
  const vagaSelecionada = vagas.find((v) => v.id === vagaId)
  const repAtiva = REPRESENTACAO_OPTIONS.find((r) => r.value === representacao)
  const modAtivo = MODELO_OPTIONS.find((m) => m.value === modelo)

  const aderencias = useMemo(() => {
    if (piloto) {
      const alta = ranking.filter((c) => c.classificacaoManual === 'Adequado').length
      const media = ranking.filter((c) => c.classificacaoManual === 'Parcialmente Adequado').length
      const baixa = ranking.filter((c) => c.classificacaoManual === 'Inadequado').length
      return { alta, media, baixa }
    }
    const alta = ranking.filter((c) => c.scoreFinal >= 0.8).length
    const media = ranking.filter((c) => c.scoreFinal >= 0.6 && c.scoreFinal < 0.8).length
    const baixa = ranking.filter((c) => c.scoreFinal < 0.6).length
    return { alta, media, baixa }
  }, [ranking, piloto])

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Ranking de Candidatos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Candidatos ordenados pelo score da combinação selecionada (representação textual + modelo supervisionado)
        </Typography>
      </Box>

      {/* Banner do piloto (dados reais) */}
      {piloto && (
        <Alert
          severity="success"
          icon={<ScienceRoundedIcon fontSize="small" />}
          sx={{
            mb: 3,
            borderRadius: '10px',
            bgcolor: '#ECFDF5',
            color: '#065F46',
            border: '1px solid #A7F3D0',
            '& .MuiAlert-icon': { color: '#059669' },
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.85rem',
          }}
        >
          Ranking com <strong>dados reais</strong> — {pilotoMeta?.totalCurriculos} currículos em inglês. Método ativo: <strong>{REPRESENTACOES[representacao]?.label}</strong> ({pilotoMeta?.metodo}). A ordem é similaridade de cosseno entre a vaga e cada currículo. As nove combinações com classificador estão na tela Comparativo.
        </Alert>
      )}

      {/* Controles */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Seletor de vaga (oculto quando há apenas uma vaga) */}
          {vagas.length > 1 && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Vaga para análise</InputLabel>
                <Select
                  value={vagaId}
                  label="Vaga para análise"
                  onChange={(e) => setVagaId(e.target.value)}
                >
                  {vagas.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.titulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Seletor de representação textual */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Representação textual</InputLabel>
              <Select
                value={representacao}
                label="Representação textual"
                onChange={(e) => setRepresentacao(e.target.value)}
              >
                {REPRESENTACAO_OPTIONS.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.cor, flexShrink: 0 }} />
                      {r.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Seletor de modelo supervisionado */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={piloto}>
              <InputLabel>{piloto ? 'Ranking por similaridade' : 'Modelo supervisionado'}</InputLabel>
              <Select
                value={modelo}
                label={piloto ? 'Ranking por similaridade' : 'Modelo supervisionado'}
                onChange={(e) => setModelo(e.target.value)}
              >
                {MODELO_OPTIONS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: m.cor, flexShrink: 0 }} />
                      {m.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Chips de aderência */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { label: piloto ? `${aderencias.alta} Adequado` : `${aderencias.alta} Alta`, bg: '#D1FAE5', color: '#065F46' },
                { label: piloto ? `${aderencias.media} Parcial` : `${aderencias.media} Média`, bg: '#FEF3C7', color: '#92400E' },
                { label: piloto ? `${aderencias.baixa} Inadequado` : `${aderencias.baixa} Baixa`, bg: '#FEE2E2', color: '#991B1B' },
              ].map((item) => (
                <Chip
                  key={item.label}
                  label={item.label}
                  size="small"
                  sx={{
                    bgcolor: item.bg, color: item.color,
                    fontWeight: 700, fontSize: '0.72rem', borderRadius: '6px', height: 24,
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Combinação ativa */}
        {!piloto && repAtiva && modAtivo && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <AccountTreeOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Combinação ativa:
            </Typography>
            <Chip
              label={repAtiva.label}
              size="small"
              sx={{ bgcolor: `${repAtiva.cor}18`, color: repAtiva.cor, fontWeight: 700, fontSize: '0.72rem', height: 22, borderRadius: '5px', border: `1px solid ${repAtiva.cor}30` }}
            />
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>+</Typography>
            <Chip
              label={modAtivo.label}
              size="small"
              sx={{ bgcolor: `${modAtivo.cor}18`, color: modAtivo.cor, fontWeight: 700, fontSize: '0.72rem', height: 22, borderRadius: '5px', border: `1px solid ${modAtivo.cor}30` }}
            />
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', ml: 0.5 }}>
              — candidatos ordenados pelo score desta combinação
            </Typography>
          </Box>
        )}
      </Card>

      <Grid container spacing={3}>
        {/* Tabela de ranking */}
        <Grid item xs={12} lg={9}>
          {vagaSelecionada && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography
                sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '1rem', color: 'text.primary' }}
              >
                {vagaSelecionada.titulo}
              </Typography>
            </Box>
          )}
          <RankingTable
            candidatos={ranking}
            representacaoAtiva={representacao}
            modeloAtivo={modelo}
            piloto={piloto}
          />
        </Grid>

        {/* Painel lateral */}
        <Grid item xs={12} lg={3}>
          {/* Top 3 destaque */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmojiEventsRoundedIcon sx={{ color: '#D97706', fontSize: 20 }} />
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.95rem' }}>
                  Top 3 Candidatos
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {ranking.slice(0, 3).map((c, idx) => {
                  const medalColors = ['#D97706', '#9CA3AF', '#B45309']
                  const aderencia = piloto ? getAderenciaPiloto(c) : getAderencia(c.scoreFinal)
                  return (
                    <Box
                      key={c.id}
                      sx={{
                        bgcolor: idx === 0 ? 'rgba(217,119,6,0.06)' : '#F9FAFB',
                        borderRadius: '8px',
                        p: 1.5,
                        border: `1px solid ${idx === 0 ? 'rgba(217,119,6,0.2)' : '#E5E7EB'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                      }}
                    >
                      <EmojiEventsRoundedIcon sx={{ fontSize: 16, color: medalColors[idx], flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }} noWrap>
                          {c.nome}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{c.area}</Typography>
                      </Box>
                      <Typography
                        sx={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: piloto ? '0.82rem' : '0.9rem', color: aderencia.hex, flexShrink: 0 }}
                      >
                        {piloto ? formatCosseno(c.scoreFinal) : formatScore(c.scoreFinal)}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </CardContent>
          </Card>

          {/* Explicação */}
          <Paper
            elevation={0}
            sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#FAFAF8' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: '#0E7490', mt: 0.25, flexShrink: 0 }} />
              <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
                Sobre este ranking
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.7 }}>
              {piloto
                ? `Este ranking usa os ${pilotoMeta?.totalCurriculos ?? 100} currículos do experimento (${REPRESENTACOES[representacao]?.label}). A ordem é similaridade de cosseno. A cor segue o rótulo de aderência: 20 anotações manuais e 80 por regra lexical. O currículo Sales Manager, inadequado, fica na posição ${posSales('TF-IDF') ?? '—'} no TF-IDF, ${posSales('Sentence-Transformers') ?? '—'} no Sentence-Transformers e ${posSales('LLM Embeddings') ?? '—'} nos embeddings de LLM.`
                : 'Este ranking utiliza pontuações simuladas geradas pela combinação entre uma técnica de representação textual e um modelo supervisionado. Na versão final, os scores serão calculados a partir dos vetores gerados por TF-IDF, Sentence-Transformers e LLM Embeddings, utilizados como entrada para modelos como Regressão Logística, SVM e XGBoost.'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.25 }}>
              {piloto ? 'Legenda (rótulo de aderência)' : 'Legenda de aderência'}
            </Typography>
            {(piloto
              ? [
                  { label: 'Adequado', range: '4/4 requisitos', bg: '#D1FAE5', color: '#065F46' },
                  { label: 'Parcialmente Adequado', range: '2–3 requisitos', bg: '#FEF3C7', color: '#92400E' },
                  { label: 'Inadequado', range: '0–1 requisito', bg: '#FEE2E2', color: '#991B1B' },
                ]
              : [
                  { label: 'Alta aderência', range: 'Score ≥ 0.80', bg: '#D1FAE5', color: '#065F46' },
                  { label: 'Média aderência', range: '0.60 ≤ Score < 0.80', bg: '#FEF3C7', color: '#92400E' },
                  { label: 'Baixa aderência', range: 'Score < 0.60', bg: '#FEE2E2', color: '#991B1B' },
                ]
            ).map((item) => (
              <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Box
                  sx={{ bgcolor: item.bg, color: item.color, borderRadius: '5px', px: 1, py: 0.2, fontSize: '0.68rem', fontWeight: 700 }}
                >
                  {item.label}
                </Box>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{item.range}</Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
              {piloto ? 'Sobre o piloto' : 'Combinações disponíveis'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1.6 }}>
              {piloto ? (
                <>
                  Corpus: {pilotoMeta?.totalCurriculos} currículos reais ({pilotoMeta?.fonte}).
                  Clique no ícone <Box component="span" sx={{ fontWeight: 700 }}>⊞</Box> em qualquer linha
                  para ver o score TF-IDF, a anotação e um trecho do currículo. Note o falso positivo lexical
                  sinalizado no ranking, uma limitação típica do TF-IDF.
                </>
              ) : (
                <>
                  São 9 combinações no total: 3 representações textuais × 3 modelos supervisionados.
                  Clique no ícone <Box component="span" sx={{ fontWeight: 700 }}>⊞</Box> em qualquer linha
                  para ver os scores de todas as combinações para aquele candidato.
                </>
              )}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
