import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

export function SimulatorEmbedBlock({
  data,
}: {
  data: ParsedBlockDataMap['simulator_embed']
}) {
  return (
    <div className="flex flex-col gap-2">
      {data.title && (
        <h4 className="m-0 text-[15px] font-semibold text-neutrals-charcoal">
          {data.title}
        </h4>
      )}
      {data.description && (
        <p className="m-0 text-[13.5px] text-neutrals-lead">{data.description}</p>
      )}
      <iframe
        src={data.embed_url}
        title={data.title ?? 'סימולטור'}
        className="aspect-video w-full rounded-lg border border-neutrals-silver"
        sandbox="allow-scripts allow-same-origin allow-forms"
        loading="lazy"
      />
    </div>
  )
}
