import { DISCIPLINE_FILTERS } from '../data/disciplines.js'

// A row of filter pills — ALL · LIVESTREAM · LIVE VIDEO · VIDEO PRODUCTION
// · MOTION / ANIMATION · DESIGN · DIGITAL / INTERACTIVE — modelled
// structurally on Lama Lama's Featured Work filter bar: a flat row of
// text toggles above the grid, one active at a time, the grid re-filters
// in place underneath rather than navigating anywhere.
//
// Deliberately does not touch, wrap, or re-render <ProjectGrid> itself —
// it only owns the active-filter state and hands the already-filtered
// project list up to whatever renders the grid. That keeps every
// existing ProjectGrid/ProjectModal visual and interaction untouched;
// this is purely an additional way to narrow which of the real
// PROJECTS/ALL_PROJECTS cards are currently shown.
export function FeaturedWorkFilter({ active, onChange }) {
  return (
    <div className="featured-work-filter mono" role="tablist" aria-label="Filter work by discipline">
      {DISCIPLINE_FILTERS.map(({ key, label, color }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`featured-work-filter__pill${isActive ? ' is-active' : ''}`}
            style={color ? { '--pill-accent': color } : undefined}
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
