import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Avatar, Divider,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { formatScore, formatCosseno, getInitials, getAvatarColor } from '../utils/formatters'
import { getAderencia, getAderenciaPiloto } from '../utils/rankingUtils'
import StatusChip from './StatusChip'

const COMBINACOES_CONFIG = [
  {
    grupo: 'TF-IDF',
    cor: '#0E7490',
    itens: [
      { label: 'TF-IDF + Regressão Logística', rep: 'tfidf', mod: 'logisticRegression' },
      { label: 'TF-IDF + SVM', rep: 'tfidf', mod: 'svm' },
      { label: 'TF-IDF + XGBoost', rep: 'tfidf', mod: 'xgboost' },
    ],
  },
  {
    grupo: 'Sentence-Transformers',
    cor: '#D97706',
    itens: [
      { label: 'Sentence-Transformers + Regressão Logística', rep: 'sentenceTransformers', mod: 'logisticRegression' },
      { label: 'Sentence-Transformers + SVM', rep: 'sentenceTransformers', mod: 'svm' },
      { label: 'Sentence-Transformers + XGBoost', rep: 'sentenceTransformers', mod: 'xgboost' },
    ],
  },
  {
    grupo: 'LLM Embeddings',
    cor: '#7C3AED',
    itens: [
      { label: 'LLM Embeddings + Regressão Logística', rep: 'llmEmbeddings', mod: 'logisticRegression' },
      { label: 'LLM Embeddings + SVM', rep: 'llmEmbeddings', mod: 'svm' },
      { label: 'LLM Embeddings + XGBoost', rep: 'llmEmbeddings', mod: 'xgboost' },
    ],
  },
]

export default function ScoresDetailModal({ open, onClose, candidato, representacaoAtiva, modeloAtivo, piloto = false }) {
  if (!candidato) return null

  const avatarColor = getAvatarColor(candidato.nome)

  if (piloto) {
    const aderencia = getAderenciaPiloto(candidato)
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700, bgcolor: avatarColor }}>
                {getInitials(candidato.nome)}
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  {candidato.nome}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  ID {candidato.id} · {candidato.area}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
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
                  {formatCosseno(candidato.scoreTfidf)}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                  Posição {candidato.posicao} de 20
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ flex: 1, p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Anotação manual
                </Typography>
                <StatusChip label={candidato.classificacaoManual} type="classificacao" />
                <Chip
                  label={aderencia.label}
                  size="small"
                  sx={{ alignSelf: 'flex-start', bgcolor: aderencia.hex + '18', color: aderencia.hex, fontWeight: 700, fontSize: '0.68rem', height: 20, borderRadius: '5px' }}
                />
              </Paper>
            </Box>

            {candidato.falsoPositivo && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, borderRadius: '8px', bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 18, color: '#DC2626', mt: 0.2 }} />
                <Typography sx={{ fontSize: '0.76rem', color: '#991B1B', lineHeight: 1.6 }}>
                  Falso positivo lexical: o TF-IDF posicionou este currículo (anotado como Inadequado) acima de candidatos relevantes,
                  por compartilhar termos genéricos com a vaga. É uma limitação esperada da representação puramente léxica.
                </Typography>
              </Box>
            )}

            {candidato.observacao && (
              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                  Observação da anotação
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: 'text.primary', lineHeight: 1.6 }}>
                  {candidato.observacao}
                </Typography>
              </Box>
            )}

            {candidato.resumo && (
              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                  Trecho do currículo (texto extraído)
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.7, fontStyle: 'italic' }}>
                  {candidato.resumo}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB', justifyContent: 'flex-start' }}>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            Scores de similaridade de cosseno do experimento com 100 currículos. TF-IDF, Sentence-Transformers e embeddings de LLM já estão calculados.
          </Typography>
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
      PaperProps={{ sx: { borderRadius: '14px', overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2.5,
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700, bgcolor: avatarColor }}>
              {getInitials(candidato.nome)}
            </Avatar>
            <Box>
              <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                {candidato.nome}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                Scores das 9 combinações experimentais
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.6 }}>
            Scores simulados para todas as combinações de{' '}
            <strong>representação textual × modelo supervisionado</strong>. A combinação ativa no ranking
            está destacada. Valores entre 0 e 1; quanto maior, maior a aderência estimada do candidato à vaga.
          </Typography>
        </Box>

        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {COMBINACOES_CONFIG.map(({ grupo, cor, itens }) => (
            <Box key={grupo}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cor }} />
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.9rem', color: cor }}>
                  {grupo}
                </Typography>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: `${cor}08` }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Combinação</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Score</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Aderência</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itens.map(({ label, rep, mod }) => {
                      const score = candidato.scores?.[rep]?.[mod] ?? 0
                      const aderencia = getAderencia(score)
                      const isAtiva = rep === representacaoAtiva && mod === modeloAtivo

                      return (
                        <TableRow
                          key={label}
                          sx={{
                            bgcolor: isAtiva ? `${cor}0D` : 'inherit',
                            borderLeft: isAtiva ? `3px solid ${cor}` : '3px solid transparent',
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: isAtiva ? 700 : 500, color: isAtiva ? cor : 'text.primary' }}>
                                {label}
                              </Typography>
                              {isAtiva && (
                                <Chip
                                  label="ativa"
                                  size="small"
                                  sx={{
                                    bgcolor: `${cor}18`,
                                    color: cor,
                                    fontWeight: 700,
                                    fontSize: '0.62rem',
                                    height: 18,
                                    borderRadius: '4px',
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              sx={{
                                fontFamily: "'Fraunces', serif",
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                color: isAtiva ? cor : aderencia.hex,
                              }}
                            >
                              {formatScore(score)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={aderencia.label}
                              size="small"
                              sx={{
                                bgcolor: aderencia.hex + '18',
                                color: aderencia.hex,
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                height: 20,
                                borderRadius: '5px',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB', justifyContent: 'flex-start' }}>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
          Scores simulados — representam a estrutura esperada dos experimentos reais do TCC.
        </Typography>
      </DialogActions>
    </Dialog>
  )
}
