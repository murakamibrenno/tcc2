import React, { useState } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, IconButton, Tooltip, Avatar, Chip,
  TableSortLabel,
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import StatusChip from './StatusChip'
import { formatScore, formatCosseno, formatExperiencia, getInitials, getAvatarColor } from '../utils/formatters'
import { getAderencia, getAderenciaPiloto } from '../utils/rankingUtils'

const AREA_COLORS = {
  Backend: { bg: '#DBEAFE', color: '#1E40AF' },
  Dados: { bg: '#FEF3C7', color: '#92400E' },
  Frontend: { bg: '#F3E8FF', color: '#6B21A8' },
  'Tecnologia da Informação': { bg: '#DBEAFE', color: '#1E40AF' },
}

// Scores representativos: melhor combinação por representação (XGBoost)
const getTfidfScore = (c) => c.scores?.tfidf?.xgboost ?? 0
const getStScore = (c) => c.scores?.sentenceTransformers?.xgboost ?? 0
const getLlmScore = (c) => c.scores?.llmEmbeddings?.xgboost ?? 0

export default function CandidateTable({ curriculos, onVerCurriculo, onCompararMetodos, piloto = false }) {
  const [orderBy, setOrderBy] = useState(piloto ? 'posicao' : 'nome')
  const [orderDir, setOrderDir] = useState(piloto ? 'asc' : 'asc')

  const handleSort = (col) => {
    if (orderBy === col) {
      setOrderDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderBy(col)
      setOrderDir('desc')
    }
  }

  const sorted = [...curriculos].sort((a, b) => {
    let va, vb
    if (orderBy === 'tfidf') { va = getTfidfScore(a); vb = getTfidfScore(b) }
    else if (orderBy === 'sentenceTransformers') { va = getStScore(a); vb = getStScore(b) }
    else if (orderBy === 'llmEmbeddings') { va = getLlmScore(a); vb = getLlmScore(b) }
    else if (orderBy === 'experienciaAnos') { va = a.experienciaAnos; vb = b.experienciaAnos }
    else if (orderBy === 'scoreFinal') { va = a.scoreFinal ?? 0; vb = b.scoreFinal ?? 0 }
    else if (orderBy === 'posicao') { va = a.posicao ?? 0; vb = b.posicao ?? 0 }
    else { va = a[orderBy] || ''; vb = b[orderBy] || '' }

    if (va < vb) return orderDir === 'asc' ? -1 : 1
    if (va > vb) return orderDir === 'asc' ? 1 : -1
    return 0
  })

  const SortLabel = ({ column, children }) => (
    <TableSortLabel
      active={orderBy === column}
      direction={orderBy === column ? orderDir : 'desc'}
      onClick={() => handleSort(column)}
      sx={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#6B7280',
        '&.Mui-active': { color: '#0E7490' },
        '& .MuiTableSortLabel-icon': { color: '#0E7490 !important' },
      }}
    >
      {children}
    </TableSortLabel>
  )

  if (piloto) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 56 }}>
                <SortLabel column="posicao">#</SortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 240 }}>
                <SortLabel column="nome">Currículo</SortLabel>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <SortLabel column="area">Categoria de origem</SortLabel>
              </TableCell>
              <TableCell>Classif. Manual</TableCell>
              <TableCell align="center">
                <Tooltip title="Similaridade cosseno TF-IDF entre a vaga e o currículo (dados reais)">
                  <span>
                    <SortLabel column="scoreFinal">Sim. cosseno</SortLabel>
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((c) => {
              const areaStyle = AREA_COLORS[c.area] || { bg: '#F3F4F6', color: '#374151' }
              const aderencia = getAderenciaPiloto(c)
              const nomeCurto = c.nome.length > 52 ? `${c.nome.slice(0, 52)}…` : c.nome

              return (
                <TableRow key={c.id} hover>
                  <TableCell align="center">
                    <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.95rem', color: c.posicao <= 3 ? '#D97706' : 'text.secondary' }}>
                      {c.posicao}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Avatar
                        sx={{
                          width: 32, height: 32, fontSize: '0.72rem', fontWeight: 700,
                          bgcolor: getAvatarColor(c.nome), flexShrink: 0,
                        }}
                      >
                        {getInitials(c.nome)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                            {nomeCurto}
                          </Typography>
                          {c.falsoPositivo && (
                            <Tooltip title="Falso positivo lexical: Inadequado posicionado acima de candidatos relevantes pelo TF-IDF">
                              <WarningAmberRoundedIcon sx={{ fontSize: 15, color: '#DC2626', flexShrink: 0 }} />
                            </Tooltip>
                          )}
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1 }}>
                          ID {c.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Chip
                      label={c.area}
                      size="small"
                      sx={{
                        bgcolor: areaStyle.bg, color: areaStyle.color,
                        fontWeight: 700, fontSize: '0.7rem', borderRadius: '5px', height: 22,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusChip label={c.classificacaoManual} type="classificacao" />
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: aderencia.hex, fontFamily: "'Fraunces', serif" }}>
                      {formatCosseno(c.scoreFinal)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalhes do currículo (piloto TF-IDF)">
                      <IconButton size="small" onClick={() => onVerCurriculo?.(c)} sx={{ color: '#0E7490' }}>
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {sorted.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Nenhum currículo encontrado com os filtros atuais.</Typography>
          </Box>
        )}
      </TableContainer>
    )
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 200 }}>
              <SortLabel column="nome">Candidato</SortLabel>
            </TableCell>
            <TableCell>
              <SortLabel column="area">Área</SortLabel>
            </TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
              <SortLabel column="formacao">Formação</SortLabel>
            </TableCell>
            <TableCell>
              <SortLabel column="experienciaAnos">Exp.</SortLabel>
            </TableCell>
            <TableCell>Classif. Manual</TableCell>
            <TableCell align="center">
              <Tooltip title="Score TF-IDF + XGBoost (melhor combinação TF-IDF)">
                <span>
                  <SortLabel column="tfidf">TF-IDF</SortLabel>
                </span>
              </Tooltip>
            </TableCell>
            <TableCell align="center">
              <Tooltip title="Score Sentence-Transformers + XGBoost (melhor combinação ST)">
                <span>
                  <SortLabel column="sentenceTransformers">ST</SortLabel>
                </span>
              </Tooltip>
            </TableCell>
            <TableCell align="center">
              <Tooltip title="Score LLM Embeddings + XGBoost (melhor combinação LLM)">
                <span>
                  <SortLabel column="llmEmbeddings">LLM</SortLabel>
                </span>
              </Tooltip>
            </TableCell>
            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((c) => {
            const areaStyle = AREA_COLORS[c.area] || { bg: '#F3F4F6', color: '#374151' }
            const tfidfScore = getTfidfScore(c)
            const stScore = getStScore(c)
            const llmScore = getLlmScore(c)
            const llmAder = getAderencia(llmScore)

            return (
              <TableRow key={c.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Avatar
                      sx={{
                        width: 32, height: 32, fontSize: '0.72rem', fontWeight: 700,
                        bgcolor: getAvatarColor(c.nome), flexShrink: 0,
                      }}
                    >
                      {getInitials(c.nome)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                        {c.nome}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1 }}>
                        {c.cargoAtual}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={c.area}
                    size="small"
                    sx={{
                      bgcolor: areaStyle.bg, color: areaStyle.color,
                      fontWeight: 700, fontSize: '0.7rem', borderRadius: '5px', height: 22,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', maxWidth: 180 }} noWrap>
                    {c.formacao}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {formatExperiencia(c.experienciaAnos)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip label={c.classificacaoManual} type="classificacao" />
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: getAderencia(tfidfScore).hex, fontFamily: "'Fraunces', serif" }}>
                    {formatScore(tfidfScore)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: getAderencia(stScore).hex, fontFamily: "'Fraunces', serif" }}>
                    {formatScore(stScore)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: llmAder.hex, fontFamily: "'Fraunces', serif" }}>
                    {formatScore(llmScore)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Ver currículo">
                      <IconButton size="small" onClick={() => onVerCurriculo?.(c)} sx={{ color: '#0E7490' }}>
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Comparar métodos">
                      <IconButton size="small" onClick={() => onCompararMetodos?.(c)} sx={{ color: '#D97706' }}>
                        <CompareArrowsRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {sorted.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">Nenhum currículo encontrado com os filtros atuais.</Typography>
        </Box>
      )}
    </TableContainer>
  )
}
