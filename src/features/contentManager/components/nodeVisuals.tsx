/**
 * ויזואלים משותפים לשורות העץ (ContentManager, doc 12).
 *
 * ארבעת אייקוני-הסוג (מסלול/מודול/נושא/שיעור) הם פער אמיתי ב-registry ה-DS
 * (109 האייקונים) — נלקחו AS-IS מ-design-export/ContentManager.dc.html (מפת TYPE),
 * כ-outline stroke=currentColor. אייקוני-הכרום (chevron, plus, edit…) מגיעים
 * מ-registry ה-DS, לא מכאן.
 */
import type { JSX } from 'react'
import { Badge } from '@/components/ui'
import type { ContentStatus } from '@/lib/constants/enums'
import { statusMetaOf } from '../constants'
import type { ContentNodeKind } from '../types'

const PATHS: Record<ContentNodeKind, JSX.Element> = {
  track: (
    <>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </>
  ),
  module: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  topic: (
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  ),
  lesson: <polygon points="6 3 20 12 6 21 6 3" />,
}

export function NodeTypeIcon({
  kind,
  size = 18,
}: {
  kind: ContentNodeKind
  size?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[kind]}
    </svg>
  )
}

/** תגית סטטוס — פיל צבעוני + טקסט בלבד (ללא נקודה, gate #8). */
export function StatusBadge({ status }: { status: ContentStatus | null | undefined }) {
  const meta = statusMetaOf(status)
  return <Badge color={meta.badgeColor}>{meta.label}</Badge>
}

/** ידית-גרירה (6 נקודות) — פער ב-registry, מ-design-export AS-IS. */
export function DragHandleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  )
}
