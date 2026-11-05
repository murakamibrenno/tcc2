import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
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
          ml: `${DRAWER_WIDTH}px`,
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
        <Outlet />
      </Box>
    </Box>
  )
}
