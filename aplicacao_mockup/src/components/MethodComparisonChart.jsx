import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { Box, Typography, Paper } from '@mui/material'

const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={4}
        sx={{
          p: '10px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.06)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          minWidth: 140,
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((p, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.fill || p.color }} />
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'text.primary' }}>
              {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}{suffix}
            </Typography>
          </Box>
        ))}
      </Paper>
    )
  }
  return null
}

export default function MethodComparisonChart({
  titulo,
  dados,
  valorKey = 'valor',
  nomeKey = 'nome',
  corKey = 'cor',
  suffix = '',
  altura = 240,
  yDomain = [0, 1],
  mostrarLegenda = false,
}) {
  return (
    <Box sx={{ width: '100%' }}>
      {titulo && (
        <Typography
          sx={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'text.primary',
            mb: 1.5,
          }}
        >
          {titulo}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={altura}>
        <BarChart
          data={dados}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey={nomeKey}
            tick={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              fill: '#6B7280',
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            tick={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 10,
              fill: '#9CA3AF',
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip suffix={suffix} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          {mostrarLegenda && <Legend wrapperStyle={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12 }} />}
          {Array.isArray(dados[0]?.[valorKey]) ? null : (
            <Bar dataKey={valorKey} radius={[6, 6, 0, 0]} maxBarSize={72}>
              {dados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry[corKey] || '#0E7490'} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

export { CustomTooltip }
