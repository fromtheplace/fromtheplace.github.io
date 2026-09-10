import { useEffect, useRef, useState } from 'react'
import { loadYouTubeIframeAPI, registerPlayback, clearPlaybackIfActive } from '../lib/youtube'
import { useSoundGate } from './SoundGateProvider.jsx'
import { CoverflowRow } from './CoverflowRow.jsx'
import { PlayIcon } from './ChipIcons.jsx'

// Exported so other sections that feature a single "tablet" video —
// e.g. AllVideosSection's site-wide video chip browser — can reuse the
// exact same YouTube IFrame API / sound-gate / play-on-active behavior
// instead of re-implementing it.
export function MainVideoEmbed({ video, isActive }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const frameRef = useRef(null)
  const isFirstOrientation = useRef(true)
  const [ready, setReady] = useState(false)
  const { soundOn, unlock } = useSoundGate()

  // Portrait/landscape is an explicit flag on the video entry itself
  // (video.portrait, set by whoever adds it to watchAllVideos.js or a
  // project's chip data) rather than auto-detected. An earlier version
  // of this tried detecting it from YouTube's oEmbed response, but
  // oEmbed's width/height turned out to just be a generic small embed-
  // size suggestion — not the source's real proportions — so it
  // couldn't actually tell a portrait video from a landscape one
  // (confirmed: two different videos, one of which was genuinely
  // portrait, both came back ~200px wide with unrelated small ratios,
  // neither near a real 9:16). Since this data is already hand-
  // maintained, flagging it directly is both simpler and correct where
  // an unreliable heuristic wasn't.
  const isPortrait = Boolean(video.portrait)

  // Plays the tablet-frame-flip animation (App.css) whenever the frame
  // actually changes shape — skipped on the very first render so a
  // section doesn't flip the instant it scrolls into view, only on an
  // actual tablet<->phone change thereafter. Re-triggering needs a
  // forced reflow: just adding the class back doesn't restart a CSS
  // animation if a previous render already left it present (e.g. two
  // quick switches back to back), so it's removed, the layout is
  // read once to flush that removal, then re-added.
  useEffect(() => {
    if (isFirstOrientation.current) {
      isFirstOrientation.current = false
      return
    }
    const el = frameRef.current
    if (!el) return
    el.classList.remove('tablet-frame--flipping')
    void el.offsetWidth
    el.classList.add('tablet-frame--flipping')
  }, [isPortrait])

  useEffect(() => {
    if (!containerRef.current) return undefined
    let cancelled = false

    loadYouTubeIframeAPI().then((YT) => {
      if (cancelled || !containerRef.current) return

      // If a player already exists (e.g. featured video changed), destroy
      // it first and rebuild for the new video id.
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch (_) {}
        playerRef.current = null
        setReady(false)
      }

      playerRef.current = new YT.Player(containerRef.current, {
        videoId: video.id,
        playerVars: {
          autoplay: 0,
          mute: 1,
          controls: 1,
          loop: 1,
          playlist: video.id,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          start: video.startTime || 0,
        },
        events: {
          onReady: () => { if (!cancelled) setReady(true) },
        },
      })
    })

    return () => {
      cancelled = true
    }
  // rebuild whenever the featured video id changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id])

  // play/pause + mute/unmute when active state or sound changes
  useEffect(() => {
    const player = playerRef.current
    if (!player || !ready) return

    if (isActive) {
      registerPlayback(player)
      unlock()
      try {
        if (soundOn) {
          player.unMute()
          player.setVolume(100)
        } else {
          player.mute()
        }
        player.playVideo()
        if (soundOn) {
          setTimeout(() => {
            try {
              const state = player.getPlayerState && player.getPlayerState()
              if (state === -1 || state === 2) {
                player.mute()
                player.playVideo()
              }
            } catch (_) {}
          }, 300)
        }
      } catch (_) {}
    } else {
      try { player.pauseVideo() } catch (_) {}
      clearPlaybackIfActive(player)
    }
  }, [isActive, ready, soundOn, unlock])

  useEffect(() => {
    return () => {
      const player = playerRef.current
      if (!player) return
      try { player.pauseVideo() } catch (_) {}
      clearPlaybackIfActive(player)
    }
  }, [])

  return (
    <div
      ref={frameRef}
      className={`tablet-frame${isPortrait ? ' tablet-frame--phone' : ''}`}
      onAnimationEnd={(e) => {
        if (e.animationName === 'tablet-frame-flip') {
          e.currentTarget.classList.remove('tablet-frame--flipping')
        }
      }}
    >
      <div className="tablet-screen">
        <div className="tablet-embed" ref={containerRef} />
      </div>
    </div>
  )
}

function renderIncidentalThumb(video) {
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

// Public component. mainVideo = project's primary clip, incidental =
// extras. Clicking an incidental thumb swaps it into the tablet frame;
// scrolling back to this project (or to a new one) resets to mainVideo.
// The incidental strip uses the same CoverflowRow convention as
// DesignExamplesSection's poster rows and AllVideosSection's video
// rows — thumbnail only, no text, scale-on-scroll, self-hiding edge
// arrow — rather than the plain scrolling chip-pill strip this used to
// be, for the same look/feel everywhere a row of video thumbs appears.
export function ProjectShorts({ mainVideo, incidental, projectIsActive }) {
  const [featured, setFeatured] = useState(mainVideo)

  // when the active project changes, reset to the first video
  useEffect(() => {
    if (projectIsActive) setFeatured(mainVideo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIsActive, mainVideo?.id])

  if (!mainVideo) return null

  const activeVideo = featured || mainVideo

  return (
    <div className="project-shorts">
      <div className="tablet-frame-wrap">
        <div className="tablet-glow" aria-hidden="true" />
        <MainVideoEmbed
          video={activeVideo}
          isActive={projectIsActive}
        />
      </div>

      {incidental && incidental.length > 0 && (
        <div className="incidental-row">
          <CoverflowRow
            items={incidental}
            itemKey={(video) => video.id}
            itemClassName={() => 'video-thumb-item'}
            itemStyle={() => ({ aspectRatio: 4 / 3 })}
            itemAriaLabel={(video) => video.title || 'Watch'}
            renderItem={renderIncidentalThumb}
            isSelected={(video) => activeVideo.id === video.id}
            onItemClick={setFeatured}
            ariaLabel="More videos"
            scaleFalloff={0.09}
            opacityFalloff={0.35}
          />
        </div>
      )}
    </div>
  )
}
