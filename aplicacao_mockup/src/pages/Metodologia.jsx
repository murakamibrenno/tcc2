import React from 'react'
import {
  Box, Typography, Grid, Card, CardContent,
  Chip, Divider, Paper,
} from '@mui/material'
import DatasetRoundedIcon from '@mui/icons-material/DatasetRounded'
import LabelRoundedIcon from '@mui/icons-material/LabelRounded'
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded'
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded'
import MonitorRoundedIcon from '@mui/icons-material/MonitorRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PendingRoundedIcon from '@mui/icons-material/PendingRounded'
import metricasReais from '../data/metricasReais.json'

const revisao = metricasReais.revisaoAmostra

const ETAPAS = [
  {
    num: 1,
    titulo: 'Coleta dos Currículos',
    descricao: 'Corpus atual: 100 currículos reais em inglês do Resume Dataset. Vinte vieram do piloto e oitenta foram acrescentados da mesma base. A base completa (2.484) fica para depois deste fechamento.',
    icone: <DatasetRoundedIcon />,
    cor: '#0E7490',
    status: 'parcial',
  },
  {
    num: 2,
    titulo: 'Anotação Manual',
    descricao: 'Vinte currículos anotados à mão e oitenta por regra lexical (SQL, REST, Git e linguagem de programação). No total: 3 Adequados, 21 Parcialmente Adequados e 76 Inadequados. Uma amostra dos 80 será conferida à mão; o restante da base não entra neste fechamento.',
    icone: <LabelRoundedIcon />,
    cor: '#7C3AED',
    status: 'parcial',
  },
  {
    num: 3,
    titulo: 'Pré-processamento Textual',
    descricao: 'Extração com PyMuPDF, limpeza e truncamento aplicados aos 100 currículos em inglês. O texto da vaga está no mesmo idioma.',
    icone: <CleaningServicesRoundedIcon />,
    cor: '#D97706',
    status: 'parcial',
  },
  {
    num: 4,
    titulo: 'Vetorização',
    descricao: 'TF-IDF (scikit-learn, unigramas e bigramas), Sentence-Transformers (BAAI/bge-large-en-v1.5) e embeddings extraídos de um LLM generativo (Qwen2.5-0.5B: último hidden state, média dos tokens, 512 tokens, normalização L2). O nome do modelo de cada ranking aparece na tela de Ranking.',
    icone: <AutoAwesomeRoundedIcon />,
    cor: '#059669',
    status: 'concluido',
  },
  {
    num: 5,
    titulo: 'Treinamento dos Modelos',
    descricao: 'Nove combinações (Regressão Logística, SVM e XGBoost sobre as três representações), com validação cruzada estratificada de 5 folds nos 100 currículos. O TF-IDF entra num Pipeline para o vocabulário não vazar entre os folds.',
    icone: <PsychologyRoundedIcon />,
    cor: '#DC2626',
    status: 'concluido',
  },
  {
    num: 6,
    titulo: 'Avaliação Comparativa',
    descricao: 'Classificação: F1 macro, acurácia e ROC-AUC. Ranking: Precision@5, Precision@10, MAP e NDCG@10, mais tempo de vetorização. Os números da tela Comparativo vêm do CSV do pipeline, não de simulação.',
    icone: <AnalyticsRoundedIcon />,
    cor: '#0E7490',
    status: 'concluido',
  },
  {
    num: 7,
    titulo: 'Interface de uso',
    descricao: 'Dashboard, Ranking (3 representações), Comparativo (9 combinações) e Currículos alimentados pelo pipeline Python. Backend contínuo e upload de PDF ficam para a versão completa.',
    icone: <MonitorRoundedIcon />,
    cor: '#7C3AED',
    status: 'concluido',
  },
]

const STATUS_ITEMS = [
  { label: 'Interface funcional', status: 'concluido' },
  { label: 'Ranking por método (TF-IDF, ST, LLM)', status: 'concluido' },
  { label: 'Comparação entre métodos e 9 combinações', status: 'concluido' },
  { label: 'Navegação entre telas', status: 'concluido' },
  { label: 'Gráficos de métricas com dados reais', status: 'concluido' },
  { label: 'Pipeline Python (corpus EN, 100 currículos)', status: 'concluido' },
  { label: 'Rótulos de aderência na base completa (2.484)', status: 'pendente' },
  { label: 'Integração com backend Python (FastAPI)', status: 'pendente' },
  { label: 'Upload de currículos em PDF', status: 'pendente' },
]

