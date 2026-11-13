export const EMAIL = 'davivarelladev@gmail.com'

export const SOCIALS: readonly { label: string; url: string }[] = [
  { label: 'GitHub', url: 'https://github.com/Davizuks' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/davivarella/' },
]

export type Station = { id: string; label: string; frequency: number; text: string; url: string }

export const BAND = { min: 88, max: 108 } as const
export const TUNE_TOLERANCE = 0.5

export const STATIONS: readonly Station[] = [
  {
    id: 'github',
    label: 'GitHub',
    frequency: 89.1,
    text: 'github.com/Davizuks',
    url: 'https://github.com/Davizuks',
  },
  { id: 'email', label: 'E-mail', frequency: 91.3, text: EMAIL, url: `mailto:${EMAIL}` },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    frequency: 106.3,
    text: 'linkedin.com/in/davivarella',
    url: 'https://www.linkedin.com/in/davivarella/',
  },
]

export const DEFAULT_FREQUENCY = 91.3

export const CREDITS: readonly { role: string; name: string }[] = [
  { role: 'Escrito e programado por', name: 'Davi Varella' },
  { role: 'Elenco de apoio', name: 'Python · React · PostgreSQL · Docker · AWS' },
  { role: 'Locação', name: 'São Paulo, Brasil' },
]

export const stationAt = (frequency: number) =>
  STATIONS.find((station) => Math.abs(station.frequency - frequency) <= TUNE_TOLERANCE) ?? null

export const formatFrequency = (frequency: number) => frequency.toFixed(1).replace('.', ',')
