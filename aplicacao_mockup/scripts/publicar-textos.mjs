import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repository = fileURLToPath(new URL('../../', import.meta.url))

// Validate every source before writing assets used by Vite's static build.
export async function publicarTextos(destination = path.join(repository, 'aplicacao_mockup/public/curriculos')) {
  const manifest = JSON.parse(await readFile(path.join(repository, 'piloto_tfidf/data/validacao_ampliada_v1/manifesto.json'), 'utf8'))
  const snapshot = JSON.parse(await readFile(path.join(repository, 'aplicacao_mockup/src/data/experimentoAtual.json'), 'utf8'))
  const sources = new Map(manifest.registros.filter(row => row.texto_utilizavel).map(row => [row.id, row]))
  if (sources.size !== snapshot.curriculos.length) throw new Error('Coleção de textos diferente do snapshot')

  const texts = []
  for (const document of snapshot.curriculos) {
    const source = sources.get(document.id)
    if (!source || !/^\d+$/.test(document.id)) throw new Error('Documento sem fonte válida')
    const text = (await readFile(path.join(repository, source.fonte_texto), 'utf8')).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
    const hash = createHash('sha256').update(text).digest('hex')
    if (!text.trim() || hash !== source.sha256_texto_utf8_lf) throw new Error(`Texto divergente: ${document.id}`)
    texts.push({ id: document.id, text })
  }

  await mkdir(destination, { recursive: true })
  for (const { id, text } of texts) {
    const filename = path.join(destination, `${id}.txt`)
    await writeFile(`${filename}.tmp`, text, 'utf8')
    await rename(`${filename}.tmp`, filename)
  }
  return texts.length
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Textos integrais publicados: ${await publicarTextos()}`)
}
