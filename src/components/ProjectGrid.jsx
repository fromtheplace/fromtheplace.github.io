import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PlayIcon } from './ChipIcons.jsx'

// Small corner "open" affordance — deliberately not from ChipIcons.jsx
// (that file's icons are for chip pills specifically: play/link/image).
// This is its own compass-style expand glyph, shown on hover/focus as
// the tile's click target grows more obviously "clickable".
function ExpandIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}


const DISCIPLINE_LABELS = {
  LIVESTREAM: 'Livestream',
  'LIVE VIDEO': 'Live Video',
  VIDEO: 'Video',
  MOTION: 'Motion',
  DESIGN: 'Design',
  DIGITAL: 'Digital',
}

function ProjectTile({ project, onOpen, reduceMotion }) {
  const thumb =
    project.tileImage ||
    (project.mainVideo && `https://i.ytimg.com/vi/${project.mainVideo.id}/hqdefault.jpg`) ||
    null
  const isVideoLed = !project.tileImage && Boolean(project.mainVideo)
  const tags = project.disciplines || []

  return (
    <motion.button
      type="button"
      id={`tile-${project.id}`}
      className="project-tile"
      role="listitem"
      style={{ '--project-color': project.color, '--project-glow': project.glowColor }}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={
        reduceMotion ? { duration: 0.15 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
      }
      onClick={() => onOpen(project.id)}
      aria-label={`Open ${project.title}`}
    >
      <span className="project-tile-media">
        {thumb ? (
          <motion.img
            src={thumb}
            alt=""
            loading="lazy"
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileFocus={reduceMotion ? undefined : { scale: 1.06 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <span className="project-tile-media-fallback" aria-hidden="true" />
        )}
        {isVideoLed && <PlayIcon className="project-tile-play" aria-hidden="true" />}
      </span>

      <span className="project-tile-scrim" aria-hidden="true" />

      <span className="project-tile-info">
        {tags.length > 0 && (
          <span className="project-tile-tags mono">
            {tags.map((tag) => DISCIPLINE_LABELS[tag] || tag).join(' · ')}
          </span>
        )}
        <span className="project-tile-title">{project.title}</span>
      </span>

      <ExpandIcon className="project-tile-expand" aria-hidden="true" />
    </motion.button>
  )
}


export function ProjectGrid({ projects, onOpen }) {
  const reduceMotion = useReducedMotion()

  return (
    <section id="all-work" className="project-grid-section">
      <div className="project-grid" role="list">
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <ProjectTile
              key={project.id}
              project={project}
              onOpen={onOpen}
              reduceMotion={reduceMotion}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
