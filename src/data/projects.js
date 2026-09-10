import { rawProjectData } from './rawProjectData.js'

// Studio identity, matches the live fromtheplace.github.io site.
export const studio = {
  name: 'from the place',
  tagline: 'Visual narratives and multimedia experiences.',
  eyebrow: 'Creating',
  headline: 'Design, Graphics, Audio & Production',
  location: 'Otepoti / Dunedin, NZ',
  disciplines: ['Design', 'Video', 'Audio', 'Print'],
  contact: 'blamboxcity@gmail.com',
  services: [
    'Graphic / Poster Design',
    'Offset / Digital / Screen Print',
    'Podcast Production',
    'Multicam Live Video',
    'Video & Motion Graphics',
    'Event Videography',
    'Video Editing & Post Production',
    'Live Audio Production',
  ],
}

// Per-project accent / overlay colours, drawn from the visual palette of
// each project's imagery. These become a 10% opacity overlay on the
// video background while that project is active, colouring the scene
// and visually demarcating section boundaries.
// IDs match rawProjectData.projects keys.
// Landing (intro) bg: midnightblue-range. Footer/grid bg: darkslategray.
const PROJECT_COLORS = {
  '100': '#12676b', // Spectacle - dark teal (rgb(24,103,107) reference)
  '1':   '#0d1a4a', // OHH Hip Hop - dark royal blue
  '3':   '#332400', // Nook & Cranny - dark ochre / gold
  '4':   '#3a1a22', // Waitati - dark dusty baby pink
  '7':   '#0a2440', // Fonterra - dark Fonterra blue
  '6':   '#1c1014', // Ollie Crooks - warm dark burgundy
  '2':   '#0d1a33', // Music for People - deep navy cathedral
  '12':  '#1a150a', // Te Karaka - warm parchment dark
  '17':  '#1a1a1a', // Tall Blacks - dark neutral
  '5':   '#1a1200', // Autumn Arena - dark earthy gold
  '8':   '#0d0d1a', // FTP Channel - deep video-slate
  '9':   '#1a1a1a', // Print design - neutral dark
  '13':  '#1a0d00', // JAH SUN - warm dark amber
  '16':  '#1a0000', // FTPtv - dark terminal green
}

export function projectColor(id) {
  return PROJECT_COLORS[String(id)] || '#0f1a1a'
}


export const PROJECT_DISCIPLINES = {
  '1':   ['LIVE VIDEO', 'VIDEO'],                            // Ōtepoti Hip Hop Hustle 24
  '2':   ['LIVESTREAM', 'LIVE VIDEO', 'DESIGN', 'DIGITAL'],  // Music for People
  '3':   ['LIVESTREAM', 'LIVE VIDEO', 'DESIGN', 'MOTION'],   // Nook & Cranny Music Fest
  '4':   ['LIVESTREAM', 'LIVE VIDEO', 'DESIGN', 'MOTION'],   // Waitati Music Festival
  '5':   ['LIVE VIDEO', 'DESIGN'],                           // Autumn Arena
  '6':   ['VIDEO', 'DESIGN'],                                // Ollie Crooks — Take You There
  '7':   ['VIDEO', 'MOTION', 'DESIGN'],                      // Fonterra
  '8':   ['VIDEO', 'DIGITAL'],                               // from the place — YouTube Channel
  '12':  ['DESIGN'],                                         // Te Karaka Magazine
  '13':  ['LIVE VIDEO', 'VIDEO', 'DESIGN'],                  // JAH SUN: FEST
  '14':  ['LIVE VIDEO'],                                     // LOBOFEST
  '16':  ['DIGITAL', 'VIDEO'],                                // FTPtv
  '17':  ['DESIGN'],                                         // NZ Tall Blacks Teamwear
  '18':  ['DESIGN'],                                         // Print & Editorial Design
  '100': ['LIVESTREAM', 'LIVE VIDEO'],                        // Spectacle! #48
}

