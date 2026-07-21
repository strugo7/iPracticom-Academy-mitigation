/**
 * אינטגרציות (design-export שורות 234-259) — תיאורי-בלבד. המפתחות וסטטוס-
 * החיבור מנוהלים server-side (.env.example: "ה-frontend לא צורך אותם
 * ישירות") — אין כאן הצגת מפתח או "מחובר/לא מחובר" בדויים (CLAUDE.md §5).
 */
import { EXTERNAL_INTEGRATIONS } from '../constants'
import { PlugIcon } from '../icons'

export function IntegrationsSection() {
  return (
    <div className="animate-[fadeIn_0.24s_ease]">
      <div className="mb-5">
        <h2 className="m-0 flex items-center gap-2.5 text-[21px] font-semibold text-neutrals-charcoal">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-hues-sky text-accent">
            <PlugIcon size={18} />
          </span>
          אינטגרציות
        </h2>
        <p className="mt-2 text-small leading-relaxed text-neutrals-lead">
          שירותים חיצוניים המחוברים לאקדמיה. המפתחות וסטטוס-החיבור בפועל מנוהלים
          בצד השרת (Phase 12) — אין ללקוח גישה אליהם, כך שהם אינם מוצגים כאן.
        </p>
      </div>

      <section className="mb-6 rounded-2xl bg-white px-5 py-1 shadow-card">
        {EXTERNAL_INTEGRATIONS.map((it, i) => (
          <div
            key={it.id}
            className={`flex items-center gap-3.5 py-4 ${
              i < EXTERNAL_INTEGRATIONS.length - 1 ? 'border-b border-neutrals-whisper' : ''
            }`}
          >
            <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-neutrals-charcoal font-sans text-[15px] font-semibold text-white">
              {it.letter}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-small text-neutrals-charcoal">{it.name}</div>
              <div className="mt-0.5 truncate text-tiny text-neutrals-nickel">{it.desc}</div>
            </div>
            <span className="flex-none rounded-full bg-neutrals-whisper px-3 py-1.5 text-tiny font-semibold text-neutrals-nickel">
              מנוהל בצד השרת
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
