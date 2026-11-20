const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const read = relative => JSON.parse(fs.readFileSync(path.resolve(__dirname, relative), 'utf8'))
const ui = read('../src/data/complementosMonografia.json')
const primary = read('../src/data/experimentoAtual.json')

test('recursos publicados preservam unidades, etapas e medições originais', () => {
  assert.equal(ui.recursos_execucao_primaria.length, 3)
  for (const row of ui.recursos_execucao_primaria) {
    const source = read(`../../piloto_tfidf/output/escala_v1/${row.representacao}_medicao.json`)
    assert.equal(row.n_documentos, 2483)
    assert.equal(row.arquivo_vetorial_bytes, source.vetores_bytes_disco)
    assert.equal(row.dimensoes, source.dimensoes[1])
    assert.equal(row.consulta_escores_s, source.consulta_e_escores_mediana_s)
    const published = primary.metodos.find(r => r.id === row.representacao)
    assert.equal(row.vetorizacao_s, published.vetorizacao_segundos)
    if (row.representacao === 'tfidf') {
      assert.equal(row.repeticoes_vetorizacao, 3)
      assert.equal(row.pico_rss_bytes, Math.max(...source.ajuste_vetorizacao_repeticoes.map(r => r.pico_rss_bytes_amostrado)))
      assert.equal(row.pico_gpu_alocado_bytes, null)
    } else {
      assert.equal(row.repeticoes_vetorizacao, 1)
      assert.equal(row.pico_rss_bytes, source.vetorizacao_sem_carregamento.pico_rss_bytes_amostrado)
      assert.equal(row.pico_gpu_alocado_bytes, source.pico_gpu_alocado_bytes)
    }
  }
  const tf = ui.recursos_execucao_primaria.find(r => r.representacao === 'tfidf')
  assert.equal((tf.pico_rss_bytes / (1024 * 1024)).toFixed(3), '377.879')
  assert.equal((tf.arquivo_vetorial_bytes / (1024 * 1024)).toFixed(3), '15.249')
})

test('guia compara a mesma configuração e explica custos sem fabricar eficiência única', async () => {
  const { createServer } = await import('vite')
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const components = await server.ssrLoadModule('/src/components/ComparacaoGuiada.jsx')
    const React = require('react')
    const { renderToString } = require('react-dom/server')
    const render = (component, props = {}) => renderToString(React.createElement(component, props)).replace(/<!--.*?-->/g, '')
    for (const model of ['lr', 'svm', 'xgb']) for (const condition of ['original', 'pesos_balanceados']) {
      const rows = components.classificacaoPara(model, condition)
      assert.equal(rows.length, 3)
      assert.ok(rows.every(row => row.classificador === model && row.condicao === condition))
      assert.equal(new Set(rows.map(row => row.representacao)).size, 3)
    }
    const ranking = render(components.RankingGuiado)
    for (const expected of ['0,635', '3 de 5', '4 de 5', '4,46', '121,82', '150,41', '12,49', '23,76', '35,06', 'universos diferentes']) assert.ok(ranking.includes(expected), expected)
    const classification = render(components.ClassificacaoGuiada, { classificador: 'svm', condicao: 'pesos_balanceados' })
    for (const expected of ['0,785', '0,544', '0,713', '294', '97', 'não incluem o custo de gerar']) assert.ok(classification.toLowerCase().includes(expected.toLowerCase()), expected)
    const noWeights = render(components.ClassificacaoGuiada, { classificador: 'svm', condicao: 'original' })
    assert.ok(noWeights.includes('nenhum dos três modelos recuperou os Adequados'))
    const resources = render(components.RecursosGuiados)
    for (const expected of ['377,88', '1.297,37', '3.335,63', '1.384,74', '2.091,71', 'NPZ esparso comprimido', 'Não aplicável', 'medidas não isolam']) assert.ok(resources.includes(expected), expected)
    const guide = render(components.default)
    for (const expected of ['Priorizar a leitura', 'Classificar aderência', 'Examinar recursos', 'janela original', 'Hardware e repetições diferentes', 'não foram medidos valores financeiros', 'Não há uma nota única de eficiência']) assert.ok(guide.includes(expected), expected)
  } finally { await server.close() }
})
