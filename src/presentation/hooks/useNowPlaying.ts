import { useEffect, useState } from 'react'
import type { Listening } from '@/domain/entities/Track'
import { fetchListening } from '@/infrastructure/repositories/nowPlayingRepository'

const REFRESH_MS = 30_000

export function useNowPlaying(): Listening | null {
  const [listening, setListening] = useState<Listening | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const refresh = () => {
      if (document.hidden) return
      fetchListening(controller.signal)
        .then(setListening)
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

  return listening
}
