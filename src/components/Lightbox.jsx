import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Generic full-screen overlay for viewing a single video (YouTube embed)
// or image without it ever taking up layout space inside a project
// section. Rendered via a portal straight onto <body> so it can never
// add height to a scroll-snapped section, closes on backdrop click,
// close button, or Escape.
export function Lightbox({ content, onClose }) {
  useEffect(() => {
    if (!content) return undefined

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    // lock background scroll while lightbox is open
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [content, onClose])

  if (!content) return null

  return createPortal(
    <div className="lightbox-backdrop" onClick={onClose}>
      <button
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>

      <div className="lightbox-body" onClick={(e) => e.stopPropagation()}>
        {content.type === 'video' ? (
          <div className="lightbox-video-frame">
            <iframe
              src={`https://www.youtube.com/embed/${content.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1${
                content.startTime ? `&start=${content.startTime}` : ''
              }`}
              title={content.title || 'Video'}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <img className="lightbox-image" src={content.src} alt={content.alt || ''} />
        )}
        {content.title && <p className="lightbox-caption mono">{content.title}</p>}
      </div>
    </div>,
    document.body
  )
}
