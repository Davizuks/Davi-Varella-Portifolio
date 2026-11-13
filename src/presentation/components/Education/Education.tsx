import { BLANK_ROWS, CARD_NUMBER, CERTIFICATES, COURSES, LANGUAGES } from './education'
import styles from './Education.module.css'

const INK_FILTER = 'formacao-tinta'

export function Education() {
  return (
    <section id="formacao" className={styles.education} aria-labelledby="formacao-titulo">
      <svg className={styles.defs} aria-hidden="true">
        <filter id={INK_FILTER} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.8" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="3" seed="4" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.2" result="wear" />
          <feComposite in="rough" in2="wear" operator="in" />
        </filter>
      </svg>

      <div className={styles.aside}>
        <span className={styles.label}>[04] Formação</span>
        <h2 id="formacao-titulo" className={styles.title}>
          Onde aprendi <br />a perguntar.
        </h2>
        <dl className={styles.languages}>
          <dt className={styles.label}>Idiomas</dt>
          {LANGUAGES.map((language) => (
            <dd key={language.name}>
              {language.name} <em>{language.level}</em>
            </dd>
          ))}
        </dl>
      </div>

      <div className={styles.desk}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span>Biblioteca DV / Labs · Ficha de leitor</span>
            <span>Nº {CARD_NUMBER}</span>
          </div>
          <p className={styles.reader}>
            <span>Leitor</span>
            <span className={styles.signature}>Davi Varella</span>
          </p>

          <table className={styles.loans}>
            <caption className={styles.srOnly}>Cursos</caption>
            <thead>
              <tr>
                <th scope="col">Retirada</th>
                <th scope="col">Devolução</th>
                <th scope="col">Obra</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.map((course) => (
                <tr key={course.id}>
                  <td>
                    <span className={styles.stamped}>{course.start}</span>
                  </td>
                  <td>
                    {course.ongoing ? (
                      <span className={styles.open}>
                        em aberto <small>prev. {course.end}</small>
                      </span>
                    ) : (
                      <span className={styles.stamped}>{course.end}</span>
                    )}
                  </td>
                  <td>
                    <h3 className={styles.degree}>{course.degree}</h3>
                    <p className={styles.description}>
                      <strong>{course.place}</strong> — {course.description}
                    </p>
                  </td>
                </tr>
              ))}
              {Array.from({ length: BLANK_ROWS }, (_, i) => (
                <tr key={i} className={styles.blank} aria-hidden="true">
                  <td />
                  <td />
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={styles.stamps} aria-label="Certificados">
          {CERTIFICATES.map((certificate) => (
            <li key={certificate.id} className={styles.stamp}>
              <span className={styles.stampName}>{certificate.name}</span>
              <span>
                {certificate.issuer} · {certificate.issued}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
