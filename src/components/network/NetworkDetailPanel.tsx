/**
 * פאנל פרטי-רכיב לקריאה-בלבד בתצוגת-הלומד (שלב 6.4d, מסמך 25 §3) — נפתח בלחיצה
 * על רכיב: כותרת, הגדרות-רשת (IP/subnet/פורט), חברוּת-VLAN, ופאנל-הסוויץ' לסוויץ'.
 * ללא עריכה. משתף את SwitchPortPanel עם העורך (מסמך 25 §5 — אותו data, שני מצבים).
 */
import { deviceMeta } from './deviceRegistry'
import { STUDIO } from './studioTokens'
import { SwitchPortPanel } from './SwitchPortPanel'
import { NET_STRINGS } from './strings'
import type { NetModel, NetNode } from './networkTopologyOps'
import { vlansOfNode, type Vlan } from './vlanOps'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold" style={{ color: STUDIO.textDim }}>
        {label}
      </span>
      <span dir="ltr" className="text-[13px]" style={{ color: STUDIO.textStrong }}>
        {value}
      </span>
    </div>
  )
}

export function NetworkDetailPanel({
  node,
  model,
  vlans,
  onClose,
}: {
  node: NetNode
  model: NetModel
  vlans: Vlan[]
  onClose: () => void
}) {
  const meta = deviceMeta(node.type)
  const memberVlans = vlansOfNode(vlans, node.id)

  return (
    <div
      className="absolute bottom-4 start-4 z-20 max-h-[calc(100%-2rem)] w-[300px] overflow-y-auto rounded-xl shadow-[0_18px_44px_rgba(0,0,0,.5)]"
      style={{ background: STUDIO.panelBg, border: `1px solid ${STUDIO.overlayBorder}` }}
      dir="rtl"
    >
      <div className="flex items-center gap-3 p-3" style={{ borderBottom: `1px solid ${STUDIO.divider}` }}>
        <span
          className="flex size-10 flex-none items-center justify-center rounded-xl"
          style={{ background: STUDIO.nodeBg, border: `1.5px solid ${STUDIO.nodeBorder}`, color: STUDIO.iconIdle }}
        >
          <span className="size-[22px]">{meta.icon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-semibold" style={{ color: STUDIO.textPrimary }}>
            {node.label || meta.label}
          </div>
          <div className="text-[11.5px]" style={{ color: STUDIO.textMuted }}>
            {meta.typeLabel}
          </div>
        </div>
        <button
          type="button"
          aria-label={NET_STRINGS.close}
          onClick={onClose}
          className="flex size-7 flex-none items-center justify-center rounded-lg"
          style={{ color: STUDIO.textMuted, background: 'rgba(255,255,255,.05)' }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {(node.ip || node.subnet || node.port) && (
        <div className="flex flex-col gap-2.5 p-3" style={{ borderBottom: `1px solid ${STUDIO.divider}` }}>
          {node.ip && <InfoRow label={NET_STRINGS.ip} value={node.ip} />}
          {node.subnet && <InfoRow label={NET_STRINGS.subnet} value={node.subnet} />}
          {node.port && <InfoRow label={NET_STRINGS.port} value={node.port} />}
        </div>
      )}

      {memberVlans.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3" style={{ borderBottom: `1px solid ${STUDIO.divider}` }}>
          {memberVlans.map((v) => (
            <span
              key={v.id}
              dir="ltr"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: 'rgba(255,255,255,.05)', color: STUDIO.textStrong }}
            >
              <span className="size-2 rounded-full" style={{ background: v.color }} />
              VLAN {v.vlan_id}
            </span>
          ))}
        </div>
      )}

      {node.type === 'switch' && <SwitchPortPanel model={model} switchId={node.id} vlans={vlans} />}
    </div>
  )
}
