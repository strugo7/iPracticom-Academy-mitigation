/**
 * סרגל-הטקסט הצף (שלב 6.3, מסמך 20 §2) — נפתח בסימון טקסט בתוך RichTextField.
 * מבוסס tiptap BubbleMenu, מעוצב 1:1 מ-design-export/Lesson Editor.dc.html
 * (§floating TEXT toolbar): גלולה charcoal, radius 12, צל עמוק, כפתורי-פורמט
 * 30px. קישור נפתח כשדה-קלט inline (בלי window.prompt). אייקונים אמיתיים
 * (currentColor), בלי גליפי-טקסט.
 */
import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { ConceptLinking } from '@/features/concepts'
import { EditorIcon, type EditorIconName } from '../editorIcons'
import { STRINGS } from '../constants'

/** אייקון סימון-מונח (ספר פתוח) — פער-DS, מתוך design-export/Concepts.dc.html. */
function ConceptGlyph({ size = 16 }: { size?: number }) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

interface FmtButtonProps {
  icon: EditorIconName
  label: string
  active?: boolean
  onClick: () => void
}

function FmtButton({ icon, label, active, onClick }: FmtButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      // מונע איבוד-הסימון: הכפתור לא לוקח פוקוס מהעורך
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex size-[30px] items-center justify-center rounded-[7px] transition-colors ${
        active
          ? 'bg-white/[0.16] text-white'
          : 'text-neutrals-palladium hover:bg-white/[0.1] hover:text-white'
      }`}
    >
      <EditorIcon name={icon} size={16} />
    </button>
  )
}

const DIVIDER = <span className="mx-[3px] h-5 w-px bg-white/[0.16]" />

export function FloatingTextToolbar({
  editor,
  conceptLinking,
}: {
  editor: Editor
  conceptLinking: ConceptLinking
}) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  function toggleLink() {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    setLinkUrl(editor.getAttributes('link').href ?? '')
    setLinkOpen(true)
  }

  function applyLink() {
    const href = linkUrl.trim()
    const chain = editor.chain().focus().extendMarkRange('link')
    if (href) chain.setLink({ href }).run()
    else chain.unsetLink().run()
    setLinkOpen(false)
  }

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-[3px] rounded-xl bg-neutrals-charcoal p-[5px_6px] shadow-[0_16px_38px_rgba(20,40,70,.4)]"
    >
      <div role="toolbar" aria-label={STRINGS.textFormatToolbar} className="flex items-center gap-[3px]">
        <FmtButton icon="bold" label={STRINGS.fmtBold} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <FmtButton icon="italic" label={STRINGS.fmtItalic} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <FmtButton icon="underline" label={STRINGS.fmtUnderline} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        {DIVIDER}
        {linkOpen ? (
          <span className="flex items-center gap-1.5 ps-1">
            <input
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyLink()
                if (e.key === 'Escape') setLinkOpen(false)
              }}
              placeholder={STRINGS.linkPlaceholder}
              dir="ltr"
              className="h-[26px] w-40 rounded-md bg-white/[0.12] px-2 text-[12.5px] text-white placeholder:text-neutrals-palladium focus:outline-none"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={applyLink}
              className="rounded-md bg-accent px-2.5 py-1 text-[12px] font-semibold text-white"
            >
              {STRINGS.linkApply}
            </button>
          </span>
        ) : (
          <>
            <FmtButton icon="link" label={STRINGS.fmtLink} active={editor.isActive('link')} onClick={toggleLink} />
            <FmtButton icon="list" label={STRINGS.fmtBulletList} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
            <FmtButton icon="listOrdered" label={STRINGS.fmtOrderedList} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
            {DIVIDER}
            {/* סימון-מונח: אם כבר מסומן — מבטל; אחרת פותח בורר-מונח (§Concept) */}
            <button
              type="button"
              title={STRINGS.fmtConcept}
              aria-label={STRINGS.fmtConcept}
              aria-pressed={editor.isActive('conceptMark')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={conceptLinking.toggle}
              className={`flex size-[30px] items-center justify-center rounded-[7px] transition-colors ${
                editor.isActive('conceptMark')
                  ? 'bg-white/[0.16] text-white'
                  : 'text-neutrals-palladium hover:bg-white/[0.1] hover:text-white'
              }`}
            >
              <ConceptGlyph size={16} />
            </button>
          </>
        )}
      </div>
    </BubbleMenu>
  )
}
