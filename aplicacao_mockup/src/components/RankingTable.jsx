import React, { useState } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, Avatar, Chip, Tooltip, IconButton,
} from '@mui/material'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import StatusChip from './StatusChip'
import ScoresDetailModal from './ScoresDetailModal'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { formatScore, formatCosseno, getInitials, getAvatarColor, formatExperiencia } from '../utils/formatters'
import { getAderencia, getAderenciaPiloto, REPRESENTACOES, MODELOS } from '../utils/rankingUtils'
import { RotuloMetrica, COLUNAS } from './CabecalhoMetrica'

const MEDAL_COLORS = ['#D97706', '#9CA3AF', '#B45309']
const AREA_COLORS = {
  Backend: { bg: '#DBEAFE', color: '#1E40AF' },
  Dados: { bg: '#FEF3C7', color: '#92400E' },
  Frontend: { bg: '#F3E8FF', color: '#6B21A8' },
}

export default function RankingTable({ candidatos, representacaoAtiva = 'llmEmbeddings', modeloAtivo = 'xgboost', piloto = false }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null)

  const repInfo = REPRESENTACOES[representacaoAtiva]
  const modInfo = MODELOS[modeloAtivo]

  const abrirModal = (candidato) => {
    setCandidatoSelecionado(candidato)
    setModalAberto(true)
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 52 }}><RotuloMetrica id="posicao">Pos.</RotuloMetrica></TableCell>
              <TableCell><RotuloMetrica id="candidato">Candidato</RotuloMetrica></TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><RotuloMetrica id="area">Área</RotuloMetrica></TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><RotuloMetrica id="classificacao">Aderência</RotuloMetrica></TableCell>
              <TableCell align="center">
                <Tooltip title={piloto ? COLUNAS.similaridade.texto : `Nota de ${repInfo?.label ?? representacaoAtiva} com ${modInfo?.label ?? modeloAtivo}. ${COLUNAS.similaridade.texto}`}>
                  <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, cursor: 'help' }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.1 }}>
                      {piloto ? 'Similaridade' : 'Nota'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1.1 }}>
                      {piloto ? (repInfo?.label ?? 'Cosseno') : (modInfo?.label ?? 'modelo')}
                    </Typography>
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><RotuloMetrica id="aderencia">Faixa</RotuloMetrica></TableCell>
              <TableCell align="center" sx={{ width: 52 }}>
                <Tooltip title="Ver detalhe do ranking ativo">
                  <TableChartOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidatos.map((c) => {
              const isTop3 = c.posicao <= 3
              const aderencia = piloto ? getAderenciaPiloto(c) : getAderencia(c.scoreFinal)
              const areaStyle = AREA_COLORS[c.area] || { bg: '#F3F4F6', color: '#374151' }

              return (
                <TableRow
                  key={c.id}
                  sx={{
                    bgcolor: isTop3
                      ? c.posicao === 1
                        ? 'rgba(217,119,6,0.05)'
                        : 'rgba(0,0,0,0.015)'
                      : 'inherit',
                    borderLeft: isTop3 ? `3px solid ${MEDAL_COLORS[c.posicao - 1]}` : '3px solid transparent',
                    '&:hover': { bgcolor: isTop3 ? 'rgba(217,119,6,0.08)' : '#F9F9F7' },
                  }}
                >
                  {/* Posição */}
                  <TableCell align="center">
                    {isTop3 ? (
                      <Tooltip title={`${c.posicao}º lugar`}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EmojiEventsRoundedIcon sx={{ fontSize: 20, color: MEDAL_COLORS[c.posicao - 1] }} />
                        </Box>
                      </Tooltip>
                    ) : (
                      <Typography
                        sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.95rem', color: 'text.secondary' }}
                      >
                        {c.posicao}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Candidato */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Avatar
                        sx={{
                          width: 30, height: 30, fontSize: '0.68rem', fontWeight: 700,
                          bgcolor: getAvatarColor(c.nome), flexShrink: 0,
                          boxShadow: isTop3 ? `0 2px 8px ${getAvatarColor(c.nome)}50` : 'none',
                        }}
                      >
                        {getInitials(c.nome)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: isTop3 ? 700 : 600, color: 'text.primary', lineHeight: 1.2 }}>
                          {piloto ? (c.nome.length > 46 ? `${c.nome.slice(0, 46)}…` : c.nome) : c.nome}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                          {piloto ? `ID ${c.id}` : formatExperiencia(c.experienciaAnos)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Área */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Chip
                      label={c.area}
                      size="small"
                      sx={{
                        bgcolor: areaStyle.bg, color: areaStyle.color,
                        fontWeight: 700, fontSize: '0.68rem', borderRadius: '5px', height: 20,
                      }}
                    />
                  </TableCell>

                  {/* Classificação manual */}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <StatusChip label={c.classificacaoManual} type="classificacao" />
                      {piloto && c.inversaoRanking && (
                        <Tooltip title="Inversão no ranking: o TF-IDF posicionou este currículo Inadequado acima de candidatos relevantes.">
                          <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#DC2626', cursor: 'help' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  {/* Score da combinação ativa */}
                  <TableCell align="center">
                    <Typography
                      sx={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 800,
                        fontSize: piloto ? '0.92rem' : '1rem',
                        color: aderencia.hex,
                      }}
                    >
                      {piloto ? formatCosseno(c.scoreFinal) : formatScore(c.scoreFinal)}
                    </Typography>
                  </TableCell>

                  {/* Aderência */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <StatusChip label={aderencia.label} type="aderencia" />
                  </TableCell>

                  {/* Botão ver detalhes */}
                  <TableCell align="center">
                    <Tooltip title={COLUNAS.acoes.texto}>
                      <IconButton
                        size="small"
                        onClick={() => abrirModal(c)}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { color: repInfo?.cor ?? '#0E7490', bgcolor: `${repInfo?.cor ?? '#0E7490'}12` },
                        }}
                      >
                        <TableChartOutlinedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {candidatos.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Selecione uma vaga para visualizar o ranking.</Typography>
          </Box>
        )}
      </TableContainer>

      <ScoresDetailModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        candidato={candidatoSelecionado}
        representacaoAtiva={representacaoAtiva}
        modeloAtivo={modeloAtivo}
        piloto={piloto}
      />
    </>
  )
}
