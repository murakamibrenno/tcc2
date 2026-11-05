import React from 'react'
import { Chip } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'

const CLASSIFICACAO_CONFIG = {
  'Adequado': {
    bgcolor: '#D1FAE5', color: '#065F46', borderColor: '#6EE7B7',
    icon: <CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />,
  },
  'Parcialmente Adequado': {
    bgcolor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A',
    icon: <RemoveCircleRoundedIcon sx={{ fontSize: '14px !important' }} />,
  },
  'Inadequado': {
    bgcolor: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA',
    icon: <CancelRoundedIcon sx={{ fontSize: '14px !important' }} />,
  },
}

const ADERENCIA_CONFIG = {
  'Alta aderência': {
    bgcolor: '#D1FAE5', color: '#065F46', borderColor: '#6EE7B7',
    icon: <TrendingUpRoundedIcon sx={{ fontSize: '14px !important' }} />,
  },
  'Média aderência': {
    bgcolor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A',
    icon: <TrendingFlatRoundedIcon sx={{ fontSize: '14px !important' }} />,
  },
  'Baixa aderência': {
    bgcolor: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA',
    icon: <TrendingDownRoundedIcon sx={{ fontSize: '14px !important' }} />,
  },
}

export default function StatusChip({ label, type = 'classificacao', size = 'small' }) {
  const config =
    type === 'aderencia'
      ? ADERENCIA_CONFIG[label]
      : CLASSIFICACAO_CONFIG[label]

  if (!config) {
    return (
      <Chip
        label={label}
        size={size}
        sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.72rem' }}
      />
    )
  }

  return (
    <Chip
      icon={config.icon}
      label={label}
      size={size}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        fontSize: '0.72rem',
        borderRadius: '6px',
        height: size === 'small' ? 24 : 28,
        '& .MuiChip-icon': { color: config.color },
      }}
    />
  )
}
