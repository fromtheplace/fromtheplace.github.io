// Small, consistent icon set used across every chip type (modal chips,
// the scroll section's incidental video chips, and its press/link
// chips), so "this is a video / image / external link" reads the same
// way everywhere instead of three different text badges.

export function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.57.87l10.86-6.86a1 1 0 0 0 0-1.74L9.57 4.27C8.87 3.84 8 4.34 8 5.14Z" />
    </svg>
  )
}

export function ImageIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 16.5 15.5 11 6 20" />
    </svg>
  )
}

export function ExternalLinkIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}
