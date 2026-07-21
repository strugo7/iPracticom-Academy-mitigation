/** מיון/סינון טהורים על SecurityLog[] — הנתונים עצמם אמיתיים (mockAuthProvider). */
import type { SecurityLog } from '@/types/entities'

export type LoginLogFilter = 'all' | 'success' | 'failed'

export function sortByRecent(logs: SecurityLog[]): SecurityLog[] {
  return [...logs].sort(
    (a, b) => Date.parse(b.created_date) - Date.parse(a.created_date),
  )
}

export function filterSecurityLogs(
  logs: SecurityLog[],
  filter: LoginLogFilter,
): SecurityLog[] {
  if (filter === 'all') return logs
  if (filter === 'success') return logs.filter((l) => l.status === 'success')
  return logs.filter((l) => l.status !== 'success')
}

export function countFailed(logs: SecurityLog[]): number {
  return logs.filter((l) => l.status !== 'success').length
}

/** פענוח ידידותי של user_agent אמיתי (navigator.userAgent, ראו mockAuthProvider) — לא בדוי. */
export function parseUserAgent(ua: string | null | undefined): {
  label: string
  isMobile: boolean
} {
  if (!ua) return { label: 'לא ידוע', isMobile: false }
  const isMobile = /Mobi|Android|iPhone|iPad/.test(ua)
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Safari\//.test(ua) && !/Chrome\//.test(ua)
          ? 'Safari'
          : 'דפדפן'
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS X|Macintosh/.test(ua)
      ? 'macOS'
      : /Android/.test(ua)
        ? 'Android'
        : /iPhone|iPad/.test(ua)
          ? 'iOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'מערכת לא ידועה'
  return { label: `${browser} · ${os}`, isMobile }
}
