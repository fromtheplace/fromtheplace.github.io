// ============================================================
// Featured Work filter definitions
// ============================================================
// This used to also build `DISCIPLINES`: synthetic per-discipline
// "chapter" project objects that pooled videos/images across every
// project tagged with that discipline. That pooling is gone — it's not
// what the Featured Work filter needs. The filter doesn't create new
// project-shaped things, it just narrows which of the *real* PROJECTS /
// ALL_PROJECTS cards (see data/projects.js, `disciplines[]` on each one)
// are currently visible in the grid.
//
// `key` must match the tag strings used in PROJECT_DISCIPLINES over in
// projects.js. `label` is purely display text for the filter pill, kept
// separate so relabeling the UI (e.g. "VIDEO" -> "VIDEO PRODUCTION")
// never means touching project tagging data.
export const DISCIPLINE_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'LIVESTREAM', label: 'Livestream', color: '#12676b' },
  { key: 'LIVE VIDEO', label: 'Live Video', color: '#3a1a22' },
  { key: 'VIDEO', label: 'Video Production', color: '#0a2440' },
  { key: 'MOTION', label: 'Motion / Animation', color: '#1c1014' },
  { key: 'DESIGN', label: 'Design', color: '#1a150a' },
  { key: 'DIGITAL', label: 'Digital / Interactive', color: '#001a0d' },
]

// Narrows a real project list (ALL_PROJECTS, PROJECTS) down to the ones
// tagged with `filterKey`. 'ALL' (or anything falsy) returns the list
// untouched — every project, exactly once, same objects, same order.
export function filterProjectsByDiscipline(projects, filterKey) {
  if (!filterKey || filterKey === 'ALL') return projects
  return projects.filter((project) => (project.disciplines || []).includes(filterKey))
}
