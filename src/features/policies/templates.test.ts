import { describe, expect, it } from 'vitest'
import { instantiateTemplate, POLICY_TEMPLATES } from './templates'

describe('POLICY_TEMPLATES', () => {
  it('כולל תבנית ריקה + תבניות תוכן, לכל אחת קטגוריה ובלוקים', () => {
    expect(POLICY_TEMPLATES.some((t) => t.id === 'blank')).toBe(true)
    expect(POLICY_TEMPLATES.length).toBeGreaterThan(1)
    for (const template of POLICY_TEMPLATES) {
      expect(template.category).toBeTruthy()
      expect(template.blocks.length).toBeGreaterThan(0)
    }
  })
})

describe('instantiateTemplate', () => {
  it('מייצר בלוקים עם מזהים ייחודיים ו-order_index רציף, ותוכן התבנית נשמר', () => {
    const safety = POLICY_TEMPLATES.find((t) => t.id === 'safety')
    expect(safety).toBeDefined()
    const blocks = instantiateTemplate(safety!)
    expect(blocks).toHaveLength(safety!.blocks.length)
    expect(blocks.map((b) => b.order_index)).toEqual(
      safety!.blocks.map((_, i) => i),
    )
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length)
    expect(blocks[0]?.type).toBe('heading')
  })

  it('כל קריאה מייצרת מזהים חדשים (אין שיתוף מזהים בין מופעים)', () => {
    const blank = POLICY_TEMPLATES.find((t) => t.id === 'blank')!
    const a = instantiateTemplate(blank)
    const b = instantiateTemplate(blank)
    const ids = new Set([...a, ...b].map((x) => x.id))
    expect(ids.size).toBe(a.length + b.length)
  })
})
