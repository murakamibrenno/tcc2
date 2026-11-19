import React, { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Typography } from '@mui/material'
import { carregarTextoCurriculo } from '../utils/textoCurriculo'
import { NotaConferenciaPosterior } from './ConferenciaTop5'

function TextoCurriculo({ id }) {
  const [state, setState] = useState({ loading: true, text: '', error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ loading: true, text: '', error: '' })
    carregarTextoCurriculo(id, import.meta.env.BASE_URL, controller.signal)
      .then(text => {
        if (!controller.signal.aborted) setState({ loading: false, text, error: '' })
      })
      .catch(error => {
        if (!controller.signal.aborted) setState({ loading: false, text: '', error: error.message })
      })
    return () => controller.abort()
  }, [id, attempt])

  if (state.loading) return <Stack direction="row" spacing={1} alignItems="center" role="status"><CircularProgress size={20} /><Typography>Carregando texto completo…</Typography></Stack>
  if (state.error) return <Alert severity="error" action={<Button color="inherit" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</Button>}>{state.error}</Alert>
  return <Typography component="pre" aria-label="Texto completo do currículo" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.7 }}>{state.text}</Typography>
}

export default function DetalheCurriculo({ document, methods, onClose }) {
  return <Dialog open={Boolean(document)} onClose={onClose} aria-labelledby="titulo-curriculo" maxWidth="md" fullWidth>
    <DialogTitle id="titulo-curriculo">{document?.id} — {document?.titulo}</DialogTitle>
    <DialogContent dividers>{document && <>
      <Typography>Referência original: {document.rotulo || 'sem anotação'}. {document.papel} • {document.origem_rotulo}</Typography>
      <NotaConferenciaPosterior id={document.id} />
      <Typography color="text.secondary">Categoria de origem: {document.categoria}. Texto integral: {document.caracteres.toLocaleString('pt-BR')} caracteres.</Typography>
      <TableContainer sx={{ my: 2 }}>
        <Table size="small" aria-label="Escores por representação">
          <TableHead>
            <TableRow>
              <TableCell>Representação</TableCell>
              <TableCell>Cosseno</TableCell>
              <TableCell>Posição na coleção</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{methods.map(method => (
            <TableRow key={method.id}>
              <TableCell>{method.nome}</TableCell>
              <TableCell>{document.scores[method.id].toLocaleString('pt-BR', { minimumFractionDigits: 5, maximumFractionDigits: 5 })}</TableCell>
              <TableCell>{document.posicoes_colecao[method.id]}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6">Texto completo</Typography>
      <Typography variant="body2" color="text.secondary">Texto extraído do PDF. A entrada experimental usou até 8.000 caracteres, com limite adicional de 512 tokens em BGE e Qwen.</Typography>
      <Box mt={2}><TextoCurriculo key={document.id} id={document.id} /></Box>
    </>}</DialogContent>
    <DialogActions><Button onClick={onClose}>Fechar currículo</Button></DialogActions>
  </Dialog>
}
