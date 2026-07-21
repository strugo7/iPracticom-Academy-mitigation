/**
 * עורך רשימה (שלב 6.3) — פריטי-תוכן עשירים.
 *
 * בדאטה האמיתי פריט-רשימה מחזיק **HTML** (`{text: '<p>…</p><ol><li>…'}`) ולעיתים
 * גם מדיה והערה. לכן הפריטים נערכים ב-RichTextField (WYSIWYG, אותו renderer של
 * הנגן) ולא כטקסט-רגיל — אחרת התגיות מוצגות גולמיות. שדות שאין להם עורך כאן
 * (mediaUrl/note) **נשמרים** as-is במקום להימחק (merge רדוד ב-onChange).
 */
import { useState } from 'react'
import { RichTextField } from '../../richtext/RichTextField'
import { STRINGS } from '../../constants'
import { EditorIcon } from '../../editorIcons'
import { Icon } from '@/components/ui'
import type { BlockEditorProps } from './types'

/** צורת פריט אמיתית: מחרוזת פשוטה או אובייקט עם text (+מדיה/הערה). */
type ListItem = string | Record<string, unknown>

function itemText(item: ListItem): string {
  if (typeof item === 'string') return item
  return typeof item.text === 'string' ? item.text : ''
}

/** כתיבת טקסט חדש תוך שימור שאר שדות הפריט (מדיה/הערה). */
function withText(item: ListItem, text: string): ListItem {
  return typeof item === 'string' ? text : { ...item, text }
}

/** האם לפריט יש נספחים שנשמרים אך אינם נערכים כאן — להצגת חיווי. */
function itemExtras(item: ListItem): { media: boolean; note: boolean } {
  if (typeof item === 'string') return { media: false, note: false }
  return { media: Boolean(item.mediaUrl), note: Boolean(item.note) }
}

export function ListBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const items: ListItem[] = Array.isArray(data.items)
    ? (data.items as ListItem[])
    : ['']
  const ordered = data.type === 'ordered' || data.ordered === true
  const [focusIndex, setFocusIndex] = useState<number | null>(
    autoFocus ? 0 : null,
  )

  const commit = (next: ListItem[]) => onChange({ items: next })

  const setItem = (i: number, text: string) =>
    commit(items.map((it, idx) => (idx === i ? withText(it, text) : it)))

  const addItem = () => {
    setFocusIndex(items.length)
    commit([...items, ''])
  }

  const removeItem = (i: number) => {
    if (items.length === 1) return
    setFocusIndex(Math.max(0, i - 1))
    commit(items.filter((_, idx) => idx !== i))
  }

  const ListTag = ordered ? 'ol' : 'ul'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-0.5">
        <button
          type="button"
          aria-pressed={!ordered}
          title={STRINGS.listUnordered}
          onClick={() => onChange({ type: 'unordered', ordered: false })}
          className={`flex size-8 items-center justify-center rounded-lg border transition-colors ${!ordered ? 'border-accent bg-hues-sky text-accent' : 'border-neutrals-silver text-neutrals-lead'}`}
        >
          <EditorIcon name="list" size={16} />
        </button>
        <button
          type="button"
          aria-pressed={ordered}
          title={STRINGS.listOrdered}
          onClick={() => onChange({ type: 'ordered', ordered: true })}
          className={`flex size-8 items-center justify-center rounded-lg border transition-colors ${ordered ? 'border-accent bg-hues-sky text-accent' : 'border-neutrals-silver text-neutrals-lead'}`}
        >
          <EditorIcon name="listOrdered" size={16} />
        </button>
      </div>

      <ListTag className="m-0 flex list-none flex-col gap-2 ps-0">
        {items.map((item, i) => {
          const extras = itemExtras(item)
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: פריטים ללא מזהה יציב
            <li key={i} className="group flex items-start gap-2">
              <span className="mt-1 flex-none text-[13px] font-semibold text-accent">
                {ordered ? `${i + 1}.` : '•'}
              </span>
              <div className="min-w-0 flex-1">
                <RichTextField
                  value={itemText(item)}
                  onChange={(html) => setItem(i, html)}
                  placeholder={STRINGS.listItemPlaceholder}
                  ariaLabel={`${STRINGS.listItemPlaceholder} ${i + 1}`}
                  autoFocus={focusIndex === i}
                  className="text-[15px] leading-relaxed text-neutrals-charcoal"
                />
                {(extras.media || extras.note) && (
                  <div className="mt-1 flex items-center gap-3 text-[11.5px] text-neutrals-nickel">
                    {extras.media && (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="Image" size={12} />
                        תמונה מצורפת
                      </span>
                    )}
                    {extras.note && (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="File" size={12} />
                        הערה מצורפת
                      </span>
                    )}
                  </div>
                )}
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  aria-label={`הסר פריט ${i + 1}`}
                  title="הסר פריט"
                  onClick={() => removeItem(i)}
                  className="mt-0.5 flex-none rounded p-1 text-neutrals-nickel opacity-0 transition-opacity hover:text-caution group-hover:opacity-100"
                >
                  <Icon name="Close" size={14} />
                </button>
              )}
            </li>
          )
        })}
      </ListTag>

      <button
        type="button"
        onClick={addItem}
        className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-semibold text-accent"
      >
        <Icon name="Plus" size={14} />
        {STRINGS.addListItem}
      </button>
    </div>
  )
}
