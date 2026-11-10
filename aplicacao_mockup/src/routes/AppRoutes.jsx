import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { DashboardAtual, VagaAtual, DocumentosAtuais, ComparativoAtual, MetodologiaAtual, ResultadosAtuais, InterpretabilidadeAtual } from '../pages/ExperimentoAtual'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardAtual />} />
        <Route path="/vagas" element={<VagaAtual />} />
        <Route path="/curriculos" element={<DocumentosAtuais />} />
        <Route path="/ranking" element={<DocumentosAtuais ranking />} />
        <Route path="/comparativo" element={<ComparativoAtual />} />
        <Route path="/metodologia" element={<MetodologiaAtual />} />
        <Route path="/resultados" element={<ResultadosAtuais />} />
        <Route path="/interpretabilidade" element={<InterpretabilidadeAtual />} />
        <Route path="/sobre" element={<Navigate to="/metodologia" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
