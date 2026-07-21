import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/**
 * מסמכי HTML מלאים (כולל <script> חיצוניים בדאטה האמיתי) — מסונדק ב-iframe
 * תמיד, לעולם לא dangerouslySetInnerHTML לתוך ה-DOM של האפליקציה. ללא
 * allow-same-origin (גם ב-srcDoc וגם ב-src חיצוני) — ה-iframe מקבל origin
 * אטום/מבודד, גם אם allow-scripts מאפשר לתוכן להריץ קוד בתוך עצמו בלבד.
 */
export function HtmlEmbedBlock({
  data,
}: {
  data: ParsedBlockDataMap['html_embed']
}) {
  const height = data.iframe_height ?? 480

  if (data.iframe_url) {
    return (
      <iframe
        src={data.iframe_url}
        title="תוכן מוטמע"
        className="w-full rounded-lg border border-neutrals-silver"
        style={{ height }}
        sandbox="allow-scripts allow-forms"
        loading="lazy"
      />
    )
  }

  const html = data.sanitized_html ?? data.html ?? data.html_content ?? ''
  if (!html) return null

  return (
    <iframe
      srcDoc={html}
      title="תוכן מוטמע"
      className="w-full rounded-lg border border-neutrals-silver"
      style={{ height }}
      sandbox="allow-scripts"
      loading="lazy"
    />
  )
}
