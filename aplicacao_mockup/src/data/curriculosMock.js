export const curriculos = [
  {
    id: 1,
    nome: 'Ana Souza',
    cargoAtual: 'Desenvolvedora Backend Júnior',
    formacao: 'Tecnologia em Análise e Desenvolvimento de Sistemas',
    experienciaAnos: 2,
    area: 'Backend',
    resumo:
      'Profissional com 2 anos de experiência em desenvolvimento de APIs REST utilizando Python, FastAPI, SQL e Git. Atuou em projetos de e-commerce e fintech, com foco em integração de sistemas e manutenção de microserviços.',
    competencias: ['Python', 'FastAPI', 'SQL', 'Git', 'Docker', 'PostgreSQL'],
    experiencias: [
      { cargo: 'Desenvolvedora Backend Jr.', empresa: 'FinTech Start', periodo: '2023–2025' },
      { cargo: 'Estagiária de TI', empresa: 'DataSystems Ltda.', periodo: '2022–2023' },
    ],
    classificacaoManual: 'Adequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.74, svm: 0.78, xgboost: 0.81 },
      sentenceTransformers: { logisticRegression: 0.87, svm: 0.91, xgboost: 0.93 },
      llmEmbeddings: { logisticRegression: 0.89, svm: 0.93, xgboost: 0.95 },
    },
    justificativas: {
      tfidf: 'O método TF-IDF identificou alta ocorrência de termos diretamente relacionados à vaga, como Python, SQL e API REST.',
      sentenceTransformers: 'O modelo semântico identificou proximidade entre a experiência da candidata e os requisitos da vaga, mesmo quando descritos com termos diferentes.',
      llmEmbeddings: 'Os embeddings de LLM capturaram aderência mais ampla entre responsabilidades, tecnologias e contexto profissional, destacando alinhamento com desenvolvimento de APIs.',
    },
  },
  {
    id: 2,
    nome: 'Bruno Martins',
    cargoAtual: 'Analista de Dados',
    formacao: 'Bacharelado em Ciência da Computação',
    experienciaAnos: 1,
    area: 'Dados',
    resumo:
      'Analista com 1 ano de experiência em tratamento e análise de dados usando Python e SQL. Experiência com Power BI para construção de dashboards gerenciais e relatórios executivos.',
    competencias: ['Python', 'SQL', 'Power BI', 'Excel', 'Pandas', 'Matplotlib'],
    experiencias: [
      { cargo: 'Analista de Dados Jr.', empresa: 'ConsultaTech', periodo: '2024–2025' },
      { cargo: 'Estagiário de BI', empresa: 'MegaVarejo S.A.', periodo: '2023–2024' },
    ],
    classificacaoManual: 'Adequado',
    vagaReferencia: 2,
    scores: {
      tfidf: { logisticRegression: 0.78, svm: 0.82, xgboost: 0.85 },
      sentenceTransformers: { logisticRegression: 0.84, svm: 0.88, xgboost: 0.90 },
      llmEmbeddings: { logisticRegression: 0.86, svm: 0.90, xgboost: 0.92 },
    },
    justificativas: {
      tfidf: 'Alta frequência de termos como SQL, Power BI e Python presentes nos requisitos obrigatórios da vaga.',
      sentenceTransformers: 'Boa similaridade semântica com a descrição da vaga, especialmente nos aspectos de análise e visualização de dados.',
      llmEmbeddings: 'Embeddings capturam forte alinhamento contextual com análise de dados e suporte à decisão, mesmo com variação vocabular.',
    },
  },
  {
    id: 3,
    nome: 'Carla Ferreira',
    cargoAtual: 'Desenvolvedora Frontend',
    formacao: 'Bacharelado em Sistemas de Informação',
    experienciaAnos: 2,
    area: 'Frontend',
    resumo:
      'Desenvolvedora com experiência em React, JavaScript e TypeScript, focada em construção de interfaces responsivas e acessíveis. Experiência em consumo de APIs e integração com design systems.',
    competencias: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Material UI', 'Git'],
    experiencias: [
      { cargo: 'Desenvolvedora Frontend Jr.', empresa: 'WebFactory', periodo: '2023–2025' },
      { cargo: 'Estagiária de UX/Dev', empresa: 'AgênciaDigital', periodo: '2022–2023' },
    ],
    classificacaoManual: 'Adequado',
    vagaReferencia: 3,
    scores: {
      tfidf: { logisticRegression: 0.76, svm: 0.80, xgboost: 0.83 },
      sentenceTransformers: { logisticRegression: 0.85, svm: 0.89, xgboost: 0.91 },
      llmEmbeddings: { logisticRegression: 0.87, svm: 0.91, xgboost: 0.93 },
    },
    justificativas: {
      tfidf: 'Presença direta de termos React, JavaScript, HTML e CSS que correspondem aos requisitos obrigatórios da vaga.',
      sentenceTransformers: 'Boa proximidade semântica com o perfil exigido, incluindo similaridade com as responsabilidades de desenvolvimento de interfaces.',
      llmEmbeddings: 'LLM capturou alinhamento com criação de componentes, consumo de APIs e integração com backend, mesmo com variações de linguagem.',
    },
  },
  {
    id: 4,
    nome: 'Diego Lima',
    cargoAtual: 'Desenvolvedor Full Stack',
    formacao: 'Tecnologia em Desenvolvimento Web',
    experienciaAnos: 3,
    area: 'Backend',
    resumo:
      'Desenvolvedor com experiência tanto em backend quanto em frontend. Domínio de Python com Flask e Django, além de React no frontend. Experiência com bancos de dados relacionais e NoSQL.',
    competencias: ['Python', 'Flask', 'Django', 'SQL', 'MongoDB', 'React', 'Git'],
    experiencias: [
      { cargo: 'Desenvolvedor Full Stack', empresa: 'StartupHub', periodo: '2022–2025' },
      { cargo: 'Desenvolvedor Backend Jr.', empresa: 'SoftBrasil', periodo: '2021–2022' },
    ],
    classificacaoManual: 'Adequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.70, svm: 0.74, xgboost: 0.77 },
      sentenceTransformers: { logisticRegression: 0.81, svm: 0.85, xgboost: 0.87 },
      llmEmbeddings: { logisticRegression: 0.84, svm: 0.88, xgboost: 0.90 },
    },
    justificativas: {
      tfidf: 'Termos Python e SQL presentes, mas ausência de menção explícita a FastAPI e APIs REST reduz o score de frequência.',
      sentenceTransformers: 'Forte similaridade semântica apesar de não usar exatamente os termos da vaga — experiência com APIs e sistemas distribuídos está bem representada.',
      llmEmbeddings: 'LLM captura bem o perfil de desenvolvedor backend com bom contexto de frameworks e bancos de dados.',
    },
  },
  {
    id: 5,
    nome: 'Fernanda Oliveira',
    cargoAtual: 'Cientista de Dados',
    formacao: 'Mestrado em Estatística',
    experienciaAnos: 4,
    area: 'Dados',
    resumo:
      'Cientista com forte formação em estatística e machine learning. Experiência em modelagem preditiva, análise exploratória e comunicação de dados para áreas de negócio.',
    competencias: ['Python', 'R', 'Pandas', 'Scikit-learn', 'SQL', 'Tableau', 'Estatística'],
    experiencias: [
      { cargo: 'Cientista de Dados', empresa: 'BankCorp', periodo: '2021–2025' },
      { cargo: 'Pesquisadora', empresa: 'UFMG', periodo: '2019–2021' },
    ],
    classificacaoManual: 'Parcialmente Adequado',
    vagaReferencia: 2,
    scores: {
      tfidf: { logisticRegression: 0.64, svm: 0.68, xgboost: 0.71 },
      sentenceTransformers: { logisticRegression: 0.75, svm: 0.79, xgboost: 0.81 },
      llmEmbeddings: { logisticRegression: 0.78, svm: 0.82, xgboost: 0.84 },
    },
    justificativas: {
      tfidf: 'TF-IDF identificou Python e SQL, mas ausência de Power BI e Excel reduz a pontuação em relação à vaga de analista jr.',
      sentenceTransformers: 'Perfil semânticamente próximo da vaga, porém com senioridade acima do esperado para a posição júnior.',
      llmEmbeddings: 'LLM identifica o potencial técnico elevado mas captura o desalinhamento de nível de carreira com o perfil da vaga.',
    },
  },
  {
    id: 6,
    nome: 'Gabriel Santos',
    cargoAtual: 'Estudante de Ciência da Computação',
    formacao: 'Bacharelado em Ciência da Computação (em curso)',
    experienciaAnos: 0,
    area: 'Backend',
    resumo:
      'Estudante do último semestre de CC com projetos acadêmicos em Python e SQL. Sem experiência profissional formal, mas com portfólio em GitHub com projetos de APIs simples.',
    competencias: ['Python', 'SQL', 'Git', 'Flask', 'Linux'],
    experiencias: [
      { cargo: 'Monitor de Programação', empresa: 'Universidade', periodo: '2024–2025' },
    ],
    classificacaoManual: 'Parcialmente Adequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.56, svm: 0.60, xgboost: 0.63 },
      sentenceTransformers: { logisticRegression: 0.61, svm: 0.65, xgboost: 0.67 },
      llmEmbeddings: { logisticRegression: 0.63, svm: 0.67, xgboost: 0.69 },
    },
    justificativas: {
      tfidf: 'Termos Python, SQL e Git presentes, mas ausência de experiência profissional e Docker reduz significativamente o score.',
      sentenceTransformers: 'Perfil emergente com alinhamento básico de competências. Potencial identificado, mas experiência ainda limitada.',
      llmEmbeddings: 'LLM captura o perfil de estudante com conhecimentos básicos da área, mas sinaliza baixa maturidade profissional.',
    },
  },
  {
    id: 7,
    nome: 'Helena Costa',
    cargoAtual: 'UX Designer',
    formacao: 'Bacharelado em Design Digital',
    experienciaAnos: 3,
    area: 'Frontend',
    resumo:
      'Designer com foco em UX/UI e prototipação. Experiência com Figma, pesquisa com usuários e design systems. Conhecimentos básicos de HTML e CSS para comunicação com desenvolvedores.',
    competencias: ['Figma', 'Adobe XD', 'HTML', 'CSS', 'Pesquisa de usuário', 'Design System'],
    experiencias: [
      { cargo: 'UX Designer Plena', empresa: 'DesignFirst', periodo: '2022–2025' },
      { cargo: 'UX Designer Jr.', empresa: 'AgênciaPixel', periodo: '2021–2022' },
    ],
    classificacaoManual: 'Inadequado',
    vagaReferencia: 3,
    scores: {
      tfidf: { logisticRegression: 0.31, svm: 0.35, xgboost: 0.37 },
      sentenceTransformers: { logisticRegression: 0.44, svm: 0.48, xgboost: 0.50 },
      llmEmbeddings: { logisticRegression: 0.40, svm: 0.44, xgboost: 0.46 },
    },
    justificativas: {
      tfidf: 'Poucos termos da vaga aparecem no currículo. HTML e CSS estão presentes, mas React e JavaScript estão ausentes.',
      sentenceTransformers: 'Apesar do foco em frontend, o perfil é de design, não de desenvolvimento, resultando em baixa similaridade semântica.',
      llmEmbeddings: 'LLM identifica que o candidato tem perfil de UX Designer, com lacunas críticas em programação exigida pela vaga.',
    },
  },
  {
    id: 8,
    nome: 'Igor Almeida',
    cargoAtual: 'Analista de Suporte TI',
    formacao: 'Tecnologia em Redes de Computadores',
    experienciaAnos: 2,
    area: 'Backend',
    resumo:
      'Analista de suporte com conhecimentos em infraestrutura, redes e Linux. Experiência com ticketing, documentação técnica e suporte a usuários internos.',
    competencias: ['Linux', 'Windows Server', 'Redes', 'Suporte TI', 'ITIL'],
    experiencias: [
      { cargo: 'Analista de Suporte N2', empresa: 'CorpTI', periodo: '2023–2025' },
      { cargo: 'Técnico de Suporte', empresa: 'TeleSoluções', periodo: '2021–2023' },
    ],
    classificacaoManual: 'Inadequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.18, svm: 0.22, xgboost: 0.24 },
      sentenceTransformers: { logisticRegression: 0.27, svm: 0.31, xgboost: 0.33 },
      llmEmbeddings: { logisticRegression: 0.24, svm: 0.28, xgboost: 0.30 },
    },
    justificativas: {
      tfidf: 'Ausência quase total de termos técnicos relacionados ao desenvolvimento backend. Nenhum dos requisitos obrigatórios aparece no texto.',
      sentenceTransformers: 'Perfil de infraestrutura é semanticamente distante do perfil de desenvolvimento de APIs exigido pela vaga.',
      llmEmbeddings: 'LLM identifica claramente o desalinhamento: candidato tem perfil de operações, não de desenvolvimento de software.',
    },
  },
  {
    id: 9,
    nome: 'Juliana Pereira',
    cargoAtual: 'Desenvolvedora Backend Plena',
    formacao: 'Bacharelado em Engenharia de Computação',
    experienciaAnos: 4,
    area: 'Backend',
    resumo:
      'Engenheira com experiência sólida em Python, FastAPI, microserviços e mensageria. Atuou em projetos de alta disponibilidade com Docker, Kubernetes e CI/CD.',
    competencias: ['Python', 'FastAPI', 'Docker', 'Kubernetes', 'SQL', 'RabbitMQ', 'Git', 'CI/CD'],
    experiencias: [
      { cargo: 'Desenvolvedora Backend Plena', empresa: 'CloudTech', periodo: '2021–2025' },
      { cargo: 'Desenvolvedora Backend Jr.', empresa: 'APIFirst', periodo: '2019–2021' },
    ],
    classificacaoManual: 'Adequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.81, svm: 0.85, xgboost: 0.88 },
      sentenceTransformers: { logisticRegression: 0.89, svm: 0.93, xgboost: 0.95 },
      llmEmbeddings: { logisticRegression: 0.91, svm: 0.95, xgboost: 0.97 },
    },
    justificativas: {
      tfidf: 'Excelente cobertura de termos: Python, FastAPI, SQL, Docker e Git todos presentes com alta frequência.',
      sentenceTransformers: 'Alta similaridade semântica. O perfil técnico da candidata é fortemente alinhado com a vaga, mesmo que com senioridade ligeiramente acima do esperado.',
      llmEmbeddings: 'LLM identifica perfil ideal com ampla cobertura de responsabilidades técnicas. Leve penalização por senioridade acima do nível júnior.',
    },
  },
  {
    id: 10,
    nome: 'Lucas Rodrigues',
    cargoAtual: 'Desenvolvedor Mobile',
    formacao: 'Bacharelado em Ciência da Computação',
    experienciaAnos: 2,
    area: 'Frontend',
    resumo:
      'Desenvolvedor mobile com experiência em React Native e Flutter. Conhecimentos de JavaScript e TypeScript. Interesse em migrar para desenvolvimento web.',
    competencias: ['React Native', 'Flutter', 'JavaScript', 'TypeScript', 'Dart', 'Git'],
    experiencias: [
      { cargo: 'Desenvolvedor Mobile Jr.', empresa: 'AppFactory', periodo: '2023–2025' },
      { cargo: 'Estagiário Mobile', empresa: 'InnovaApps', periodo: '2022–2023' },
    ],
    classificacaoManual: 'Parcialmente Adequado',
    vagaReferencia: 3,
    scores: {
      tfidf: { logisticRegression: 0.51, svm: 0.55, xgboost: 0.58 },
      sentenceTransformers: { logisticRegression: 0.68, svm: 0.72, xgboost: 0.74 },
      llmEmbeddings: { logisticRegression: 0.70, svm: 0.74, xgboost: 0.76 },
    },
    justificativas: {
      tfidf: 'JavaScript e TypeScript presentes, mas React Native é diferente de React. HTML e CSS não mencionados explicitamente.',
      sentenceTransformers: 'Semanticamente próximo — experiência com componentes e JavaScript é transferível para frontend web.',
      llmEmbeddings: 'LLM capta a transferibilidade de habilidades mobile para web, mas nota a lacuna de experiência específica com React e CSS.',
    },
  },
  {
    id: 11,
    nome: 'Mariana Teixeira',
    cargoAtual: 'Analista de BI',
    formacao: 'Bacharelado em Administração com ênfase em Sistemas',
    experienciaAnos: 3,
    area: 'Dados',
    resumo:
      'Analista com forte atuação em Business Intelligence, criação de relatórios e dashboards no Power BI e Excel. Conhecimentos de SQL para extração e transformação de dados.',
    competencias: ['Power BI', 'Excel', 'SQL', 'DAX', 'ETL', 'Tableau'],
    experiencias: [
      { cargo: 'Analista de BI Plena', empresa: 'CorpAnalytics', periodo: '2022–2025' },
      { cargo: 'Analista de BI Jr.', empresa: 'RetailData', periodo: '2021–2022' },
    ],
    classificacaoManual: 'Parcialmente Adequado',
    vagaReferencia: 2,
    scores: {
      tfidf: { logisticRegression: 0.66, svm: 0.70, xgboost: 0.73 },
      sentenceTransformers: { logisticRegression: 0.72, svm: 0.76, xgboost: 0.78 },
      llmEmbeddings: { logisticRegression: 0.74, svm: 0.78, xgboost: 0.80 },
    },
    justificativas: {
      tfidf: 'SQL, Power BI e Excel presentes com alta frequência. Python ausente impacta o score.',
      sentenceTransformers: 'Perfil com boa aderência à parte de visualização e análise, mas com lacuna em programação com Python.',
      llmEmbeddings: 'LLM identifica alinhamento parcial: forte no BI tradicional, mais fraco na parte analítica com código.',
    },
  },
  {
    id: 12,
    nome: 'Nelson Barbosa',
    cargoAtual: 'Engenheiro de Software Pleno',
    formacao: 'Bacharelado em Engenharia de Software',
    experienciaAnos: 5,
    area: 'Backend',
    resumo:
      'Engenheiro de software com ampla experiência em arquitetura de sistemas, APIs e infraestrutura. Especialista em Python, microsserviços e cloud computing.',
    competencias: ['Python', 'FastAPI', 'AWS', 'Docker', 'SQL', 'NoSQL', 'CI/CD', 'Git'],
    experiencias: [
      { cargo: 'Engenheiro de Software Pleno', empresa: 'CloudNative', periodo: '2020–2025' },
      { cargo: 'Desenvolvedor Backend Jr./Pleno', empresa: 'TechCorp', periodo: '2018–2020' },
    ],
    classificacaoManual: 'Parcialmente Adequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.79, svm: 0.83, xgboost: 0.86 },
      sentenceTransformers: { logisticRegression: 0.83, svm: 0.87, xgboost: 0.89 },
      llmEmbeddings: { logisticRegression: 0.82, svm: 0.86, xgboost: 0.88 },
    },
    justificativas: {
      tfidf: 'Excelente cobertura técnica. Python, FastAPI, Docker e SQL fortemente presentes.',
      sentenceTransformers: 'Alta similaridade técnica. Penalização por seniority — candidato com 5 anos pode estar acima do nível júnior.',
      llmEmbeddings: 'LLM aponta perfil técnico excelente, mas detecta desalinhamento de nível de carreira com a vaga júnior.',
    },
  },
  {
    id: 13,
    nome: 'Patrícia Gomes',
    cargoAtual: 'Professora de Informática',
    formacao: 'Licenciatura em Computação',
    experienciaAnos: 6,
    area: 'Backend',
    resumo:
      'Professora de informática com domínio de lógica de programação, Python e banco de dados. Experiência em ensino de programação e criação de material didático.',
    competencias: ['Python', 'SQL', 'Lógica de Programação', 'Git', 'LibreOffice'],
    experiencias: [
      { cargo: 'Professora de Informática', empresa: 'Escola Técnica Estadual', periodo: '2019–2025' },
    ],
    classificacaoManual: 'Parcialmente Adequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.51, svm: 0.55, xgboost: 0.57 },
      sentenceTransformers: { logisticRegression: 0.58, svm: 0.62, xgboost: 0.64 },
      llmEmbeddings: { logisticRegression: 0.56, svm: 0.60, xgboost: 0.62 },
    },
    justificativas: {
      tfidf: 'Python e SQL presentes, mas o contexto de aplicação é acadêmico/educacional, não de desenvolvimento de software empresarial.',
      sentenceTransformers: 'Similaridade média. O modelo identifica conhecimentos técnicos relevantes, mas em contexto diferente da vaga.',
      llmEmbeddings: 'LLM detecta o perfil de docente — habilidades técnicas presentes, mas experiência prática em desenvolvimento de APIs ausente.',
    },
  },
  {
    id: 14,
    nome: 'Rafael Carvalho',
    cargoAtual: 'Analista Financeiro',
    formacao: 'Bacharelado em Finanças',
    experienciaAnos: 4,
    area: 'Dados',
    resumo:
      'Analista financeiro com uso intensivo de Excel avançado, Power BI e SQL para análise de indicadores e elaboração de relatórios gerenciais.',
    competencias: ['Excel', 'Power BI', 'SQL', 'SAP', 'Contabilidade', 'Finanças'],
    experiencias: [
      { cargo: 'Analista Financeiro Pleno', empresa: 'FinanceCorp', periodo: '2021–2025' },
      { cargo: 'Assistente Financeiro', empresa: 'ContaBrasil', periodo: '2019–2021' },
    ],
    classificacaoManual: 'Inadequado',
    vagaReferencia: 2,
    scores: {
      tfidf: { logisticRegression: 0.44, svm: 0.48, xgboost: 0.50 },
      sentenceTransformers: { logisticRegression: 0.50, svm: 0.54, xgboost: 0.56 },
      llmEmbeddings: { logisticRegression: 0.46, svm: 0.50, xgboost: 0.52 },
    },
    justificativas: {
      tfidf: 'SQL, Excel e Power BI presentes, mas ausência de Python e Pandas reduz fortemente o score para a vaga de analista de dados.',
      sentenceTransformers: 'Similaridade moderada em BI, mas perfil de finanças distante de análise de dados técnica.',
      llmEmbeddings: 'LLM identifica o candidato como profissional de finanças com ferramentas de BI — perfil adjacente mas não adequado para a vaga.',
    },
  },
  {
    id: 15,
    nome: 'Sabrina Andrade',
    cargoAtual: 'Desenvolvedora Frontend Plena',
    formacao: 'Bacharelado em Ciência da Computação',
    experienciaAnos: 4,
    area: 'Frontend',
    resumo:
      'Desenvolvedora com sólida experiência em React, TypeScript e ecossistema JavaScript. Foco em performance, acessibilidade e boas práticas de engenharia frontend.',
    competencias: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Redux', 'Jest', 'Storybook'],
    experiencias: [
      { cargo: 'Desenvolvedora Frontend Plena', empresa: 'UXTech', periodo: '2021–2025' },
      { cargo: 'Desenvolvedora Frontend Jr.', empresa: 'WebStudio', periodo: '2019–2021' },
    ],
    classificacaoManual: 'Adequado',
    vagaReferencia: 3,
    scores: {
      tfidf: { logisticRegression: 0.82, svm: 0.86, xgboost: 0.89 },
      sentenceTransformers: { logisticRegression: 0.88, svm: 0.92, xgboost: 0.94 },
      llmEmbeddings: { logisticRegression: 0.90, svm: 0.94, xgboost: 0.96 },
    },
    justificativas: {
      tfidf: 'Cobertura completa dos requisitos: React, JavaScript, TypeScript, HTML e CSS todos presentes.',
      sentenceTransformers: 'Alta similaridade semântica. Perfil muito bem alinhado com as responsabilidades da vaga.',
      llmEmbeddings: 'LLM captura excelente alinhamento técnico e de contexto de trabalho, com leve nota de seniority acima do júnior.',
    },
  },
  {
    id: 16,
    nome: 'Thiago Nunes',
    cargoAtual: 'DBA / Desenvolvedor SQL',
    formacao: 'Tecnologia em Banco de Dados',
    experienciaAnos: 3,
    area: 'Dados',
    resumo:
      'Profissional especializado em banco de dados relacionais, modelagem de dados e SQL avançado. Experiência com Oracle, MySQL e PostgreSQL. Conhecimentos básicos de Python.',
    competencias: ['SQL', 'PL/SQL', 'Oracle', 'MySQL', 'PostgreSQL', 'Python', 'ETL'],
    experiencias: [
      { cargo: 'DBA Jr./Pleno', empresa: 'DataOps', periodo: '2022–2025' },
      { cargo: 'Estagiário de Banco de Dados', empresa: 'SistemaBD', periodo: '2021–2022' },
    ],
    classificacaoManual: 'Parcialmente Adequado',
    vagaReferencia: 2,
    scores: {
      tfidf: { logisticRegression: 0.61, svm: 0.65, xgboost: 0.68 },
      sentenceTransformers: { logisticRegression: 0.67, svm: 0.71, xgboost: 0.73 },
      llmEmbeddings: { logisticRegression: 0.69, svm: 0.73, xgboost: 0.75 },
    },
    justificativas: {
      tfidf: 'SQL fortemente presente. Python básico e ausência de Power BI e Pandas impactam o score.',
      sentenceTransformers: 'Perfil técnico de banco de dados tem sobreposição com análise de dados, mas sem foco em visualização ou ML.',
      llmEmbeddings: 'LLM identifica forte alinhamento com dados, mas com lacunas nos aspectos de análise exploratória e dashboards.',
    },
  },
  {
    id: 17,
    nome: 'Vanessa Cruz',
    cargoAtual: 'Estagiária de TI',
    formacao: 'Tecnologia em Análise e Desenvolvimento de Sistemas (em curso)',
    experienciaAnos: 0,
    area: 'Frontend',
    resumo:
      'Estagiária do penúltimo semestre, com projetos pessoais em React e conhecimentos de HTML, CSS e JavaScript básico. Participação em hackathons e bootcamp de desenvolvimento web.',
    competencias: ['HTML', 'CSS', 'JavaScript', 'React (básico)', 'Git'],
    experiencias: [
      { cargo: 'Estagiária de TI', empresa: 'StartLab', periodo: '2024–2025' },
    ],
    classificacaoManual: 'Parcialmente Adequado',
    vagaReferencia: 3,
    scores: {
      tfidf: { logisticRegression: 0.58, svm: 0.62, xgboost: 0.65 },
      sentenceTransformers: { logisticRegression: 0.64, svm: 0.68, xgboost: 0.70 },
      llmEmbeddings: { logisticRegression: 0.66, svm: 0.70, xgboost: 0.72 },
    },
    justificativas: {
      tfidf: 'Termos HTML, CSS, JavaScript e React presentes. Nível básico e ausência de TypeScript e Material UI reduzem o score.',
      sentenceTransformers: 'Perfil emergente com boa base técnica. Potencial identificado, mas com experiência ainda muito inicial.',
      llmEmbeddings: 'LLM capta o perfil de ingressante — conhecimentos básicos dos requisitos, sem experiência profissional significativa.',
    },
  },
  {
    id: 18,
    nome: 'William Sousa',
    cargoAtual: 'Engenheiro de Dados Júnior',
    formacao: 'Bacharelado em Engenharia de Computação',
    experienciaAnos: 2,
    area: 'Dados',
    resumo:
      'Engenheiro de dados com experiência em pipelines de dados, Python e SQL. Familiaridade com ferramentas de orquestração e processamento de grandes volumes de dados.',
    competencias: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'Pandas', 'Dbt', 'Git'],
    experiencias: [
      { cargo: 'Engenheiro de Dados Jr.', empresa: 'DataPipe', periodo: '2023–2025' },
      { cargo: 'Estagiário de Dados', empresa: 'BigData Co.', periodo: '2022–2023' },
    ],
    classificacaoManual: 'Adequado',
    vagaReferencia: 2,
    scores: {
      tfidf: { logisticRegression: 0.73, svm: 0.77, xgboost: 0.80 },
      sentenceTransformers: { logisticRegression: 0.80, svm: 0.84, xgboost: 0.86 },
      llmEmbeddings: { logisticRegression: 0.82, svm: 0.86, xgboost: 0.88 },
    },
    justificativas: {
      tfidf: 'Python, SQL e Pandas presentes. Ausência de Power BI e Excel explícito reduz o score em relação à vaga de analista.',
      sentenceTransformers: 'Boa similaridade — perfil de engenharia de dados é próximo de análise de dados, com sobreposição em ferramentas.',
      llmEmbeddings: 'LLM identifica alinhamento robusto com análise de dados técnica, com diferença de foco em engenharia vs análise.',
    },
  },
  {
    id: 19,
    nome: 'Ximena Prado',
    cargoAtual: 'Desenvolvedora Backend Júnior',
    formacao: 'Tecnologia em Sistemas para Internet',
    experienciaAnos: 1,
    area: 'Backend',
    resumo:
      'Desenvolvedora com 1 ano de experiência em APIs com Python e Django REST Framework. Atuou em projeto de plataforma educacional com banco de dados PostgreSQL e versionamento Git.',
    competencias: ['Python', 'Django', 'REST API', 'PostgreSQL', 'Git', 'Linux'],
    experiencias: [
      { cargo: 'Desenvolvedora Backend Jr.', empresa: 'EduTech', periodo: '2024–2025' },
    ],
    classificacaoManual: 'Adequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.68, svm: 0.72, xgboost: 0.75 },
      sentenceTransformers: { logisticRegression: 0.79, svm: 0.83, xgboost: 0.85 },
      llmEmbeddings: { logisticRegression: 0.81, svm: 0.85, xgboost: 0.87 },
    },
    justificativas: {
      tfidf: 'Python, REST API e Git presentes. Django em vez de FastAPI e sem Docker menciona reduzem o score de frequência.',
      sentenceTransformers: 'Alta similaridade semântica — Django REST e FastAPI são semanticamente próximos no contexto de APIs Python.',
      llmEmbeddings: 'LLM capta experiência real com desenvolvimento backend Python mesmo com framework diferente da vaga.',
    },
  },
  {
    id: 20,
    nome: 'Yuri Fonseca',
    cargoAtual: 'Gerente de Projetos de TI',
    formacao: 'MBA em Gestão de TI',
    experienciaAnos: 8,
    area: 'Backend',
    resumo:
      'Gerente de projetos com experiência em metodologias ágeis, gestão de times de desenvolvimento e coordenação de entregas de software. Formação técnica original em programação.',
    competencias: ['Scrum', 'Kanban', 'Jira', 'Gestão de Projetos', 'Comunicação', 'Git'],
    experiencias: [
      { cargo: 'Gerente de Projetos de TI', empresa: 'TechManage', periodo: '2020–2025' },
      { cargo: 'Scrum Master', empresa: 'AgileCorp', periodo: '2017–2020' },
    ],
    classificacaoManual: 'Inadequado',
    vagaReferencia: 1,
    scores: {
      tfidf: { logisticRegression: 0.14, svm: 0.18, xgboost: 0.20 },
      sentenceTransformers: { logisticRegression: 0.21, svm: 0.25, xgboost: 0.27 },
      llmEmbeddings: { logisticRegression: 0.18, svm: 0.22, xgboost: 0.24 },
    },
    justificativas: {
      tfidf: 'Ausência crítica de Python, SQL, APIs REST e Docker. Git é o único termo técnico da vaga presente no currículo.',
      sentenceTransformers: 'Perfil de gestão é semanticamente distante do perfil técnico de desenvolvedor backend.',
      llmEmbeddings: 'LLM identifica claramente o desalinhamento: candidato tem perfil de liderança, sem proficiência técnica de desenvolvimento.',
    },
  },
]

export const getCurriculoById = (id) => curriculos.find((c) => c.id === id)

export const getCurriculosByArea = (area) =>
  area ? curriculos.filter((c) => c.area === area) : curriculos

export const getCurriculosByClassificacao = (classificacao) =>
  classificacao ? curriculos.filter((c) => c.classificacaoManual === classificacao) : curriculos
