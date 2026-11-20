import React from 'react'
import { Alert, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import complementos from '../data/complementosMonografia.json'

const nome = id => ({ tfidf: 'TF-IDF', bge: 'BGE large', qwen: 'Qwen 0.5B' }[id] || id)
const modelo = id => ({ lr: 'Regressão Logística', svm: 'SVM', xgb: 'XGBoost' }[id] || id)
const numero = (value, digits = 3) => value == null ? 'Não calculado' : value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const papel = id => ({ desenvolvimento: 'Desenvolvimento', avaliacao97: 'Avaliação — 97', excluido_desenvolvimento: 'Versão excluída do desenvolvimento' }[id] || id)

export function ConferenciasConsolidadas({ compact = false }) {
  const audit = complementos.conferencias
  const parts = audit.distribuicao_atual
  return <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" gutterBottom>Conferências consolidadas do autor</Typography>
    <Typography>{audit.n_ids_unicos} documentos distintos por identificador: {parts.desenvolvimento294} do desenvolvimento, {parts.avaliacao97} da avaliação e {parts.fora_das_particoes_atuais} versão excluída do desenvolvimento. São {parts.desenvolvimento294 + parts.avaliacao97} documentos das partições atuais; não são {audit.n_ids_unicos} candidatos distintos nem revisão integral dos 97.</Typography>
    <Typography variant="body2" mt={1}>A consolidação elimina {audit.soma_etapas - audit.n_ids_unicos} repetições entre piloto, auditoria e top 5. A referência assistida e as métricas da avaliação primária permanecem preservadas.</Typography>
    {!compact && <details style={{ marginTop: 16 }}><summary>Ver identificadores e etapas da conferência</summary>
      <TableContainer sx={{ maxHeight: 360 }}><Table size="small" stickyHeader aria-label="Conferências do autor sem repetição de identificadores"><TableHead><TableRow><TableCell>Documento</TableCell><TableCell>Partição atual</TableCell><TableCell>Etapas registradas</TableCell></TableRow></TableHead>
        <TableBody>{audit.registros.map(row => <TableRow key={row.id}><TableCell>{row.id}</TableCell><TableCell>{papel(row.particao_atual)}</TableCell><TableCell>{row.fontes.map(f => ({ piloto: 'Piloto', auditoria_primaria: 'Auditoria primária', top5_posterior: 'Top 5 posterior' }[f] || f)).join('; ')}</TableCell></TableRow>)}</TableBody>
      </Table></TableContainer></details>}
    <Typography variant="body2" mt={2}>Conferência assistida do autor, sem revisão humana independente integral. As quantidades consolidadas reúnem etapas distintas; não alteram retroativamente a referência usada para calcular as métricas.</Typography>
  </Paper>
}

export function JanelaEquivalente({ onOpen }) {
  const window = complementos.janela
  return <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" gutterBottom>Análise complementar — janela de leitura equivalente</Typography>
    <Typography>Os três métodos receberam o mesmo trecho inicial de cada um dos {window.n_documentos.toLocaleString('pt-BR')} currículos, verificado para caber em até {window.limite_tokens} tokens nos dois encoders, incluindo tokens especiais. A mediana foi de {numero(window.prefixos.caracteres_prefixo.mediana, 0)} caracteres; {window.prefixos.n_reduzidos.toLocaleString('pt-BR')} entradas foram encurtadas. Mantiveram-se vaga, modelos, parâmetros, {window.n_desenvolvimento} casos de desenvolvimento e {window.n_avaliacao} de avaliação.</Typography>
    <Alert severity="info" sx={{ my: 2 }}>As tabelas abaixo são complementares. Ranking, Comparativo e Interpretabilidade mantêm os resultados primários; a coluna “janela original” se refere a essa execução, e não à condição sem pesos.</Alert>
    <Typography variant="subtitle1" gutterBottom>Recuperação entre os mesmos 97 julgados</Typography>
    <TableContainer><Table size="small" aria-label="Comparação das janelas na recuperação dos 97"><TableHead><TableRow>{['Representação', 'AP original', 'AP equivalente', 'NDCG original', 'NDCG equivalente', 'P@5 original nos 97', 'P@5 equivalente nos 97'].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
      <TableBody>{window.ranking_comparado.map(row => <TableRow key={row.representacao}><TableCell>{nome(row.representacao)}</TableCell>{[row.original.AP_adequado, row.equivalente.AP_adequado, row.original.NDCG_graduado, row.equivalente.NDCG_graduado, row.original['P@5'], row.equivalente['P@5']].map((value, i) => <TableCell key={i}>{numero(value)}</TableCell>)}</TableRow>)}</TableBody>
    </Table></TableContainer>
    <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>Classificação nas dezoito configurações</Typography>
    <TableContainer><Table size="small" aria-label="F1 e recall nas dezoito configurações e duas janelas"><TableHead><TableRow>{['Representação', 'Classificador', 'Condição de pesos', 'F1 macro original', 'F1 macro equivalente', 'Recall Adequado original', 'Recall Adequado equivalente'].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
      <TableBody>{window.classificacao_comparada.map(row => <TableRow key={`${row.condicao}-${row.representacao}-${row.classificador}`}><TableCell>{nome(row.representacao)}</TableCell><TableCell>{modelo(row.classificador)}</TableCell><TableCell>{row.condicao === 'original' ? 'Sem pesos' : 'Pesos balanceados'}</TableCell>{[row.f1_original, row.f1_equivalente, row.recall_A_original, row.recall_A_equivalente].map((value, i) => <TableCell key={i}>{numero(value)}</TableCell>)}</TableRow>)}</TableBody>
    </Table></TableContainer>
    <Typography variant="body2" mt={2}>TF-IDF melhorou no ranking, mas todas as suas configurações tiveram redução de F1 macro. Com XGBoost e pesos, F1 passou de 0,759 para 0,685; Qwen com SVM e pesos manteve 0,785. Melhor ordenação não implicou melhor classificação.</Typography>
    <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>P@5 nas primeiras posições da coleção completa</Typography>
    <TableContainer><Table size="small" aria-label="P@5 completo nas janelas original e equivalente"><TableHead><TableRow><TableCell>Representação</TableCell><TableCell>P@5 completo original</TableCell><TableCell>P@5 completo equivalente</TableCell><TableCell>Top 5 da janela equivalente</TableCell></TableRow></TableHead>
      <TableBody>{window.ranking_comparado.map(row => <TableRow key={row.representacao}><TableCell>{nome(row.representacao)}</TableCell><TableCell>{numero(window.top5_primario.find(r => r.representacao === row.representacao)['P@5'], 2)}</TableCell><TableCell>{numero(row.top5_completo['P@5'], 2)}</TableCell><TableCell>{row.top5_completo.ids.map((id, i) => <Button key={id} onClick={() => onOpen(id)} aria-haspopup="dialog">{i + 1}. {id}</Button>)}</TableCell></TableRow>)}</TableBody>
    </Table></TableContainer>
    <Typography variant="body2" mt={2}>Os novos top 5 estavam integralmente entre os 12 documentos já conferidos pelo autor. Foram reutilizados esses julgamentos, sem inferir novos rótulos. A unidade é documento por posição, sem agrupamento por candidato; duas versões semelhantes continuam ocupando duas posições em BGE. Este P@5 não é o P@5 do subconjunto de 97.</Typography>
    <Alert severity="warning" sx={{ mt: 2 }}>{window.natureza} A referência assistida, os quatro Adequados e a vaga única permanecem. O corte também altera vocabulário, frequências e normalização; não demonstra superioridade geral nem causa isolada. Os tempos dessa rodada não permitem concluir ganho causal de eficiência.</Alert>
  </Paper>
}
