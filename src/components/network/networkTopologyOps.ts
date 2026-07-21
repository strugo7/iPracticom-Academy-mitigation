/**
 * מודל-עריכה ופעולות טהורות לטופולוגיית הרשת (שלב 6.4b, מסמכים 21/25).
 * ממיר את data של הבלוק (blockSchemas.networkCanvasBlockSchema — שטוח:
 * nodes[{id,type,x,y,label,ip,config,ports}], connections[{from,to}], vlans)
 * למודל-עריכה נוח ובחזרה, בלי React ובלי תופעות-לוואי. subnet/port נשמרים
 * ב-node.config כדי לא לחרוג מהסכמה הקיימת.
 */

export const DEFAULT_SWITCH_PORTS = 8

export interface NetNode {
  id: string
  type: string
  label: string
  ip: string
  subnet: string
  port: string
  x: number
  y: number
}

export interface NetConnection {
  from: string
  to: string
}

export interface NetModel {
  nodes: NetNode[]
  connections: NetConnection[]
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/** מזהה-node מקומי חדש. */
export function newNodeId(): string {
  const g = globalThis.crypto
  if (g && 'randomUUID' in g) return `dev_${g.randomUUID()}`
  return `dev_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
}

/** קריאה בטוחה של המודל מ-data גמיש של הבלוק. */
export function readModel(data: Record<string, unknown>): NetModel {
  const rawNodes = Array.isArray(data.nodes) ? data.nodes : []
  const nodes: NetNode[] = rawNodes.map((raw, i) => {
    const n = raw as Record<string, unknown>
    const config = (n.config as Record<string, unknown> | undefined) ?? {}
    return {
      id: str(n.id) || `dev_${i}`,
      type: str(n.type) || 'switch',
      label: str(n.label),
      ip: str(n.ip),
      subnet: str(config.subnet),
      port: str(config.port),
      x: num(n.x, 80 + i * 40),
      y: num(n.y, 80 + i * 40),
    }
  })
  const rawConns = Array.isArray(data.connections) ? data.connections : []
  const connections: NetConnection[] = rawConns
    .map((raw) => {
      const c = raw as Record<string, unknown>
      return { from: str(c.from), to: str(c.to) }
    })
    .filter((c) => c.from && c.to)
  return { nodes, connections }
}

/**
 * מחזיר data מעודכן של הבלוק (משמר provider וכל שדה לא-מוכר). `vlans` נכתב אם
 * סופק (העורך שולח את ה-VLANs הערוכים); אחרת נשמר original.vlans כפי-שהוא.
 */
export function serializeModel(
  model: NetModel,
  original: Record<string, unknown>,
  vlans?: unknown[],
): Record<string, unknown> {
  return {
    ...original,
    nodes: model.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      x: Math.round(n.x),
      y: Math.round(n.y),
      label: n.label,
      ip: n.ip,
      config: { subnet: n.subnet, port: n.port },
    })),
    connections: model.connections.map((c) => ({ from: c.from, to: c.to })),
    ...(vlans ? { vlans } : {}),
  }
}

export function addNode(
  model: NetModel,
  type: string,
  defaultLabel: string,
  x: number,
  y: number,
): { model: NetModel; id: string } {
  const id = newNodeId()
  const node: NetNode = { id, type, label: defaultLabel, ip: '', subnet: '', port: '', x, y }
  return { model: { ...model, nodes: [...model.nodes, node] }, id }
}

export function updateNode(model: NetModel, id: string, patch: Partial<NetNode>): NetModel {
  return {
    ...model,
    nodes: model.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
  }
}

export function removeNode(model: NetModel, id: string): NetModel {
  return {
    nodes: model.nodes.filter((n) => n.id !== id),
    connections: model.connections.filter((c) => c.from !== id && c.to !== id),
  }
}

export function addConnection(model: NetModel, from: string, to: string): NetModel {
  if (from === to) return model
  const exists = model.connections.some(
    (c) => (c.from === from && c.to === to) || (c.from === to && c.to === from),
  )
  if (exists) return model
  return { ...model, connections: [...model.connections, { from, to }] }
}

export function moveNode(model: NetModel, id: string, x: number, y: number): NetModel {
  return updateNode(model, id, { x, y })
}

export interface PortRow {
  /** מספר-פורט (מ-node.port של הרכיב המחובר, או סידורי אם ריק). */
  n: number
  device: NetNode
}

/**
 * טבלת פורטים של סוויץ' (מסמך 21 §4) — לכל חיבור שנוגע בסוויץ', שורת
 * port → device. מספר-הפורט נלקח משדה ה-port של הרכיב המחובר; חסר → סידורי.
 */
export function derivePorts(model: NetModel, switchId: string): PortRow[] {
  const neighbors = model.connections
    .filter((c) => c.from === switchId || c.to === switchId)
    .map((c) => (c.from === switchId ? c.to : c.from))
  const rows: PortRow[] = []
  let seq = 1
  for (const nid of neighbors) {
    const device = model.nodes.find((n) => n.id === nid)
    if (!device) continue
    const parsed = Number.parseInt(device.port, 10)
    rows.push({ n: Number.isFinite(parsed) && parsed > 0 ? parsed : seq, device })
    seq += 1
  }
  return rows.sort((a, b) => a.n - b.n)
}
