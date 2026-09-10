import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayIcon, ExternalLinkIcon, ImageIcon } from './ChipIcons.jsx'

// Renders one chip (url, youtube, twitch, iframe, image) in the vertical
// strip beside the modal text. All chip types share the same pill shape
// as the plain text press/link chips; youtube, image, and image-link
// chips get the larger "media" pill size since they carry a thumbnail.
function ModalChip({ chip, isSelected, onYouTubeSelect, onImageSelect }) {
  if (chip.type === 'image') {
    return (
      <button
        type="button"
        className="chip-pill chip-pill-media modal-chip-image"
        onClick={() => onImageSelect(chip.src)}
      >
        <img className="chip-pill-thumb" src={chip.src} alt="" loading="lazy" />
        <ImageIcon className="chip-pill-platform" />
        <span className="chip-pill-label mono">{chip.title || 'View image'}</span>
      </button>
    )
  }

  if (chip.type === 'youtube') {
    return (
      <button
        type="button"
        className={`chip-pill chip-pill-media modal-chip-video${isSelected ? ' modal-chip-active' : ''}`}
        onClick={() => onYouTubeSelect(chip)}
        aria-pressed={isSelected}
      >
        <img
          className="chip-pill-thumb"
          src={chip.thumbnail || `https://i.ytimg.com/vi/${chip.id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
        />
        <PlayIcon className="chip-pill-platform" />
        <span className="chip-pill-label mono">{chip.title || 'Watch'}</span>
      </button>
    )
  }

  if (chip.type === 'url') {
    const thumb = chip.localImage || null
    return (
      <a
        className={`chip-pill modal-chip-link${thumb ? ' chip-pill-media' : ''}`}
        href={chip.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {thumb && <img className="chip-pill-thumb" src={thumb} alt="" loading="lazy" />}
        <span className="chip-pill-label mono">{chip.title || 'Read more'}</span>
        <ExternalLinkIcon className="chip-pill-platform" />
      </a>
    )
  }

  if (chip.type === 'twitch') {
    const url = `https://www.twitch.tv/videos/${chip.videoId}${chip.timestamp ? `?t=${chip.timestamp}` : ''}`
    return (
      <a
        className="chip-pill modal-chip-twitch"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {chip.thumbnail && <img className="chip-pill-thumb" src={chip.thumbnail} alt="" loading="lazy" />}
        <PlayIcon className="chip-pill-platform" />
        <span className="chip-pill-label mono">{chip.title || 'Watch on Twitch'}</span>
      </a>
    )
  }

  if (chip.type === 'iframe' && chip.iframe) {
    return (
      <div className="iframe-chip-container">
        {chip.title && <div className="iframe-chip-title mono">{chip.title}</div>}
        <div
          className="iframe-chip-wrapper"
          // studio-authored markup, trusted
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: chip.iframe }}
        />
      </div>
    )
  }

  return null
}

