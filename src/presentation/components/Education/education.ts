export type Course = {
  id: string
  start: string
  end: string
  ongoing?: boolean
  place: string
  degree: string
  description: string
}

export type Certificate = { id: string; name: string; issuer: string; issued: string }

export const COURSES: readonly Course[] = [
  {
    id: 'fecap',
    start: 'Jan 2026',
    end: 'Dez 2029',
    ongoing: true,
    place: 'FECAP',
    degree: 'Bacharelado em Ciência da Computação',
    description:
      'Fundamentos de programação, estruturas de dados, bancos de dados, engenharia de software e inteligência artificial.',
  },
  {
    id: 'ilac',
    start: 'Jan 2025',
    end: 'Mar 2025',
    place: 'ILAC',
    degree: 'Intercâmbio de inglês',
    description: 'Imersão em inglês geral e de negócios, fora do país.',
  },
  {
    id: 'etec',
    start: 'Jan 2022',
    end: 'Dez 2024',
    place: 'Etec',
    degree: 'Técnico em Desenvolvimento de Sistemas',
    description:
      'Programação, bancos de dados, análise de sistemas e métodos ágeis. Terminou com o Meu Guia Pessoal como TCC.',
  },
]

export const CERTIFICATES: readonly Certificate[] = [
  { id: 'ibm-ai', name: 'Artificial Intelligence Fundamentals', issuer: 'IBM', issued: 'Jun 2026' },
  { id: 'ilac-english', name: 'English Certificate', issuer: 'ILAC', issued: 'Fev 2025' },
  { id: 'sfpc', name: 'Scrum Foundation Professional', issuer: 'Certiprof', issued: 'Abr 2024' },
  { id: 'cisco-endpoint', name: 'Endpoint Security', issuer: 'Cisco', issued: 'Mar 2024' },
]

export const LANGUAGES: readonly { name: string; level: string }[] = [
  { name: 'Português', level: 'nativo' },
  { name: 'Inglês', level: 'intermediário' },
]

export const CARD_NUMBER = '0004'
export const BLANK_ROWS = 2
