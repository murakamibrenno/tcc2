import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
import Vagas from '../pages/Vagas'
import Curriculos from '../pages/Curriculos'
import Ranking from '../pages/Ranking'
import Comparativo from '../pages/Comparativo'
import Metodologia from '../pages/Metodologia'
import Sobre from '../pages/Sobre'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vagas" element={<Vagas />} />
        <Route path="/curriculos" element={<Curriculos />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/comparativo" element={<Comparativo />} />
        <Route path="/metodologia" element={<Metodologia />} />
        <Route path="/sobre" element={<Sobre />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
