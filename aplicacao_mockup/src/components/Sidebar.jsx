import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Tooltip,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import WorkRoundedIcon from '@mui/icons-material/WorkRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'

const NAVY = '#0B1929'
const NAVY_LIGHT = '#122236'
const AMBER = '#D97706'
const WHITE = '#FFFFFF'
const WHITE_MUTED = 'rgba(255,255,255,0.55)'
const WHITE_DIVIDER = 'rgba(255,255,255,0.08)'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardRoundedIcon fontSize="small" /> },
  { label: 'Vagas', path: '/vagas', icon: <WorkRoundedIcon fontSize="small" /> },
  { label: 'Currículos', path: '/curriculos', icon: <DescriptionRoundedIcon fontSize="small" /> },
  { label: 'Ranking', path: '/ranking', icon: <LeaderboardRoundedIcon fontSize="small" /> },
  { label: 'Comparativo de Métodos', path: '/comparativo', icon: <BarChartRoundedIcon fontSize="small" /> },
  { label: 'Metodologia', path: '/metodologia', icon: <SchoolRoundedIcon fontSize="small" /> },
  { label: 'Resultados', path: '/resultados', icon: <MenuBookRoundedIcon fontSize="small" /> },
  { label: 'Interpretabilidade', path: '/interpretabilidade', icon: <MenuBookRoundedIcon fontSize="small" /> },
  /* Rota /sobre mantida em AppRoutes para uso futuro — não listada no menu */
]

export default function Sidebar({ drawerWidth = 260 }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <Box
      sx={{
        width: drawerWidth,
        minHeight: '100vh',
        bgcolor: NAVY,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1200,
        backgroundImage: `
          radial-gradient(ellipse at 80% 10%, rgba(14,116,144,0.18) 0%, transparent 60%),
          radial-gradient(ellipse at 20% 90%, rgba(217,119,6,0.10) 0%, transparent 50%)
        `,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.15)', borderRadius: 2 },
      }}
    >
      {/* Logo / Título */}
      <Box sx={{ px: 3, pt: 3.5, pb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${AMBER} 0%, #B45309 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 12px rgba(217,119,6,0.4)`,
            }}
          >
            <LeaderboardRoundedIcon sx={{ color: WHITE, fontSize: 20 }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: '1.2rem',
              color: WHITE,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Currículo
            <Box component="span" sx={{ color: AMBER }}>Rank</Box>
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: WHITE_MUTED,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: 600,
            ml: '48px',
          }}
        >
          Triagem com PLN
        </Typography>
      </Box>

      <Divider sx={{ borderColor: WHITE_DIVIDER, mx: 2 }} />

      {/* Nav items */}
      <Box sx={{ px: 1, pt: 1.5, flex: 1 }}>
        <Typography
          sx={{
            fontSize: '0.65rem',
            color: WHITE_MUTED,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            px: 1.5,
            mb: 1,
          }}
        >
          Navegação
        </Typography>
        <List disablePadding>
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Tooltip key={item.path} title="" placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    mx: 0,
                    py: 1,
                    px: 1.5,
                    width: '100%',
                    background: active
                      ? `linear-gradient(90deg, rgba(217,119,6,0.2) 0%, rgba(217,119,6,0.08) 100%)`
                      : 'transparent',
                    borderLeft: active ? `3px solid ${AMBER}` : '3px solid transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      background: active
                        ? `linear-gradient(90deg, rgba(217,119,6,0.2) 0%, rgba(217,119,6,0.08) 100%)`
                        : `rgba(255,255,255,0.06)`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: active ? AMBER : WHITE_MUTED,
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.85rem',
                      color: active ? WHITE : WHITE_MUTED,
                      transition: 'color 0.15s ease',
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            )
          })}
        </List>
      </Box>

      {/* Footer da sidebar */}
      <Box sx={{ p: 2, borderTop: `1px solid ${WHITE_DIVIDER}` }}>
        <Box
          sx={{
            bgcolor: NAVY_LIGHT,
            borderRadius: '8px',
            p: 1.5,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              color: WHITE_MUTED,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.5,
            }}
          >
            Interface focada em ranqueamento e comparativo de representações textuais para currículos em inglês.
          </Typography>
          <Typography
            sx={{
              fontSize: '0.68rem',
              color: `${AMBER}99`,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              mt: 0.5,
              fontWeight: 600,
            }}
          >
            CurrículoRank — PLN & triagem
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
