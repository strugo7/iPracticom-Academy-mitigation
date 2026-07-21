/**
 * דיאלוג יצירת/עריכת VLAN (שלב 6.4c, מסמך 24 §4) — שם, VLAN ID, בורר-צבע, ובמצב
 * עריכה גם "פירוק". תואם design-export/Network Canvas.dc.html (שורות 272-311).
 */
import { Icon } from '@/components/ui'
import { STRINGS } from '../constants'
import { STUDIO } from '@/components/network/studioTokens'
import { VLAN_COLORS, type VlanDraft } from '@/components/network/vlanOps'

const FIELD_CLASS = 'h-10 w-full rounded-lg px-3 text-[14px] outline-none focus:border-[#7CCBFF]'
const FIELD_STYLE = {
  background: STUDIO.fieldBg,
  border: '1px solid rgba(255,255,255,.1)',
  color: STUDIO.textPrimary,
}

export function VlanDialog({
  mode,
  draft,
  memberCount,
  onChange,
  onSave,
  onClose,
  onDissolve,
}: {
  mode: 'create' | 'edit'
  draft: VlanDraft
  memberCount: number
  onChange: (patch: Partial<VlanDraft>) => void
  onSave: () => void
  onClose: () => void
  onDissolve: () => void
}) {
  const isEdit = mode === 'edit'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" dir="rtl">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: שכבת-כיסוי לסגירה; הדיאלוג עצמו נגיש */}
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(8,11,15,.55)', backdropFilter: 'blur(2px)' }}
      />
      <div
        role="dialog"
        aria-label={isEdit ? STRINGS.vlanEditTitle : STRINGS.vlanCreateTitle}
        className="relative w-[368px] max-w-[92%] overflow-hidden rounded-2xl"
        style={{ background: STUDIO.panelBg, border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 30px 70px rgba(0,0,0,.55)' }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between gap-2 p-4"
          style={{ borderBottom: `1px solid ${STUDIO.divider}` }}
        >
          <div>
            <div className="text-[15.5px] font-semibold" style={{ color: STUDIO.textPrimary }}>
              {isEdit ? STRINGS.vlanEditTitle : STRINGS.vlanCreateTitle}
            </div>
            <div className="mt-0.5 text-[11.5px]" style={{ color: STUDIO.textDim }}>
              {STRINGS.vlanMembers(memberCount)}
            </div>
          </div>
          <button
            type="button"
            aria-label={STRINGS.close}
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: 'rgba(255,255,255,.05)', color: STUDIO.textMuted }}
          >
            <Icon name="Close" size={16} />
          </button>
        </div>

        {/* body */}
        <div className="flex flex-col gap-4 p-4">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold" style={{ color: STUDIO.textDim }}>
              {STRINGS.vlanName}
            </span>
            <input
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={STRINGS.vlanNamePlaceholder}
              aria-label={STRINGS.vlanName}
              className={FIELD_CLASS}
              style={FIELD_STYLE}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold" style={{ color: STUDIO.textDim }}>
              {STRINGS.vlanId}
            </span>
            <input
              value={String(draft.vlan_id)}
              dir="ltr"
              inputMode="numeric"
              aria-label={STRINGS.vlanId}
              onChange={(e) => onChange({ vlan_id: Number(e.target.value.replace(/\D/g, '')) || 0 })}
              className={`${FIELD_CLASS} text-left font-semibold`}
              style={FIELD_STYLE}
            />
          </label>
          <div>
            <span className="mb-2 block text-[11px] font-semibold" style={{ color: STUDIO.textDim }}>
              {STRINGS.vlanColor}
            </span>
            <div className="flex gap-2">
              {VLAN_COLORS.map((c) => {
                const active = draft.color === c
                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={`${STRINGS.vlanColor} ${c}`}
                    aria-pressed={active}
                    onClick={() => onChange({ color: c })}
                    className="flex size-8 items-center justify-center rounded-lg transition-transform hover:scale-105"
                    style={{ background: c, border: `2px solid ${active ? '#fff' : 'rgba(255,255,255,.12)'}` }}
                  >
                    {active && <Icon name="Check" size={15} className="text-white" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* footer */}
        <div
          className="flex items-center justify-between gap-2 p-4"
          style={{ borderTop: `1px solid ${STUDIO.divider}` }}
        >
          {isEdit ? (
            <button
              type="button"
              onClick={onDissolve}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
              style={{ color: '#E5777B', border: '1px solid rgba(201,66,54,.35)' }}
            >
              <Icon name="Remove" size={15} />
              {STRINGS.vlanDissolve}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[13px] font-semibold"
              style={{ color: STUDIO.textMuted, border: '1px solid rgba(255,255,255,.12)' }}
            >
              {STRINGS.cancel}
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
              style={{ background: '#0075DB', boxShadow: '0 6px 16px rgba(0,117,219,.4)' }}
            >
              <Icon name="Check" size={15} />
              {isEdit ? STRINGS.save : STRINGS.vlanCreateAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
