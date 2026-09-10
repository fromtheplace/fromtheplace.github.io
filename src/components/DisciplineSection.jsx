// DisciplineSection is a thin, semantically-named alias for
// ProjectSection. The template it renders — title/eyebrow, tablet
// frame, chip strip (video + link chips, click-to-swap into the
// tablet), gallery, insular lightbox — is already fully generic: it
// reads project.{title,badge,description,creditsHTML,mainVideo,
// incidentalVideos,links,gallery,color,glowColor} and has no
// per-project assumptions baked in. A discipline object from
// disciplines.js (pooled chips/gallery across every project tagged
// with that discipline) has that exact same shape, so it renders
// through the identical component unmodified.
//
// No duplicate component, no CSS changes — the contract that already
// works for one project's chips works identically for a discipline's
// pooled chips. Import this instead of ProjectSection when the prop
// is conceptually a discipline, purely so App.jsx doesn't read
// `<ProjectSection project={disciplineObj} />`, which would be
// confusing at the call site even though it works.
export { ProjectSection as DisciplineSection } from './ProjectSection.jsx'
