/**
 * שדה-טקסט עשיר inline (שלב 6.3, מסמך 20 §2) — עורך tiptap במקום הבלוק בקנבס,
 * WYSIWYG. פורמט (bold/italic/underline/link/רשימות) דרך FloatingTextToolbar
 * שנפתח בסימון. הפלט הוא HTML תואם ל-sanitizeRichText (אותם tags), כך שהנגן
 * מרנדר בדיוק את מה שנערך. placeholder מוצג כשהעורך ריק (בלי extension נוסף).
 */
import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { normalizeConceptMarkers } from '@/components/blocks/sanitizeHtml'
import { ConceptMark, useConceptLinking } from '@/features/concepts'
import { FloatingTextToolbar } from './FloatingTextToolbar'

interface RichTextFieldProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  ariaLabel?: string
  autoFocus?: boolean
  className?: string
}

/** tiptap מחזיר `<p></p>` על תוכן ריק — ממופה למחרוזת ריקה למודל-הדאטה. */
function normalize(html: string): string {
  return html === '<p></p>' ? '' : html
}

export function RichTextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  autoFocus,
  className,
}: RichTextFieldProps) {
  // סימוני-המונח המיושנים (⟦id⟧…⟦/c⟧) מנורמלים לפני שהתוכן נכנס ל-tiptap, אחרת
  // הם מוצגים כטקסט גולמי בעורך. אחרי הנרמול ConceptMark מזהה אותם כמונח, ושמירה
  // מקבעת את הפורמט הקנוני (migrateConceptMarkers, צד-לקוח).
  const html = normalizeConceptMarkers(value)

  const editor = useEditor({
    // ConceptMark מוסף ל-StarterKit כדי שסימוני-מונח קיימים בשיעור (span[data-
    // concept-id]) יישמרו בעריכה במקום להיחתך, וכדי לאפשר סימון חדש (§Concept).
    extensions: [StarterKit.configure({ heading: false }), ConceptMark],
    content: html,
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        dir: 'rtl',
        role: 'textbox',
        'aria-multiline': 'true',
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
        class: `min-h-[1.6em] whitespace-pre-wrap outline-none [&_p]:m-0 [&_a]:text-accent [&_a]:underline [&_ul]:ms-5 [&_ul]:list-disc [&_ol]:ms-5 [&_ol]:list-decimal [&_strong]:font-semibold ${className ?? ''}`,
      },
    },
    onUpdate: ({ editor: e }) => onChange(normalize(e.getHTML())),
  })

  const conceptLinking = useConceptLinking(editor)

  // סנכרון ערך חיצוני (שחזור גרסה / החלפת בלוק) בלי לשבור הקלדה שוטפת.
  // ההשוואה מול ה-html המנורמל, כדי שלא ייווצר לולאת-setContent מול legacy value.
  useEffect(() => {
    if (!editor) return
    if (normalize(editor.getHTML()) !== html) {
      editor.commands.setContent(html, { emitUpdate: false })
    }
  }, [html, editor])

  return (
    <div className="relative">
      {editor && (
        <FloatingTextToolbar editor={editor} conceptLinking={conceptLinking} />
      )}
      {editor?.isEmpty && placeholder && (
        <span className="pointer-events-none absolute inset-0 text-neutrals-nickel">
          {placeholder}
        </span>
      )}
      <EditorContent editor={editor} />
      {/* הדיאלוגים מותקנים כאן (לא ב-BubbleMenu) כדי לשרוד את איפוס-הבחירה */}
      {conceptLinking.dialogs}
    </div>
  )
}
