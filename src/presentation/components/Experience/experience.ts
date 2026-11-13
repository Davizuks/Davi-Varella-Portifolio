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
    description:
      'Python, FastAPI e Google Cloud no back-end, React no front-end. Desenvolvo produtos com IA generativa para implantações em grandes instituições de saúde, alcançando milhares de pacientes, e conduzo a engenharia interna: arquitetura escalável, automações e design system.',
  },
  {
    id: 'qi-tech',
    period: 'Mar 2025 — Dez 2025',
    place: 'QI Tech',
    role: 'Software Engineer',
    description:
      'APIs em Python, PostgreSQL e AWS na área de passivos. Automatizei etapas do fluxo de oferta, em sistemas que atendem cerca de 1.000 FIDCs.',
  },
  {
    id: 'adl',
    period: 'Out 2023 — Set 2024',
    place: 'ADL Mineração',
    role: 'Support Analyst',
    description:
      'Primeira linha de TI de uma empresa pequena: suporte aos usuários, redes, acessos e manutenção de computadores e servidores.',
  },
]
