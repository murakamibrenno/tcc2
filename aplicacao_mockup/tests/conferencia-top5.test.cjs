const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const read = name => JSON.parse(fs.readFileSync(path.resolve(__dirname, name), 'utf8'))
const report = read('../src/data/revisaoTop5.json')
const data = read('../src/data/experimentoAtual.json')

test('P@5 complementar corresponde às posições da coleção e não altera a referência primária', () => {
  assert.deepEqual(report, read('../../piloto_tfidf/validation/conferencia_top5_autor_v1.json'))
  for (const [original, saved] of Object.entries({
    'mapa_revisao_humana_top5.json': 'top5_mapa_formulario_v1.json',
    'decisoes_top5_recebidas.json': 'top5_formulario_devolvido_v1.json',
    'adjudicacao_top5_final.json': 'top5_adjudicacao_assistida_v1.json',
  })) {
    const raw = fs.readFileSync(path.resolve(__dirname, '../../piloto_tfidf/validation', saved))
    assert.equal(createHash('sha256').update(raw).digest('hex'), report.fontes_sha256[original])
  }
  assert.equal(new Set(report.casos.map(r => r.id)).size, 12)
  assert.equal(report.resultados.reduce((sum, r) => sum + r.ids.length, 0), 15)
  for (const r of report.resultados) {
    const original = [...data.curriculos].sort((a, b) => a.posicoes_colecao[r.representacao] - b.posicoes_colecao[r.representacao]).slice(0, 5)
    assert.deepEqual(r.ids, original.map(row => row.id))
    const positives = r.ids.filter(id => report.casos.find(c => c.id === id).rotulo_final === 'Adequado').length
    assert.equal(r.adequados, positives)
    assert.equal(r.p_at_5, positives / 5)
  }
  assert.deepEqual(report.resultados.map(r => r.p_at_5), [0.6, 0.8, 0.6])
  const overlap = report.casos.filter(r => data.curriculos.find(c => c.id === r.id).coorte97)
  assert.deepEqual(overlap.map(r => r.id).sort(), ['43311839', '62994611'])
  assert.ok(overlap.every(r => r.rotulo_final === data.curriculos.find(c => c.id === r.id).rotulo))
  assert.equal(report.casos.find(r => r.code === 'TOP-02').rotulo_final, 'Parcialmente Adequado')
  assert.equal(report.casos.find(r => r.code === 'TOP-02').rotulo_enviado_pelo_autor, 'Adequado')
  const cohort = read('../../piloto_tfidf/data/coorte_97_v1/manifesto.json')
  assert.equal(cohort.n_ratificacoes_humanas_assistidas, 5)
  assert.equal(cohort.n_ia_sem_conferencia, 92)
  assert.deepEqual(data.classificacao, read('../../piloto_tfidf/output/coorte97_v1/classificacao_coorte97.json'))
})

test('Resultados distingue P@5 completo, subconjunto e adjudicação assistida', async () => {
  const { createServer } = await import('vite')
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { ResultadosAtuais } = await server.ssrLoadModule('/src/pages/ExperimentoAtual.jsx')
    const React = require('react')
    const { renderToString } = require('react-dom/server')
    const html = renderToString(React.createElement(ResultadosAtuais)).replace(/<!--.*?-->/g, '')
    for (const expected of ['Ranking dentro do conjunto julgado', 'P@5 completo', '0,80', 'TOP-02', 'adjudicação assistida', '43311839', 'demais 91']) assert.ok(html.includes(expected), expected)
    assert.ok(html.includes('Ver currículo completo 43311839'))
  } finally { await server.close() }
})
