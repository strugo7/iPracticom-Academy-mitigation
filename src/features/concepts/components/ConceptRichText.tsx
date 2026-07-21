/**
 * עורך ההסבר המלא (design-export/Term Editor.dc.html שורות 113-126): תיבה עם
 * גבול, סרגל-כלים **קבוע** מעליה, ואזור-עריכה נגלל (min 200 / max 340).
 * ה-SVG-ים של הסרגל מועתקים as-is מ-`tDef` שבאותו קובץ (שורות 481-488) —
 * אין ל-registry של ה-DS אייקוני מודגש/נטוי/רשימה (נוהל-הפער §6.1 שלב 1).
 *
 * הסרגל מציג רק פורמטים ש**שורדים** את `sanitizeRichText` (bold/italic/רשימות/
 * קישור). "כותרת", "ציטוט" ו"יישור" שבעיצוב הושמטו במכוון: ה-sanitizer לא מתיר
 * תגיות כותרת או ציטוט, כך שכפתור כזה היה מייצר תוכן שנעלם בתצוגה.
 *
 * זו קומפוננטה נפרדת מ-`RichTextField` של עורך-השיעורים: שם עריכה inline-בקנבס
 * עם סרגל צף, וכאן תיבת-טופס עם סרגל קבוע (וגם: אין ייבוא בין features, §8).
 */
import { useEffect, useState } from 'react'
import { type Editor, EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Button, Input } from '@/components/ui'

/** tiptap מחזיר `<p></p>` על תוכן ריק — ממופה למחרוזת ריקה למודל-הדאטה. */
function normalize(html: string): string {
  return html === '<p></p>' ? '' : html
}

type SvgProps = { size?: number }

function Glyph({ size = 16, children }: SvgProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const BoldIcon = () => (
  <Glyph>
    <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
    <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
  </Glyph>
)

const ItalicIcon = () => (
  <Glyph>
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </Glyph>
)

const BulletListIcon = () => (
  <Glyph>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </Glyph>
)

const OrderedListIcon = () => (
  <Glyph>
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </Glyph>
)

/** אייקון-הקישור של הסרגל (Term Editor.dc.html שורה 121). */
const LinkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width={17}
    height={17}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

interface Tool {
  title: string
  Icon: () => React.ReactElement
  mark: string
  run: (editor: Editor) => void
}

const TOOLS: Tool[] = [
  {
    title: 'מודגש',
    Icon: BoldIcon,
    mark: 'bold',
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    title: 'נטוי',
    Icon: ItalicIcon,
    mark: 'italic',
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    title: 'רשימת תבליטים',
    Icon: BulletListIcon,
    mark: 'bulletList',
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'רשימה ממוספרת',
    Icon: OrderedListIcon,
    mark: 'orderedList',
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
]

function ToolButton({
  title,
  active,
  onClick,
  children,
}: {
  title: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      // מונע איבוד-הסימון: הכפתור לא לוקח פוקוס מהעורך
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
        active
          ? 'bg-hues-sky text-accent'
          : 'text-neutrals-charcoal hover:bg-hues-sky hover:text-accent'
      }`}
    >
      {children}
    </button>
  )
}

interface ConceptRichTextProps {
  value: string
  onChange: (html: string) => void
  invalid?: boolean
}

export function ConceptRichText({ value, onChange, invalid }: ConceptRichTextProps) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: false })],
    content: value,
    editorProps: {
      attributes: {
        dir: 'rtl',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'תיאור מלא',
        class:
          'min-h-[200px] max-h-[340px] overflow-y-auto p-4 text-[15px] leading-loose text-neutrals-charcoal outline-none [&_a]:text-accent [&_a]:underline [&_ol]:ms-5 [&_ol]:list-decimal [&_p]:mb-2.5 [&_strong]:font-semibold [&_ul]:ms-5 [&_ul]:list-disc',
      },
    },
    onUpdate: ({ editor: e }) => onChange(normalize(e.getHTML())),
  })

  // סנכרון ערך חיצוני (טעינת המונח במצב עריכה) בלי לשבור הקלדה שוטפת
  useEffect(() => {
    if (!editor) return
    if (normalize(editor.getHTML()) !== value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  const toggleLink = () => {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    setLinkUrl(editor.getAttributes('link').href ?? '')
    setLinkOpen(true)
  }

  const applyLink = () => {
    if (!editor) return
    const href = linkUrl.trim()
    const chain = editor.chain().focus().extendMarkRange('link')
    if (href) chain.setLink({ href }).run()
    else chain.unsetLink().run()
    setLinkOpen(false)
    setLinkUrl('')
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white ${
        invalid ? 'border-caution' : 'border-neutrals-silver'
      }`}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-neutrals-silver bg-neutrals-whisper p-2">
        {TOOLS.map(({ title, Icon, mark, run }) => (
          <ToolButton
            key={mark}
            title={title}
            active={editor?.isActive(mark) ?? false}
            onClick={() => editor && run(editor)}
          >
            <Icon />
          </ToolButton>
        ))}

        <span className="mx-1 h-5 w-px bg-neutrals-silver" aria-hidden="true" />

        <ToolButton
          title="הוסף קישור"
          active={editor?.isActive('link') ?? false}
          onClick={toggleLink}
        >
          <LinkIcon />
        </ToolButton>

        {linkOpen && (
          <div className="flex flex-1 items-center gap-2 ps-2">
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyLink()
                }
                if (e.key === 'Escape') setLinkOpen(false)
              }}
              placeholder="https://"
              aria-label="כתובת הקישור"
            />
            <Button variant="primary" onClick={applyLink}>
              החל
            </Button>
          </div>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
