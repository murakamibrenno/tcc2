import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Alert } from '@mui/material'
import Sidebar from '../components/Sidebar'
import Topbar, { TOPBAR_HEIGHT } from '../components/Topbar'


const DRAWER_WIDTH = 260

export default function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar drawerWidth={DRAWER_WIDTH} />
      <Topbar drawerWidth={DRAWER_WIDTH} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          minWidth: 0,
          mt: `${TOPBAR_HEIGHT}px`,
          minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          bgcolor: 'background.default',
          p: { xs: 2, sm: 3, md: 4 },
          '@keyframes fadeSlideIn': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '& > *': {
            animation: 'fadeSlideIn 0.35s ease forwards',
          },
        }}
      >
        <Alert severity="warning" sx={{ mb: 3 }}>
          Avaliação exploratória em 97 casos: 5 ratificações humanas assistidas e 92 rótulos da IA sem conferência. Não é teste humano independente nem avaliação de qualidade dos 2.483 textos.
        </Alert>
        <Outlet />
      </Box>
    </Box>
  )
}
