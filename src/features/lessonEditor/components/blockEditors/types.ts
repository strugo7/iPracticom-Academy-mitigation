/** חוזה משותף לעורכי-הבלוק הפרטניים (שלב 6.3). כל עורך מקבל את data של הבלוק
 *  ומחזיר טלאי-דאטה דרך onChange (merge רדוד ב-setBlockData). */
export interface BlockEditorProps {
  data: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
  /** נבחר-כרגע — משפיע על autofocus של השדה הראשי. */
  autoFocus?: boolean
}

/** גישה בטוחה לשדה-מחרוזת מ-data גמיש. */
export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

/** הסוגים בעלי עורך-תוכן inline (שלבים 6.3-6.5). מקור-אמת יחיד ל-BlockEditorSwitch
 *  ול-EditorBlockItem — מחוץ לקובץ-קומפוננטה כדי לא לשבור fast-refresh. */
export const EDITABLE_BLOCK_TYPES = [
  'text',
  'heading',
  'list',
  'quote',
  'note',
  'motivation',
  'table',
  'image',
  'video',
  'pdf',
  'lesson_cover',
  'flashcard',
  'tabs',
  'network_canvas',
  'ai_generated',
  'gamma_embed',
  'html_embed',
  'designed_section',
] as const

/** האם לסוג-הבלוק יש עורך-תוכן inline בשלב 6.3. */
export function hasInlineEditor(type: string): boolean {
  return (EDITABLE_BLOCK_TYPES as readonly string[]).includes(type)
}
