import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, Chip, Breadcrumbs, Select, MenuItem } from '@mui/material'
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'

const TOPBAR_HEIGHT = 64

const PAGE_LABELS = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral da triagem e dos indicadores' },
  '/vagas': { title: 'Vagas', subtitle: 'Gerencie e selecione vagas para análise' },
  '/curriculos': { title: 'Currículos', subtitle: 'Listagem e detalhamento dos perfis cadastrados' },
  '/ranking': { title: 'Ranking de Candidatos', subtitle: 'Ranqueamento por método de representação textual' },
  '/comparativo': { title: 'Comparativo de Métodos', subtitle: 'Comparação de TF-IDF, Sentence-Transformers e LLM Embeddings' },
  '/metodologia': { title: 'Metodologia', subtitle: 'Fluxo metodológico da avaliação comparativa' },
  '/resultados': { title: 'Resultados', subtitle: 'Começo, medição e discussão do experimento' },
  '/interpretabilidade': { title: 'Interpretabilidade', subtitle: 'Termos e sensibilidade dos modelos fixos' },
  '/sobre': { title: 'Sobre', subtitle: 'Contexto, limitações e roadmap da aplicação' },
}

export default function Topbar({ drawerWidth = 260 }) {
  const location = useLocation()
  const navigate = useNavigate()
  const page = PAGE_LABELS[location.pathname] || { title: 'CurrículoRank', subtitle: '' }

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: { xs: 0, md: drawerWidth },
        right: 0,
        height: TOPBAR_HEIGHT,
        zIndex: 1100,
        bgcolor: 'rgba(244,242,237,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        gap: 2,
      }}
    >
      {/* Título e breadcrumb */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Breadcrumbs
          separator={<NavigateNextRoundedIcon fontSize="small" sx={{ color: 'text.disabled', fontSize: 14 }} />}
          sx={{ mb: 0.25 }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'text.disabled',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            CurrículoRank
          </Typography>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {page.title}
          </Typography>
        </Breadcrumbs>
        <Typography
          sx={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: '1.05rem',
            color: 'text.primary',
            lineHeight: 1.2,
          }}
        >
          {page.title}
        </Typography>
      </Box>

      <Select size="small" value={location.pathname} onChange={e => navigate(e.target.value)} inputProps={{ 'aria-label': 'Navegar no CurrículoRank' }} sx={{ display: { xs: 'block', md: 'none' }, maxWidth: 180 }}>
        {Object.entries(PAGE_LABELS).filter(([path]) => path !== '/sobre').map(([path, page]) => <MenuItem key={path} value={path}>{page.title}</MenuItem>)}
      </Select>

      {/* Badges informativos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          icon={<ScienceRoundedIcon sx={{ fontSize: '14px !important' }} />}
          label="Exploratório · 97 casos"
          size="small"
          sx={{
            bgcolor: '#FEF3C7',
            color: '#92400E',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '0.7rem',
            border: '1px solid #FDE68A',
            borderRadius: '6px',
            height: 28,
            '& .MuiChip-icon': { color: '#D97706' },
          }}
        />
      </Box>
    </Box>
  )
}

export { TOPBAR_HEIGHT }
