import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

export function QuoteBlock({ data }: { data: ParsedBlockDataMap['quote'] }) {
  return (
    <blockquote className="border-s-4 border-accent bg-hues-sky/30 py-3 ps-4 pe-3 text-[15px] italic text-neutrals-charcoal">
      <p className="m-0">{data.text}</p>
      {data.author && (
        <footer className="mt-2 text-[13px] font-normal not-italic text-neutrals-lead">
          — {data.author}
        </footer>
      )}
    </blockquote>
  )
}
