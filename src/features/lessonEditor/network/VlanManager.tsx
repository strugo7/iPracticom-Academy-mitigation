/**
 * מקטע ניהול ה-VLANs ב-Inspector (שלב 6.4c, מסמך 24) — כותרת + יצירה, רשימת
 * ה-VLANs (צבע · VLAN ID · שם · מס' רכיבים) עם עריכה/פירוק, ורמז-קיבוץ.
 * תואם design-export/Network Canvas.dc.html (שורות 201-224).
 */
import { Icon } from '@/components/ui'
import { STRINGS } from '../constants'
import { STUDIO } from '@/components/network/studioTokens'
import type { Vlan } from '@/components/network/vlanOps'

function IconBtn({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-7 flex-none items-center justify-center rounded-lg transition-colors"
      style={{ color: danger ? '#8A97A6' : STUDIO.textDim }}
    >
      {children}
    </button>
  )
}

export function VlanManager({
  vlans,
  onCreate,
  onEdit,
  onDissolve,
}: {
  vlans: Vlan[]
  onCreate: () => void
  onEdit: (id: string) => void
  onDissolve: (id: string) => void
}) {
  return (
    <div className="p-4" style={{ borderBottom: `1px solid ${STUDIO.divider}` }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[11px] font-semibold tracking-wide" style={{ color: STUDIO.textFaint }}>
          <span style={{ color: STUDIO.accentSky }}>
            <Icon name="Iot" size={14} />
          </span>
          {STRINGS.vlanSection(vlans.length)}
        </span>
        <button
          type="button"
          aria-label={STRINGS.vlanCreate}
          title={STRINGS.vlanCreate}
          onClick={onCreate}
          className="flex size-7 items-center justify-center rounded-lg transition-colors"
          style={{ background: 'rgba(124,203,255,.1)', border: '1px solid rgba(124,203,255,.3)', color: STUDIO.accentSky }}
        >
          <Icon name="Plus" size={15} />
        </button>
      </div>

      {vlans.length === 0 ? (
        <p className="text-[12px]" style={{ color: STUDIO.textFaint }}>
          {STRINGS.vlanEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {vlans.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}
            >
              <span className="size-2.5 flex-none rounded-[3px]" style={{ background: v.color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span dir="ltr" className="text-[12px] font-semibold" style={{ color: STUDIO.textPrimary }}>
                    VLAN {v.vlan_id}
                  </span>
                  <span className="truncate text-[12.5px]" style={{ color: STUDIO.iconIdle }}>
                    {v.name}
                  </span>
                </div>
                <div className="mt-0.5 text-[10.5px]" style={{ color: STUDIO.textFaint }}>
                  {STRINGS.vlanMemberCount(v.member_node_ids.length)}
                </div>
              </div>
              <IconBtn label={STRINGS.vlanEdit} onClick={() => onEdit(v.id)}>
                <Icon name="Edit" size={14} />
              </IconBtn>
              <IconBtn label={STRINGS.vlanDissolve} onClick={() => onDissolve(v.id)} danger>
                <Icon name="Remove" size={14} />
              </IconBtn>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed" style={{ color: STUDIO.textFaint }}>
        <span className="mt-px flex-none" style={{ color: STUDIO.textFaint }}>
          <Icon name="QuestionFill" size={13} />
        </span>
        <span>{STRINGS.vlanGroupHint}</span>
      </div>
    </div>
  )
}
