import React from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'

export default function MetricCard({ titulo, valor, subtitulo, icone, corAccent = '#0E7490', delay = 0 }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: `4px solid ${corAccent}`,
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        cursor: 'default',
        animation: `fadeSlideIn 0.4s ease ${delay}ms both`,
        '@keyframes fadeSlideIn': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px rgba(0,0,0,0.10)`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.65rem',
              lineHeight: 1.3,
              letterSpacing: '0.1em',
            }}
          >
            {titulo}
          </Typography>
          {icone && (
            <Box
              sx={{
                bgcolor: `${corAccent}18`,
                borderRadius: '8px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: corAccent,
                flexShrink: 0,
              }}
            >
              {icone}
            </Box>
          )}
        </Box>

        <Typography
          sx={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '1.75rem',
            color: 'text.primary',
            lineHeight: 1,
            mb: 0.75,
          }}
        >
          {valor}
        </Typography>

        {subtitulo && (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', lineHeight: 1.4 }}>
            {subtitulo}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
