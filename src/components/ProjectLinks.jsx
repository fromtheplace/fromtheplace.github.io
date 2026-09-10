import { PlayIcon, ExternalLinkIcon } from './ChipIcons.jsx'

// Renders the non-video chips: press articles, Twitch VOD links, and any
// custom embed markup (Bandcamp players etc). Twitch VODs are linked out
// rather than embedded, since a live embed needs the deployed domain
// registered with Twitch's player first. Uses the same chip-pill system
// as the modal's chips, so both places read as one consistent design.
export function ProjectLinks({ links }) {
  if (!links || links.length === 0) return null

  return (
    <div className="project-links">
      {links.map((link, i) => {
        if (link.type === 'url') {
          const thumb = link.localImage || null
          return (
            <a
              key={link.url || i}
              className="chip-pill"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {thumb && <img className="chip-pill-thumb" src={thumb} alt="" loading="lazy" />}
              <span className="chip-pill-label mono">{link.title || 'Read more'}</span>
              <ExternalLinkIcon className="chip-pill-platform" />
            </a>
          )
        }

        if (link.type === 'twitch') {
          const twitchUrl = `https://www.twitch.tv/videos/${link.videoId}${
            link.timestamp ? `?t=${link.timestamp}` : ''
          }`
          return (
            <a
              key={link.videoId || i}
              className="chip-pill"
              href={twitchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.thumbnail && <img className="chip-pill-thumb" src={link.thumbnail} alt="" loading="lazy" />}
              <PlayIcon className="chip-pill-platform" />
              <span className="chip-pill-label mono">{link.title || 'Watch on Twitch'}</span>
            </a>
          )
        }

        if (link.type === 'iframe' && link.iframe) {
          // studio-authored embed markup (e.g. Bandcamp player), trusted
          // content from the studio's own data file
          return (
            <div
              key={i}
              className="project-link-embed"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: link.iframe }}
            />
          )
        }

        return null
      })}
    </div>
  )
}
