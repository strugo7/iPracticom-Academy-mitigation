import { Icon } from '@/components/ui'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/** spec-only (0 מופעים אמיתיים בפיקסצ'רים) — קישור-הורדה פשוט, ראו blockSchemas.ts. */
export function PdfBlock({ data }: { data: ParsedBlockDataMap['pdf'] }) {
  return (
    <a
      href={data.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg border border-neutrals-silver bg-white p-4 hover:bg-neutrals-whisper"
    >
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-hues-salmon text-caution">
        <Icon name="File" size={20} />
      </div>
      <span className="text-[14.5px] font-semibold text-neutrals-charcoal">
        {data.title ?? 'מסמך PDF'}
      </span>
    </a>
  )
}
