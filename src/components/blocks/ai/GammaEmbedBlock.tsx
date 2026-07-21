import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/** Gamma — אינטגרציה קיימת ומאושרת (CLAUDE.md — תשתיות שנשארות). */
export function GammaEmbedBlock({
  data,
}: {
  data: ParsedBlockDataMap['gamma_embed']
}) {
  return (
    <div className="flex flex-col gap-2">
      {data.title && (
        <h4 className="m-0 text-[15px] font-semibold text-neutrals-charcoal">
          {data.title}
        </h4>
      )}
      <iframe
        src={data.embed_url}
        title={data.title ?? 'מצגת'}
        className="aspect-video w-full rounded-lg border border-neutrals-silver"
        allow="fullscreen"
        loading="lazy"
      />
    </div>
  )
}
