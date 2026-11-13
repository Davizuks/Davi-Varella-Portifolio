import type { Listening, Track } from '@/domain/entities/Track'

export const NOW_PLAYING_URL = '/api/now-playing'
export const LAST_PLAYED_URL = '/api/last-played'

const OFFLINE_ARTIST = 'Offline'

export function parseProfileCard(svg: string): Track | null {
  const card = new DOMParser().parseFromString(svg, 'text/html')
  const artist = card.querySelector('.artist')?.textContent?.trim()
  const title = card.querySelector('.song')?.textContent?.trim()
  if (!artist || !title || artist === OFFLINE_ARTIST) return null
  return { title, artist }
}

async function fetchCard(url: string, signal?: AbortSignal): Promise<Track | null> {
  const response = await fetch(url, { signal })
  if (!response.ok) return null
  return parseProfileCard(await response.text())
}

export async function fetchListening(signal?: AbortSignal): Promise<Listening | null> {
  const playing = await fetchCard(NOW_PLAYING_URL, signal)
  if (playing) return { track: playing, live: true }
  const last = await fetchCard(LAST_PLAYED_URL, signal)
  return last && { track: last, live: false }
}
