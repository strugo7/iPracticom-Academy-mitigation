/**
 * פאנל ניהול הסוויץ' (שלב 6.4b, מסמך 21 §4 — הרכיב הייחודי) — לוח-פנים פיזי
 * (jacks) + טבלת port → device. נגזר מהחיבורים הנוגעים בסוויץ' (derivePorts).
 * תואם design-export/Network Canvas.dc.html (שורות 226-260). עמודת VLAN תיווסף
 * עם שכבת ה-VLAN (מסמך 24) — כאן פורט/מחובר-ל/סטטוס.
 */
import { deviceMeta } from './deviceRegistry'
import { STUDIO } from './studioTokens'
import { DEFAULT_SWITCH_PORTS, derivePorts, type NetModel } from './networkTopologyOps'
import { vlansOfNode, type Vlan } from './vlanOps'
import { NET_STRINGS } from './strings'

export function SwitchPortPanel({
  model,
  switchId,
  vlans,
}: {
  model: NetModel
  switchId: string
  vlans: Vlan[]
}) {
  const ports = derivePorts(model, switchId)
  const usedByNum = new Map(ports.map((p) => [p.n, p]))
  const jackCount = Math.max(DEFAULT_SWITCH_PORTS, ...ports.map((p) => p.n))

  return (
    <div className="px-4 pb-6 pt-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className="flex items-center gap-2 text-[11px] font-semibold tracking-wide"
          style={{ color: STUDIO.textFaint }}
        >
          {NET_STRINGS.switchPanel}
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ color: STUDIO.accentSky, background: 'rgba(124,203,255,.12)' }}
        >
          {NET_STRINGS.portsActive(ports.length, jackCount)}
        </span>
      </div>

      {/* faceplate */}
      <div
        className="mb-4 rounded-xl p-3"
        style={{ background: '#10151C', border: `1px solid ${STUDIO.overlayBorder}` }}
      >
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: jackCount }, (_, i) => i + 1).map((n) => {
            const used = usedByNum.has(n)
            return (
              <div
                key={n}
                title={`${NET_STRINGS.port} ${n}`}
                className="relative flex h-8 items-end justify-center rounded-md pb-1"
                style={{
                  background: used ? 'rgba(124,203,255,.12)' : 'rgba(255,255,255,.03)',
                  border: `1.5px solid ${used ? 'rgba(124,203,255,.4)' : STUDIO.overlayBorder}`,
                }}
              >
                <span
                  className="absolute left-1/2 top-1 size-[7px] -translate-x-1/2 rounded-full"
                  style={{
                    background: used ? '#51D5A5' : '#3A424D',
                    boxShadow: used ? '0 0 6px rgba(81,213,165,.7)' : 'none',
                  }}
                />
                <span
                  className="text-[9.5px] font-semibold"
                  style={{ color: used ? STUDIO.textStrong : STUDIO.textFaint }}
                >
                  {n}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* port table */}
      <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${STUDIO.overlayBorder}` }}>
        <div
          className="grid grid-cols-[32px_1fr_52px_44px] px-3 py-2 text-[10.5px] font-semibold"
          style={{ background: 'rgba(255,255,255,.04)', color: STUDIO.textFaint }}
        >
          <span>{NET_STRINGS.port}</span>
          <span>{NET_STRINGS.connectedTo}</span>
          <span>VLAN</span>
          <span>{NET_STRINGS.status}</span>
        </div>
        {ports.length === 0 ? (
          <div className="px-3 py-4 text-center text-[12px]" style={{ color: STUDIO.textFaint }}>
            {NET_STRINGS.noPorts}
          </div>
        ) : (
          ports.map((p) => {
            const deviceVlans = vlansOfNode(vlans, p.device.id)
            const primary = deviceVlans[0]
            return (
              <div
                key={p.device.id}
                className="grid grid-cols-[32px_1fr_52px_44px] items-center px-3 py-2"
                style={{ borderTop: `1px solid rgba(255,255,255,.05)` }}
              >
                <span className="text-[12.5px] font-semibold" style={{ color: STUDIO.accentSky }}>
                  {p.n}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-4 flex-none" style={{ color: STUDIO.iconIdle }}>
                    {deviceMeta(p.device.type).icon}
                  </span>
                  <span className="truncate text-[12.5px]" style={{ color: STUDIO.textStrong }}>
                    {p.device.label || deviceMeta(p.device.type).label}
                  </span>
                </span>
                <span dir="ltr" className="text-[12px] font-semibold" style={{ color: primary ? primary.color : STUDIO.textFaint }}>
                  {primary ? primary.vlan_id : '—'}
                </span>
                <span className="text-[10.5px] font-semibold" style={{ color: '#51D5A5' }}>
                  {NET_STRINGS.portActive}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
