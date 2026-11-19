const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')

test('publicação cobre a coleção inteira com textos integrais e hashes do manifesto', async () => {
  const { publicarTextos } = await import('../scripts/publicar-textos.mjs')
  const destination = await fs.mkdtemp(path.join(os.tmpdir(), 'curriculorank-test-'))
  try {
    const total = await publicarTextos(destination)
    const repository = path.resolve(__dirname, '../..')
    const manifest = JSON.parse(await fs.readFile(path.join(repository, 'piloto_tfidf/data/validacao_ampliada_v1/manifesto.json'), 'utf8'))
    const sources = manifest.registros.filter(row => row.texto_utilizavel)
    assert.equal(total, 2483)
    assert.equal((await fs.readdir(destination)).length, total)
    for (const source of sources) {
      const text = await fs.readFile(path.join(destination, `${source.id}.txt`), 'utf8')
      assert.equal(createHash('sha256').update(text).digest('hex'), source.sha256_texto_utf8_lf, source.id)
    }
    assert.ok((await fs.readFile(path.join(destination, '83816738.txt'), 'utf8')).length > 8000)
    await assert.rejects(fs.access(path.join(destination, '12632728.txt')))
  } finally {
    await fs.rm(destination, { recursive: true, force: true })
  }
})

test('carregamento usa a base publicada e recusa fallback HTML, vazios e falhas HTTP', async t => {
  const { carregarTextoCurriculo } = await import('../src/utils/textoCurriculo.js')
  const controller = new AbortController()
  const fullText = 'Texto integral\n' + 'x'.repeat(12000)
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/tcc/curriculos/83816738.txt')
    assert.equal(options.signal, controller.signal)
    return new Response(fullText, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  })
  assert.equal(await carregarTextoCurriculo('83816738', '/tcc/', controller.signal), fullText)
  for (const response of [
    new Response('<html>SPA</html>', { headers: { 'Content-Type': 'text/html' } }),
    new Response('ausente', { status: 404 }),
    new Response('  ', { headers: { 'Content-Type': 'text/plain' } }),
  ]) {
    globalThis.fetch.mock.mockImplementation(async () => response)
    await assert.rejects(carregarTextoCurriculo('83816738', '/tcc/', controller.signal))
  }
  await assert.rejects(carregarTextoCurriculo('../arquivo', '/', controller.signal))
  globalThis.fetch.mock.mockImplementation(async () => { throw new DOMException('Cancelado', 'AbortError') })
  await assert.rejects(carregarTextoCurriculo('83816738', '/', controller.signal), { name: 'AbortError' })
})
