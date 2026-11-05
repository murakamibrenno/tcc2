import React from 'react'
import {
  Box, Typography, Grid, Card, CardContent,
  Divider, Chip, Paper,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import CodeRoundedIcon from '@mui/icons-material/CodeRounded'
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded'

const IMPLEMENTADO = [
  'Dashboard com métricas reais do pipeline piloto',
  'Vaga piloto com rankings reais (TF-IDF, ST, LLM)',
  'Listagem dos 100 currículos reais da base archive (EN)',
  'Detalhamento completo de currículos',
  'Ranking de candidatos com seletor de representação',
  'Comparativo das 9 combinações (LR / SVM / XGBoost × 3 reps.)',
  'Gráficos de desempenho (Recharts) com dados reais',
  'Página metodológica com timeline atualizada',
  'Filtros e busca de currículos',
  'Chips de status de aderência e classificação',
  'Modal de detalhes com scores e justificativas',
  'Pipeline Python: embeddings, classificação e métricas de ranking',
]

const FUTURO = [
  'Rótulos de aderência na base completa (2.484 currículos)',
  'Upload de currículos em PDF pela interface',
  'Integração contínua com backend Python (FastAPI)',
  'Split train/val/test e validação sem vazamento (TF-IDF)',
  'Anotação com dois avaliadores e Kappa de Cohen',
  'Modelos multilíngues para currículos em PT',
  'Persistência em banco de dados (PostgreSQL)',
  'Autenticação de usuários',
  'Exportação de relatórios em PDF',
]

const STACK = [
  { label: 'React 18', cat: 'Frontend' },
  { label: 'Vite', cat: 'Build' },
  { label: 'Material UI v6', cat: 'UI' },
  { label: 'React Router v6', cat: 'Roteamento' },
  { label: 'Recharts', cat: 'Gráficos' },
  { label: 'Plus Jakarta Sans', cat: 'Tipografia' },
  { label: 'Fraunces', cat: 'Tipografia' },
]

const CAT_COLORS = {
  Frontend: { bg: '#DBEAFE', color: '#1E40AF' },
  Build: { bg: '#F3E8FF', color: '#6B21A8' },
  UI: { bg: '#D1FAE5', color: '#065F46' },
  Roteamento: { bg: '#FEF3C7', color: '#92400E' },
  Gráficos: { bg: '#FEE2E2', color: '#991B1B' },
  Tipografia: { bg: '#E0F2F7', color: '#0C6177' },
}

export default function Sobre() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Sobre o CurrículoRank
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Contexto, limitações e roadmap do CurrículoRank
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Coluna principal */}
        <Grid item xs={12} md={8}>
          {/* Sobre a aplicação */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: '10px',
                    bgcolor: '#E0F2F7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0E7490',
                  }}
                >
                  <ScienceRoundedIcon />
                </Box>
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}>
                  Sobre a Aplicação
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', mb: 2 }}>
                O CurrículoRank organiza o trabalho em torno do tema{' '}
                <strong style={{ color: '#1C1917' }}>
                  "Avaliação Comparativa de Representações Textuais Aplicadas à Triagem Automática de Currículos em Português: TF-IDF, Sentence-Transformers e Embeddings de LLMs"
                </strong>, reunindo telas para explorar vagas, perfis, rankings e métricas lado a lado.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', mb: 2 }}>
                O foco aqui é experiência de uso: navegação entre fluxos, leitura de rankings e comparativo entre métodos de representação textual, com espaço para evoluir integrações conforme o pipeline de PLN amadurecer.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                Próximos passos incluem backend em Python, dataset anotado e execução dos pipelines de vetorização e classificação ligados diretamente à interface.
              </Typography>
            </CardContent>
          </Card>

          {/* Implementado x Futuro */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', borderTop: '4px solid #059669' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleRoundedIcon sx={{ color: '#059669', fontSize: 20 }} />
                    <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                      O que já está implementado
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {IMPLEMENTADO.map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#059669', mt: 0.35, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.45 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', borderTop: '4px solid #D97706' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BuildRoundedIcon sx={{ color: '#D97706', fontSize: 20 }} />
                    <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                      O que será implementado futuramente
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {FUTURO.map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 14, height: 14, borderRadius: '50%', border: '2px dashed #D97706',
                            flexShrink: 0, mt: 0.35,
                          }}
                        />
                        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.45 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Coluna lateral */}
        <Grid item xs={12} md={4}>
          {/* Contexto acadêmico */}
          <Card sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SchoolRoundedIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.95rem' }}>
                  Escopo do projeto
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Linha temática', valor: 'PLN aplicado à triagem de currículos' },
                  { label: 'Métodos', valor: 'TF-IDF, Sentence-Transformers, LLM Embeddings' },
                  { label: 'Idioma', valor: 'Português Brasileiro' },
                  { label: 'Versão da interface', valor: 'v0.1' },
                ].map((item) => (
                  <Box key={item.label}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.83rem', color: 'text.secondary', lineHeight: 1.4 }}>
                      {item.valor}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Stack tecnológica */}
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CodeRoundedIcon sx={{ color: '#0E7490', fontSize: 20 }} />
                <Typography sx={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '0.95rem' }}>
                  Stack tecnológica
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {STACK.map((item) => {
                  const style = CAT_COLORS[item.cat] || { bg: '#F3F4F6', color: '#374151' }
                  return (
                    <Box key={item.label}>
                      <Chip
                        label={item.label}
                        size="small"
                        sx={{
                          bgcolor: style.bg,
                          color: style.color,
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                          height: 24,
                          mb: 0.5,
                        }}
                      />
                    </Box>
                  )
                })}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontStyle: 'italic', lineHeight: 1.6 }}>
                Sem backend real, sem autenticação, sem chamadas HTTP. Todos os dados são processados localmente com arquivos JavaScript.
              </Typography>
            </CardContent>
          </Card>

          {/* Nota de uso */}
          <Paper
            elevation={0}
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: '10px',
              border: '1px dashed #9CA3AF',
              bgcolor: '#FAFAF8',
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.7, fontStyle: 'italic' }}>
              Os números e perfis exibidos acompanham o roteiro metodológico e servem para explorar o comportamento esperado dos métodos; validações quantitativas definitivas aparecem quando o pipeline estiver acoplado ao dataset anotado.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
