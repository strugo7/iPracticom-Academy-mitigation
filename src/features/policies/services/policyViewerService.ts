/**
 * עזרי תצוגת-נוהל: בניית תוכן-עניינים מבלוקי-הכותרת, אומדן זמן-קריאה, ומזהה
 * עוגן לבלוק. לוגיקה טהורה (נבדקת ב-*.test.ts). הרינדור עצמו מנצל את
 * BlockRenderer של lessonPlayer — כאן רק הנגזרות סביבו.
 */
import type { LessonBlockEnvelope } from '@/types/entities'
import type { PolicyTocItem } from '../types'

const HEADING_TYPES = new Set(['heading'])
const TEXT_TYPES = new Set(['heading', 'text', 'list', 'note', 'quote'])
const WORDS_PER_MINUTE = 200

/** מזהה-עוגן יציב לבלוק (לניווט מתוכן-העניינים). */
export const blockAnchorId = (blockId: string): string =>
  `policy-block-${blockId}`

/** טקסט-הכותרת מבלוק (data.text עדיף, אחרת data.content). */
function headingText(block: LessonBlockEnvelope): string {
  const data = block.data as { text?: unknown; content?: unknown }
  const raw = data.text ?? data.content
  return typeof raw === 'string' ? stripHtml(raw).trim() : ''
}

/** מסיר תגי-HTML לצורך ספירת-מילים / תווית-TOC (לא לרינדור). */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ')
}

/** תוכן-עניינים ממוספר מבלוקי-הכותרת בלבד. */
export function buildToc(blocks: LessonBlockEnvelope[]): PolicyTocItem[] {
  const items: PolicyTocItem[] = []
  for (const block of blocks) {
    if (!HEADING_TYPES.has(block.type)) continue
    const label = headingText(block)
    if (!label) continue
    items.push({
      anchor: blockAnchorId(block.id),
      label,
      index: items.length + 1,
    })
  }
  return items
}

/** אומדן זמן-קריאה בדקות (מינימום 1) מספירת-מילים בבלוקי-טקסט. */
export function estimateReadingMinutes(blocks: LessonBlockEnvelope[]): number {
  let words = 0
  for (const block of blocks) {
    if (!TEXT_TYPES.has(block.type)) continue
    const data = block.data as {
      text?: unknown
      content?: unknown
      items?: unknown
    }
    const parts: string[] = []
    if (typeof data.text === 'string') parts.push(data.text)
    if (typeof data.content === 'string') parts.push(data.content)
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (typeof item === 'string') parts.push(item)
        else if (item && typeof item === 'object' && 'text' in item) {
          parts.push(String((item as { text: unknown }).text))
        }
      }
    }
    words += stripHtml(parts.join(' ')).split(/\s+/).filter(Boolean).length
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

/** בלוקים ממוינים לפי order_index (בטוח מול דאטה לא-ממוין). */
export function sortedBlocks(
  blocks: LessonBlockEnvelope[] | null | undefined,
): LessonBlockEnvelope[] {
  return [...(blocks ?? [])].sort((a, b) => a.order_index - b.order_index)
}

/** תאריך בפורמט ישראלי (Asia/Jerusalem) — "14 ביוני 2026". */
export function formatPolicyDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jerusalem',
  }).format(new Date(iso))
}

/** תאריך+שעה של חתימה — "29 ביוני 2026, 14:32". */
export function formatSignedAt(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  }).format(new Date(iso))
}
