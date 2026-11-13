export type ExperienceEntry = {
  id: string
  period: string
  place: string
  role: string
  description: string
}

export const EXPERIENCE: readonly ExperienceEntry[] = [
  {
    id: 'folks',
    period: 'Hoje',
    place: 'Folks',
    role: 'Full Stack Software Engineer',
    description: 'Back-end em Python para sistemas de saúde e IA.',
  },
  {
    id: 'fecap',
    period: '2026 — Hoje',
    place: 'FECAP',
    role: 'Ciência da Computação',
    description:
      'Projetos interdisciplinares com empresas parceiras, como a Gestão Troca Ticket e o Urban Chase.',
  },
  {
    id: 'etec',
    period: 'Até 2024',
    place: 'Etec',
    role: 'Ensino técnico',
    description: 'TCC: Meu Guia Pessoal, um aplicativo para viagens independentes.',
  },
]
