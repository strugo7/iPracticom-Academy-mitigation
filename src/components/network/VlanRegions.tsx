/**
 * אזורי-VLAN על הקנבס (שלב 6.4c, מסמך 24 §3) — לכל VLAN תיבה צבעונית-שקופה
 * (group-box; גישת "90% ערך בפשטות" של המסמך) מתחת לצמתים, עם צ'יפ-תווית לחיץ
 * לעריכה. חפיפה (trunk) נראית דרך השקיפות. נגזר מ-ViewportPortal כדי לזוז/להתקרב
 * עם הקנבס. תואם design-export/Network Canvas.dc.html (שורות 63-79, 424-437).
 */
import { ViewportPortal, type Node } from '@xyflow/react'
import type { Vlan } from './vlanOps'

const PAD = 46
const NODE_HALF_W = 32
const NODE_HALF_H = 28

function rgba(hex: string, a: number): string {
  const n = Number.parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

interface Region {
  id: string
  left: number
  top: number
  width: number
  height: number
  color: string
  name: string
  vid: string
  labelLeft: number
  onEdit: () => void
}

function buildRegions(vlans: Vlan[], centers: Map<string, { x: number; y: number }>, onEdit: (id: string) => void): Region[] {
  const regions: Region[] = []
  for (const v of vlans) {
    const pts = v.member_node_ids.map((id) => centers.get(id)).filter((p): p is { x: number; y: number } => !!p)
    if (pts.length === 0) continue
    const xs = pts.map((p) => p.x)
    const ys = pts.map((p) => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const left = minX - PAD
    const top = minY - PAD
    regions.push({
      id: v.id,
      left,
      top,
      width: Math.max(...xs) - minX + PAD * 2,
      height: Math.max(...ys) - minY + PAD * 2,
      color: v.color,
      name: v.name,
      vid: `VLAN ${v.vlan_id}`,
      labelLeft: xs[0],
      onEdit: () => onEdit(v.id),
    })
  }
  return regions
}

export function VlanRegions({
  vlans,
  nodes,
  onEditVlan,
  readOnly = false,
}: {
  vlans: Vlan[]
  nodes: Node[]
  onEditVlan: (id: string) => void
  readOnly?: boolean
}) {
  const centers = new Map(
    nodes.map((n) => [n.id, { x: n.position.x + NODE_HALF_W, y: n.position.y + NODE_HALF_H }]),
  )
  const regions = buildRegions(vlans, centers, onEditVlan)

  return (
    <ViewportPortal>
      {regions.map((r) => (
        <div key={r.id}>
          <div
            style={{
              position: 'absolute',
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
              zIndex: -1,
              pointerEvents: 'none',
              background: rgba(r.color, 0.08),
              border: `1px solid ${rgba(r.color, 0.55)}`,
              borderRadius: 18,
            }}
          />
          {(() => {
            const chipStyle = {
              position: 'absolute' as const,
              left: r.labelLeft,
              top: r.top + 9,
              transform: 'translateX(-50%)',
              zIndex: 5,
              display: 'inline-flex' as const,
              alignItems: 'center' as const,
              gap: 6,
              background: rgba('#10151C', 0.92),
              border: `1px solid ${rgba(r.color, 0.55)}`,
              borderRadius: 999,
              padding: '4px 12px',
            }
            const inner = (
              <>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: r.color }} />
                <span dir="ltr" style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>
                  {r.vid}
                </span>
                <span style={{ fontSize: 11, color: '#AEB9C6' }}>{r.name}</span>
              </>
            )
            return readOnly ? (
              <span style={chipStyle}>{inner}</span>
            ) : (
              <button
                type="button"
                title="עריכת VLAN"
                aria-label={`עריכת ${r.vid}`}
                onClick={r.onEdit}
                style={{ ...chipStyle, cursor: 'pointer' }}
              >
                {inner}
              </button>
            )
          })()}
        </div>
      ))}
    </ViewportPortal>
  )
}
