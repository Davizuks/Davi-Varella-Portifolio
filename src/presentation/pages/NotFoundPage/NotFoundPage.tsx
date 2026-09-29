import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main>
      <h1>404</h1>
      <Link to="/">Voltar para o início</Link>
    </main>
  )
}
