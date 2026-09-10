// Determines whether a YouTube video is portrait (e.g. Shorts, vertical
// social content) or landscape by reading its real dimensions from
// YouTube's oEmbed endpoint — https://www.youtube.com/oembed. No API
// key required. This is the only practical client-side source for
// this: the IFrame Player API has no method that reports a video's
// native aspect ratio (nothing like player.getAspectRatio()), so
// "get the aspect ratio from the link itself" has to come from here
// instead of a per-section CSS guess.
//
// CAVEAT — I haven't been able to verify a live oEmbed response from
// this environment (youtube.com isn't in my sandbox's reachable
// domains), so this is built from documented/commonly-observed oEmbed
// behavior, not a request I've actually run. Worth a quick check once
// this is deployed: open a known Shorts id and confirm isPortrait
// comes back true.
//
// oEmbed's `width`/`height` fields describe the embed iframe YouTube
// suggests for the content — that's the field that should actually
// vary by source orientation (portrait for a Short), so it's the
// primary signal here. `thumbnail_width`/`thumbnail_height` describe
// the static preview image instead, which YouTube generates at fixed,
// historically-landscape sizes, and is used only as a fallback if the
// embed dimensions are missing. (An earlier version of this file had
// these two prioritized the other way round, which was very likely
// why a known Shorts video wasn't flipping the tablet to phone mode.)
//
// Results are cached in-memory per video id (the promise itself, not
// just the resolved value, so concurrent callers for the same id share
// one fetch rather than firing it twice) — a visitor clicking through
// many chips in one session shouldn't re-fetch oEmbed for a video
// they've already seen.
const cache = new Map()

const FALLBACK = { width: 16, height: 9, ratio: 16 / 9, isPortrait: false }

export function getVideoOrientation(videoId) {
  if (!videoId) return Promise.resolve(FALLBACK)
  if (cache.has(videoId)) return cache.get(videoId)

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const promise = fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`)
    .then((res) => {
      if (!res.ok) throw new Error(`oEmbed responded ${res.status}`)
      return res.json()
    })
    .then((data) => {
      // width/height describe the embed iframe oEmbed suggests for
      // the content's natural shape — for a Short that should come
      // back portrait, which is the actual signal we want. Fall back
      // to thumbnail_width/height only if those are missing — the
      // thumbnail is a static preview image at YouTube's fixed,
      // historically-landscape sizes (hqdefault.jpg etc.) and likely
      // doesn't vary by source orientation the way the embed
      // dimensions do. (Previous version prioritized these the other
      // way round — if a known Shorts video still wasn't flipping to
      // phone mode, this was almost certainly why.)
      const width = data.width || data.thumbnail_width
      const height = data.height || data.thumbnail_height
      if (!width || !height) throw new Error('oEmbed response missing dimensions')
      const result = { width, height, ratio: width / height, isPortrait: height > width }
      // Temporary — remove once orientation switching is confirmed
      // working. This is the only way to tell "genuinely landscape
      // video" apart from "the lookup silently failed" from outside
      // devtools, which is exactly the ambiguity that made this hard
      // to debug last time.
      // eslint-disable-next-line no-console
      console.debug('[videoAspect]', videoId, result)
      return result
    })
    .catch((err) => {
      // Same reasoning — a swallowed error and a real landscape video
      // were indistinguishable before this. If you see this firing for
      // every video, the fetch itself is failing (CORS/CSP/network),
      // not "every video happens to be landscape".
      // eslint-disable-next-line no-console
      console.warn('[videoAspect] orientation lookup failed for', videoId, err)
      return FALLBACK
    })

  cache.set(videoId, promise)
  return promise
}