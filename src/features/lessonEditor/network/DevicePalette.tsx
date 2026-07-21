/**
 * פלטת-רכיבים צפה (תחתית-מרכז) של עורך-הטופולוגיה (שלב 6.4b) — תואם
 * design-export/Network Canvas.dc.html (שורות 125-138). לחיצה על צ'יפ מוסיפה
 * רכיב מהסוג לקנבס (גרירה-לקנבס תיתכן בהמשך; לחיצה נגישה ופשוטה יותר).
 */
import { DEVICE_REGISTRY, PALETTE_ORDER, type DeviceType } from '@/components/network/deviceRegistry'
import { STUDIO } from '@/components/network/studioTokens'
import { STRINGS } from '../constants'

export function DevicePalette({ onAdd }: { onAdd: (type: DeviceType) => void }) {
  return (
    <div
      aria-label={STRINGS.netPaletteAria}
      className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-2xl p-2 px-3 shadow-[0_14px_36px_rgba(0,0,0,.45)] backdrop-blur"
      style={{ background: STUDIO.overlayBg, border: `1px solid ${STUDIO.overlayBorder}` }}
    >
      <div
        className="mb-2 text-center text-[10.5px] font-semibold tracking-wide"
        style={{ color: STUDIO.textFaint }}
      >
        {STRINGS.netPaletteHint}
      </div>
      <div className="flex gap-2">
        {PALETTE_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            title={DEVICE_REGISTRY[type].label}
            aria-label={`${STRINGS.netAddDevice}: ${DEVICE_REGISTRY[type].label}`}
            onClick={() => onAdd(type)}
            className="flex w-[62px] flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors hover:brightness-125"
            style={{ background: '#1B222B', border: `1px solid ${STUDIO.overlayBorder}` }}
          >
            <span className="size-6" style={{ color: STUDIO.iconIdle }}>
              {DEVICE_REGISTRY[type].icon}
            </span>
            <span
              className="max-w-[56px] truncate text-[10px]"
              style={{ color: STUDIO.textMuted }}
            >
              {DEVICE_REGISTRY[type].label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
