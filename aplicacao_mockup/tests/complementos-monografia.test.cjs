const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const read = relative => JSON.parse(fs.readFileSync(path.resolve(__dirname, relative), 'utf8'))
const exported = read('../src/data/complementosMonografia.json')
const primary = read('../src/data/experimentoAtual.json')

test('complementos publicados reproduzem fontes e conferências sem duplicar IDs', () => {
  for (const source of Object.values(exported.fontes)) {
    const raw = fs.readFileSync(path.resolve(__dirname, '../..', source.caminho), 'utf8').replace(/\r\n/g, '\n')
    assert.equal(createHash('sha256').update(raw).digest('hex'), source.sha256_utf8_lf)
  }
  const original = read('../../piloto_tfidf/validation/conferencias_autor_consolidadas_v1.json')
  const a = exported.conferencias
  for (const [key, value] of Object.entries(a)) assert.deepEqual(value, original[key])
  assert.equal(a.n_ids_unicos, 72)
  assert.equal(new Set(a.registros.map(r => r.id)).size, 72)
  assert.deepEqual(a.distribuicao_atual, { desenvolvimento294: 65, avaliacao97: 6, fora_das_particoes_atuais: 1 })
  assert.ok(a.registros.every(r => r.independente === false))
  assert.equal(a.soma_etapas - a.n_ids_unicos, 5)
  assert.equal(a.registros.filter(r => r.particao_atual === 'avaliacao97').length, 6)
  // O snapshot primário não recebe novas anotações nem novas métricas.
  assert.equal(primary.classificacao.protocolo.proveniencia.IA_com_ratificacao_assistida, 5)
  assert.deepEqual(primary.classificacao, read('../../piloto_tfidf/output/coorte97_v1/classificacao_coorte97.json'))
})

test('janela equivalente mantém as duas tarefas e unidades de P@5 separadas', () => {
  const source = read('../../piloto_tfidf/output/janela_equivalente_v1/comparacao_original_equivalente.json')
  const j = exported.janela
  assert.deepEqual(j.ranking_comparado, source.ranking_comparado)
  assert.deepEqual(j.classificacao_comparada, source.classificacao_comparada)
  assert.deepEqual([j.n_documentos, j.n_desenvolvimento, j.n_avaliacao, j.limite_tokens], [2483, 294, 97, 512])
  assert.equal(j.classificacao_comparada.length, 18)
  assert.equal(j.prefixos.caracteres_prefixo.mediana, 2589)
  for (const row of j.ranking_comparado) {
    const refs = read('../src/data/revisaoTop5.json').casos
    assert.equal(row.top5_completo.n_com_revisao_posterior_disponivel, 5)
    assert.equal(row.top5_completo['P@5'], row.top5_completo.ids.filter(id => refs.find(r => r.id === id)?.rotulo_final === 'Adequado').length / 5)
    assert.deepEqual(row.original, Object.fromEntries(Object.keys(row.original).map(k => [k, primary.ranking.representacoes.find(r => r.representacao === row.representacao)[k]])))
  }
  const tfidf = j.ranking_comparado.find(r => r.representacao === 'tfidf')
  assert.equal(tfidf.equivalente['P@5'], 0.6)
  assert.equal(tfidf.top5_completo['P@5'], 0.8)
  const worst = j.classificacao_comparada.find(r => r.representacao === 'qwen' && r.classificador === 'xgb' && r.condicao === 'pesos_balanceados')
  assert.ok(worst.f1_equivalente < worst.f1_original)
})

test('Dashboard, Metodologia e Resultados expõem o mesmo escopo da monografia', async () => {
  const { createServer } = await import('vite')
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const pages = await server.ssrLoadModule('/src/pages/ExperimentoAtual.jsx')
    const React = require('react')
    const { renderToString } = require('react-dom/server')
    const { MemoryRouter } = require('react-router-dom')
    const render = Component => renderToString(React.createElement(MemoryRouter, null, React.createElement(Component))).replace(/<!--.*?-->/g, '')
    const dashboard = render(pages.DashboardAtual)
    const method = render(pages.MetodologiaAtual)
    const results = render(pages.ResultadosAtuais)
    for (const html of [dashboard, method]) for (const expected of ['72 documentos distintos', '65 do desenvolvimento', '6 da avaliação', '1 versão excluída', '71 documentos das partições atuais']) assert.ok(html.includes(expected), expected)
    for (const expected of ['janela de leitura equivalente', 'Recuperação entre os mesmos 97 julgados', 'P@5 nas primeiras posições da coleção completa', '0,741', '0,685', '0,785', 'não é teste independente novo', 'Ver currículo completo 43311839']) assert.ok(results.includes(expected), expected)
    assert.ok(results.includes('F1 e recall nas dezoito configurações e duas janelas'))
    assert.ok(method.includes('Ranking, Comparativo e Interpretabilidade preservam os resultados primários'))
  } finally { await server.close() }
})
