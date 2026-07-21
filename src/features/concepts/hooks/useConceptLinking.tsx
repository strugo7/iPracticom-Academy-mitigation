/**
 * מחבר בין עורך tiptap (RichTextField) לבין סימון-מונח: לוכד את הבחירה, פותח
 * בורר/יצירה-מהירה, ומפעיל את ה-ConceptMark על הטווח שנשמר. מיוצא מ-feature
 * המונחים כדי ש-lessonEditor יצרוך אותו בלי לחצות גבולות (CLAUDE.md §8).
 *
 * ה-JSX של הדיאלוגים מוחזר כ-`dialogs` ומרונדר ע"י RichTextField (מותקן תמיד),
 * כדי שלא יתפרק יחד עם ה-BubbleMenu כשהבחירה מתאפסת בפתיחת הדיאלוג.
 */
import { type ReactElement, useState } from 'react'
import type { Editor } from '@tiptap/react'
import type { Concept } from '@/types/entities'
import { ConceptPickerDialog } from '../components/ConceptPickerDialog'
import { QuickConceptDialog } from '../components/QuickConceptDialog'

interface PendingRange {
  from: number
  to: number
  text: string
}

type Mode = 'closed' | 'picker' | 'create'

export interface ConceptLinking {
  /** האם הבחירה הנוכחית כבר מסומנת כמונח (לתצוגת מצב-הכפתור). */
  isActive: boolean
  /** האם יש טקסט נבחר שאפשר לסמן (הכפתור פעיל רק אז). */
  canLink: boolean
  /** לחיצת כפתור-המונח: מסיר סימון קיים, או פותח בורר לבחירה חדשה. */
  toggle: () => void
  /** ה-JSX של הדיאלוגים — לרנדר ב-RichTextField (מותקן תמיד). */
  dialogs: ReactElement
}

export function useConceptLinking(editor: Editor | null): ConceptLinking {
  const [mode, setMode] = useState<Mode>('closed')
  const [pending, setPending] = useState<PendingRange | null>(null)

  const isActive = editor?.isActive('conceptMark') ?? false
  const canLink = editor ? !editor.state.selection.empty : false

  const apply = (conceptId: string) => {
    if (!editor || !pending) return
    editor
      .chain()
      .focus()
      .setTextSelection({ from: pending.from, to: pending.to })
      .setConceptMark({ conceptId })
      .run()
    setMode('closed')
    setPending(null)
  }

  const toggle = () => {
    if (!editor) return
    if (editor.isActive('conceptMark')) {
      editor.chain().focus().unsetConceptMark().run()
      return
    }
    const { from, to, empty } = editor.state.selection
    if (empty) return
    const text = editor.state.doc.textBetween(from, to, ' ')
    setPending({ from, to, text })
    setMode('picker')
  }

  const close = () => {
    setMode('closed')
    setPending(null)
  }

  const dialogs = (
    <>
      <ConceptPickerDialog
        open={mode === 'picker'}
        selectedText={pending?.text ?? ''}
        onClose={close}
        onPick={(concept: Concept) => apply(concept.id)}
        onCreateNew={() => setMode('create')}
      />
      <QuickConceptDialog
        open={mode === 'create'}
        initialTerm={pending?.text ?? ''}
        onClose={close}
        onCreated={(concept: Concept) => apply(concept.id)}
      />
    </>
  )

  return { isActive, canLink, toggle, dialogs }
}
