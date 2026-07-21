/**
 * מודל ופעולות טהורות ל-VLANs בטופולוגיית הרשת (שלב 6.4c, מסמך 24).
 * `data.vlans: [{id,name,vlan_id,color,member_node_ids[]}]` — שדה-תוסף עם
 * ברירת-מחדל []; טופולוגיה מיובאת ללא VLANs לא נשברת. בלי React/תופעות-לוואי.
 */

/** פלטת הצבעים ל-VLAN (design-export VCOL) — hues אמיתיים בלבד. */
export const VLAN_COLORS = ['#2EB4FF', '#0075DB', '#8E7057', '#004E9B', '#51D5A5', '#C94236']

export interface Vlan {
  id: string
  name: string
  vlan_id: number
  color: string
  member_node_ids: string[]
}

export interface VlanDraft {
  name: string
  vlan_id: number
  color: string
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function newVlanId(): string {
  const g = globalThis.crypto
  if (g && 'randomUUID' in g) return `vlan_${g.randomUUID()}`
  return `vlan_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
}

/** קריאה בטוחה של ה-VLANs מ-data גמיש. */
export function readVlans(data: Record<string, unknown>): Vlan[] {
  if (!Array.isArray(data.vlans)) return []
  return data.vlans.map((raw, i) => {
    const v = raw as Record<string, unknown>
    const members = Array.isArray(v.member_node_ids)
      ? v.member_node_ids.map((m) => str(m)).filter(Boolean)
      : []
    const vidNum = Number(v.vlan_id)
    return {
      id: str(v.id) || `vlan_${i}`,
      name: str(v.name),
      vlan_id: Number.isFinite(vidNum) ? vidNum : 0,
      color: str(v.color) || VLAN_COLORS[i % VLAN_COLORS.length],
      member_node_ids: members,
    }
  })
}

/** מזהה-VLAN פנוי הבא (כפולות של 10, כמו ב-design-export startGroup). */
export function suggestVlanId(vlans: Vlan[]): number {
  const used = new Set(vlans.map((v) => v.vlan_id))
  let nid = 10
  while (used.has(nid)) nid += 10
  return nid
}

/** טיוטת-VLAN חדשה עם הצעת-מזהה וצבע-רוטציה. */
export function newDraft(vlans: Vlan[]): VlanDraft {
  return {
    name: '',
    vlan_id: suggestVlanId(vlans),
    color: VLAN_COLORS[vlans.length % VLAN_COLORS.length],
  }
}

export function createVlan(vlans: Vlan[], draft: VlanDraft, members: string[]): Vlan[] {
  const name = draft.name.trim() || `VLAN ${draft.vlan_id}`
  return [
    ...vlans,
    { id: newVlanId(), name, vlan_id: Number(draft.vlan_id), color: draft.color, member_node_ids: members.slice() },
  ]
}

export function updateVlan(vlans: Vlan[], id: string, draft: VlanDraft): Vlan[] {
  const name = draft.name.trim() || `VLAN ${draft.vlan_id}`
  return vlans.map((v) =>
    v.id === id ? { ...v, name, vlan_id: Number(draft.vlan_id), color: draft.color } : v,
  )
}

export function dissolveVlan(vlans: Vlan[], id: string): Vlan[] {
  return vlans.filter((v) => v.id !== id)
}

/** מסיר צומת שנמחק מכל ה-VLANs (שמירה על עקביות). */
export function pruneNodeFromVlans(vlans: Vlan[], nodeId: string): Vlan[] {
  return vlans.map((v) => ({
    ...v,
    member_node_ids: v.member_node_ids.filter((m) => m !== nodeId),
  }))
}

/** ה-VLANs שצומת נתון חבר בהם (trunk = יותר מאחד). */
export function vlansOfNode(vlans: Vlan[], nodeId: string): Vlan[] {
  return vlans.filter((v) => v.member_node_ids.includes(nodeId))
}
