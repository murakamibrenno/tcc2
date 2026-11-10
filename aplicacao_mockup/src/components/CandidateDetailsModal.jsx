import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Chip, Button, Grid, Divider,
  LinearProgress, Avatar, Paper,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import WorkRoundedIcon from '@mui/icons-material/WorkRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import StatusChip from './StatusChip'
import { formatScore, formatCosseno, formatExperiencia, getInitials, getAvatarColor } from '../utils/formatters'
import { getAderenciaPiloto, getOrigemRotulo, getScoreAtivo, getMensagemInversao } from '../utils/rankingUtils'

// Mostra o melhor score de cada representação (XGBoost) como referência rápida
const REPRESENTACOES_INFO = [
  { repKey: 'tfidf', modeloKey: 'xgboost', label: 'TF-IDF', sublabel: '(melhor combinação: + XGBoost)', cor: '#0E7490', justKey: 'tfidf' },
  { repKey: 'sentenceTransformers', modeloKey: 'xgboost', label: 'Sentence-Transformers', sublabel: '(melhor combinação: + XGBoost)', cor: '#D97706', justKey: 'sentenceTransformers' },
  { repKey: 'llmEmbeddings', modeloKey: 'xgboost', label: 'LLM Embeddings', sublabel: '(melhor combinação: + XGBoost)', cor: '#7C3AED', justKey: 'llmEmbeddings' },
]

export default function CandidateDetailsModal({ curriculo, open, onClose, piloto = false }) {
  if (!curriculo) return null

  const avatarColor = getAvatarColor(curriculo.nome)

  if (piloto) {
    const aderencia = getAderenciaPiloto(curriculo)
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{ sx: { borderRadius: '16px', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #0B1929 0%, #122236 100%)',
              p: 3,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 0 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: avatarColor, fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                {getInitials(curriculo.nome)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.15rem', color: '#FFFFFF', lineHeight: 1.25 }}>
                  {curriculo.nome}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', mt: 0.25 }}>
                  ID {curriculo.id} · {curriculo.area}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <StatusChip label={curriculo.classificacaoManual} type="classificacao" />
                </Box>
              </Box>
            </Box>
            <Button onClick={onClose} sx={{ minWidth: 0, p: 0.5, color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}>
              <CloseRoundedIcon />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper elevation={0} sx={{ flex: 1, p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                  Similaridade cosseno
                </Typography>
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: '1.6rem', color: aderencia.hex }}>
                  {formatCosseno(getScoreAtivo(curriculo, curriculo.representacaoAtiva))}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                  Posição {curriculo.posicao} de {curriculo.totalCurriculos ?? '—'}
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ flex: 1, p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {getOrigemRotulo(curriculo)}
                </Typography>
                <StatusChip label={curriculo.classificacaoManual} type="classificacao" />
                <Chip
                  label={aderencia.label}
                  size="small"
                  sx={{ alignSelf: 'flex-start', bgcolor: aderencia.hex + '18', color: aderencia.hex, fontWeight: 700, fontSize: '0.68rem', height: 20, borderRadius: '5px' }}
                />
              </Paper>
            </Box>

            {curriculo.inversaoRanking && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, borderRadius: '8px', bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 18, color: '#DC2626', mt: 0.2 }} />
                <Typography sx={{ fontSize: '0.76rem', color: '#991B1B', lineHeight: 1.6 }}>
                  {getMensagemInversao(curriculo, curriculo.representacaoAtiva)}
                </Typography>
              </Box>
            )}

            {curriculo.observacao && (
              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                  Observação da anotação
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: 'text.primary', lineHeight: 1.6 }}>
                  {curriculo.observacao}
                </Typography>
              </Box>
            )}

            {curriculo.resumo && (
              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                  Trecho do currículo (texto extraído)
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.7, fontStyle: 'italic' }}>
                  {curriculo.resumo}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ flex: 1, fontSize: '0.72rem', color: 'text.secondary', fontStyle: 'italic' }}>
            Score de similaridade de cosseno do experimento (100 currículos). Os três rankings estão na tela Ranking.
          </Typography>
          <Button onClick={onClose} variant="contained" size="small" sx={{ px: 3 }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: '16px', maxHeight: '90vh' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, #0B1929 0%, #122236 100%)`,
            p: 3,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: avatarColor,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1.2rem',
                flexShrink: 0,
                boxShadow: `0 4px 12px rgba(0,0,0,0.25)`,
              }}
            >
              {getInitials(curriculo.nome)}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                {curriculo.nome}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', mt: 0.25 }}>
                {curriculo.cargoAtual}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <StatusChip label={curriculo.classificacaoManual} type="classificacao" />
              </Box>
            </Box>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 0, p: 0.5, color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}>
            <CloseRoundedIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Informações básicas */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    Formação
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
                    {curriculo.formacao}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    Experiência
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
                    {formatExperiencia(curriculo.experienciaAnos)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    Área
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
                    {curriculo.area}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Resumo */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}>
              Resumo Profissional
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, fontSize: '0.9rem' }}>
              {curriculo.resumo}
            </Typography>
          </Box>

          {/* Competências */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}>
              Competências Técnicas
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {curriculo.competencias.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  size="small"
                  sx={{
                    bgcolor: '#E0F2F7',
                    color: '#0C6177',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #BAE6FD',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Experiências */}
          {curriculo.experiencias && curriculo.experiencias.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}>
                Experiências Profissionais
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {curriculo.experiencias.map((exp, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main',
                        flexShrink: 0, mt: 0.75,
                      }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
                        {exp.cargo}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                        {exp.empresa} · {exp.periodo}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2.5 }} />

          {/* Scores e justificativas por representação */}
          <Typography variant="h6" sx={{ mb: 0.5, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}>
            Scores por Representação Textual
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 2 }}>
            Exibindo o melhor score de cada representação (combinação com XGBoost). Para ver todos os 9 scores, acesse o Ranking e clique no ícone de detalhes.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {REPRESENTACOES_INFO.map((m) => {
              const score = curriculo.scores?.[m.repKey]?.[m.modeloKey] ?? 0
              const justificativa = curriculo.justificativas?.[m.justKey]
              return (
                <Paper
                  key={m.repKey}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: `1px solid ${m.cor}30`,
                    bgcolor: `${m.cor}06`,
                    borderLeft: `4px solid ${m.cor}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: m.cor }}>
                        {m.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {m.sublabel}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.1rem', color: m.cor }}>
                      {formatScore(score)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={score * 100}
                    sx={{ mb: 1.25, bgcolor: `${m.cor}20`, '& .MuiLinearProgress-bar': { bgcolor: m.cor } }}
                  />
                  {justificativa && (
                    <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{justificativa}"
                    </Typography>
                  )}
                </Paper>
              )
            })}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ flex: 1, fontSize: '0.72rem', color: 'text.disabled', fontStyle: 'italic' }}>
          * Perfil mantido para exercício da interface; pontuações seguem o cenário definido nos dados locais.
        </Typography>
        <Button onClick={onClose} variant="contained" size="small" sx={{ px: 3 }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
