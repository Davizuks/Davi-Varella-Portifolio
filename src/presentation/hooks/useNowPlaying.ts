import { useEffect, useState } from 'react'
import type { Track } from '@/domain/entities/Track'
import { fetchNowPlaying } from '@/infrastructure/repositories/nowPlayingRepository'

const REFRESH_MS = 30_000

export function useNowPlaying(): Track | null {
  const [track, setTrack] = useState<Track | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const refresh = () => {
      if (document.hidden) return
      fetchNowPlaying(controller.signal)
        .then(setTrack)
        .catch(() => {})
    }
    refresh()
    const timer = window.setInterval(refresh, REFRESH_MS)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return track
}
