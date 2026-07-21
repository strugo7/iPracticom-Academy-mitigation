import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/** divider הוא alias של separator (BlockRenderer ממפה type='divider' לכאן). */
export function SeparatorBlock({
  data,
}: {
  data: ParsedBlockDataMap['separator']
}) {
  return (
    <hr
      className="mx-auto my-2 border-neutrals-silver"
      style={{
        borderTopWidth: data.thickness ?? 1,
        width: data.width ?? '100%',
      }}
    />
  )
}
