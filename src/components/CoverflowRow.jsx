import { useEffect, useRef, useState } from 'react'

// Shared "coverflow" sliding-row interaction, extracted once this
// pattern hit its third use site (DesignExamplesSection's poster rows,
// AllVideosSection's video rows, ProjectShorts' incidental strip —
// ProjectModal next). All the scroll-snap / scale-on-scroll /
// drag-to-scroll / click-vs-drag-guard / self-hiding edge-arrow
// mechanics live here exactly once; callers only supply what's
// different about their items (how each one renders, its aspect
// ratio, what a click does).
//
// Renders the same .design-grid-row-wrap / .design-grid-row /
// .design-grid-item / .design-grid-row-nav classes every row in the
// site already uses, so sizing is controlled entirely by CSS scoped to
// each call site's wrapper (see e.g. .video-library-groups-scroll
// .design-grid-row and .incidental-row .design-grid-row in App.css),
// not by props here.
export function CoverflowRow({
  items,
  itemKey,
  renderItem,
  itemClassName,
  itemStyle,
  itemAriaLabel,
  isSelected,
  onItemClick,
  ariaLabel,
  trackClassName,
  scaleFalloff = 0.000,
  opacityFalloff = 0.4,
  // Opt-in only — 0 (default) leaves every existing call site (video
  // rows, incidental strip) exactly as it was. When set, the row also
  // drifts horizontally as the *page* scrolls vertically: each frame's
  // scrollLeft is nudged by (page scrollY delta) * parallaxSpeed *
  // parallaxDirection. It's a relative increment, not an absolute
  // position, so it composes with manual swipe/drag rather than
  // fighting or resetting it — see the effect below for why.
  parallaxSpeed = 0,
  parallaxDirection = 1,
}) {
  const trackRef = useRef(null)
  const itemRefs = useRef([])
  const dragRef = useRef({ down: false, dragging: false, moved: false, pointerId: null, startX: 0, startScroll: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isWheeling, setIsWheeling] = useState(false)
  const wheelEndTimeoutRef = useRef(null)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)

  function updateScales() {
    const track = trackRef.current
    if (!track) return
    const trackRect = track.getBoundingClientRect()
    const centerX = trackRect.left + trackRect.width / 2
    const halfWidth = trackRect.width / 2 || 1

    itemRefs.current.forEach((el) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const dist = r.left + r.width / 2 - centerX
      const norm = Math.min(Math.abs(dist) / halfWidth, 1)
      el.style.transform = `scale(${1 - norm * scaleFalloff})`
      el.style.opacity = 1 - norm * opacityFalloff
    })

    const canRight = track.scrollWidth - track.clientWidth - track.scrollLeft > 4
    setCanScrollRight((prev) => (prev === canRight ? prev : canRight))
    const canLeft = track.scrollLeft > 4
    setCanScrollLeft((prev) => (prev === canLeft ? prev : canLeft))
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    updateScales()

    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        updateScales()
        ticking = false
      })
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // image 'load' doesn't bubble, but capture-phase listeners still
    // see it on the way down — catches late-loading images shifting
    // item widths so scale (and the arrow's visibility) settle correctly.
    track.addEventListener('load', onScroll, true)

    return () => {
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      track.removeEventListener('load', onScroll, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // Vertical-scroll-driven horizontal drift — disabled entirely
  // (no listener attached at all) unless a caller opts in with
  // parallaxSpeed. Uses a relative per-frame delta rather than
  // computing an absolute scroll position, so it naturally composes
  // with whatever the user is doing manually (swipe/drag) instead of
  // needing to reconcile with it.
  useEffect(() => {
    if (!parallaxSpeed) return undefined
    const track = trackRef.current
    if (!track) return undefined

    let lastScrollY = window.scrollY
    let ticking = false

    function onWindowScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const currentY = window.scrollY
        const deltaY = currentY - lastScrollY
        lastScrollY = currentY
        if (dragRef.current.dragging || deltaY === 0) return

        // Skip rows well outside the viewport so drift doesn't
        // silently pile up (and jump) while a row is scrolled past.
        const rect = track.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) return

        track.scrollLeft += deltaY * parallaxSpeed * parallaxDirection
      })
    }

    window.addEventListener('scroll', onWindowScroll, { passive: true })
    return () => window.removeEventListener('scroll', onWindowScroll)
  }, [parallaxSpeed, parallaxDirection])

  // Lets a plain mouse wheel (vertical wheel input) scroll the row
  // horizontally while hovering it — native overflow-x containers don't
  // reliably do this across browsers on their own. Needs a real
  // addEventListener rather than JSX's onWheel: React attaches wheel
  // listeners as passive by default (a React 17+ change for scroll
  // performance), and event.preventDefault() silently fails — or logs
  // a console warning — inside a passive listener, so there's no way
  // to actually claim the gesture through the JSX prop alone.
  //
  // Only intercepts when it's actually a vertical wheel gesture (a
  // trackpad's native horizontal swipe reports deltaX instead, and
  // should scroll the row via the browser's own handling untouched)
  // and the row actually has somewhere to scroll at all. Deliberately
  // does NOT hand off to page scroll once a row hits either edge —
  // every section on this site is a full-viewport scroll-snap, so
  // "chaining through" at a carousel's edge risks yanking the visitor
  // to an entirely different project mid-browse, not just revealing a
  // little more content the way scroll-chaining normally would on an
  // ordinary page. Wheel input just stays trapped in the row for as
  // long as the cursor is over it; moving off it is what hands control
  // back to the page.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    function handleWheel(e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

      const maxScrollLeft = track.scrollWidth - track.clientWidth
      if (maxScrollLeft <= 0) return

      e.preventDefault()
      e.stopPropagation()

      // Scroll-snap has no concept of "mid-gesture" for these writes —
      // each wheel tick is a discrete, instant scrollLeft jump rather
      // than one continuous native scroll, so scroll-snap-type: x
      // proximity treats the momentary pause between ticks as
      // "settled" and pulls the row back toward the nearest snap
      // point before the next tick lands — that tug-of-war is the
      // "stuck halfway" symptom. Suppressing snap for the gesture's
      // duration (same trick .is-dragging already uses for pointer
      // drag) fixes it; re-enabled a short beat after the last wheel
      // tick, once the gesture has actually finished, via a debounced
      // timeout since wheel has no clean start/end event the way
      // pointer down/up does.
      setIsWheeling(true)
      clearTimeout(wheelEndTimeoutRef.current)
      // 350ms rather than a shorter gap: for a normal narrow item, even
      // if snap re-enables slightly early it's imperceptible (a tiny
      // pull toward a nearby center). For a very wide item, the same
      // premature re-enable yanks the row a much larger, obvious
      // distance toward its center — proximity snap's "how close
      // counts as close" zone scales with the item's own width. This
      // needs to reliably span the natural gaps between wheel ticks
      // during a real, ongoing gesture (a slower, deliberate scroll on
      // a discrete mouse wheel has bigger gaps between ticks than a
      // trackpad's momentum scroll), or snap sneaks back on mid-
      // gesture and this is the "getting stuck on the wide images"
      // symptom.
      wheelEndTimeoutRef.current = setTimeout(() => setIsWheeling(false), 350)

      // scrollLeft clamps silently at either bound (no error, no
      // overshoot) — so continuing to wheel past an edge just holds
      // the row at its limit rather than doing anything unexpected.
      track.scrollLeft += e.deltaY
    }

    track.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      track.removeEventListener('wheel', handleWheel)
      clearTimeout(wheelEndTimeoutRef.current)
    }
  }, [])

  function handlePointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const track = trackRef.current
    if (!track) return
    dragRef.current = {
      down: true,
      dragging: false,
      moved: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: track.scrollLeft,
    }
  }

  function handlePointerMove(e) {
    const drag = dragRef.current
    const track = trackRef.current
    if (!drag.down || !track) return
    const dx = e.clientX - drag.startX

    if (!drag.dragging) {
      if (Math.abs(dx) <= 4) return
      // Crossed the drag threshold for the first time — only now do we
      // capture the pointer, so a plain tap never touches this at all
      // and never risks swallowing its own click.
      drag.dragging = true
      drag.moved = true
      track.setPointerCapture(drag.pointerId)
      setIsDragging(true)
    }

    track.scrollLeft = drag.startScroll - dx
  }

  function endDrag() {
    dragRef.current.down = false
    dragRef.current.dragging = false
    setIsDragging(false)
  }

  // Swallows the click that would otherwise fire on an item right
  // after a drag gesture releases, so dragging past an item doesn't
  // also trigger onItemClick. A plain tap never sets drag.moved, so it
  // always fires normally.
  function handleTrackClickCapture(e) {
    if (dragRef.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current.moved = false
    }
  }

  // Scrolls directly to the actual next/previous item's real center,
  // using each item's own measured geometry — not a fixed fraction of
  // the track's width. A fixed-fraction step (the previous approach)
  // works fine when items are roughly uniform width, but a very wide
  // item can exceed that fixed step entirely: the click only covers
  // part of it, landing in dead space too far from either item's
  // center for scroll-snap's proximity mode to catch — hence needing
  // a second click to actually reach the next item. Using each item's
  // real center instead means one click always lands exactly on the
  // next/previous item's snap point, regardless of how wide any given
  // item is.
  function getItemCenters() {
    const track = trackRef.current
    if (!track) return []
    const trackRect = track.getBoundingClientRect()
    return itemRefs.current
      .filter(Boolean)
      .map((el) => {
        const r = el.getBoundingClientRect()
        // Center in the same coordinate space track.scrollLeft itself
        // uses (content-space, independent of current scroll position)
        // — getBoundingClientRect rather than offsetLeft/offsetParent,
        // matching updateScales' own approach above, since offsetLeft
        // depends on which ancestor ends up being this element's
        // offsetParent and that isn't guaranteed by this row's DOM
        // structure.
        return r.left - trackRect.left + track.scrollLeft + r.width / 2
      })
  }

  function scrollToCenter(centerX) {
    const track = trackRef.current
    if (!track) return
    const maxScrollLeft = track.scrollWidth - track.clientWidth
    const target = Math.max(0, Math.min(maxScrollLeft, centerX - track.clientWidth / 2))
    track.scrollTo({ left: target, behavior: 'smooth' })
  }

  function scrollNext() {
    const track = trackRef.current
    if (!track) return
    const currentCenter = track.scrollLeft + track.clientWidth / 2
    // +8px epsilon so the item already centered doesn't count as "next"
    const next = getItemCenters().find((c) => c > currentCenter + 8)
    if (next !== undefined) {
      scrollToCenter(next)
    } else {
      track.scrollTo({ left: track.scrollWidth - track.clientWidth, behavior: 'smooth' })
    }
  }

  function scrollPrev() {
    const track = trackRef.current
    if (!track) return
    const currentCenter = track.scrollLeft + track.clientWidth / 2
    const centers = getItemCenters()
    let prev
    for (let i = centers.length - 1; i >= 0; i -= 1) {
      if (centers[i] < currentCenter - 8) {
        prev = centers[i]
        break
      }
    }
    if (prev !== undefined) {
      scrollToCenter(prev)
    } else {
      track.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="design-grid-row-wrap">
      {canScrollLeft && (
        <button
          type="button"
          className="design-grid-row-nav design-grid-row-nav--prev"
          onClick={scrollPrev}
          aria-label={`Scroll ${ariaLabel || 'row'} left`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}

      <div
        ref={trackRef}
        className={
          'design-grid-row' +
          (trackClassName ? ` ${trackClassName}` : '') +
          (isDragging ? ' is-dragging' : '') +
          (isWheeling ? ' is-wheeling' : '')
        }
        role="region"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={handleTrackClickCapture}
      >
        {items.map((item, i) => {
          const selected = isSelected ? isSelected(item) : false
          return (
            <button
              key={itemKey(item)}
              type="button"
              className={
                'design-grid-item' +
                (itemClassName ? ` ${itemClassName(item)}` : '') +
                (selected ? ' is-selected' : '')
              }
              ref={(el) => { itemRefs.current[i] = el }}
              style={itemStyle ? itemStyle(item) : undefined}
              onClick={() => onItemClick(item)}
              aria-pressed={isSelected ? selected : undefined}
              aria-label={itemAriaLabel ? itemAriaLabel(item) : undefined}
            >
              {renderItem(item, { isSelected: selected })}
            </button>
          )
        })}
      </div>

      {canScrollRight && (
        <button
          type="button"
          className="design-grid-row-nav"
          onClick={scrollNext}
          aria-label={`Scroll ${ariaLabel || 'row'} right`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      )}
    </div>
  )
}