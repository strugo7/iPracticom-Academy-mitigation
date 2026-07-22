/**
 * הפקת אישור-חתימה להורדה בצד-הלקוח. במצב הנוכחי מייצר מסמך HTML פשוט (Blob)
 * המתעד את פרטי החתימה. ב-Phase 12 האישור הרשמי יופק בשרת (חתום/חתימה
 * דיגיטלית) — כאן זו הורדה מקומית מיידית שמדגימה את הזרימה.
 */
import type { ProcedureAcknowledgement } from '@/types/entities'
import { formatSignedAt } from './policyViewerService'

/** בונה HTML של אישור-הקריאה (RTL, עברית). */
function certificateHtml(
  policyTitle: string,
  ack: ProcedureAcknowledgement,
): string {
  return `<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8">
<title>אישור קריאה וחתימה — ${policyTitle}</title></head>
<body style="font-family:system-ui,sans-serif;padding:40px;color:#181D24;">
<h1 style="font-size:22px;">אישור קריאה וחתימה</h1>
<p>הריני לאשר כי קראתי, הבנתי ואני מאשר/ת את הנוהל:</p>
<p style="font-weight:600;font-size:18px;">${policyTitle}</p>
<hr>
<p>נחתם ע״י: <strong>${ack.user_name ?? ''}</strong></p>
<p>אימייל: ${ack.user_email ?? ''}</p>
<p>מועד החתימה: ${formatSignedAt(ack.acknowledged_at)}</p>
<p>מזהה אישור: ${ack.id}</p>
</body></html>`
}

/** מוריד את אישור-החתימה כקובץ HTML. */
export function downloadAcknowledgementCertificate(
  policyTitle: string,
  ack: ProcedureAcknowledgement,
): void {
  const blob = new Blob([certificateHtml(policyTitle, ack)], {
    type: 'text/html;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `אישור-קריאה-${policyTitle}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
