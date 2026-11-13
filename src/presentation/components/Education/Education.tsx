import { CERTIFICATES, COURSES, LANGUAGES } from './education'
import styles from './Education.module.css'

export function Education() {
  return (
    <section id="formacao" className={styles.education} aria-labelledby="formacao-titulo">
      <div className={styles.head}>
        <span className={styles.label}>[04] Formação</span>
        <h2 id="formacao-titulo" className={styles.title}>
          Onde aprendi <br />a perguntar.
        </h2>
      </div>

      <ol className={styles.courses} aria-label="Cursos">
        {COURSES.map((course) => (
          <li key={course.id} className={styles.course}>
            <span className={styles.period}>{course.period}</span>
            <h3 className={styles.place}>{course.place}</h3>
            <p className={styles.degree}>{course.degree}</p>
            <p className={styles.description}>{course.description}</p>
          </li>
        ))}
      </ol>

      <div className={styles.extra}>
        <h3 className={styles.label}>Certificados</h3>
        <ul className={styles.certificates} aria-label="Certificados">
          {CERTIFICATES.map((certificate) => (
            <li key={certificate.id} className={styles.certificate}>
              <span className={styles.name}>{certificate.name}</span>
              <span className={styles.issuer}>
                {certificate.issuer} · {certificate.issued}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.extra}>
        <h3 className={styles.label}>Idiomas</h3>
        <ul className={styles.languages} aria-label="Idiomas">
          {LANGUAGES.map((language) => (
            <li key={language.name}>
              {language.name} <em>{language.level}</em>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
