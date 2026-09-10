import { forwardRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ProjectShorts } from './ProjectShorts.jsx'
import { ProjectLinks } from './ProjectLinks.jsx'
import { Lightbox } from './Lightbox.jsx'
import { CoverflowRow } from './CoverflowRow.jsx'
import { useSoundGate } from './SoundGateProvider.jsx'


// Each element enters from a different direction, staggered, cinematic
// but not exaggerated. Title slides from the left, the tablet/video
// slides in from the right, body copy rises from below.
const fromLeft = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const fromRight = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 } },
}
const fromBelow = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 } },
}

export const ProjectSection = forwardRef(function ProjectSection(
  { project, index, total, isActive },
  ref
) {
  const hasVideo = Boolean(project.mainVideo)
  const hasEmbed = Boolean(project.embed)
  const [lightboxContent, setLightboxContent] = useState(null)
  const { unlock } = useSoundGate()

  // Custom third-party iframes (project.embed — e.g. id 16's FTPtv)
  // can't be muted/unmuted programmatically the way MainVideoEmbed
  // controls YouTube's player: that relies on YouTube's own IFrame API
  // over postMessage, and there's no way to assume an arbitrary
  // third-party site exposes anything equivalent. What *is* achievable
  // without knowing that site's internals: calling the same unlock()
  // every YouTube tablet calls once active, so this section
  // participates in the shared "has the visitor interacted with sound
  // anywhere on the page" state the rest of the site tracks — and,
  // as a side effect of standard browser autoplay policy (Chrome and
  // others can allow autoplay-with-sound in a child iframe once the
  // top-level page has had a user gesture), that may also help this
  // specific iframe's own autoplay behave better, though that's the
  // browser's policy doing the work, not anything we control directly.
  useEffect(() => {
    if (isActive && hasEmbed) unlock()
  }, [isActive, hasEmbed, unlock])

  return (
    <section
      ref={ref}
      id={project.id}
      className={`project-section ${isActive ? 'project-section-active' : ''}`}
      data-index={index}
      // colour overlay: low-opacity tinted layer over the video bg
      style={{ '--project-color': project.color, '--project-glow': project.glowColor }}
    >
      {/* per-project colour scrim, sits above the global video bg scrim */}
      <div className="project-color-scrim" aria-hidden="true" />

      <div className="project-content">
        <div className="project-text-block">
          <motion.div
            className="project-title-block"
            initial="hidden"
            animate={isActive ? 'visible' : 'hidden'}
            variants={fromLeft}
          >
            {project.badge && <p className="project-meta mono">{project.badge}</p>}
            <h2 className="project-title">{project.title}</h2>
          </motion.div>

          <motion.div
            className="project-body-block"
            initial="hidden"
            animate={isActive ? 'visible' : 'hidden'}
            variants={fromBelow}
          >
            {project.description && (
              <p
                className="project-description"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            )}

            {project.creditsHTML && (
              <div
                className="project-credits"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: project.creditsHTML }}
              />
            )}

            <ProjectLinks links={project.links} />
          </motion.div>
        </div>

        {/* hasVideo and hasEmbed share one project-shorts-wrap (same
            motion entrance, same grid column) rather than the embed
            being a separate, unanimated sibling — this is the "act
            like a project tablet" part: same fromRight slide-in timing
            as every real video tablet, and the Images row below now
            works for embed-only projects too instead of being gated
            behind hasVideo specifically. */}
        {(hasVideo || hasEmbed) && (
          <motion.div
            className="project-shorts-wrap"
            initial="hidden"
            animate={isActive ? 'visible' : 'hidden'}
            variants={fromRight}
          >
            {hasVideo && (
              <ProjectShorts
                mainVideo={project.mainVideo}
                incidental={project.incidentalVideos}
                projectIsActive={isActive}
              />
            )}

            {!hasVideo && hasEmbed && (
              <div className="tablet-frame-wrap" data-lenis-prevent>
                <div className="tablet-glow" aria-hidden="true" />
                <div
                  className="project-embed tablet-frame"
                  // data-lenis-prevent tells Lenis to ignore scroll/
                  // wheel input over this region rather than smoothing
                  // it into a page scroll — the standard fix for a
                  // scroll library "stealing" input meant for embedded
                  // content. Caveat: this is well-documented for
                  // same-document nested scrollables; a cross-origin
                  // iframe's *own* content lives in a completely
                  // separate document Lenis can never see into, so if
                  // the embedded page itself has scrollable content,
                  // whether wheel input over it reaches this page at
                  // all (vs. being consumed entirely inside the
                  // iframe) is up to the browser, not something either
                  // Lenis or this attribute can override further.
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: project.embed }}
                />
              </div>
            )}

            {project.gallery?.length > 0 && (
              <div className="project-media-row">
                <h3 className="chip-row-heading mono">Images</h3>
                <CoverflowRow
                  items={project.gallery}
                  itemKey={(src) => src}
                  itemStyle={() => ({ aspectRatio: 1 })}
                  renderItem={(src) => <img src={src} alt="" loading="lazy" draggable={false} />}
                  onItemClick={(src) => setLightboxContent({ type: 'image', src, alt: '' })}
                  ariaLabel="Images"
                  scaleFalloff={0.09}
                  opacityFalloff={0.35}
                />
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Lightbox content={lightboxContent} onClose={() => setLightboxContent(null)} />
    </section>
  )
})