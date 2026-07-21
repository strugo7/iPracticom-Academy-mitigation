/**
 * ConceptMark (PRD §Concept, `migrateConceptMarkers`) — סימון tiptap שעוטף טקסט
 * במונח מהמאגר. הפורמט זהה 1:1 לזה שכבר קיים בדאטה האמיתי של Base44:
 *   <span data-concept-id="<id>" class="concept-term">טקסט התצוגה</span>
 *
 * טקסט-התצוגה יכול להיות צורה מוטה ("הרכזת" למונח "רכזת גילוי אש") — קישור
 * עם alias, בדיוק כמו wiki-link. ה-`data-concept-id` הוא ה-Concept.id.
 *
 * מוגדר כאן (ב-feature המונחים) ולא ב-lessonEditor, כי הוא צריך להירשם גם
 * בעורך (RichTextField) וגם בכל מקום שמרנדר תוכן — שני צרכנים, פרימיטיב אחד.
 */
import { Mark, mergeAttributes } from '@tiptap/core'

export interface ConceptMarkAttributes {
  conceptId: string | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    conceptMark: {
      /** עוטף את הבחירה הנוכחית בסימון-מונח עם ה-id הנתון. */
      setConceptMark: (attributes: { conceptId: string }) => ReturnType
      /** מסיר את סימון-המונח מהבחירה. */
      unsetConceptMark: () => ReturnType
    }
  }
}

export const ConceptMark = Mark.create({
  name: 'conceptMark',

  // לא inclusive: הקלדה בקצה הסימון לא נכנסת לתוכו (כמו קישור).
  inclusive: false,

  addAttributes() {
    return {
      conceptId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-concept-id'),
        renderHTML: (attributes) =>
          attributes.conceptId
            ? { 'data-concept-id': attributes.conceptId }
            : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-concept-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'concept-term' }),
      0,
    ]
  },

  addCommands() {
    return {
      setConceptMark:
        (attributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),
      unsetConceptMark:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})
