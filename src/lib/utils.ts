/** Clamp a value between min and max */
export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max)

/** Get initials from a name or username */
export const initials = (name: string) =>
  name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

/** Format page progress: "p.24 of 180" */
export const formatProgress = (page: number, total: number) =>
  `p.${page} of ${total}`

/** Debounce a function */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

/** Throttle a function */
export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      fn(...args)
    }
  }
}

/** Generate a short random invite code */
export const generateInviteCode = () =>
  Math.random().toString(36).slice(2, 6) +
  Math.random().toString(36).slice(2, 6)

/** Format a relative time: "2m ago", "just now" */
export const relativeTime = (date: string | Date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/** Copy text to clipboard */
export const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text)
}
