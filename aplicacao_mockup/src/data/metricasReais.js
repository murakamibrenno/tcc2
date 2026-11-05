import metricasReaisJson from './metricasReais.json'
import corpusMeta from './corpusMeta.json'
import { combinacoes as combinacoesMock } from './metricasMock'

/** Combinações 9x9 reais quando existirem; senão mock (legacy). */
export const combinacoesReais = metricasReaisJson.combinacoes9?.length
  ? metricasReaisJson.combinacoes9
  : null

export const combinacoes = combinacoesReais ?? combinacoesMock

export const rankingReais = metricasReaisJson.ranking ?? []

export const temDadosReais = Boolean(combinacoesReais?.length)

const CORES_REP = {
  'TF-IDF': '#0E7490',
  'Sentence-Transformers': '#D97706',
  'LLM Embeddings': '#7C3AED',
}

export const dadosDashboardReais = temDadosReais
  ? (() => {
      const melhor = combinacoes.reduce((a, b) => (b.f1Score > a.f1Score ? b : a))
      return {
        totalCurriculos: corpusMeta?.total ?? 20,
        vagasCadastradas: 1,
        curriculosAdequados: corpusMeta?.distribuicao?.Adequado ?? 3,
        melhorF1: melhor.f1Score,
        melhorMetodo: `${melhor.representacao} + ${melhor.modelo}`,
        representacoesAtivas: 3,
      }
    })()
  : null

/** Melhor F1 por representação (gráfico resumido no Dashboard). */
export const dadosGraficoF1Reais = temDadosReais
  ? ['TF-IDF', 'Sentence-Transformers', 'LLM Embeddings'].map((rep) => {
      const best = combinacoes
        .filter((c) => c.representacao === rep)
        .reduce((a, b) => (b.f1Score > a.f1Score ? b : a))
      return { nome: rep, valor: best.f1Score, F1: best.f1Score, cor: CORES_REP[rep] }
    })
  : null

/** Tempo de vetorização por representação (ranking). */
export const dadosGraficoTempoReais = temDadosReais
  ? (metricasReaisJson.ranking ?? []).map((r) => ({
      nome: r.metodo,
      valor: r.tempo_vetorizacao_seg,
      cor: CORES_REP[r.metodo] ?? '#64748B',
    }))
  : null

export default metricasReaisJson
