import { useEffect, useMemo, useRef, useState } from 'react'
import { BackgroundVideoProvider } from './components/BackgroundVideoManager.jsx'
import { SoundGateProvider } from './components/SoundGateProvider.jsx'
import { ProjectSection } from './components/ProjectSection.jsx'
import { DesignExamplesSection } from './components/DesignExamplesSection.jsx'
import { AllVideosSection } from './components/AllVideosSection.jsx'
import { ProjectGrid } from './components/ProjectGrid.jsx'
import { ProjectModal } from './components/ProjectModal.jsx'
import { FeaturedWorkFilter } from './components/FeaturedWorkFilter.jsx'
import { Nav } from './components/Nav.jsx'
import { Intro } from './components/Intro.jsx'
import { useSectionObserver } from './hooks/useSectionObserver.js'
import { useLenis, getLenis, setLenisSectionIndex } from './hooks/useLenis.js'
import { PROJECTS, ALL_PROJECTS, ALL_VIDEOS_PROJECT_ID } from './data/projects.js'
import { filterProjectsByDiscipline } from './data/disciplines.js'
import './components/FeaturedWorkFilter.css'
import './components/ProjectGrid.css'

// Tracks a max-width media query live, including orientation changes
// (portrait <-> landscape), not just the width at first render.
function useMatchMedia(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    window.addEventListener('orientationchange', onChange)
    return () => {
      mql.removeEventListener('change', onChange)
      window.removeEventListener('orientationchange', onChange)
    }
  }, [query])
  return matches
}

