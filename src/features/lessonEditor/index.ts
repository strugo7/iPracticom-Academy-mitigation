/** המשטח הציבורי של feature עורך-השיעורים (שלב 6.2) — הניתוב מייבא רק מכאן. */
export { LessonEditorPage } from './pages/LessonEditorPage'
/**
 * שדה-טקסט עשיר (tiptap + FloatingTextToolbar) — נחשף לשימוש חוזר בעורכי-תוכן
 * אחרים (עורך-הנהלים, policies feature) כדי לא לשכפל את שכבת ה-rich-text.
 */
export { RichTextField } from './richtext/RichTextField'
