import React from 'react'
import { Box, TableCell, Tooltip, Typography } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export const COLUNAS = {
  posicao: {
    titulo: 'Posição na fila',
    texto: 'Lugar do currículo depois de ordenar pela similaridade com a vaga. A posição 1 é o primeiro nome que seria lido. Uma posição menor significa que a representação considerou aquele texto mais próximo da vaga.',
  },
  candidato: {
    titulo: 'Candidato',
    texto: 'Nome ou título extraído do currículo. O identificador numérico é o da base pública, para distinguir pessoas com o mesmo cargo.',
  },
  curriculo: {
    titulo: 'Currículo',
    texto: 'Título profissional lido no início do documento. Dois currículos podem ter o mesmo título; o número embaixo é o identificador da base.',
  },
  area: {
    titulo: 'Área de origem',
    texto: 'Categoria profissional da base de onde o currículo foi retirado, como tecnologia, vendas ou educação. Essa pasta não é o rótulo de aderência à vaga.',
  },
  categoria: {
    titulo: 'Categoria de origem',
    texto: 'Pasta da base pública em que o arquivo estava. Serve para saber a profissão de origem. A aderência à vaga de desenvolvedor é outra coluna.',
  },
  classificacao: {
    titulo: 'Classificação de aderência',
    texto: 'Rótulo de quão bem o currículo atende a vaga de desenvolvedor backend: Adequado, Parcialmente Adequado ou Inadequado. Vinte rótulos foram lidos à mão. Os demais seguem a regra de SQL, REST, Git e linguagem de programação.',
  },
  rotulo: {
    titulo: 'Rótulo de aderência',
    texto: 'Adequado atende os quatro requisitos e tem perfil de desenvolvimento. Parcialmente Adequado atende dois ou três, ou é tecnologia genérica. Inadequado atende no máximo um, ou é outra profissão.',
  },
  similaridade: {
    titulo: 'Similaridade de cosseno',
    texto: 'Proximidade entre o vetor da vaga e o vetor do currículo, entre -1 e 1; no TF-IDF não negativo, entre 0 e 1. Quanto maior, mais a representação aproximou os dois textos. No TF-IDF os valores ficam baixos porque os vetores são esparsos. No Qwen ficam altos e comprimidos, então a ordem importa mais do que o valor absoluto.',
  },
  aderencia: {
    titulo: 'Faixa de aderência',
    texto: 'Leitura visual do rótulo ou da nota. Verde é Adequado, âmbar é Parcialmente Adequado, vermelho é Inadequado. A faixa resume a coluna de classificação; não é uma métrica nova.',
  },
  acoes: {
    titulo: 'Ações',
    texto: 'Abre o texto do currículo ou o detalhe das notas. Não altera o ranking nem a classificação.',
  },
  p5: {
    titulo: 'Precision@5',
    texto: 'Dos 5 primeiros currículos da fila, a fração que é Adequado ou Parcialmente Adequado. 1,00 significa que os cinco primeiros valem pelo menos uma leitura parcial. 0,60 significa que três dos cinco servem e dois não.',
  },
  p10: {
    titulo: 'Precision@10',
    texto: 'A mesma conta do Precision@5, agora nos 10 primeiros. Mede a precisão de uma leitura inicial um pouco mais longa.',
  },
  map: {
    titulo: 'AP da vaga',
    texto: 'Average Precision desta única vaga, calculada só com os currículos Adequados. O arquivo histórico usa o nome MAP. Vale 1,00 quando os três Adequados ocupam as três primeiras posições, sem nenhum Inadequado ou Parcial na frente deles.',
  },
  ndcg: {
    titulo: 'NDCG@10',
    texto: 'Normalized Discounted Cumulative Gain nos dez primeiros. Adequado pesa mais do que Parcialmente Adequado, e os primeiros lugares pesam mais do que o décimo. 1,00 seria a ordem ideal.',
  },
  ndcgCurto: {
    titulo: 'NDCG',
    texto: 'Versão do NDCG@10 associada à representação: qualidade da fila nos dez primeiros, com mais peso para Adequado e para o topo. Não é uma métrica do classificador.',
  },
  tempo: {
    titulo: 'Tempo de vetorização',
    texto: 'Segundos em processo Python novo: carga do modelo (nos densos), vetorização da vaga de referência e dos 100 currículos (truncamento 8.000) e cálculo do cosseno vaga × currículos. Não inclui treino do classificador.',
  },
  representacao: {
    titulo: 'Representação textual',
    texto: 'Forma de transformar o currículo e a vaga em números. TF-IDF conta palavras. Sentence-Transformers usa um modelo treinado para aproximar textos de mesmo sentido. LLM Embeddings tira a média do último estado oculto do Qwen2.5-0.5B, um modelo generativo que não foi treinado para busca.',
  },
  modelo: {
    titulo: 'Classificador',
    texto: 'Modelo que recebe o vetor e tenta prever Adequado, Parcialmente Adequado ou Inadequado. São regressão logística, SVM linear e XGBoost. O vetor permanece congelado: o classificador não retreina a representação.',
  },
  f1: {
    titulo: 'F1 macro',
    texto: 'Média do F1 das três classes, com o mesmo peso para cada uma. Por isso a classe Adequado, que tem só 3 currículos, puxa o número para baixo quando o modelo não a encontra. Validação cruzada de 5 partes nos 100 currículos.',
  },
  acuracia: {
    titulo: 'Acurácia',
    texto: 'Fração de currículos em que a classe prevista coincide com o rótulo. Com 76 Inadequados em 100, um modelo que sempre diz Inadequado já acerta cerca de 76%. Por isso a acurácia sozinha não mostra se os Adequados foram encontrados.',
  },
  roc: {
    titulo: 'ROC-AUC',
    texto: 'Área sob a curva ROC, no esquema um-contra-os-restos, em média entre as classes. Mede se o modelo separa as classes ao variar o limiar, mesmo quando o F1 da classe rara fica baixo. 0,50 é o acaso. 1,00 é a separação perfeita.',
  },
  precisao: {
    titulo: 'Precisão',
    texto: 'Entre os currículos que o modelo marcou com uma classe, quantos realmente pertenciam a ela. Na tabela completa, quando o valor não foi exportado para aquela combinação, a célula fica vazia.',
  },
  recall: {
    titulo: 'Recall',
    texto: 'Entre os currículos que de fato são de uma classe, quantos o modelo encontrou. Recall alto de Adequado significa que os poucos perfis bons não ficaram de fora.',
  },
  pk: {
    titulo: 'Precision@k',
    texto: 'Precisão nos primeiros lugares da fila daquela representação. Na comparação das nove combinações, o valor acompanha o ranking da representação, não um ranking novo do classificador.',
  },
  tvetor: {
    titulo: 'Tempo de vetorização',
    texto: 'Segundos no protocolo publicado: carga do modelo (densos), vaga, 100 currículos (8.000 caracteres) e cosseno. Mesmo valor dos cartões por representação.',
  },
  ttreino: {
    titulo: 'Tempo de treino',
    texto: 'Soma do tempo de fit nas cinco partes da validação cruzada estratificada. No TF-IDF o vocabulário é ajustado em cada parte; nos densos o vetor já estava em cache.',
  },
  tinfer: {
    titulo: 'Tempo de inferência',
    texto: 'Soma do predict e predict_proba nas cinco partes da validação cruzada, sobre os currículos de cada parte de teste.',
  },
  memoria: {
    titulo: 'Memória (RSS)',
    texto: 'Legado: pico de RSS durante o fit na CV. Na tabela de ajuste use o acréscimo (memoriaAjuste).',
  },
  memoriaAjuste: {
    titulo: 'Acréscimo de RSS no ajuste',
    texto: 'Aumento máximo do RSS do processo Python durante o fit em cada fold da validação cruzada (5 partes), em MiB. Não é o tamanho total do processo nem o peso do modelo de embedding já carregado.',
  },
  memvet: {
    titulo: 'Acréscimo de RSS na vetorização',
    texto: 'Aumento do RSS (pico menos RSS medido após importar as bibliotecas, antes de carregar o modelo de embedding), em MiB, no mesmo roteiro do tempo: carga (densos), vaga, 100 currículos, cosseno. Cada representação em processo separado.',
  },
  interpretabilidade: {
    titulo: 'Interpretabilidade',
    texto: 'O quanto dá para explicar a nota olhando o próprio vetor. No TF-IDF cada dimensão é uma palavra, então a nota se inspeciona. Nos embeddings densos a dimensão não tem um termo correspondente, então a explicação depende de exemplos e da posição na fila.',
  },
  tfidf: {
    titulo: 'Posição no TF-IDF',
    texto: 'Lugar desse currículo na fila feita por contagem de palavras (unigramas e bigramas) e similaridade de cosseno. Uma posição alta com rótulo Inadequado indica uma possível inversão no ranking, a investigar pela leitura do documento e pela validade do rótulo.',
  },
  st: {
    titulo: 'Posição no Sentence-Transformers',
    texto: 'Lugar na fila do BAAI/bge-large-en-v1.5, modelo treinado para aproximar textos de mesmo sentido. A posição 1 é o currículo que esse modelo colocaria primeiro na leitura.',
  },
  qwen: {
    titulo: 'Posição no Qwen',
    texto: 'Lugar na fila dos embeddings extraídos do Qwen2.5-0.5B: média do último estado oculto, 512 tokens, normalização L2. Não é um modelo treinado para busca. As notas ficam próximas umas das outras, então a posição informa mais do que o cosseno isolado.',
  },
}

export function RotuloMetrica({ id, children }) {
  const info = COLUNAS[id]
  const rotulo = children ?? info?.titulo ?? id
  const marca = (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, cursor: info ? 'help' : 'inherit' }}>
      <span>{rotulo}</span>
      {info && <InfoOutlinedIcon sx={{ fontSize: 14, color: '#0E7490', flexShrink: 0 }} />}
    </Box>
  )
  if (!info) return marca
  return (
    <Tooltip
      arrow
      placement="top"
      enterDelay={250}
      title={(
        <Box sx={{ p: 0.25, maxWidth: 340 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', mb: 0.5 }}>{info.titulo}</Typography>
          <Typography sx={{ fontSize: '0.74rem', lineHeight: 1.55 }}>{info.texto}</Typography>
        </Box>
      )}
    >
      {marca}
    </Tooltip>
  )
}

export default function CabecalhoMetrica({ id, children, align = 'left', sx }) {
  return (
    <TableCell align={align} sx={{ fontWeight: 700, ...sx }}>
      <RotuloMetrica id={id}>{children}</RotuloMetrica>
    </TableCell>
  )
}
