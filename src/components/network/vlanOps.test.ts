import { describe, expect, it } from 'vitest'
import {
  createVlan,
  dissolveVlan,
  newDraft,
  pruneNodeFromVlans,
  readVlans,
  suggestVlanId,
  updateVlan,
  vlansOfNode,
} from './vlanOps'

const vlans = [
  { id: 'v10', name: 'wifi', vlan_id: 10, color: '#2EB4FF', member_node_ids: ['sw', 'ap'] },
  { id: 'v20', name: 'voice', vlan_id: 20, color: '#8E7057', member_node_ids: ['sw', 'voip'] },
]

describe('readVlans', () => {
  it('reads and coerces vlan_id, defaults members/color', () => {
    const out = readVlans({ vlans: [{ id: 'x', name: 'a', vlan_id: '30' }] })
    expect(out[0]).toMatchObject({ id: 'x', vlan_id: 30, member_node_ids: [] })
    expect(out[0].color).toBeTruthy()
  })
  it('returns [] for missing/invalid vlans', () => {
    expect(readVlans({})).toEqual([])
  })
})

describe('suggestVlanId / newDraft', () => {
  it('suggests the next free multiple of 10', () => {
    expect(suggestVlanId(vlans)).toBe(30)
    expect(suggestVlanId([])).toBe(10)
  })
  it('rotates the color by count', () => {
    expect(newDraft(vlans).vlan_id).toBe(30)
    expect(newDraft([]).color).toBe('#2EB4FF')
  })
})

describe('create / update / dissolve', () => {
  it('creates a vlan with trimmed name (fallback to VLAN <id>) and member snapshot', () => {
    const next = createVlan(vlans, { name: '  ', vlan_id: 30, color: '#51D5A5' }, ['reg', 'cc'])
    expect(next).toHaveLength(3)
    expect(next[2]).toMatchObject({ name: 'VLAN 30', vlan_id: 30, member_node_ids: ['reg', 'cc'] })
  })
  it('updates name/vlan_id/color but keeps members', () => {
    const next = updateVlan(vlans, 'v10', { name: 'guest', vlan_id: 99, color: '#C94236' })
    expect(next[0]).toMatchObject({ name: 'guest', vlan_id: 99, color: '#C94236', member_node_ids: ['sw', 'ap'] })
  })
  it('dissolves by id', () => {
    expect(dissolveVlan(vlans, 'v10')).toHaveLength(1)
  })
})

describe('membership helpers', () => {
  it('lists vlans of a node (trunk = >1)', () => {
    expect(vlansOfNode(vlans, 'sw')).toHaveLength(2)
    expect(vlansOfNode(vlans, 'ap')).toHaveLength(1)
    expect(vlansOfNode(vlans, 'nope')).toHaveLength(0)
  })
  it('prunes a removed node from all vlans immutably', () => {
    const pruned = pruneNodeFromVlans(vlans, 'sw')
    expect(pruned[0].member_node_ids).toEqual(['ap'])
    expect(pruned[1].member_node_ids).toEqual(['voip'])
    expect(vlans[0].member_node_ids).toEqual(['sw', 'ap'])
  })
})
