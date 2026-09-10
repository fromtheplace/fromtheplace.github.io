import { useEffect } from 'react'
import Lenis from 'lenis'

// Module-level so any component (e.g. nav jumpTo) can reach the same
// Lenis instance without prop-drilling.
let lenisInstance = null
export function getLenis() {
  return lenisInstance
}

// Kept for compatibility with existing callers; there's no discrete
// section index to sync anymore, this is now a no-op.
export function setLenisSectionIndex() {}

// ============================================================
// Plain smooth scrolling. That's it.
// ============================================================
// Today went through several increasingly elaborate attempts to force
// scroll into discrete "one gesture = one section" snapping — JS
// idle-detection, native CSS scroll-snap, then fully hand-rolled wheel/
// touch interception with manual index tracking. Each one fixed its
// predecessor's symptom while introducing a new failure mode, and the
// last one broke scrolling entirely (wheel events fully intercepted,
// scroll only working via scrollbar drag because that bypasses wheel/
// touch events altogether).
//
// None of that complexity is actually necessary. The layout no longer
// has sections taller than the viewport, so ordinary momentum-based
// smooth scroll reads perfectly well as "one scroll roughly = one
// section" without forcing it — and it can't break in the ways above,
// because there's exactly one thing here: Lenis smoothing native
// scroll. No preventDefault, no manual state, no snap.
export function useLenis() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return undefined

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    })
    lenisInstance = lenis

    let frameId
    function raf(time) {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])
}
