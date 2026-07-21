/**
 * פעולות-דאטה טהורות לבלוקים האינטראקטיביים (שלב 6.4) — כרטיסי-זיכרון וטאבים.
 * מקבלות את data הגמיש של הבלוק ומחזירות מבנה מנורמל / patch, בלי React ובלי
 * תופעות-לוואי — כך שהלוגיקה נבדקת ביחידה והעורכים נשארים תצוגתיים בלבד (§4).
 */

/** מזהה מקומי חדש לפריט (טאב) — פריטי-בלוק אינם רשומות DB, id מקומי מספיק. */
function newItemId(prefix: string): string {
  const g = globalThis.crypto
  if (g && 'randomUUID' in g) return `${prefix}_${g.randomUUID()}`
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`
}

/** הזזת פריט במערך מ-from ל-to (immutable). קלמפ לטווח חוקי. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= items.length) return items
  const clampedTo = Math.max(0, Math.min(to, items.length - 1))
  const next = items.slice()
  const [moved] = next.splice(from, 1)
  next.splice(clampedTo, 0, moved)
  return next
}

/* ── כרטיסי זיכרון (flashcard) — data = { items: [{ front, back }] } ───────── */

export interface FlashcardItem {
  front: string
  back: string
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/** קריאה בטוחה של הכרטיסים מ-data גמיש. */
export function readCards(data: Record<string, unknown>): FlashcardItem[] {
  if (!Array.isArray(data.items)) return []
  return data.items.map((item) => ({
    front: str((item as FlashcardItem)?.front),
    back: str((item as FlashcardItem)?.back),
  }))
}

export function addCard(cards: FlashcardItem[]): FlashcardItem[] {
  return [...cards, { front: '', back: '' }]
}

export function removeCard(cards: FlashcardItem[], index: number): FlashcardItem[] {
  return cards.filter((_, i) => i !== index)
}

export function setCardSide(
  cards: FlashcardItem[],
  index: number,
  side: 'front' | 'back',
  value: string,
): FlashcardItem[] {
  return cards.map((card, i) => (i === index ? { ...card, [side]: value } : card))
}

/* ── טאבים (tabs) — data = { tabs: [{ id, title, content, image_url? }] } ──── */

export interface TabItem {
  id: string
  title: string
  content: string
  image_url?: string | null
}

/** קריאה בטוחה של הטאבים מ-data גמיש; מייצר id חסר כדי לשמור מפתח יציב. */
export function readTabs(data: Record<string, unknown>): TabItem[] {
  if (!Array.isArray(data.tabs)) return []
  return data.tabs.map((tab) => {
    const t = tab as Partial<TabItem>
    return {
      id: str(t?.id) || newItemId('tab'),
      title: str(t?.title),
      content: str(t?.content),
      image_url: typeof t?.image_url === 'string' ? t.image_url : null,
    }
  })
}

export function addTab(tabs: TabItem[], title: string): TabItem[] {
  return [...tabs, { id: newItemId('tab'), title, content: '', image_url: null }]
}

export function removeTab(tabs: TabItem[], index: number): TabItem[] {
  return tabs.filter((_, i) => i !== index)
}

export function setTabField(
  tabs: TabItem[],
  index: number,
  field: 'title' | 'content' | 'image_url',
  value: string | null,
): TabItem[] {
  return tabs.map((tab, i) => (i === index ? { ...tab, [field]: value } : tab))
}
