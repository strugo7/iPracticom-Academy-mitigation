import { Alert } from '@/components/ui'
import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

const TONE_TO_ALERT_KIND: Record<
  string,
  'info' | 'success' | 'warning' | 'error'
> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  danger: 'error',
}

/** משתמש ברכיב Alert הקיים של ה-DS AS-IS (כלל CLAUDE.md §6.1) — לא בונה חלופה. */
export function NoteBlock({ data }: { data: ParsedBlockDataMap['note'] }) {
  const html = data.content ?? data.text ?? ''
  const kind = data.tone ? (TONE_TO_ALERT_KIND[data.tone] ?? 'info') : 'info'
  return (
    <Alert kind={kind} title={data.title ?? undefined}>
      <div
        // eslint-disable-next-line react/no-danger -- מסונן דרך sanitizeRichText (DOMPurify)
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
      />
    </Alert>
  )
}
