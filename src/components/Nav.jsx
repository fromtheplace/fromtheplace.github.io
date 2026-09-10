import { useSoundGate } from './SoundGateProvider.jsx'

export function Nav({ projects, activeIndex, onJump, onJumpAll }) {
  const { soundOn, toggleMute } = useSoundGate()

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <a className="logo-mark" href="#top" aria-label="From the Place">
          <span className="line-top">from the</span>
          <span className="line-bottom">place</span>
        </a>

        <div className="site-nav-right">
          <nav className="site-nav-dots" aria-label="Projects">
            {projects.map((project, i) => (
              <button
                key={project.id}
                type="button"
                className={`site-nav-dot ${i === activeIndex ? 'site-nav-dot-active' : ''}`}
                onClick={() => onJump(i)}
                aria-current={i === activeIndex ? 'true' : undefined}
                aria-label={`Jump to ${project.title}`}
              >
                <span className="site-nav-dot-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="site-nav-dot-label mono">{project.title}</span>
              </button>
            ))}

            <button
              type="button"
              className="site-nav-dot site-nav-dot-all"
              onClick={onJumpAll}
              aria-label="Jump to all projects"
            >
              <span className="site-nav-dot-number">All</span>
            </button>
          </nav>

          <button
            type="button"
            className="site-nav-sound mono"
            onClick={toggleMute}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Mute project videos' : 'Unmute project videos'}
          >
            {soundOn ? '♪ on' : '♪ off'}
          </button>
        </div>
      </div>
    </header>
  )
}
