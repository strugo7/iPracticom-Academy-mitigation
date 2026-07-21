import { Tag } from '@/components/ui'
import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

export function AiGeneratedBlock({
  data,
}: {
  data: ParsedBlockDataMap['ai_generated']
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutrals-silver bg-white p-4">
      <Tag type="blue">נוצר ב-AI</Tag>
      <div
        className="text-[14.5px] text-neutrals-charcoal"
        // eslint-disable-next-line react/no-danger -- מסונן דרך sanitizeRichText (DOMPurify)
        dangerouslySetInnerHTML={{
          __html: sanitizeRichText(data.generatedContent),
        }}
      />
    </div>
  )
}
