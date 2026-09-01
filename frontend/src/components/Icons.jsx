export const CheckIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path pathLength="1" d="M4 12.5l5 5L20 6.5" />
  </svg>
)

export const AlertIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2V7Zm0 9h2v2h-2v-2Z" />
  </svg>
)

export const EyeIcon = ({ open, size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={open ? 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z' : 'M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.4 3.3M6.6 6.6A16 16 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4-.9'} />
  </svg>
)

export const MailIcon = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="m3 6 9 7 9-7" />
  </svg>
)

export const LockIcon = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="3" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)
