/**
 * סניטציית HTML-עשיר לבלוקי-תוכן (text/list/note/heading/flashcard וכו') —
 * לפני dangerouslySetInnerHTML. עטיפה מרוכזת יחידה סביב DOMPurify (אושר
 * כ-dependency, CLAUDE.md §5.1) — כל בלוק עם HTML עובר דרך כאן, לא מיישם
 * סניטציה בעצמו. **לא** לשימוש עבור html_embed (מסמכי HTML מלאים — מסונדק
 * ב-iframe, ראו HtmlEmbedBlock).
 */
import DOMPurify from 'dompurify'

/**
 * migrateConceptMarkers (SRS §KMS) — נרמול צד-לקוח של סימון-המונח ה**מיושן**
 * של Base44 לפורמט הקנוני. בדאטה האמיתי מונח מסומן לעיתים כ:
 *   ⟦<conceptId>⟧<טקסט תצוגה>⟦/c⟧
 * (לרוב עטוף ב-<span> כחול inline). התבנית הזו הודפסה כטקסט גולמי במקום להיות
 * מונח לחיץ. כאן היא מומרת ל-<span data-concept-id class="concept-term"> —
 * אותו פורמט שה-renderer, ה-ConceptHoverLayer וה-tiptap ConceptMark מכירים.
 *
 * צד-לקוח בכוונה: אנחנו client בלבד, וה-backend עדיין מגיש את הפורמט המיושן עד
 * שיריץ מיגרציה משלו. שמירה מחדש של תוכן בעורך מקבעת את הפורמט הקנוני (RichText
 * מנרמל בטעינה) — כך הדאטה נודד קדימה בהדרגה. סימוני ⟦pwd⟧ (תוכן-מוגן) לא נוגעים.
 */
export function normalizeConceptMarkers(html: string): string {
  return html.replace(
    /⟦([0-9a-f]{24})⟧([\s\S]*?)⟦\/c⟧/g,
    (_match, id: string, text: string) =>
      `<span data-concept-id="${id}" class="concept-term">${text}</span>`,
  )
}

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(normalizeConceptMarkers(html), {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'span',
      'code',
      'pre',
      'ul',
      'ol',
      'li',
      'a',
      'sub',
      'sup',
    ],
    // data-concept-id שורד גם ב-ALLOW_DATA_ATTR שהוא ברירת-המחדל של DOMPurify,
    // אבל מפורש כאן כדי שסימוני-המונח (ConceptMark, PRD §Concept) יישמרו גם אם
    // ברירת-המחדל תשתנה. class נדרש ל-`concept-term` שמפעיל את הסגנון וה-hover.
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'data-concept-id'],
  })
}
