import { useEffect, useState } from 'react'

function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone }).format(
    date,
  )
}

export function useLocalTime(timeZone = 'America/Sao_Paulo'): string {
  const [time, setTime] = useState(() => formatTime(new Date(), timeZone))

  useEffect(() => {
    const id = window.setInterval(() => setTime(formatTime(new Date(), timeZone)), 30_000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return time
}