export function ProjectModal({ projects, activeId, onClose, onNavigate }) {
  const index = projects.findIndex((p) => p.id === activeId)
  const project = index >= 0 ? projects[index] : null
  const [featured, setFeatured] = useState(null)
  const [shareStatus, setShareStatus] = useState(null)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const contentRef = useRef(null)
  const touchStartY = useRef(null)
  const touchStartScrollTop = useRef(0)

  // reset state when changing projects, falls back to the project's own
  // mainVideo, same as the tablet resetting to mainVideo on re-entry
  useEffect(() => {
    setFeatured(null)
    setShareStatus(null)
    setLightboxSrc(null)
    if (contentRef.current) contentRef.current.scrollTop = 0
  }, [activeId])

  // keyboard nav + scroll lock
  useEffect(() => {
    if (!project) return undefined

    const goNext = () => onNavigate(projects[(index + 1) % projects.length].id)
    const goPrev = () => onNavigate(projects[(index - 1 + projects.length) % projects.length].id)

    function onKeyDown(e) {
      if (lightboxSrc) {
        if (e.key === 'Escape') setLightboxSrc(null)
        return
      }
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, index, lightboxSrc])

  if (!project) return null

  const goNext = () => onNavigate(projects[(index + 1) % projects.length].id)
  const goPrev = () => onNavigate(projects[(index - 1 + projects.length) % projects.length].id)

  // Swipe-down-to-dismiss (mobile only, matches the full-screen sheet
  // treatment at the 760px breakpoint). Only arms when the modal is
  // scrolled to the very top, so it never fights normal vertical
  // scrolling of the content itself.
  function onTouchStart(e) {
    touchStartY.current = e.touches[0].clientY
    touchStartScrollTop.current = contentRef.current?.scrollTop || 0
  }

  function onTouchEnd(e) {
    if (touchStartY.current === null) return
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    const startedAtTop = touchStartScrollTop.current <= 0
    if (startedAtTop && deltaY > 90) onClose()
    touchStartY.current = null
  }

  // Main video embed at the top, either the project's own hero video or
  // whichever incidental chip video the visitor picked from the strip,
  // same "featured" concept as the scrolling tablet
  const activeVideoId = (featured || project.mainVideo)?.id
  const activeVideoStart = (featured || project.mainVideo)?.startTime || 0

  // Chips: gallery images, incidental videos, and any link / twitch /
  // embed chips, all in one unified pill list — images used to live in
  // a separate media column, which visually competed with the YouTube
  // hero embed above. Now everything but the featured video is one strip.
  const allChips = [
    ...(project.gallery || []).map((src, i) => ({ type: 'image', src, title: project.galleryCaptions?.[i] })),
    ...(project.incidentalVideos || []).map((v) => ({ type: 'youtube', ...v })),
    ...(project.links || []),
  ]
  const hasChips = allChips.length > 0

  async function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?project=${project.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: project.title, url })
      } catch (_) {
        /* user cancelled the native share sheet, nothing to do */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareStatus('Copied')
      setTimeout(() => setShareStatus(null), 2000)
    } catch (_) {
      setShareStatus('Could not copy')
      setTimeout(() => setShareStatus(null), 2000)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        data-lenis-prevent
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          ref={contentRef}
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.97 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* HEADER: counter + close */}
          <div className="modal-header">
            <div className="modal-counter mono">
              {index + 1} / {projects.length}
            </div>
            <button type="button" className="modal-close-x" onClick={onClose} aria-label="Close">
              &times;
            </button>
          </div>

          {/* FULL-WIDTH VIDEO STRIP */}
          {activeVideoId && (
            <div className="modal-video-strip">
              <div className="embed-container">
                <iframe
                  key={activeVideoId}
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&start=${activeVideoStart}&rel=0&modestbranding=1`}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}

          <div className="modal-body-wrap">
            {/* INFO COLUMN */}
            <div className="modal-info-col">
              <div className="modal-text-col">
                <div className="modal-footer-nav modal-top-nav">
                  <button type="button" className="modal-prev" onClick={goPrev} aria-label="Previous project">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    Prev
                  </button>
                  <button type="button" className="modal-next" onClick={goNext} aria-label="Next project">
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>

                {project.badge && <div className="modal-badge mono">{project.badge}</div>}
                <h2 className="modal-title">{project.title}</h2>

                {project.description && (
                  <p
                    className="modal-description"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                )}

                {project.creditsHTML && (
                  <div
                    className="modal-credits credit-list"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: project.creditsHTML }}
                  />
                )}

                {project.embed && (
                  <div
                    className="modal-embed"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: project.embed }}
                  />
                )}

                <button
                  type="button"
                  className={`modal-share-btn ${shareStatus === 'Copied' ? 'copied' : ''}`}
                  onClick={handleShare}
                  aria-label="Share project"
                >
                  {shareStatus === 'Copied' ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  )}
                  {shareStatus || 'Share'}
                </button>
              </div>

              {hasChips && (
                <div className="chips">
                  <div className="chip-container">
                    {allChips.map((chip, i) => (
                      <ModalChip
                        key={chip.id || chip.url || chip.videoId || chip.src || i}
                        chip={chip}
                        isSelected={chip.type === 'youtube' && chip.id === activeVideoId}
                        onYouTubeSelect={(c) => setFeatured({ id: c.id, startTime: c.startTime || 0, title: c.title })}
                        onImageSelect={setLightboxSrc}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {lightboxSrc && (
        <motion.div
          className="modal-image-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxSrc(null)}
        >
          <span className="modal-image-lightbox-close" onClick={() => setLightboxSrc(null)}>&times;</span>
          <img src={lightboxSrc} alt="" onClick={(e) => e.stopPropagation()} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
