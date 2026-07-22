/**
 * עורך-בלוק פר-סוג (7 הסוגים של קטלוג-הנהלים). טקסט עשיר דרך RichTextField
 * (tiptap) שנחשף מ-lessonEditor — שימוש חוזר, לא שכפול. שאר הסוגים עם קלטי-DS.
 * ה-data נשמר בצורה תואמת ל-blockSchemas/BlockRenderer, כדי שהצפייה תרנדר 1:1.
 */
import { RichTextField } from '@/features/lessonEditor'
import { Icon, Input, Textarea } from '@/components/ui'
import type { LessonBlockEnvelope } from '@/types/entities'

interface PolicyBlockEditorProps {
  block: LessonBlockEnvelope
  onChange: (data: Record<string, unknown>) => void
}

type Data = Record<string, unknown>

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const list = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map((x) => (typeof x === 'string' ? x : str((x as Data)?.text)))
    : []

export function PolicyBlockEditor({ block, onChange }: PolicyBlockEditorProps) {
  const data = block.data as Data

  switch (block.type) {
    case 'heading':
      return (
        <Input
          value={str(data.text)}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="כותרת…"
        />
      )

    case 'text':
      return (
        <RichTextField
          value={str(data.content)}
          onChange={(html) => onChange({ content: html })}
          placeholder="כתוב/כתבי טקסט…"
          ariaLabel="תוכן הבלוק"
        />
      )

    case 'list': {
      const items = list(data.items)
      const update = (next: string[]) => onChange({ items: next })
      return (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex size-6 flex-none items-center justify-center rounded-full bg-hues-sky text-[12px] font-semibold text-accent">
                {index + 1}
              </span>
              <div className="flex-1">
                <Input
                  value={item}
                  onChange={(e) =>
                    update(
                      items.map((v, i) => (i === index ? e.target.value : v)),
                    )
                  }
                  placeholder={`פריט ${index + 1}`}
                />
              </div>
              <button
                type="button"
                aria-label="הסר פריט"
                className="text-neutrals-nickel hover:text-hues-red"
                onClick={() => update(items.filter((_, i) => i !== index))}
              >
                <Icon name="Remove" size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="inline-flex w-fit items-center gap-1.5 text-small font-semibold text-accent"
            onClick={() => update([...items, ''])}
          >
            <Icon name="Plus" size={14} />
            הוסף פריט
          </button>
        </div>
      )
    }

    case 'table':
      return <TableEditor data={data} onChange={onChange} />

    case 'image':
      return (
        <div className="flex flex-col gap-2">
          <Input
            value={str(data.url)}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="כתובת התמונה (URL)"
          />
          <Input
            value={str(data.caption)}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="כיתוב (רשות)"
          />
        </div>
      )

    case 'pdf':
      return (
        <div className="flex flex-col gap-2">
          <Input
            value={str(data.url)}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="כתובת קובץ ה-PDF (URL)"
          />
          <Input
            value={str(data.title)}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="כותרת הקובץ (רשות)"
          />
        </div>
      )

    case 'separator':
      return (
        <div className="flex items-center gap-3 py-1.5 text-neutrals-palladium">
          <span className="h-px flex-1 bg-neutrals-silver" />
          <Icon name="Minus" size={14} />
          <span className="h-px flex-1 bg-neutrals-silver" />
        </div>
      )

    default:
      return (
        <Textarea
          value={str(data.content)}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="תוכן"
        />
      )
  }
}

/** עורך-טבלה פשוט — כותרות ותאים עריכים, הוספת שורה/עמודה. */
function TableEditor({
  data,
  onChange,
}: {
  data: Data
  onChange: (data: Data) => void
}) {
  const headers = Array.isArray(data.headers) ? (data.headers as string[]) : []
  const rows = Array.isArray(data.rows)
    ? (data.rows as { cells: string[] }[])
    : []

  const setHeader = (index: number, value: string) =>
    onChange({ headers: headers.map((h, i) => (i === index ? value : h)) })

  const setCell = (r: number, c: number, value: string) =>
    onChange({
      rows: rows.map((row, ri) =>
        ri === r
          ? { cells: row.cells.map((cell, ci) => (ci === c ? value : cell)) }
          : row,
      ),
    })

  const addRow = () =>
    onChange({ rows: [...rows, { cells: headers.map(() => '') }] })

  const addColumn = () =>
    onChange({
      headers: [...headers, 'עמודה'],
      rows: rows.map((row) => ({ cells: [...row.cells, ''] })),
    })

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-xl border border-neutrals-silver">
        <table className="w-full border-collapse text-small">
          <thead>
            <tr className="bg-neutrals-whisper">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="border-b border-neutrals-silver p-1.5"
                >
                  <input
                    value={header}
                    onChange={(e) => setHeader(index, e.target.value)}
                    className="w-full bg-transparent px-2 py-1 text-start font-semibold text-neutrals-charcoal outline-none"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-b border-neutrals-whisper">
                {row.cells.map((cell, c) => (
                  <td key={c} className="p-1.5">
                    <input
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className="w-full bg-transparent px-2 py-1 text-start text-neutrals-slate outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 text-small font-semibold text-accent">
        <button
          type="button"
          className="inline-flex items-center gap-1"
          onClick={addRow}
        >
          <Icon name="Plus" size={13} />
          הוסף שורה
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1"
          onClick={addColumn}
        >
          <Icon name="Plus" size={13} />
          הוסף עמודה
        </button>
      </div>
    </div>
  )
}
