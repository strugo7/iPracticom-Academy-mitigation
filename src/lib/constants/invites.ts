/**
 * קבועי דומיין-ההזמנה המשותפים (תצוגה + יצירה) — נצרכים ע"י יותר מ-feature אחד
 * (userManagement: הזמנות-עובד · recruitment: הזמנות-מועמד). מקור-אמת יחיד כדי
 * שלא ישוכפל בין ה-features (CLAUDE.md §4/§8). מקור העיצוב: User Management.dc.html
 * (ROLE map + stMap + AVATAR_HUES).
 */
import type { InviteStatus, UserRole } from '@/lib/constants/enums'

export type BadgeColor = 'accent' | 'success' | 'caution' | 'warning' | 'neutral' | 'bronze'

export const ROLE_META: Record<UserRole, { label: string; badgeColor: BadgeColor }> = {
  user: { label: 'משתמש', badgeColor: 'neutral' },
  instructor: { label: 'מדריך', badgeColor: 'accent' },
  manager: { label: 'מנהל', badgeColor: 'success' },
  admin: { label: 'אדמין', badgeColor: 'bronze' },
}

export const INVITE_STATUS_META: Record<InviteStatus, { label: string; badgeColor: BadgeColor }> = {
  pending: { label: 'ממתינה', badgeColor: 'warning' },
  started: { label: 'התחילה', badgeColor: 'accent' },
  test_submitted: { label: 'מבחן הוגש', badgeColor: 'accent' },
  completed: { label: 'הושלמה', badgeColor: 'success' },
  hired: { label: 'התקבל/ה', badgeColor: 'success' },
  expired: { label: 'פגה', badgeColor: 'caution' },
  canceled: { label: 'בוטלה', badgeColor: 'neutral' },
}

/** סטטוסי-הזמנה שעדיין ניתנים לפעולה (שלח-שוב/בטל) — לא סופיים */
export const OPEN_INVITE_STATUSES: InviteStatus[] = ['pending', 'started']

/** רוטציית-צבע לאווטארים (design-export: AVATAR_HUES) — נגזרת דטרמיניסטית משם/מייל */
const AVATAR_HUE_CLASSES = [
  'bg-hues-denim',
  'bg-hues-teal',
  'bg-hues-bronze',
  'bg-hues-cobalt',
] as const

export function avatarHueClass(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return AVATAR_HUE_CLASSES[hash % AVATAR_HUE_CLASSES.length]
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** תוקף קישור-הזמנה (SRS §2.1 generateInviteToken — def +7 ימים) */
export const INVITE_TOKEN_TTL_DAYS = 7

export const MAGIC_LINK_HOST = 'academy.ipracticom.co.il/join'
