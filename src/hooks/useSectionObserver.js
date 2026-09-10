import { useEffect, useRef, useState } from 'react'

// Watches a set of section refs and works out, on every intersection change,
// which single section counts as "active" (highest visible ratio past the
// threshold). Sections that were active and drop below the threshold report
// "leaving" for one tick before becoming inactive, so callers can run exit
// animations or stop playback cleanly.
export function useSectionObserver(count, { threshold = 0.55 } = {}) {
  const refs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const ratiosRef = useRef(new Array(count).fill(0))

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = refs.current.indexOf(entry.target)
          if (index === -1) return
          ratiosRef.current[index] = entry.isIntersecting ? entry.intersectionRatio : 0
        })

        let bestIndex = -1
        let bestRatio = threshold
        ratiosRef.current.forEach((ratio, i) => {
          if (ratio >= bestRatio) {
            bestRatio = ratio
            bestIndex = i
          }
        })

        // Previously this only updated activeIndex when some section
        // crossed the threshold, so the outgoing section stayed "active"
        // (and kept playing) until a new one won the race. Now bestIndex
        // of -1 (nothing currently past threshold, e.g. mid-scroll
        // between two sections) is a valid state: nothing is active, so
        // playback should stop rather than waiting for the next section.
        setActiveIndex(bestIndex)
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20), // 0, 0.05, ... 1
      }
    )

    refs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [count, threshold])

  const setRef = (index) => (el) => {
    refs.current[index] = el
  }

  return { activeIndex, setRef }
}
