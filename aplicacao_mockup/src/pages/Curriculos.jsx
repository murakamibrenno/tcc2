import React, { useState, useMemo } from 'react'
import {
  Box, Typography, Card, TextField, Select, MenuItem,
  FormControl, InputLabel, InputAdornment, Grid,
  ToggleButton, ToggleButtonGroup, Alert, Chip,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded'
import CandidateTable from '../components/CandidateTable'
import CandidateDetailsModal from '../components/CandidateDetailsModal'
import { getCurriculosPiloto, getPilotoMeta } from '../utils/rankingUtils'

const curriculos = getCurriculosPiloto()
const pilotoMeta = getPilotoMeta()

const ehTI = (c) => c.categoriaOrigem === 'information-technology'

export default function Curriculos() {
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todos')
  const [filtroClassificacao, setFiltroClassificacao] = useState('Todas')
  const [modalCurriculo, setModalCurriculo] = useState(null)

  const curriculosFiltrados = useMemo(() => {
    let lista = [...curriculos]

    if (busca.trim()) {
      const buscaLower = busca.toLowerCase()
      lista = lista.filter(
        (c) =>
          c.nome.toLowerCase().includes(buscaLower) ||
          (c.resumo || '').toLowerCase().includes(buscaLower) ||
          (c.observacao || '').toLowerCase().includes(buscaLower) ||
          String(c.id).includes(buscaLower)
      )
    }

    if (filtroCategoria !== 'Todos') {
      lista = lista.filter((c) => (filtroCategoria === 'TI' ? ehTI(c) : !ehTI(c)))
    }

    if (filtroClassificacao !== 'Todas') {
      lista = lista.filter((c) => c.classificacaoManual === filtroClassificacao)
    }

    return lista
  }, [busca, filtroCategoria, filtroClassificacao])

  const countByClassificacao = useMemo(() => {
    const counts = { Adequado: 0, 'Parcialmente Adequado': 0, Inadequado: 0 }
    curriculos.forEach((c) => { if (counts[c.classificacaoManual] !== undefined) counts[c.classificacaoManual]++ })
    return counts
  }, [])

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Currículos carregados
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {curriculos.length} currículos reais da base archive (inglês), com rótulo de aderência à vaga
        </Typography>
      </Box>

      {/* Resumo rápido */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {Object.entries(countByClassificacao).map(([classif, count]) => {
          const colorMap = {
            Adequado: { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
            'Parcialmente Adequado': { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
            Inadequado: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
          }
          const style = colorMap[classif]
          return (
            <Grid item xs="auto" key={classif}>
              <Box
                sx={{
                  bgcolor: style.bg,
                  border: `1px solid ${style.border}`,
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.2rem', color: style.color }}>
                  {count}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: style.color }}>
                  {classif}
                </Typography>
              </Box>
            </Grid>
          )
        })}
      </Grid>

      {/* Banner dados reais */}
      <Alert
        severity="success"
        icon={<ScienceRoundedIcon fontSize="small" />}
        sx={{
          mb: 3, borderRadius: '10px',
          bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0',
          '& .MuiAlert-icon': { color: '#059669' },
          fontSize: '0.82rem',
        }}
      >
        {pilotoMeta.totalCurriculos} currículos em inglês, na ordem do TF-IDF ({pilotoMeta.metodo}). Sentence-Transformers e o Qwen estão no seletor da tela Ranking. Vinte rótulos são manuais e oitenta vêm da regra lexical.
      </Alert>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por título, ID ou trecho do currículo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Classificação</InputLabel>
              <Select
                value={filtroClassificacao}
                label="Classificação"
                onChange={(e) => setFiltroClassificacao(e.target.value)}
              >
                <MenuItem value="Todas">Todas</MenuItem>
                <MenuItem value="Adequado">Adequado</MenuItem>
                <MenuItem value="Parcialmente Adequado">Parcialmente Adequado</MenuItem>
                <MenuItem value="Inadequado">Inadequado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ToggleButtonGroup
              value={filtroCategoria}
              exclusive
              onChange={(_, val) => val && setFiltroCategoria(val)}
              size="small"
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {[
                { value: 'Todos', label: 'Todos' },
                { value: 'TI', label: 'TI' },
                { value: 'Outras', label: 'Outras áreas' },
              ].map((cat) => (
                <ToggleButton
                  key={cat.value}
                  value={cat.value}
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    px: 1.25,
                    py: 0.5,
                    '&.Mui-selected': {
                      bgcolor: '#0E7490',
                      color: '#fff',
                      '&:hover': { bgcolor: '#0C6177' },
                    },
                  }}
                >
                  {cat.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {(busca || filtroCategoria !== 'Todos' || filtroClassificacao !== 'Todas') && (
          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              {curriculosFiltrados.length} de {curriculos.length} currículos
            </Typography>
            {busca && (
              <Chip
                label={`Busca: "${busca}"`}
                size="small"
                onDelete={() => setBusca('')}
                sx={{ height: 22, fontSize: '0.72rem' }}
              />
            )}
            {filtroCategoria !== 'Todos' && (
              <Chip
                label={`Categoria: ${filtroCategoria === 'TI' ? 'TI' : 'Outras áreas'}`}
                size="small"
                onDelete={() => setFiltroCategoria('Todos')}
                sx={{ height: 22, fontSize: '0.72rem' }}
              />
            )}
            {filtroClassificacao !== 'Todas' && (
              <Chip
                label={`Classif.: ${filtroClassificacao}`}
                size="small"
                onDelete={() => setFiltroClassificacao('Todas')}
                sx={{ height: 22, fontSize: '0.72rem' }}
              />
            )}
          </Box>
        )}
      </Card>

      {/* Tabela */}
      <CandidateTable
        curriculos={curriculosFiltrados}
        piloto
        onVerCurriculo={(c) => setModalCurriculo(c)}
      />

      {/* Modal de detalhes */}
      <CandidateDetailsModal
        curriculo={modalCurriculo}
        piloto
        open={!!modalCurriculo}
        onClose={() => setModalCurriculo(null)}
      />
    </Box>
  )
}
