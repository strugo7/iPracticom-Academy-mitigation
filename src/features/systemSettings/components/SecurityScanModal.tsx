/**
 * מודאל "סריקת אבטחה" (design-export שורות 328-353) — נגזר בזמן-אמת ממצב
 * ההגדרות הטעון בעמוד (לא סימולציה): whitelist/IP/2FA. מפתחות-API מסומן
 * "info" בכוונה — לא ניתן לאמת חיבור-שרת מהלקוח (CLAUDE.md §5, .env.example).
 */
import { Button, Icon } from '@/components/ui'
import { ShieldCheckIcon } from '../icons'

export interface ScanCheck {
  label: string
  note: string
  status: 'ok' | 'warning' | 'info'
}

interface Props {
  open: boolean
  checks: ScanCheck[]
  onClose: () => void
  onRerun: () => void
}

const STATUS_STYLE: Record<ScanCheck['status'], { tag: string; iconBg: string; iconFg: string }> = {
  ok: { tag: 'תקין', iconBg: 'bg-hues-mint', iconFg: 'text-success' },
  warning: { tag: 'אזהרה', iconBg: 'bg-warning/25', iconFg: 'text-warning' },
  info: { tag: 'לא נבדק מהלקוח', iconBg: 'bg-neutrals-whisper', iconFg: 'text-neutrals-nickel' },
}

export function SecurityScanModal({ open, checks, onClose, onRerun }: Props) {
  if (!open) return null
  const warnCount = checks.filter((c) => c.status === 'warning').length

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(15,30,50,.5)]"
      />
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="סריקת אבטחה"
        className="relative w-full max-w-[480px] overflow-hidden rounded-[20px] bg-white shadow-menu"
      >
        <div className="flex items-center gap-3 bg-accent-gradient p-6 text-white">
          <span className="flex size-[46px] flex-none items-center justify-center rounded-[13px] bg-white/20">
            <ShieldCheckIcon size={24} />
          </span>
          <div className="flex-1">
            <div className="text-[18px] font-semibold">סריקת אבטחה</div>
            <div className="mt-0.5 text-small opacity-90">
              {warnCount === 0 ? 'לא נמצאו בעיות' : `${warnCount} אזהרות · נסרק זה עתה`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="flex size-[34px] items-center justify-center rounded-[10px] bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <Icon name="Close" size={18} />
          </button>
        </div>

        <div className="px-6 pb-2 pt-4">
          {checks.map((c) => {
            const style = STATUS_STYLE[c.status]
            return (
              <div
                key={c.label}
                className="flex items-center gap-3.5 border-b border-neutrals-whisper py-3.5 last:border-b-0"
              >
                <span
                  className={`flex size-8 flex-none items-center justify-center rounded-lg ${style.iconBg} ${style.iconFg}`}
                >
                  {c.status === 'warning' ? (
                    <Icon name="Warning" size={17} />
                  ) : (
                    <Icon name="Check" size={17} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[14.5px] text-neutrals-charcoal">{c.label}</div>
                  <div className="mt-0.5 text-tiny text-neutrals-nickel">{c.note}</div>
                </div>
                <span
                  className={`flex-none rounded-full px-2.5 py-1 text-tiny font-semibold ${style.iconBg} ${style.iconFg}`}
                >
                  {style.tag}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2.5 px-6 pb-6 pt-3.5">
          <Button variant="white" className="flex-1" onClick={onClose}>
            סגור
          </Button>
          <Button variant="primary" className="flex-1" onClick={onRerun}>
            הרץ סריקה מחדש
          </Button>
        </div>
      </div>
    </div>
  )
}
