import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

export function TableBlock({ data }: { data: ParsedBlockDataMap['table'] }) {
  const bordered = data.showBorders !== false
  return (
    <div className="overflow-x-auto">
      {data.title && (
        <h4 className="mb-2 text-[15px] font-semibold text-neutrals-charcoal">
          {data.title}
        </h4>
      )}
      <table
        className={`w-full text-start text-[14px] ${bordered ? 'border border-neutrals-silver' : ''}`}
      >
        <thead>
          <tr
            className={!data.headerBg ? 'bg-neutrals-whisper' : ''}
            style={data.headerBg ? { backgroundColor: data.headerBg } : undefined}
          >
            {data.headers.map((header, i) => (
              <th
                key={i}
                className="border-b border-neutrals-silver px-3 py-2 text-start font-semibold text-neutrals-charcoal"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={
                data.stripedRows && rowIndex % 2 === 1 ? 'bg-neutrals-whisper' : ''
              }
            >
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-b border-neutrals-silver px-3 py-2 text-neutrals-charcoal"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
