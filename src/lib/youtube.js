// Loads the YouTube IFrame API exactly once for the whole app and exposes
// a tiny registry so that, no matter how many ProjectShorts instances exist,
// only one Short can ever be playing across the entire site at a time.

let apiPromise = null

export function loadYouTubeIframeAPI() {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }

    const existingCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof existingCallback === 'function') existingCallback()
      resolve(window.YT)
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })

  return apiPromise
}

// currently playing player instance, tracked globally
let activePlayer = null

export function registerPlayback(player) {
  if (activePlayer && activePlayer !== player) {
    try {
      activePlayer.pauseVideo()
    } catch (e) {
      // player may already be destroyed, ignore
    }
  }
  activePlayer = player
}

export function clearPlaybackIfActive(player) {
  if (activePlayer === player) {
    activePlayer = null
  }
}
