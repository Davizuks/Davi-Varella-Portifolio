import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { EMAIL } from './contact'

const FEEDBACK_MS = 2200

type EmailLinkProps = { className?: string; children: ReactNode }

export function EmailLink({ className, children }: EmailLinkProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), FEEDBACK_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = () => {
    navigator.clipboard
      ?.writeText(EMAIL)
      .then(() => setCopied(true))
      .catch(() => {})
  }

  return (
    <a className={className} href={`mailto:${EMAIL}`} onClick={copy}>
      <span aria-live="polite">{copied ? 'Copiado ✓' : children}</span>
    </a>
  )
}
