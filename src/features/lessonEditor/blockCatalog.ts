/**
 * קטלוג הבלוקים של הפלטה — 5 המשפחות (מסמך 19 §2, מקורן ב-`FAMILIES`
 * שב-design-export/Lesson Editor.dc.html). ה-`type` של כל פריט תואם למפתחות
 * ה-renderer (features/lessonPlayer/BlockRenderer) — 'paragraph'→text,
 * 'עטיפה'→lesson_cover וכו' כבר ממופים לשמות ה-SRS האמיתיים.
 */
import type { BlockCatalogItem, BlockFamily } from './types'

export const BLOCK_FAMILIES: BlockFamily[] = [
  {
    key: 'text',
    label: 'טקסט',
    dotClass: 'bg-accent',
    chipClass: 'bg-hues-sky text-accent',
    items: [
      { type: 'text', label: 'פסקה', icon: 'text' },
      { type: 'heading', label: 'כותרת', icon: 'heading' },
      { type: 'list', label: 'רשימה', icon: 'list' },
      { type: 'quote', label: 'ציטוט', icon: 'quote' },
    ],
  },
  {
    key: 'structure',
    label: 'מבנה והדגשה',
    dotClass: 'bg-hues-cobalt',
    chipClass: 'bg-hues-sky text-hues-cobalt',
    items: [
      { type: 'note', label: 'תיבת הערה', icon: 'note' },
      { type: 'motivation', label: 'תיבה מעוררת', icon: 'motivation' },
      { type: 'table', label: 'טבלה', icon: 'table' },
      { type: 'separator', label: 'מפריד', icon: 'separator' },
      { type: 'page_break', label: 'מעבר עמוד', icon: 'page_break' },
    ],
  },
  {
    key: 'media',
    label: 'מדיה',
    dotClass: 'bg-success',
    chipClass: 'bg-hues-mint text-hues-teal',
    items: [
      { type: 'image', label: 'תמונה', icon: 'image' },
      { type: 'video', label: 'וידאו', icon: 'video' },
      { type: 'pdf', label: 'מסמך PDF', icon: 'pdf' },
      { type: 'lesson_cover', label: 'עטיפת שיעור', icon: 'lesson_cover' },
    ],
  },
  {
    key: 'interactive',
    label: 'אינטראקטיבי',
    dotClass: 'bg-hues-bronze',
    chipClass: 'bg-hues-yellow/20 text-hues-bronze',
    items: [
      { type: 'flashcard', label: 'כרטיסי זיכרון', icon: 'flashcard' },
      { type: 'tabs', label: 'טאבים', icon: 'tabs' },
      { type: 'network_canvas', label: 'טופולוגיית רשת', icon: 'network' },
    ],
  },
  {
    key: 'ai',
    label: 'AI והטמעה',
    dotClass: 'bg-accent',
    chipClass: 'bg-hues-sky text-accent',
    items: [
      { type: 'ai_generated', label: 'תוכן AI', icon: 'ai_generated' },
      { type: 'gamma_embed', label: 'מצגת Gamma', icon: 'gamma_embed' },
      { type: 'html_embed', label: 'הטמעת HTML', icon: 'html_embed' },
      { type: 'designed_section', label: 'סקשן מעוצב', icon: 'designed_section' },
    ],
  },
]

/** כל פריטי-הקטלוג, שטוח — לחיפוש ולמטא-דאטה פר-סוג (Inspector/Outline). */
const ALL_ITEMS: (BlockCatalogItem & { family: BlockFamily })[] =
  BLOCK_FAMILIES.flatMap((family) =>
    family.items.map((item) => ({ ...item, family })),
  )

const BY_TYPE = new Map(ALL_ITEMS.map((item) => [item.type, item]))

/** מטא-דאטה לתצוגה של סוג-בלוק (תווית, אייקון, מחלקת-צ'יפ). fallback לגנרי. */
export function blockMeta(type: string): {
  label: string
  icon: BlockCatalogItem['icon']
  chipClass: string
} {
  const found = BY_TYPE.get(type)
  if (found) {
    return { label: found.label, icon: found.icon, chipClass: found.family.chipClass }
  }
  // 'divider' הוא alias של separator; שאר הלא-מוכרים → טקסט גנרי.
  if (type === 'divider') return blockMeta('separator')
  return { label: type, icon: 'text', chipClass: 'bg-neutrals-whisper text-neutrals-lead' }
}

/** סינון הקטלוג לפי מחרוזת-חיפוש (לפי תווית-בלוק). */
export function filterFamilies(query: string): BlockFamily[] {
  const q = query.trim()
  if (!q) return BLOCK_FAMILIES
  return BLOCK_FAMILIES.map((family) => ({
    ...family,
    items: family.items.filter((item) => item.label.includes(q)),
  })).filter((family) => family.items.length > 0)
}
