import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/** spec-only (0 מופעים אמיתיים בפיקסצ'רים) — מוצג בזהירות, ראו blockSchemas.ts. */
export function VideoBlock({ data }: { data: ParsedBlockDataMap['video'] }) {
  return (
    <video
      controls
      poster={data.poster ?? undefined}
      className="w-full rounded-lg bg-neutrals-charcoal"
    >
      <source src={data.url} />
      {data.captions && <track kind="captions" src={data.captions} default />}
    </video>
  )
}
