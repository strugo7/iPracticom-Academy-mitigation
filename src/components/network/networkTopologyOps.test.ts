import { describe, expect, it } from 'vitest'
import {
  addConnection,
  addNode,
  derivePorts,
  readModel,
  removeNode,
  serializeModel,
  updateNode,
} from './networkTopologyOps'

const baseData = {
  provider: 'demo',
  nodes: [
    { id: 'sw', type: 'switch', x: 100, y: 100, label: 'סוויץ׳', ip: '192.168.1.2', config: { subnet: '/24', port: '1' } },
    { id: 'ap', type: 'ap', x: 50, y: 250, label: 'AP', ip: '192.168.1.10', config: { subnet: '/24', port: '2' } },
  ],
  connections: [{ from: 'sw', to: 'ap' }],
  vlans: [{ id: 'v10', name: 'wifi', vlan_id: 10, color: '#2EB4FF', member_node_ids: ['sw', 'ap'] }],
}

describe('readModel / serializeModel', () => {
  it('reads flat nodes and lifts subnet/port out of config', () => {
    const m = readModel(baseData)
    expect(m.nodes).toHaveLength(2)
    expect(m.nodes[0]).toMatchObject({ id: 'sw', subnet: '/24', port: '1' })
    expect(m.connections).toEqual([{ from: 'sw', to: 'ap' }])
  })

  it('serializes back into config and preserves untouched fields (vlans/provider)', () => {
    const m = readModel(baseData)
    const out = serializeModel(m, baseData)
    expect(out.provider).toBe('demo')
    expect(out.vlans).toBe(baseData.vlans)
    expect((out.nodes as { config: unknown }[])[0].config).toEqual({ subnet: '/24', port: '1' })
  })

  it('drops connections that reference a missing endpoint id', () => {
    const m = readModel({ ...baseData, connections: [{ from: 'sw', to: '' }, { from: 'sw', to: 'ap' }] })
    expect(m.connections).toEqual([{ from: 'sw', to: 'ap' }])
  })
})

describe('node/connection ops', () => {
  it('adds a node with a unique id and removes it with its connections', () => {
    const m = readModel(baseData)
    const { model, id } = addNode(m, 'router', 'ראוטר', 200, 60)
    expect(model.nodes).toHaveLength(3)
    const linked = addConnection(model, 'sw', id)
    expect(linked.connections).toHaveLength(2)
    const pruned = removeNode(linked, id)
    expect(pruned.nodes).toHaveLength(2)
    expect(pruned.connections).toEqual([{ from: 'sw', to: 'ap' }])
  })

  it('dedupes connections regardless of direction, and ignores self-links', () => {
    const m = readModel(baseData)
    expect(addConnection(m, 'ap', 'sw').connections).toHaveLength(1)
    expect(addConnection(m, 'sw', 'sw').connections).toHaveLength(1)
  })

  it('updates a node field immutably', () => {
    const m = readModel(baseData)
    const next = updateNode(m, 'sw', { ip: '10.0.0.1' })
    expect(next.nodes[0].ip).toBe('10.0.0.1')
    expect(m.nodes[0].ip).toBe('192.168.1.2')
  })
})

describe('derivePorts', () => {
  it('lists switch ports by connected device port number', () => {
    const m = readModel(baseData)
    const ports = derivePorts(m, 'sw')
    expect(ports).toHaveLength(1)
    expect(ports[0]).toMatchObject({ n: 2 })
    expect(ports[0].device.id).toBe('ap')
  })

  it('falls back to sequential numbering when a device has no port field', () => {
    const data = {
      nodes: [
        { id: 'sw', type: 'switch', x: 0, y: 0 },
        { id: 'x', type: 'router', x: 1, y: 1 },
      ],
      connections: [{ from: 'sw', to: 'x' }],
    }
    expect(derivePorts(readModel(data), 'sw')[0].n).toBe(1)
  })
})
