import pilotoTfidf from '../data/pilotoTfidf.json'
import pilotoSt from '../data/pilotoSt.json'
import pilotoLlm from '../data/pilotoLlm.json'
import origemRotulos from '../data/origemRotulos.json'

export const PILOTO_VAGA_ID = 4

export const isVagaPiloto = (vagaId) => vagaId === PILOTO_VAGA_ID

export const REPRESENTACOES = {
  tfidf: { label: 'TF-IDF', key: 'tfidf', cor: '#0E7490' },
  sentenceTransformers: { label: 'Sentence-Transformers', key: 'sentenceTransformers', cor: '#D97706' },
  llmEmbeddings: { label: 'LLM Embeddings', key: 'llmEmbeddings', cor: '#7C3AED' },
}

export const MODELOS = {
  logisticRegression: { label: 'Regressao Logistica', key: 'logisticRegression', cor: '#059669' },
  svm: { label: 'SVM', key: 'svm', cor: '#DC2626' },
  xgboost: { label: 'XGBoost', key: 'xgboost', cor: '#D97706' },
}

export const COMBINACOES = Object.entries(REPRESENTACOES).flatMap(([rKey, rVal]) =>
  Object.entries(MODELOS).map(([mKey, mVal]) => ({
    id: `${rKey}_${mKey}`,
    representacaoKey: rKey,
    modeloKey: mKey,
    representacaoLabel: rVal.label,
    modeloLabel: mVal.label,
    label: `${rVal.label} + ${mVal.label}`,
    labelCurto: `${rKey === 'tfidf' ? 'TF-IDF' : rKey === 'sentenceTransformers' ? 'ST' : 'LLM'} + ${mKey === 'logisticRegression' ? 'LR' : mKey === 'svm' ? 'SVM' : 'XGB'}`,
  }))
)

const PILOTO_FONTES = {
  tfidf: { dados: pilotoTfidf, scoreKey: 'scoreTfidf' },
  sentenceTransformers: { dados: pilotoSt, scoreKey: 'scoreSt' },
  llmEmbeddings: { dados: pilotoLlm, scoreKey: 'scoreLlm' },
}

export const getAderencia = (score) => {
  if (score >= 0.8) return { label: 'Alta aderencia', cor: 'success', hex: '#059669' }
  if (score >= 0.6) return { label: 'Media aderencia', cor: 'warning', hex: '#D97706' }
  return { label: 'Baixa aderencia', cor: 'error', hex: '#DC2626' }
}

export const getAderenciaPiloto = (candidato) => {
  switch (candidato.classificacaoManual) {
    case 'Adequado': return { label: 'Alta aderencia', cor: 'success', hex: '#059669' }
    case 'Parcialmente Adequado': return { label: 'Media aderencia', cor: 'warning', hex: '#D97706' }
    default: return { label: 'Baixa aderencia', cor: 'error', hex: '#DC2626' }
  }
}

const PILOTO_RELEVANTES = new Set(['Adequado', 'Parcialmente Adequado'])

const marcarInversoes = (candidatos) => {
  const ultima = candidatos.filter((c) => PILOTO_RELEVANTES.has(c.classificacaoManual)).reduce((m, c) => Math.max(m, c.posicao), 0)
  return candidatos.map((c) => ({ ...c, inversaoRanking: !PILOTO_RELEVANTES.has(c.classificacaoManual) && c.posicao < ultima }))
}

export const getRankingPiloto = (representacao = 'tfidf') => {
  const fonte = PILOTO_FONTES[representacao] || PILOTO_FONTES.tfidf
  const scoreKey = fonte.scoreKey
  const candidatos = [...fonte.dados.candidatos]
    .sort((a, b) => (b[scoreKey] ?? 0) - (a[scoreKey] ?? 0))
    .map((c, idx) => ({ ...c, ...origemRotulos[String(c.id)], posicao: idx + 1, scoreFinal: c[scoreKey] ?? null, representacaoAtiva: representacao, totalCurriculos: fonte.dados.candidatos.length }))
  return marcarInversoes(candidatos)
}

export const getPilotoMeta = (representacao = 'tfidf') => {
  const fonte = PILOTO_FONTES[representacao] || PILOTO_FONTES.tfidf
  return fonte.dados.meta
}

export const getPilotoVaga = () => pilotoTfidf.vaga

export const getCurriculosPiloto = (representacao = 'tfidf') => getRankingPiloto(representacao)

export const getRankingParaVaga = (vagaId, representacao = 'tfidf') => {
  if (isVagaPiloto(vagaId)) return getRankingPiloto(representacao)
  return []
}

export const getTop5Candidatos = (representacao = 'tfidf') => getRankingPiloto(representacao).slice(0, 5)

export const getClassificacaoColor = (classificacao) => {
  switch (classificacao) {
    case 'Adequado': return { cor: 'success', hex: '#059669', bg: '#D1FAE5' }
    case 'Parcialmente Adequado': return { cor: 'warning', hex: '#D97706', bg: '#FEF3C7' }
    case 'Inadequado': return { cor: 'error', hex: '#DC2626', bg: '#FEE2E2' }
    default: return { cor: 'default', hex: '#6B7280', bg: '#F3F4F6' }
  }
}

export const pilotoRepresentacaoDisponivel = (representacao) => {
  const fonte = PILOTO_FONTES[representacao]
  return fonte && fonte.dados?.candidatos?.length > 0
}


export const getOrigemRotulo = (candidato) => {
  const origem = origemRotulos[String(candidato.id)] ?? candidato
  const label = origem.anotacaoAutomatica === true ? 'Rótulo automático'
    : origem.anotacaoAutomatica === false ? 'Anotação humana (piloto)' : 'Rótulo de referência'
  return origem.revisaoPendente ? `${label} · revisão pendente` : label
}

export const getScoreAtivo = (candidato, representacao = candidato.representacaoAtiva ?? 'tfidf') => {
  const key = PILOTO_FONTES[representacao]?.scoreKey
  return key && Number.isFinite(candidato[key]) ? candidato[key]
    : candidato.representacaoAtiva === representacao ? candidato.scoreFinal : undefined
}

export const getMensagemInversao = (candidato, representacao = candidato.representacaoAtiva ?? 'tfidf') =>
  `Este perfil, rotulado como Inadequado, aparece antes de referências relevantes no ranking de ${REPRESENTACOES[representacao]?.label ?? representacao}. É uma inversão na ordenação, não uma predição de classe pelo classificador.`
