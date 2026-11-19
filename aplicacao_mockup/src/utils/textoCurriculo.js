export async function carregarTextoCurriculo(id, baseUrl, signal) {
  if (!/^\d+$/.test(id)) throw new Error('Identificador de currículo inválido')
  const response = await fetch(`${baseUrl}curriculos/${id}.txt`, { signal, cache: 'no-cache' })
  // SPA hosts can return index.html with HTTP 200 for a missing asset.
  if (!response.ok || !response.headers.get('content-type')?.includes('text/plain')) {
    throw new Error('Não foi possível carregar o texto deste currículo. Tente novamente.')
  }
  const text = await response.text()
  if (!text.trim()) throw new Error('O texto deste currículo está vazio.')
  return text
}
