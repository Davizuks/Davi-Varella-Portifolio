import type { Track } from '@/domain/entities/Track'

export const NOW_PLAYING_URL = '/api/now-playing'

const OFFLINE_ARTIST = 'Offline'

export function parseProfileCard(svg: string): Track | null {
  const card = new DOMParser().parseFromString(svg, 'text/html')
  const artist = card.querySelector('.artist')?.textContent?.trim()
  const title = card.querySelector('.song')?.textContent?.trim()
  if (!artist || !title || artist === OFFLINE_ARTIST) return null
  return { title, artist }
}

export async function fetchNowPlaying(signal?: AbortSignal): Promise<Track | null> {
  const response = await fetch(NOW_PLAYING_URL, { signal })
  if (!response.ok) return null
  return parseProfileCard(await response.text())
}
