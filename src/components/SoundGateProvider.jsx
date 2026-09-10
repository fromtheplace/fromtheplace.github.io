import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const SoundGateContext = createContext({
  hasInteracted: false,
  userMuted: false,
  soundOn: false,
  toggleMute: () => {},
  unlock: () => {},
})

export function useSoundGate() {
  return useContext(SoundGateContext)
}

// Browsers block unmuted autoplay until the visitor has interacted with
// the page at least once (a real click/tap/keypress; scroll alone does
// not count in most desktop browsers, though some mobile browsers treat
// a touch-driven scroll as a qualifying gesture). Starts muted, flips on
// permanently after the first qualifying interaction, plus a manual mute
// toggle so the visitor can turn sound back off if they want to.
export function SoundGateProvider({ children }) {
  const [hasInteracted, setHasInteracted] = useState(false)  // becomes true on first real gesture
  const [userMuted, setUserMuted] = useState(false)

  useEffect(() => {
    if (hasInteracted) return undefined

    const unlock = () => setHasInteracted(true)
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [hasInteracted])

  const toggleMute = useCallback(() => {
    setHasInteracted(true)
    setUserMuted((prev) => !prev)
  }, [])

  const unlock = useCallback(() => setHasInteracted(true), [])

  const value = {
    hasInteracted,
    userMuted,
    soundOn: hasInteracted && !userMuted,
    toggleMute,
    unlock,
  }

  return <SoundGateContext.Provider value={value}>{children}</SoundGateContext.Provider>
}
