export const vagas = [
  {
    id: 4,
    titulo: 'Piloto — Desenvolvedor de Software (Backend/Web)',
    area: 'Backend',
    empresa: 'TechSolutions Ltd.',
    piloto: true,
    descricao:
      'Vaga de referência do experimento, com rankings reais de TF-IDF, Sentence-Transformers e embeddings de LLM sobre 100 currículos da base archive (em inglês). O profissional desenvolve e mantém web services e componentes de backend, integra bancos de dados relacionais e atua em equipes ágeis. Requisitos calibrados ao vocabulário real dos currículos (Java/Spring, .NET, PHP), e não apenas Python.',
    requisitosObrigatorios: ['SQL (banco relacional)', 'REST / web services', 'Git ou controle de versão', 'Linguagem de programação (Java, Python, PHP, C#/.NET)'],
    requisitosDesejaveis: ['Spring', '.NET', 'Docker', 'Testes automatizados', 'Microservices'],
    pesos: {
      experiencia: 'médio',
      formacao: 'médio',
      competenciasTecnicas: 'alto',
      similaridadeTextual: 'alto',
    },
    nivelExperiencia: 'Júnior a pleno (0–3 anos)',
    modalidade: 'Híbrido',
    totalCandidatos: 20,
  },
]

export const getVagaById = (id) => vagas.find((v) => v.id === id)
