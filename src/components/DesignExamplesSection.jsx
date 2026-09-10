import { forwardRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CoverflowRow } from './CoverflowRow.jsx'


const GROUPS = [
{
    label: 'Selected Examples',
    items: [
	
	 {
        title: 'Take You Thee',
        ratio: 1.3109,
        grid: 'images/grid/take_you_thee.png',
        full: 'images/full/take_you_thee.png',
      },
      {
        title: 'NEWNEWNEW',
        ratio: 0.7749,
        grid: 'images/grid/newnewnew.png',
        full: 'images/full/newnewnew.png',
      },
      {
        title: 'Vapourium',
        ratio: 0.6912,
        grid: 'images/grid/vapourium.png',
        full: 'images/full/vapourium.png',
      },
      {
        title: 'Undertow',
        ratio: 2.1278,
        grid: 'images/grid/undertow.png',
        full: 'images/full/undertow.png',
      },
      {
        title: 'OCHO',
        ratio: 2.0832,
        grid: 'images/grid/ocho.png',
        full: 'images/full/ocho.png',
      },
      
    ],
  },
  {
    label: 'Poster Design',
    items: [
    {
        title: 'EXPJ 5',
        ratio: 0.8559,
        grid: 'images/grid/expj_5.png',
        full: 'images/full/expj_5.png',
      },
      {
        title: 'Us Not Them',
        ratio: 0.8746,
        grid: 'images/grid/us_not_them.png',
        full: 'images/full/us_not_them.png',
      },
      {
        title: 'KODE9',
        ratio: 0.8295,
        grid: 'images/grid/kode9.png',
        full: 'images/full/kode9.png',
      },
	  {
        title: 'Robots in Love',
        ratio: 0.8628,
        grid: 'images/grid/robots_in_love.png',
        full: 'images/full/robots_in_love.png',
      },
      {
        title: 'Fresh Produce',
        ratio: 0.8816,
        grid: 'images/grid/fresh_produce.png',
        full: 'images/full/fresh_produce.png',
      },
      {
        title: 'LOEFAH',
        ratio: 0.8377,
        grid: 'images/grid/loefah.png',
        full: 'images/full/loefah.png',
      },
      
	  
    ],
  },
  
  {
    label: 'Cover + layout design',
    items: [
      {
        title: 'ORC Plan',
        ratio: 2.1749,
        grid: 'images/grid/orc_plan.png',
        full: 'images/full/orc_plan.png',
      },
      {
        title: 'Te Karaka',
        ratio: 2.1575,
        grid: 'images/grid/te_karaka.png',
        full: 'images/full/te_karaka.png',
      },
	
    ],
  },
  
]


const ALL_IMAGES = GROUPS.flatMap((g) => g.items)


function DesignRow({ label, items, compact, parallaxIndex, onOpenLightbox, resolveGlobalIndex }) {
  
  const parallaxDirection = parallaxIndex % 2 === 0 ? 1 : -1
  const parallaxSpeed = 0.18 + (parallaxIndex % 3) * 0.06

  return (
    <div>
      {label && <div className="design-grid-group-label mono">{label}</div>}
      <CoverflowRow
        items={items}
        itemKey={(item) => item.title}
        trackClassName={compact ? 'design-grid-row--compact' : undefined}
        itemStyle={(item) => ({ aspectRatio: item.ratio })}
        renderItem={(item) => <img src={item.grid} alt={item.title} loading="lazy" draggable={false} />}
        onItemClick={(item) => onOpenLightbox(resolveGlobalIndex(item))}
        ariaLabel={label || 'Design examples'}
        parallaxSpeed={parallaxSpeed}
        parallaxDirection={parallaxDirection}
      />
    </div>
  )
}

export const DesignExamplesSection = forwardRef(function DesignExamplesSection(
  { project },
  ref
) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  function lightboxNext() {
    setLightboxIndex((i) => (i + 1) % ALL_IMAGES.length)
  }
  function lightboxPrev() {
    setLightboxIndex((i) => (i - 1 + ALL_IMAGES.length) % ALL_IMAGES.length)
  }

  useEffect(() => {
    if (lightboxIndex === null) return undefined

    function onKeyDown(e) {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') lightboxNext()
      if (e.key === 'ArrowLeft') lightboxPrev()
    }
    window.addEventListener('keydown', onKeyDown)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex])

  return (
    <section className="project-section design-grid-section" id={project.id} ref={ref}>
      <div className="design-grid-content">
        <div>
          <div className="design-grid-eyebrow mono"></div>
          <div className="design-grid-headings">
            <span>Print Design & Graphics</span>
 
          </div>
        </div>

        <div className="design-grid-groups">
          {GROUPS.map((group, i) => (
            <DesignRow
              key={group.label || i}
              label={group.label}
              items={group.items}
              compact={group.compact}
              parallaxIndex={i}
              onOpenLightbox={setLightboxIndex}
              resolveGlobalIndex={(item) => ALL_IMAGES.indexOf(item)}
            />
          ))}
        </div>
      </div>

      {lightboxIndex !== null && createPortal(
        <div className="modal-image-lightbox" onClick={() => setLightboxIndex(null)}>
          <span className="modal-image-lightbox-close" onClick={() => setLightboxIndex(null)}>&times;</span>

          <div className="modal-image-lightbox-counter mono">
            {lightboxIndex + 1} / {ALL_IMAGES.length}
          </div>

          <button
            type="button"
            className="modal-image-lightbox-nav modal-image-lightbox-prev"
            onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
            aria-label="Previous image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          <img
            src={ALL_IMAGES[lightboxIndex].full}
            alt={ALL_IMAGES[lightboxIndex].title}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            className="modal-image-lightbox-nav modal-image-lightbox-next"
            onClick={(e) => { e.stopPropagation(); lightboxNext() }}
            aria-label="Next image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>,
        document.body
      )}
    </section>
  )
})