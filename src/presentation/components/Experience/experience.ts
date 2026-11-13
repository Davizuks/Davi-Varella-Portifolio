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
    period: 'Jul 2026 — Hoje',
    place: 'Folks',
    role: 'AI Software Engineer',
    description: 'Infraestrutura de software e inteligência artificial.',
  },
  {
    id: 'qi-tech',
    period: 'Mar 2025 — Dez 2025',
    place: 'QI Tech',
    role: 'Software Engineer',
    description:
      'Back-end em Python, APIs REST e integrações para operações financeiras, em sistemas que atendem cerca de 1.000 FIDCs.',
  },
  {
    id: 'adl',
    period: 'Out 2023 — Set 2024',
    place: 'ADL Mineração',
    role: 'Support Analyst',
    description: 'Suporte técnico a usuários e manutenção da infraestrutura de TI.',
  },
]
