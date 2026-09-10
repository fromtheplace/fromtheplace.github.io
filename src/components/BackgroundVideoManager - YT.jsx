import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { loadYouTubeIframeAPI } from '../lib/youtube'

const BG_OPACITY = 0.1
const BG_PLAYBACK_RATE = 0.5

// One ambient background video. Unlike the per-project Shorts, this is
// instantiated exactly once and left playing muted for the entire visit,
// which is what keeps the crossfade smooth, there is no create/destroy
// churn as the visitor scrolls, only an opacity swap between two videos
// that are already running. Played back at half speed, since looping
// resets the rate each time, it's reapplied on every state change too.
function AmbientVideo({ videoId }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let player = null

    function applySlowRate(target) {
      try {
        target.setPlaybackRate(BG_PLAYBACK_RATE)
      } catch (e) {
        // ignore, some videos only offer a limited set of rates
      }
    }

    loadYouTubeIframeAPI().then((YT) => {
      if (cancelled || !containerRef.current) return
      player = new YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          loop: 1,
          playlist: videoId,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            event.target.mute()
            applySlowRate(event.target)
            event.target.playVideo()
          },
          onStateChange: (event) => {
            // looping restarts the video and can reset playback rate,
            // reapply it every time playback (re)starts
            if (event.data === 1) applySlowRate(event.target)
          },
        },
      })
    })

    return () => {
      cancelled = true
      if (player) {
        try {
          player.destroy()
        } catch (e) {
          // already gone, ignore
        }
      }
    }
  }, [videoId])

  return (
    <div className="bg-yt-crop">
      <div className="bg-yt-iframe" ref={containerRef} />
    </div>
  )
}

// Renders exactly two ambient background videos, both playing from the
// moment the page loads, and crossfades which one is visible based on how
// far down the whole page the visitor has scrolled, switching once at the
// halfway point. No per-project background logic, no player churn.
export function BackgroundVideoProvider({ children, videoIds }) {
  const [showSecond, setShowSecond] = useState(false)

  useEffect(() => {
    let ticking = false

    function checkProgress() {
      ticking = false
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      setShowSecond(progress >= 0.5)
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(checkProgress)
    }

    checkProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const [firstId, secondId] = videoIds

  return (
    <>
      <div className="bg-video-stage" aria-hidden="true">
        <motion.div
          className="bg-layer-wrap"
          animate={{ opacity: showSecond ? 0 : BG_OPACITY }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ zIndex: showSecond ? 0 : 1 }}
        >
          <AmbientVideo videoId={firstId} />
        </motion.div>
        <motion.div
          className="bg-layer-wrap"
          animate={{ opacity: showSecond ? BG_OPACITY : 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ zIndex: showSecond ? 1 : 0 }}
        >
          <AmbientVideo videoId={secondId} />
        </motion.div>
        <div className="bg-video-scrim" />
      </div>
      {children}
    </>
  )
}
