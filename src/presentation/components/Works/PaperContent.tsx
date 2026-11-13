import cassette from '@/presentation/assets/trocaticket-cassette.svg'
import { padIndex } from './format'
import type { Project } from './projects'
import styles from './Works.module.css'

type PaperContentProps = { project: Project; index: number }

export function PaperContent({ project, index }: PaperContentProps) {
  const number = padIndex(index + 1)
  const meta = `${project.shortTags} · ${project.year}`

  if (project.kind === 'photo') {
    return (
      <>
        <img className={styles.photo} src={cassette} width={268} height={190} alt="" />
        <span className={styles.paperTitle}>{project.title}</span>
        <span className={styles.meta}>
          {number} · {meta}
        </span>
      </>
    )
  }

  const tag = (
    <span className={styles.tag}>
      {number} — {project.label}
    </span>
  )
  if (project.kind === 'note') {
    return (
      <>
        {tag}
        <span className={styles.paperTitle}>{project.title}</span>
        <span className={styles.scribble}>{project.note}</span>
        <span className={styles.meta}>{meta}</span>
      </>
    )
  }
  return (
    <>
      {tag}
      <span className={styles.cutoutTitle}>{project.title}</span>
      <span className={styles.meta}>{meta}</span>
    </>
  )
}
