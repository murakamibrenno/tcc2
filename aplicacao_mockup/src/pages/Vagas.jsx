import React, { useState } from 'react'
import {
  Box, Grid, Typography, Card, CardContent, CardActions,
  Button, TextField, ToggleButton, ToggleButtonGroup,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Divider, InputAdornment,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import WorkRoundedIcon from '@mui/icons-material/WorkRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { vagas } from '../data/vagasMock'
import { useNavigate } from 'react-router-dom'

const AREA_COLORS = {
  Backend: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  Dados: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  Frontend: { bg: '#F3E8FF', color: '#6B21A8', border: '#E9D5FF' },
}

const PESO_COLORS = {
  alto: { bg: '#D1FAE5', color: '#065F46' },
  médio: { bg: '#FEF3C7', color: '#92400E' },
  baixo: { bg: '#FEE2E2', color: '#991B1B' },
}

const AREA_OPTIONS = ['Todos', ...Array.from(new Set(vagas.map((v) => v.area)))]

export default function Vagas() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('Todos')
  const [vagaSelecionada, setVagaSelecionada] = useState(null)
  const [modalAberta, setModalAberta] = useState(false)

  const vagasFiltradas = vagas.filter((v) => {
    const matchBusca = v.titulo.toLowerCase().includes(busca.toLowerCase())
    const matchArea = filtroArea === 'Todos' || v.area === filtroArea
    return matchBusca && matchArea
  })

  const abrirModal = (vaga) => {
    setVagaSelecionada(vaga)
    setModalAberta(true)
  }

  const fecharModal = () => {
    setModalAberta(false)
    setVagaSelecionada(null)
  }

  const irParaRanking = (vagaId) => {
    navigate(`/ranking?vagaId=${vagaId}`)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Vagas Cadastradas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selecione uma vaga para visualizar candidatos e rankings associados
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar vaga por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 240 }}
          />
          <ToggleButtonGroup
            value={filtroArea}
            exclusive
            onChange={(_, val) => val && setFiltroArea(val)}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            {AREA_OPTIONS.map((area) => (
              <ToggleButton
                key={area}
                value={area}
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: '#0E7490',
                    color: '#fff',
                    '&:hover': { bgcolor: '#0C6177' },
                  },
                }}
              >
                {area}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography sx={{ ml: 'auto', fontSize: '0.82rem', color: 'text.secondary' }}>
            {vagasFiltradas.length} vaga{vagasFiltradas.length !== 1 ? 's' : ''} encontrada{vagasFiltradas.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Card>

      {/* Cards das vagas */}
      <Grid container spacing={2.5}>
        {vagasFiltradas.map((vaga) => {
          const areaStyle = AREA_COLORS[vaga.area] || {}
          return (
            <Grid item xs={12} md={6} lg={4} key={vaga.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: `4px solid ${areaStyle.border || '#E5E7EB'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.10)',
                  },
                }}
              >
                <CardContent sx={{ flex: 1, p: 2.5 }}>
                  {/* Header da vaga */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      <Chip
                        label={vaga.area}
                        size="small"
                        sx={{
                          bgcolor: areaStyle.bg,
                          color: areaStyle.color,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          borderRadius: '6px',
                          border: `1px solid ${areaStyle.border}`,
                        }}
                      />
                      {vaga.piloto && (
                        <Chip
                          label="Vaga da avaliação"
                          size="small"
                          sx={{
                            bgcolor: '#D1FAE5',
                            color: '#065F46',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            borderRadius: '6px',
                            border: '1px solid #A7F3D0',
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        bgcolor: '#F3F4F6',
                        borderRadius: '8px',
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6B7280',
                      }}
                    >
                      <WorkRoundedIcon fontSize="small" />
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: 'text.primary',
                      lineHeight: 1.3,
                      mb: 0.5,
                    }}
                  >
                    {vaga.titulo}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BusinessRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{vaga.empresa}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{vaga.modalidade}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2, fontSize: '0.82rem' }}>
                    {vaga.descricao}
                  </Typography>

                  {/* Requisitos */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary',
                        textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75,
                      }}
                    >
                      Requisitos Obrigatórios
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {vaga.requisitosObrigatorios.map((r) => (
                        <Chip
                          key={r}
                          label={r}
                          size="small"
                          sx={{
                            bgcolor: '#E0F2F7',
                            color: '#0C6177',
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            borderRadius: '5px',
                            height: 20,
                            border: '1px solid #BAE6FD',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary',
                        textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75,
                      }}
                    >
                      Candidatos associados
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          bgcolor: '#FEF3C7',
                          color: '#92400E',
                          borderRadius: '6px',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        {vaga.totalCandidatos} candidatos
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                        para esta vaga
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0, gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    onClick={() => abrirModal(vaga)}
                    sx={{
                      flex: 1,
                      borderColor: '#E5E7EB',
                      color: 'text.secondary',
                      '&:hover': { borderColor: '#0E7490', color: '#0E7490' },
                    }}
                  >
                    Ver detalhes
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<LeaderboardRoundedIcon fontSize="small" />}
                    onClick={() => irParaRanking(vaga.id)}
                    sx={{ flex: 1 }}
                  >
                    Ver ranking
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {vagasFiltradas.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Nenhuma vaga encontrada com os filtros aplicados.</Typography>
        </Box>
      )}

      {/* Modal de detalhes */}
      <Dialog
        open={modalAberta}
        onClose={fecharModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        {vagaSelecionada && (
          <>
            <DialogTitle sx={{ p: 0 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #0B1929 0%, #122236 100%)',
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip
                    label={vagaSelecionada.area}
                    size="small"
                    sx={{
                      bgcolor: AREA_COLORS[vagaSelecionada.area]?.bg || '#F3F4F6',
                      color: AREA_COLORS[vagaSelecionada.area]?.color || '#374151',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={vagaSelecionada.modalidade}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: '0.7rem' }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: '#fff',
                    mt: 0.5,
                  }}
                >
                  {vagaSelecionada.titulo}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', mt: 0.25 }}>
                  {vagaSelecionada.empresa} · {vagaSelecionada.nivelExperiencia}
                </Typography>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary', mb: 2.5 }}>
                {vagaSelecionada.descricao}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* Requisitos */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                  Requisitos Obrigatórios
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {vagaSelecionada.requisitosObrigatorios.map((r) => (
                    <Chip
                      key={r}
                      icon={<CheckRoundedIcon sx={{ fontSize: '12px !important', color: '#059669 !important' }} />}
                      label={r}
                      size="small"
                      sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #6EE7B7' }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                  Requisitos Desejáveis
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {vagaSelecionada.requisitosDesejaveis.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      size="small"
                      sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #FDE68A' }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Pesos */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                  Peso dos Critérios de Avaliação
                </Typography>
                <Grid container spacing={1.5}>
                  {Object.entries(vagaSelecionada.pesos).map(([criterio, peso]) => {
                    const labelMap = {
                      experiencia: 'Experiência',
                      formacao: 'Formação',
                      competenciasTecnicas: 'Competências Técnicas',
                      similaridadeTextual: 'Similaridade Textual',
                    }
                    const pesoStyle = PESO_COLORS[peso] || { bg: '#F3F4F6', color: '#374151' }
                    return (
                      <Grid item xs={6} key={criterio}>
                        <Box
                          sx={{
                            bgcolor: '#F9FAFB',
                            borderRadius: '8px',
                            p: 1.25,
                            border: '1px solid #E5E7EB',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mb: 0.5 }}>
                            {labelMap[criterio] || criterio}
                          </Typography>
                          <Chip
                            label={peso.charAt(0).toUpperCase() + peso.slice(1)}
                            size="small"
                            sx={{
                              bgcolor: pesoStyle.bg,
                              color: pesoStyle.color,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              borderRadius: '5px',
                              height: 20,
                            }}
                          />
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
              <Button onClick={fecharModal} variant="outlined" size="small">
                Fechar
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<LeaderboardRoundedIcon fontSize="small" />}
                onClick={() => { fecharModal(); irParaRanking(vagaSelecionada.id) }}
              >
                Ver ranking desta vaga
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
