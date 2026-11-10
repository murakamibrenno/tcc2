export const classesAtuais = ['Inadequado', 'Parcialmente Adequado', 'Adequado']
export const chaveConfiguracao = r => `${r.condicao}_${r.representacao}_${r.classificador}`
export function rankingAtual(data, metodo, universo = 'coorte97') {
  if (!data.metodos.some(m => m.id === metodo)) throw new Error('Representação desconhecida')
  const rows = data.curriculos.filter(r => universo === 'colecao2483' || r.coorte97)
  rows.sort((a, b) => universo === 'colecao2483'
    ? a.posicoes_colecao[metodo] - b.posicoes_colecao[metodo]
    : b.scores[metodo] - a.scores[metodo] || a.id.localeCompare(b.id))
  return rows.map((r, i) => ({ ...r, posicao_exibicao: i + 1 }))
}
export function filtrarDocumentos(rows, busca = '', classe = '') {
  const q = busca.trim().toLocaleLowerCase('pt-BR')
  return rows.filter(r => (!q || `${r.id} ${r.titulo} ${r.categoria}`.toLocaleLowerCase('pt-BR').includes(q)) && (!classe || r.rotulo === classe))
}
