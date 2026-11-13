export type PaperKind = 'photo' | 'note' | 'cutout'

export type Project = {
  id: string
  kind: PaperKind
  title: string
  tags: string
  shortTags: string
  year: number
  description: string
  label?: string
  note?: string
  url: string
}

export const ALL_PROJECTS_COUNT = 7
export const ALL_PROJECTS_URL = 'https://github.com/Davizuks?tab=repositories'

export const LOOSE_NOTE = '“Tudo é precioso para quem foi, por muito tempo, privado de tudo.”'

export const PROJECTS: readonly Project[] = [
  {
    id: 'troca-ticket',
    kind: 'photo',
    title: 'Troca Ticket',
    tags: 'Plataforma web · Eventos',
    shortTags: 'Web · Eventos',
    year: 2026,
    description:
      'Plataforma web de planejamento e precificação de eventos, feita na FECAP em parceria com a TrocaTicket.',
    url: 'https://gestaotrocaticket.com.br',
  },
  {
    id: 'meu-guia-pessoal',
    kind: 'note',
    title: 'Meu Guia Pessoal',
    tags: 'App mobile · Geolocalização',
    shortTags: 'App mobile',
    year: 2024,
    description:
      'Aplicativo para viagens independentes: monte suas rotas, descubra pontos turísticos e ajuste o caminho pela geolocalização, sem depender de um guia.',
    label: 'TCC · Etec',
    note: 'viajar sem guia. se perder de propósito também é um roteiro.',
    url: 'https://github.com/Davizuks/Meu_Guia_Pessoal',
  },
  {
    id: 'urban-chase',
    kind: 'cutout',
    title: 'Urban Chase',
    tags: 'Jogo · Unity · C#',
    shortTags: 'Jogo · Unity',
    year: 2026,
    label: 'FECAP Tech Week 2026-1',
    description:
      'Jogo de perseguição urbana com foco na conscientização sobre a destruição do patrimônio público, feito em Unity e C#.',
    url: 'https://davizuks.itch.io/urban-chase',
  },
]