function Experience() {
  useLenis()
  // Below 860px the layout stacks title/tablet/gallery/chips into one
  // column, which is frequently taller than a short mobile viewport
  // (especially landscape). A 0.55 intersection threshold could then
  // never be reached by any section, leaving activeIndex stuck at -1
  // forever (nothing shows, nothing plays). A lower threshold on small
  // viewports keeps sections switching active reliably, and also makes
  // the "leaving" transition less twitchy while scrolling on mobile.
  const isCompact = useMatchMedia('(max-width: 860px)')
  const { activeIndex, setRef } = useSectionObserver(PROJECTS.length, {
    threshold: isCompact ? 0.22 : 0.55,
  })
  const sectionRefs = useRef([])
  const [activeModalId, setActiveModalId] = useState(null)
  // { videoId, startTime } | null — set only when the modal is opened
  // from AllVideosSection's "View project" link, so ProjectModal can
  // resume the same video at the same position instead of restarting
  // it. Anything that opens the modal without this (ProjectGrid tiles,
  // the ?project= deep link) leaves it null, same as before.
  const [modalStartOverride, setModalStartOverride] = useState(null)
  // Whether closing should scroll-jump back to the grid tile below.
  // Only makes sense when the modal was actually opened *from* that
  // tile (ProjectGrid) — jumping there when it was opened from
  // AllVideosSection's "View project" link, or the ?project= deep
  // link, yanks the visitor to a part of the page they never
  // interacted with. Defaults true so ProjectGrid's own onOpen={openModal}
  // (no options arg) keeps its exact original behavior unchanged.
  const [modalReturnToTile, setModalReturnToTile] = useState(true)

  // Featured Work discipline filter — ALL by default. This only ever
  // narrows ALL_PROJECTS, the same real project records the grid and
  // modal already use; it never creates or duplicates project data.
  const [activeDiscipline, setActiveDiscipline] = useState('ALL')
  const visibleProjects = useMemo(
    () => filterProjectsByDiscipline(ALL_PROJECTS, activeDiscipline),
    [activeDiscipline]
  )

  const jumpTo = (index) => {
    const el = document.getElementById(PROJECTS[index].id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 5) })
      // useLenis's internal section list is [intro, ...projects], so a
      // PROJECTS index of 0 is section index 1 there
      setLenisSectionIndex(index + 1)
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }


  // "All" nav item scrolls to the tile grid, which sits after the last
  // scroll section, not part of the per-project index/section list.
  const jumpToAll = () => {
    const el = document.getElementById('all-work')
    if (!el) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 5) })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Opening the modal stops the main page's Lenis smoothing, so the
  // modal's own scroll (the browser's native overflow on the backdrop)
  // is the only thing scrolling, independent of the page behind it.
  const openModal = (id, startOverride = null, { returnToTile = true } = {}) => {
    getLenis()?.stop()
    setActiveModalId(id)
    setModalStartOverride(startOverride)
    setModalReturnToTile(returnToTile)
  }

  // Closing hands scrolling back to Lenis. Only scroll-jumps back to
  // the grid tile if that's actually where this modal was opened from
  // (see modalReturnToTile) — otherwise just resumes scrolling from
  // wherever the page already is, since there's nowhere more
  // appropriate to send the visitor.
  const closeModal = () => {
    const returningToId = activeModalId
    const shouldReturnToTile = modalReturnToTile
    setActiveModalId(null)
    setModalStartOverride(null)
    setModalReturnToTile(true)

    const lenis = getLenis()
    lenis?.start()

    if (!shouldReturnToTile) return

    requestAnimationFrame(() => {
      const tile = document.getElementById(`tile-${returningToId}`)
      if (!tile) return
      if (lenis) {
        lenis.scrollTo(tile, {
          offset: -140,
          duration: 1.1,
          easing: (t) => 1 - Math.pow(1 - t, 5),
        })
      } else {
        tile.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }

  // Deep-linking: ?project=ID on load always opens the modal, never
  // scroll-jumps — this is exactly what a Share link should produce
  // (ProjectModal's own share button generates this URL while showing
  // the modal, so a recipient should land in the modal too, not get
  // scroll-jumped to a different layout just because that project also
  // happens to be in the cinematic PROJECTS scroll list). Runs once on
  // mount, after useLenis()'s own effect above has already set up the
  // shared Lenis instance, so openModal's getLenis() call resolves
  // correctly straight away.
  //
  // NOTE: only opens for an id actually in ALL_PROJECTS (rawProjectData's
  // bottom_project_order) — that's the modal's own data source. A
  // project not listed there (e.g. id 15 currently) won't open
  // anything regardless of this fix; it needs to be added to
  // bottom_project_order in data/projects.js first.
  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get('project')
    if (!projectId) return
    if (!ALL_PROJECTS.some((p) => p.id === projectId)) return

    // one tick so layout has settled before the modal measures anything
    requestAnimationFrame(() => {
      // returnToTile: false — a deep-linked visitor never scrolled
      // from a grid tile to get here, so closing shouldn't scroll-jump
      // them to one they never interacted with.
      openModal(projectId, null, { returnToTile: false })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Nav projects={PROJECTS} activeIndex={activeIndex} onJump={jumpTo} onJumpAll={jumpToAll} />

      <Intro onEnter={() => jumpTo(0)} />

      <main>
        {PROJECTS.map((project, i) => {
          // Watch All and Design Examples ('18') both swap in their own
          // layout instead of ProjectSection's — everything about how
          // each is tracked (ref, index, observer) stays identical to
          // every other section either way. Their position in the
          // scroll (Watch All first, Design Examples second) comes from
          // PROJECTS' own order in data/projects.js, not from anything
          // here — this stays a single, uniform loop over PROJECTS so
          // `index` always matches actual DOM order (see the comment
          // above PROJECTS in data/projects.js for why that matters).
          let SectionComponent = ProjectSection
          if (project.id === '18') SectionComponent = DesignExamplesSection
          if (project.id === ALL_VIDEOS_PROJECT_ID) SectionComponent = AllVideosSection

          return (
            <SectionComponent
              key={project.id}
              ref={(el) => {
                sectionRefs.current[i] = el
                setRef(i)(el)
              }}
              project={project}
              index={i}
              total={PROJECTS.length}
              // Viewport visibility alone isn't enough once the modal
              // can be opened *from* an actively-playing tablet
              // (AllVideosSection's "View project" link) — without
              // this, that section stays isActive (scroll position
              // hasn't changed) and keeps its video playing right
              // underneath the modal's own, so both play at once. Every
              // section's isActive collapses to false while any modal
              // is open, which — via MainVideoEmbed's existing play/
              // pause effect, already keyed on isActive — pauses
              // whatever was playing site-wide, same mechanism that
              // already pauses a tablet the moment it scrolls
              // off-screen. Reactivates normally once the modal closes.
              isActive={activeModalId === null && i === activeIndex}
              // Only AllVideosSection actually reads this (its
              // per-video projectId opens the same modal a ProjectGrid
              // tile would) — harmless unused prop for the other two.
              onOpenProject={openModal}
            />
          )
        })}
      </main>

      {/* Featured Work: same ALL_PROJECTS records ProjectModal already
          uses, just narrowed by the active discipline filter. ProjectGrid
          owns its own "all-work" scroll anchor and animates tiles in/out
          via framer-motion's AnimatePresence as the filtered list changes
          — no wrapper/remount trick needed here. */}
      <FeaturedWorkFilter active={activeDiscipline} onChange={setActiveDiscipline} />
      <ProjectGrid projects={visibleProjects} onOpen={openModal} />

      <ProjectModal
        projects={ALL_PROJECTS}
        activeId={activeModalId}
        startOverride={modalStartOverride}
        onClose={closeModal}
        onNavigate={(id) => {
          // The override only applies to the project it was opened
          // for — navigating to a different one inside the modal
          // (prev/next) should start that one normally, not carry a
          // timestamp meant for a different project's video.
          setActiveModalId(id)
          setModalStartOverride(null)
        }}
      />

      <footer className="site-footer mono">
        <span>&copy; {new Date().getFullYear()} from the place</span>
      </footer>
    </>
  )
}

export default function App() {
  const projectCount = useMemo(() => PROJECTS.length, [])
  if (projectCount === 0) {
    return <p className="empty-state">No projects configured yet. Check src/data/rawProjectData.js.</p>
  }

  return (
    <SoundGateProvider>
      <BackgroundVideoProvider>
        <Experience />
      </BackgroundVideoProvider>
    </SoundGateProvider>
  )
}