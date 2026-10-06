import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/main/App'
import '@/presentation/styles/global.css'

// Recarregar sempre volta ao início: a intro do hero só faz sentido vista do topo.
history.scrollRestoration = 'manual'
const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
if (navigation?.type === 'reload') {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  window.scrollTo({ top: 0, behavior: 'instant' })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
