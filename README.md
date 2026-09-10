# from the place - cinematic scroll portfolio

A scroll-driven rebuild of the from the place homepage, built on the real
project data.

## Running it

```bash
npm install
npm run dev
```

`npm run build` produces a static `dist/` folder. `base` in
`vite.config.js` is set to `/scroll/` to match
`fromtheplace.github.io/scroll/`, change that if you deploy elsewhere.

## How the background works now

Two fixed ambient videos (`aX-Oef93Duk` and `9r7a4rlKTUM`, set in
`AMBIENT_BACKGROUND_VIDEOS` in `src/data/projects.js`) play muted from the
moment the page loads and never stop, there is no per-project background
anymore, that was the source of the previous jank (constantly creating
and destroying YouTube players as you scrolled past sections). Instead
`BackgroundVideoManager.jsx` just watches total scroll progress down the
whole page and crossfades which of the two already-playing videos is
visible, switching once at the halfway point. Change the switch point in
that file's `checkProgress()` if 50% isn't right.

## How each project's own video works

Every project section shows its own main video (`mainVideo`, the raw
data's `youtube` field) large, in a 4:3 "tablet" frame, and plays it with
**sound on** once that section becomes the active one, pausing
immediately when you scroll off it. Below that, the project's other
clips (`incidentalVideos`, everything from the `chips` array of type
`youtube`) appear as a small clickable strip, click one to swap it into
the tablet frame above.

**Important nuance on sound**: browsers block unmuted autoplay until the
visitor has actually interacted with the page (a real click/tap/keypress,
scrolling alone usually doesn't count). `SoundGateProvider.jsx` tracks
this and there's a small "Sound on/off" button in the top nav that
doubles as a guaranteed way to unlock it. Until the first interaction,
videos play muted so autoplay itself doesn't get blocked entirely, then
switch to sound as soon as the browser allows it.

## The bottom section: all projects, full modal

Below the cinematic scroll, `ProjectGrid.jsx` renders every project as a
tile (image, badge, title, one-line summary), matching the original
site's browsing grid. Clicking a tile opens `ProjectModal.jsx`, a full
detail view with its own image gallery (counter + prev/next), the
project's embedded video, description, credits, press/Twitch/Bandcamp
links, a Share button (native share sheet on mobile, copies a link
otherwise), and prev/next arrows that cycle through every project.
Escape closes it, arrow keys navigate.

`ALL_PROJECTS` in `src/data/projects.js` includes every id in the raw
data (not just the 9 in `project_order`), sorted numerically, that's
what feeds the grid and modal. `PROJECTS` (just the curated 9, in
`project_order`) still feeds the cinematic scroll.

## Where the real data lives

- `src/data/rawProjectData.js` - the actual project JSON, carried over
  from the live site. Paste a new version straight in here if it
  changes.
- `src/data/projects.js` - the adapter, turns each raw record into
  `{ mainVideo, incidentalVideos, tileImage, description, creditsHTML,
  links, embed, gallery }`.

**Images**: all image paths in the raw data are relative
(`images/whatever.jpg`), drop the real files into `public/images/` with
matching names before building.

## Other pieces

- `useSectionObserver.js` - IntersectionObserver deciding which cinematic
  section counts as active right now.
- `ProjectLinks.jsx` - press articles and Twitch VODs link out (a live
  Twitch embed needs your deployed domain registered with Twitch first),
  Bandcamp/custom iframe chips render inline.
- `useLenis.js` - Lenis smooth scrolling, skipped for
  `prefers-reduced-motion`.

## Known gaps worth knowing about

- Twitch VODs link out rather than embed live.
- Projects 9, 10, 11, 13, 14, 15, 16 aren't in `project_order`, so they
  don't appear in the cinematic scroll, only in the bottom grid/modal
  (all projects). Add an id to `project_order` if you want it in the
  scroll too.
