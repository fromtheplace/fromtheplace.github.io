import { forwardRef, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { WATCH_ALL_ROWS } from '../data/watchAllVideos.js'
import { MainVideoEmbed } from './ProjectShorts.jsx'
import { CoverflowRow } from './CoverflowRow.jsx'
import { PlayIcon } from './ChipIcons.jsx'

const fromLeft = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const fromRight = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 } },
}

const VISIBLE_ROWS = WATCH_ALL_ROWS.filter((row) => row.videos.length > 0)
const ALL_VIDEOS_FLAT = VISIBLE_ROWS.flatMap((row) => row.videos)

function renderVideoThumb(video) {
  return (
    <>
      <img
        src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        draggable={false}
      />
      <span className="video-thumb-icon" aria-hidden="true">
        <PlayIcon />
      </span>
    </>
  )
}

// onOpenProject: same callback App.jsx already passes to ProjectGrid
// as onOpen (App.jsx's openModal) — opens ProjectModal for a given
// project id. Passed down here too so a video's own projectId
// (watchAllVideos.js) can open the exact same modal a tile click would.
export const AllVideosSection = forwardRef(function AllVideosSection(
  { project, index, total, isActive, onOpenProject },
  ref
) {
  const [featured, setFeatured] = useState(ALL_VIDEOS_FLAT[0] || null)
  const videoEmbedRef = useRef(null)

  useEffect(() => {
    if (isActive) setFeatured(ALL_VIDEOS_FLAT[0] || null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  if (VISIBLE_ROWS.length === 0) return null

  return (
    <section
      ref={ref}
      id={project.id}
      className={`project-section video-library-section ${isActive ? 'project-section-active' : ''}`}
      data-index={index}
      style={{ '--project-color': project.color, '--project-glow': project.glowColor }}
    >
      <div className="project-color-scrim" aria-hidden="true" />

      <div className="video-library-content">
        <motion.div
          className="video-library-list"
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          variants={fromLeft}
        >
          {project.badge && <p className="project-meta mono">{project.badge}</p>}
          <h2 className="project-title">{project.title}</h2>

          <div className="video-library-groups-scroll">
            <div className="design-grid-groups">
              {VISIBLE_ROWS.map((row) => (
                <div key={row.label}>
                  <h3 className="chip-row-heading mono">{row.label}</h3>
                  <CoverflowRow
                    items={row.videos}
                    itemKey={(video) => video.id}
                    itemClassName={() => 'video-thumb-item'}
                    itemStyle={() => ({ aspectRatio: 4 / 3 })}
                    itemAriaLabel={(video) => video.title || row.label}
                    renderItem={renderVideoThumb}
                    isSelected={(video) => featured?.id === video.id}
                    onItemClick={setFeatured}
                    ariaLabel={row.label}
                    scaleFalloff={0.09}
                    opacityFalloff={0.35}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="video-library-tablet-wrap"
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          variants={fromRight}
        >
          <div className="tablet-frame-wrap">
            <div className="tablet-glow" aria-hidden="true" />
            {featured && <MainVideoEmbed ref={videoEmbedRef} video={featured} isActive={isActive} />}
          </div>

          {featured?.projectId && (
            <button
              type="button"
              className="video-library-project-link mono"
              onClick={() => {
                // Read the tablet's actual current position at the
                // moment of the click, not featured.startTime (that's
                // just where this video started, not where the visitor
                // currently is in it). Passed alongside the video id so
                // ProjectModal can confirm it's actually about to show
                // this same video before applying it — a leftover
                // timestamp for a different video (e.g. if the modal's
                // project defaults to showing a different clip) would
                // be meaningless.
                const currentTime = videoEmbedRef.current?.getCurrentTime?.() ?? 0
                onOpenProject?.(
                  featured.projectId,
                  { videoId: featured.id, startTime: Math.floor(currentTime) },
                  // returnToTile: false — this section, not a grid
                  // tile, is where the visitor actually was; closing
                  // the modal shouldn't scroll-jump them away from
                  // Watch All to a tile they never clicked.
                  { returnToTile: false }
                )
              }}
            >
              View project ↗
            </button>
          )}
        </motion.div>
      </div>
    </section>
  )
})