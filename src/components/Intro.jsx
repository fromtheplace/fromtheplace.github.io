import { motion } from 'framer-motion'
import { studio } from '../data/projects.js'

export function Intro({ onEnter }) {
  return (
    <section className="intro-section" id="top">
      <motion.div
        className="intro-content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="intro-eyebrow mono">{studio.eyebrow}</p>
        <h1 className="intro-headline">{studio.headline}</h1>
        <p className="intro-tagline">{studio.tagline}</p>

        <dl className="intro-facts">
          <div>
            <dt className="mono">Location</dt>
            <dd>{studio.location}</dd>
          </div>
          <div>
            <dt className="mono">Disciplines</dt>
            <dd>{studio.disciplines.join(' - ')}</dd>
          </div>
          <div>
            <dt className="mono">Services</dt>
            <dd>{studio.services.join(' - ')}</dd>
          </div>
        </dl>

        <button type="button" className="intro-cta" onClick={onEnter}>
          View our work <span aria-hidden="true">&darr;</span>
        </button>
      </motion.div>
    </section>
  )
}