export function disciplinesForProject(id) {
  return PROJECT_DISCIPLINES[String(id)] || []
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const int = parseInt(full, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s, l }
}

function hslToHex({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Extracted so other data modules can turn an arbitrary hex into the
// same "boosted" glow color this uses, without duplicating the HSL math.
export function glowFromHex(hex) {
  const { h, s } = rgbToHsl(hexToRgb(hex))
  // a neutral (near-zero saturation) base color has no real hue to
  // preserve, boosting it would produce an arbitrary tint (h defaults
  // to 0/red), so fall back to a neutral warm-white glow instead
  if (s < 0.05) return '#e8e6df'
  return hslToHex({ h, s: Math.max(s, 0.65), l: 0.62 })
}

export function projectGlowColor(id) {
  return glowFromHex(projectColor(id))
}

function extractYouTubeId(url) {
  if (!url) return null
  const watchMatch = url.match(/[?&]v=([\w-]{11})/)
  if (watchMatch) return watchMatch[1]
  const shortMatch = url.match(/youtu\.be\/([\w-]{11})/)
  if (shortMatch) return shortMatch[1]
  return null
}


function adaptProject(id, raw) {
  const chips = raw.chips || []

  const chipVideos = chips
    .filter((chip) => chip.type === 'youtube')
    .map((chip) => ({
      id: chip.id,
      title: chip.title,
      startTime: chip.startTime || 0,
      portrait: Boolean(chip.portrait),
    }))

  const links = chips.filter((chip) => chip.type !== 'youtube')

  let embed = null
  if (raw.customIframe) {
    if (raw.customIframe.includes('<iframe')) {
      embed = raw.customIframe
    } else {
      const impliedId = extractYouTubeId(raw.customIframe)
      if (impliedId && !chipVideos.some((s) => s.id === impliedId) && impliedId !== raw.youtube) {
        links.push({ type: 'url', url: raw.customIframe, title: 'Watch' })
      }
    }
  }

  const mainVideo = raw.youtube
    ? { id: raw.youtube, startTime: raw.startTime || 0, title: null, portrait: Boolean(raw.portrait) }
    : chipVideos[0] || null

  const incidentalVideos = raw.youtube ? chipVideos : chipVideos.slice(1)

  const tileImage = raw.html_image || (raw.images && raw.images[0]) || null

  return {
    id: String(id),
    color: projectColor(id),
    glowColor: projectGlowColor(id),
    title: raw.html_h4 || raw.title || 'Untitled project',
    badge: raw.html_badge || null,
    summary: raw.html_description || null,
    description: raw.description || raw.html_description || '',
    creditsHTML: raw.creditsHTML || null,
    mainVideo,
    incidentalVideos,
    tileImage,
    links,
    embed,
    gallery: raw.images || [],
    disciplines: disciplinesForProject(id),
    href: `#${id}`,
  }
}


const projectRecords = rawProjectData.project_order
  .map((id) => {
    const raw = rawProjectData.projects[id]
    if (!raw) return null
    return adaptProject(id, raw)
  })
  .filter(Boolean)


export const ALL_VIDEOS_PROJECT_ID = 'all-videos'
const allVideosProject = {
  id: ALL_VIDEOS_PROJECT_ID,
  title: 'MOTION/CAPTURE/PRODUCTION',
  badge: 'All videos',
  color: '#0f1a1a',
  glowColor: '#e8e6df',
  mainVideo: null,
  incidentalVideos: [],
  gallery: [],
  links: [],
  disciplines: [],
}

const designExamplesRecord = projectRecords.find((p) => p.id === '18')
const otherRecords = projectRecords.filter((p) => p.id !== '18')

export const PROJECTS = [
  allVideosProject,
  ...(designExamplesRecord ? [designExamplesRecord] : []),
  ...otherRecords,
]
export const ALL_PROJECTS = rawProjectData.bottom_project_order
  .map(String)
  .filter((id) => rawProjectData.projects[id])
  .map((id) => adaptProject(id, rawProjectData.projects[id]))