export default function Metodologia() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Metodologia
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fluxo metodológico para avaliação comparativa de representações textuais aplicadas à triagem de currículos
        </Typography>
      </Box>

      {/* Linha do tempo */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: '1.1rem',
            mb: 2.5,
            color: 'text.primary',
          }}
        >
          Fluxo das Etapas
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Linha vertical conectora */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 20, sm: 28 },
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: '#E5E7EB',
              zIndex: 0,
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ETAPAS.map((etapa, idx) => (
              <Box
                key={etapa.num}
                sx={{
                  display: 'flex',
                  gap: { xs: 2, sm: 3 },
                  alignItems: 'flex-start',
                  position: 'relative',
                  zIndex: 1,
                  animation: `fadeSlideIn 0.4s ease ${idx * 80}ms both`,
                  '@keyframes fadeSlideIn': {
                    from: { opacity: 0, transform: 'translateX(-12px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
              >
                {/* Ícone/número circular */}
                <Box
                  sx={{
                    width: { xs: 40, sm: 56 },
                    height: { xs: 40, sm: 56 },
                    borderRadius: '50%',
                    bgcolor: etapa.cor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${etapa.cor}40`,
                    zIndex: 2,
                    '& svg': { fontSize: { xs: 18, sm: 24 } },
                  }}
                >
                  {etapa.icone}
                </Box>

                {/* Card da etapa */}
                <Card
                  sx={{
                    flex: 1,
                    borderLeft: `3px solid ${etapa.cor}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: `0 6px 20px ${etapa.cor}20`,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            color: etapa.cor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          Etapa {etapa.num}
                        </Typography>
                      </Box>
                      <Chip
                        label={etapa.status === 'concluido' ? 'Concluído' : etapa.status === 'parcial' ? 'Em progresso' : 'Pendente'}
                        size="small"
                        sx={{
                          bgcolor: etapa.status === 'concluido' ? '#D1FAE5' : etapa.status === 'parcial' ? '#FEF3C7' : '#F3F4F6',
                          color: etapa.status === 'concluido' ? '#065F46' : etapa.status === 'parcial' ? '#92400E' : '#6B7280',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          borderRadius: '5px',
                          height: 20,
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: 'text.primary',
                        mb: 0.5,
                      }}
                    >
                      {etapa.titulo}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.65 }}>
                      {etapa.descricao}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Status de implementação */}
      <Box>
        <Typography
          sx={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: '1.1rem',
            mb: 0.5,
            color: 'text.primary',
          }}
        >
          Estado atual da interface
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.82rem' }}>
          Funcionalidades já cobertas pela interface frente ao pipeline completo planejado na linha do tempo acima
        </Typography>

        {revisao && (
          <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: '10px', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', lineHeight: 1.6 }}>
              Amostra dos rótulos automáticos: {revisao.n_revisados} de {revisao.n_amostra} conferidos
              {revisao.concordancia == null
                ? '. A planilha ainda está em branco — a concordância entra aqui depois da conferência.'
                : `. Concordância com a regra: ${(revisao.concordancia * 100).toFixed(1)}%.`}
            </Typography>
          </Paper>
        )}

        <Grid container spacing={1.5}>
          {STATUS_ITEMS.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: '10px',
                  border: `1px solid ${item.status === 'concluido' ? '#6EE7B7' : item.status === 'parcial' ? '#FCD34D' : '#E5E7EB'}`,
                  bgcolor: item.status === 'concluido' ? '#F0FDF4' : item.status === 'parcial' ? '#FFFBEB' : '#FAFAFA',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                }}
              >
                {item.status === 'concluido' ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 20, color: '#059669', flexShrink: 0 }} />
                ) : (
                  <PendingRoundedIcon sx={{ fontSize: 20, color: item.status === 'parcial' ? '#D97706' : '#9CA3AF', flexShrink: 0 }} />
                )}
                <Typography
                  sx={{
                    fontSize: '0.83rem',
                    fontWeight: item.status === 'concluido' || item.status === 'parcial' ? 600 : 400,
                    color: item.status === 'concluido' ? '#065F46' : item.status === 'parcial' ? '#92400E' : 'text.secondary',
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
