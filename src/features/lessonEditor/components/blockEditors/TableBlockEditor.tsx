/** עורך טבלה (שלב 6.3) — רשת עריכה inline (תאים טקסט-נקי) + הוסף/מחק שורה
 *  ועמודה. שומר {headers[], rows[{cells[]}]} כפי שהנגן (TableBlock) מצפה. */
import { PlainInline } from '../../richtext/PlainInline'
import { STRINGS } from '../../constants'
import { Icon } from '@/components/ui'
import type { BlockEditorProps } from './types'

interface TableRow {
  cells: string[]
}

function readHeaders(data: Record<string, unknown>): string[] {
  return Array.isArray(data.headers) ? data.headers.map((h) => String(h ?? '')) : []
}
function readRows(data: Record<string, unknown>): TableRow[] {
  if (!Array.isArray(data.rows)) return []
  return data.rows.map((r) => ({
    cells: Array.isArray((r as TableRow)?.cells)
      ? (r as TableRow).cells.map((c) => String(c ?? ''))
      : [],
  }))
}

function ToolButton({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string
  icon: 'add' | 'remove'
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[10px] border border-neutrals-silver bg-white px-3 py-2 text-[12.5px] font-semibold transition-colors ${
        danger ? 'text-neutrals-lead hover:border-caution hover:text-caution' : 'text-neutrals-lead hover:border-accent hover:text-accent'
      }`}
    >
      <Icon name={icon === 'add' ? 'Plus' : 'Remove'} size={14} />
      {label}
    </button>
  )
}

export function TableBlockEditor({ data, onChange }: BlockEditorProps) {
  const headers = readHeaders(data)
  const rows = readRows(data)
  const cols = headers.length

  function commit(nextHeaders: string[], nextRows: TableRow[]) {
    onChange({ headers: nextHeaders, rows: nextRows })
  }
  const setHeader = (c: number, v: string) =>
    commit(headers.map((h, i) => (i === c ? v : h)), rows)
  const setCell = (r: number, c: number, v: string) =>
    commit(
      headers,
      rows.map((row, ri) =>
        ri === r ? { cells: row.cells.map((cell, ci) => (ci === c ? v : cell)) } : row,
      ),
    )
  const addRow = () => commit(headers, [...rows, { cells: Array(cols).fill('') }])
  const addCol = () =>
    commit(
      [...headers, `${STRINGS.tableHeaderPlaceholder} ${cols + 1}`],
      rows.map((row) => ({ cells: [...row.cells, ''] })),
    )
  const removeRow = () => rows.length > 1 && commit(headers, rows.slice(0, -1))
  const removeCol = () =>
    cols > 1 &&
    commit(
      headers.slice(0, -1),
      rows.map((row) => ({ cells: row.cells.slice(0, -1) })),
    )

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-neutrals-silver">
        <table className="w-full border-collapse text-start text-[14px]">
          <thead>
            <tr className="bg-neutrals-whisper">
              {headers.map((header, c) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: עמודות ללא מזהה יציב
                <th key={c} className="border-b border-e border-neutrals-silver px-3 py-2 last:border-e-0">
                  <PlainInline
                    value={header}
                    onChange={(v) => setHeader(c, v)}
                    placeholder={STRINGS.tableHeaderPlaceholder}
                    ariaLabel={`${STRINGS.tableHeaderPlaceholder} ${c + 1}`}
                    className="font-semibold text-accent"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: שורות ללא מזהה יציב
              <tr key={r}>
                {row.cells.map((cell, c) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: תאים ללא מזהה יציב
                  <td key={c} className="border-b border-e border-neutrals-silver px-3 py-2 last:border-e-0">
                    <PlainInline
                      value={cell}
                      onChange={(v) => setCell(r, c, v)}
                      placeholder={STRINGS.tableCellPlaceholder}
                      ariaLabel={`תא ${r + 1}·${c + 1}`}
                      className="text-neutrals-charcoal"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <ToolButton label={STRINGS.tableAddRow} icon="add" onClick={addRow} />
        <ToolButton label={STRINGS.tableAddColumn} icon="add" onClick={addCol} />
        <ToolButton label={STRINGS.tableRemoveRow} icon="remove" onClick={removeRow} danger />
        <ToolButton label={STRINGS.tableRemoveColumn} icon="remove" onClick={removeCol} danger />
      </div>
    </div>
  )
}
