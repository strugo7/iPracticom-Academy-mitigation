import { describe, expect, it } from 'vitest'
import {
  addCard,
  addTab,
  moveItem,
  readCards,
  readTabs,
  removeCard,
  removeTab,
  setCardSide,
  setTabField,
} from './interactiveBlockOps'

describe('moveItem', () => {
  it('moves an item forward and backward immutably', () => {
    const src = ['a', 'b', 'c']
    expect(moveItem(src, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(src, 2, 0)).toEqual(['c', 'a', 'b'])
    expect(src).toEqual(['a', 'b', 'c'])
  })

  it('is a no-op for equal or out-of-range indices, and clamps the target', () => {
    const src = ['a', 'b', 'c']
    expect(moveItem(src, 1, 1)).toBe(src)
    expect(moveItem(src, 5, 0)).toBe(src)
    expect(moveItem(src, 0, 99)).toEqual(['b', 'c', 'a'])
  })
})

describe('flashcard ops', () => {
  it('reads cards defensively from flexible data', () => {
    expect(readCards({})).toEqual([])
    expect(readCards({ items: [{ front: 'VLAN', back: '802.1Q' }, { front: 1 }] })).toEqual([
      { front: 'VLAN', back: '802.1Q' },
      { front: '', back: '' },
    ])
  })

  it('adds, edits and removes cards immutably', () => {
    const cards = addCard(addCard([]))
    expect(cards).toHaveLength(2)
    const edited = setCardSide(cards, 0, 'front', 'DHCP')
    expect(edited[0]).toEqual({ front: 'DHCP', back: '' })
    expect(cards[0]).toEqual({ front: '', back: '' })
    expect(removeCard(edited, 0)).toHaveLength(1)
  })
})

describe('tabs ops', () => {
  it('reads tabs and backfills a stable id when missing', () => {
    const tabs = readTabs({ tabs: [{ title: 'הגדרה', content: 'x' }] })
    expect(tabs).toHaveLength(1)
    expect(tabs[0].id).toBeTruthy()
    expect(tabs[0]).toMatchObject({ title: 'הגדרה', content: 'x', image_url: null })
  })

  it('adds tabs with unique ids and edits fields immutably', () => {
    const tabs = addTab(addTab([], 'א'), 'ב')
    expect(tabs).toHaveLength(2)
    expect(tabs[0].id).not.toEqual(tabs[1].id)
    const edited = setTabField(tabs, 1, 'content', '<p>גוף</p>')
    expect(edited[1].content).toBe('<p>גוף</p>')
    expect(tabs[1].content).toBe('')
    expect(removeTab(edited, 0)).toHaveLength(1)
  })
})
