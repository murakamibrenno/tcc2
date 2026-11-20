import React, { useState } from 'react'
import { Alert, Box, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from '@mui/material'
import data from '../data/experimentoAtual.json'
import complementos from '../data/complementosMonografia.json'
import top5 from '../data/revisaoTop5.json'

const format = (value, digits = 3) => value == null ? 'Não aplicável' : value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const methodName = id => data.metodos.find(row => row.id === id)?.nome || id
const classifierName = id => ({ lr: 'Regressão Logística', svm: 'SVM', xgb: 'XGBoost' }[id] || id)
const resources = complementos.recursos_execucao_primaria
const mib = bytes => bytes == null ? null : bytes / (1024 * 1024)

function CompareTable({ label, headers, rows }) {
  return <TableContainer><Table size="small" aria-label={label}><TableHead><TableRow>{headers.map(title => <TableCell key={title}>{title}</TableCell>)}</TableRow></TableHead>
    <TableBody>{rows.map(row => <TableRow key={row.id}>{row.values.map((value, i) => <TableCell key={i}>{value}</TableCell>)}</TableRow>)}</TableBody>
  </Table></TableContainer>
}

export function RankingGuiado() {
  return <>
    <Typography variant="h6" gutterBottom>Objetivo: decidir quais currículos ler primeiro</Typography>
    <Typography mb={2}>O ranking ordena os documentos pela similaridade com a vaga. AP indica se os Adequados aparecem cedo entre os 97 julgados; quanto maior, melhor essa ordenação. O top 5 completo conta quantos dos cinco primeiros documentos da coleção foram considerados Adequados pelo autor.</Typography>
    <CompareTable label="Qualidade do ranking e custo na execução primária" headers={['Representação', 'AP nos 97 (0 a 1)', 'Adequados no top 5 completo', 'Gerar vetores dos 2.483 (s)', 'Consultar e calcular escores (ms)', 'Dispositivo da vetorização']} rows={resources.map(resource => {
      const ranking = data.ranking.representacoes.find(row => row.representacao === resource.representacao)
      const complete = top5.resultados.find(row => row.representacao === resource.representacao)
      return { id: resource.representacao, values: [methodName(resource.representacao), format(ranking.AP_adequado), `${complete.adequados} de ${complete.k}`, format(resource.vetorizacao_s, 2), format(resource.consulta_escores_s * 1000, 2), resource.dispositivo] }
    })} />
    <Typography mt={2}>Nesta execução, TF-IDF teve a maior AP e o menor tempo de geração dos vetores; BGE reuniu mais Adequados no top 5 completo. As duas medidas de qualidade usam universos diferentes e não indicam um vencedor para todas as prioridades.</Typography>
    <Alert severity="info" sx={{ mt: 2 }}>A qualidade foi julgada nos 97 e nas primeiras posições conferidas. Os tempos abrangem a coleção de 2.483. Processar a coleção inteira não significa que todos os seus rótulos foram conferidos.</Alert>
  </>
}

export function classificacaoPara(classificador, condicao) {
  return data.metodos.map(method => data.classificacao.resultados.find(row => row.representacao === method.id && row.classificador === classificador && row.condicao === condicao))
}

export function ClassificacaoGuiada({ classificador, condicao }) {
  const rows = classificacaoPara(classificador, condicao)
  const maxF1 = Math.max(...rows.map(row => row.f1_macro))
  const best = rows.filter(row => Math.abs(row.f1_macro - maxF1) < 1e-12).map(row => methodName(row.representacao)).join(', ')
  return <>
    <Typography variant="h6" gutterBottom>Objetivo: atribuir uma categoria de aderência</Typography>
    <Typography mb={2}>O classificador aprende com os 294 exemplos e prevê Adequado, Parcialmente Adequado ou Inadequado nos 97 casos separados. Compare a mesma regra de classificação nas três representações. F1 macro resume o equilíbrio entre as três categorias; recall de Adequado indica a fração dos quatro casos dessa classe que o modelo recuperou.</Typography>
    <CompareTable label="Qualidade e custo do mesmo classificador nas três representações" headers={['Representação', 'F1 macro (0 a 1)', 'Recall de Adequado (0 a 1)', 'Treinar nos 294 (s)', 'Inferência dos 97 (ms)']} rows={rows.map(row => ({ id: row.representacao, values: [methodName(row.representacao), format(row.f1_macro), format(row.por_classe.Adequado.recall), format(row.fit_s_uma_passagem), format(row.inferencia_s_uma_passagem * 1000, 2)] }))} />
    <Typography mt={2}>Nesta seleção de {classifierName(classificador)} {condicao === 'original' ? 'sem pesos' : 'com pesos balanceados'}, o maior F1 macro observado é {format(maxF1)}, em {best}. Isso descreve os resultados desta seleção e não é uma recomendação validada de contratação.</Typography>
    {rows.every(row => row.por_classe.Adequado.recall === 0) && <Alert severity="warning" sx={{ mt: 2 }}>Nesta seleção, nenhum dos três modelos recuperou os Adequados da referência. Acurácia global pode parecer alta mesmo quando essa classe não é encontrada.</Alert>}
    <Typography variant="body2" mt={2}>Treino e inferência foram medidos em uma passagem, com os vetores já disponíveis. Não incluem o custo de gerar a representação textual. Um caso altera o recall de Adequado em 25 pontos percentuais; os tempos não constituem comparação estatística de desempenho.</Typography>
  </>
}

export function RecursosGuiados() {
  return <>
    <Typography variant="h6" gutterBottom>Objetivo: entender os recursos necessários</Typography>
    <Typography mb={2}>Gerar os vetores é preparar os currículos para o processamento. Depois, os vetores podem ser reutilizados. RAM é a memória do processo durante a execução; memória da GPU é a alocação registrada pelo framework. O arquivo vetorial é o espaço ocupado em disco, uma medida diferente das duas anteriores.</Typography>
    <CompareTable label="Memória e armazenamento das representações na coleção de 2483" headers={['Representação', 'Pico de RAM do processo (MiB)', 'Pico alocado na GPU (MiB)', 'Arquivo vetorial (MiB)', 'Dimensões', 'Formato em disco']} rows={resources.map(row => ({ id: row.representacao, values: [methodName(row.representacao), format(mib(row.pico_rss_bytes), 2), format(mib(row.pico_gpu_alocado_bytes), 2), format(mib(row.arquivo_vetorial_bytes), 2), format(row.dimensoes, 0), row.formato_arquivo] }))} />
    <Typography mt={2}>TF-IDF teve menor pico de RAM observado, mas os arquivos densos ocuparam menos espaço em disco. Seu vocabulário maior não significa que cada vetor armazene todos esses valores: a representação TF-IDF é esparsa, com muitas posições iguais a zero.</Typography>
    <Typography variant="body2" mt={2}>1 MiB = 1.048.576 bytes. RAM é o pico absoluto do processo, amostrado a cada 20 ms; no TF-IDF, mostra-se o maior pico das três repetições. O pico GPU não equivale à VRAM total reservada. Os arquivos usam formatos e compressão distintos, e as medidas não isolam o custo de carregar cada modelo.</Typography>
  </>
}

export default function ComparacaoGuiada() {
  const [view, setView] = useState('ranking')
  const [classifier, setClassifier] = useState('svm')
  const [condition, setCondition] = useState('pesos_balanceados')
  return <Paper variant="outlined" id="comparacao-guiada" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
    <Typography variant="h5" component="h2" gutterBottom>Entenda os resultados: qualidade, tempo e recursos</Typography>
    <Typography color="text.secondary">Escolha o objetivo da triagem. Qualidade responde se o método ajuda na tarefa; custo mostra os recursos usados para executá-la. Esta comparação guiada usa a janela original. A janela equivalente aparece no painel complementar mais abaixo.</Typography>
    <Tabs value={view} onChange={(_, value) => setView(value)} aria-label="Objetivo da comparação guiada" variant="scrollable" scrollButtons="auto" sx={{ mt: 2, mb: 3 }}>
      <Tab value="ranking" id="guia-tab-ranking" aria-controls="guia-panel-ranking" label="Priorizar a leitura" />
      <Tab value="classificacao" id="guia-tab-classificacao" aria-controls="guia-panel-classificacao" label="Classificar aderência" />
      <Tab value="recursos" id="guia-tab-recursos" aria-controls="guia-panel-recursos" label="Examinar recursos" />
    </Tabs>
    <Box role="tabpanel" id={`guia-panel-${view}`} aria-labelledby={`guia-tab-${view}`}>
      {view === 'ranking' && <RankingGuiado />}
      {view === 'classificacao' && <><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 220 }}><InputLabel id="guia-classificador-label">Classificador</InputLabel><Select labelId="guia-classificador-label" value={classifier} label="Classificador" onChange={event => setClassifier(event.target.value)}>{['lr', 'svm', 'xgb'].map(id => <MenuItem key={id} value={id}>{classifierName(id)}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 220 }}><InputLabel id="guia-pesos-label">Condição de pesos</InputLabel><Select labelId="guia-pesos-label" value={condition} label="Condição de pesos" onChange={event => setCondition(event.target.value)}><MenuItem value="original">Sem pesos</MenuItem><MenuItem value="pesos_balanceados">Com pesos balanceados</MenuItem></Select></FormControl>
      </Stack><ClassificacaoGuiada classificador={classifier} condicao={condition} /></>}
      {view === 'recursos' && <RecursosGuiados />}
    </Box>
    <Alert severity="info" sx={{ mt: 3 }}>Medições locais: TF-IDF em CPU, BGE e Qwen em GPU RTX 4060. Geração TF-IDF: mediana de três ajustes; densos: uma passagem após aquecimento, sem download ou carga. Consulta e escores: mediana de dez medições, sem ordenar nem exportar o ranking. Hardware e repetições diferentes impedem afirmar vantagem universal de eficiência.</Alert>
    <Typography variant="body2" mt={2}>Aqui, custo computacional significa tempo, memória e armazenamento; não foram medidos valores financeiros nem consumo de energia. Não há uma nota única de eficiência. A referência assistida, a vaga única e os poucos Adequados limitam o alcance da qualidade observada.</Typography>
    <details style={{ marginTop: 16 }}><summary>Como interpretar as principais medidas</summary><Typography variant="body2" mt={1}>AP: qualidade da ordenação entre os 97 julgados. Top 5 completo: documentos Adequados nas cinco primeiras posições da coleção. F1 macro: média do equilíbrio entre precisão e recall nas três categorias. Recall de Adequado: proporção dos quatro Adequados da referência recuperados pelo classificador. Segundos e milissegundos medem etapas diferentes; 1 segundo corresponde a 1.000 milissegundos.</Typography></details>
  </Paper>
}
