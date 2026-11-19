import React from 'react'
import { Alert, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import revisao from '../data/revisaoTop5.json'

const nomes = { tfidf: 'TF-IDF', bge: 'BGE large', qwen: 'Qwen 0.5B' }
export const conferenciaPosterior = id => revisao.casos.find(caso => caso.id === id)

export function NotaConferenciaPosterior({ id }) {
  const caso = conferenciaPosterior(id)
  return caso ? <Typography variant="body2" sx={{ mt: 1 }}>
    Conferência posterior do top 5: {caso.rotulo_final} ({caso.code}).
    {caso.adjudicacao_assistida ? ' TOP-02 teve adjudicação assistida pela rubrica.' : ' Decisão enviada pelo autor.'}
    {' '}A referência original das métricas foi preservada.
  </Typography> : null
}

export default function ConferenciaTop5({ onOpen }) {
  return <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" gutterBottom>Conferência posterior do top 5 da coleção completa</Typography>
    <Typography>{revisao.procedimento} Foram conferidos 12 documentos distintos, correspondentes a 15 posições.</Typography>
    <TableContainer sx={{ mt: 2 }}><Table size="small" aria-label="P@5 do ranking completo após conferência do autor">
      <TableHead><TableRow><TableCell>Representação</TableCell><TableCell>Adequados / posições</TableCell><TableCell>P@5 completo</TableCell><TableCell>Documentos em ordem do ranking</TableCell></TableRow></TableHead>
      <TableBody>{revisao.resultados.map(r => <TableRow key={r.representacao}>
        <TableCell>{nomes[r.representacao]}</TableCell><TableCell>{r.adequados} / {r.k}</TableCell>
        <TableCell>{r.p_at_5.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
        <TableCell>{r.ids.map((id, i) => <Button key={id} onClick={() => onOpen(id)} aria-haspopup="dialog">{i + 1}. {id}</Button>)}</TableCell>
      </TableRow>)}</TableBody>
    </Table></TableContainer>
    <Alert severity="info" sx={{ my: 2 }}>{revisao.unidade} Um documento altera P@5 em 20 pontos percentuais; estes resultados não estabelecem superioridade geral.</Alert>
    <Typography variant="body2">{revisao.natureza} {revisao.sobreposicao_coorte97.nota}</Typography>
    <Typography variant="subtitle1" sx={{ mt: 2 }}>Decisões e evidências da conferência</Typography>
    {revisao.casos.map(caso => <details key={caso.code}>
      <summary>{caso.code} — {caso.id} — {caso.rotulo_final}</summary>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', my: 1 }}>Evidências enviadas pelo autor: {caso.evidencias_enviadas}</Typography>
      {caso.adjudicacao_assistida && <Alert severity="warning">A decisão enviada era {caso.rotulo_enviado_pelo_autor}; após adjudicação assistida: {caso.rotulo_final}. {caso.adjudicacao_assistida.motivo}</Alert>}
      <Button onClick={() => onOpen(caso.id)} aria-haspopup="dialog">Ver currículo completo {caso.id}</Button>
    </details>)}
  </Paper>
}
