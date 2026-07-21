import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/** spec-only (0 מופעים אמיתיים בפיקסצ'רים) — placeholder ויזואלי בלבד, ראו blockSchemas.ts. */
export function LessonCoverBlock({
  data,
}: {
  data: ParsedBlockDataMap['lesson_cover']
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-accent-gradient px-8 py-12 text-center text-white"
      style={data.gradient ? { background: data.gradient } : undefined}
    >
      {data.image && (
        <img src={data.image} alt="" className="mb-2 h-16 w-16 object-contain" />
      )}
      <h2 className="m-0 text-[24px] font-semibold">{data.title}</h2>
      {data.subtitle && <p className="m-0 text-[15px] opacity-90">{data.subtitle}</p>}
    </div>
  )
}
