import React from 'react'
import { Box, Card, CardContent, Typography, LinearProgress, Chip } from '@mui/material'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'

const INTERPRETABILIDADE_COLOR = {
  'Alta': '#059669',
  'Média': '#D97706',
  'Média/Alta': '#D97706',
  'Baixa/Média': '#7C3AED',
  'Baixa': '#DC2626',
}

const MEMORIA_COLOR = {
  'Baixa': '#059669',
  'Média': '#D97706',
  'Média/Alta': '#D97706',
  'Alta': '#DC2626',
}

export default function MethodCard({ metodo }) {
  const {
    nome, cor, f1Score, descricaoCard,
    interpretabilidade, consumoMemoria, tempoVetorizacao,
    melhorCombinacao,
  } = metodo

  return (
    <Card
      sx={{
        height: '100%',
        borderTop: `4px solid ${cor}`,
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 32px ${cor}25`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}
          >
            {nome}
          </Typography>
          <Box
            sx={{
              width: 12, height: 12, borderRadius: '50%', bgcolor: cor,
              flexShrink: 0, mt: 0.5, boxShadow: `0 0 0 4px ${cor}25`,
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}>
          {descricaoCard}
        </Typography>

        {/* Melhor combinação */}
        {melhorCombinacao && (
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75, mb: 2,
              bgcolor: `${cor}0D`, borderRadius: '8px', px: 1.25, py: 0.75,
              border: `1px solid ${cor}25`,
            }}
          >
            <WorkspacePremiumOutlinedIcon sx={{ fontSize: 14, color: cor, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.2 }}>
                Melhor combinação
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
                {melhorCombinacao}
              </Typography>
            </Box>
          </Box>
        )}

        {/* F1-score barra */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Melhor F1-Score
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: cor }}>
              {f1Score.toFixed(2)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={f1Score * 100}
            sx={{ bgcolor: `${cor}20`, '& .MuiLinearProgress-bar': { bgcolor: cor } }}
          />
        </Box>

        {/* Chips de metadados */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <Chip
            label={`Interp.: ${interpretabilidade}`}
            size="small"
            sx={{
              bgcolor: `${INTERPRETABILIDADE_COLOR[interpretabilidade] || '#6B7280'}18`,
              color: INTERPRETABILIDADE_COLOR[interpretabilidade] || '#6B7280',
              fontWeight: 700, fontSize: '0.68rem', borderRadius: '5px', height: 22,
            }}
          />
          <Chip
            label={`Mem.: ${consumoMemoria}`}
            size="small"
            sx={{
              bgcolor: `${MEMORIA_COLOR[consumoMemoria] || '#6B7280'}15`,
              color: MEMORIA_COLOR[consumoMemoria] || '#6B7280',
              fontWeight: 700, fontSize: '0.68rem', borderRadius: '5px', height: 22,
            }}
          />
          <Chip
            label={`Vetor.: ${tempoVetorizacao}`}
            size="small"
            sx={{
              bgcolor: 'rgba(107,114,128,0.1)', color: '#6B7280',
              fontWeight: 700, fontSize: '0.68rem', borderRadius: '5px', height: 22,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  )
}
