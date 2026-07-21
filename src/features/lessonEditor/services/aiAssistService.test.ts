import { describe, expect, it } from 'vitest'
import {
  AI_PIPELINE_STEPS,
  AI_TASK_OPTIONS,
  TEMPLATE_OPTIONS,
  buildTaskBlocks,
  buildTemplateBlocks,
} from './aiAssistService'

describe('AI assist metadata', () => {
  it('exposes four tasks, four pipeline steps and four templates', () => {
    expect(AI_TASK_OPTIONS).toHaveLength(4)
    expect(AI_PIPELINE_STEPS).toHaveLength(4)
    expect(TEMPLATE_OPTIONS).toHaveLength(4)
  })
})

describe('buildTemplateBlocks', () => {
  it('builds the pedagogical skeleton for a concept lesson', () => {
    const blocks = buildTemplateBlocks('concept')
    expect(blocks.map((b) => b.type)).toEqual([
      'lesson_cover',
      'heading',
      'text',
      'note',
      'image',
      'flashcard',
      'tabs',
    ])
  })

  it('opens the note block as a tip (tone=success)', () => {
    const note = buildTemplateBlocks('concept').find((b) => b.type === 'note')
    expect(note?.data).toMatchObject({ tone: 'success' })
  })

  it('gives every block a unique id', () => {
    const ids = buildTemplateBlocks('guided').map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('builds a minimal skeleton for the blank template', () => {
    expect(buildTemplateBlocks('blank').map((b) => b.type)).toEqual([
      'lesson_cover',
      'heading',
      'text',
    ])
  })
})

describe('buildTaskBlocks', () => {
  it('produces an ai_generated block for draft/section, echoing the prompt', () => {
    const [block] = buildTaskBlocks('section', '  הסבר על VLAN  ')
    expect(block.type).toBe('ai_generated')
    expect(block.data).toMatchObject({ prompt: 'הסבר על VLAN' })
    expect(String(block.data.generatedContent)).toContain('הסבר על VLAN')
  })

  it('produces a flashcard block with sample cards for questions', () => {
    const [block] = buildTaskBlocks('questions', '')
    expect(block.type).toBe('flashcard')
    expect(Array.isArray((block.data as { items: unknown[] }).items)).toBe(true)
    expect((block.data as { items: unknown[] }).items.length).toBeGreaterThan(0)
  })

  it('produces an image block using the prompt as alt text', () => {
    const [block] = buildTaskBlocks('image', 'תרשים רשת')
    expect(block.type).toBe('image')
    expect(block.data).toMatchObject({ alt: 'תרשים רשת' })
    expect(String(block.data.url)).not.toBe('')
  })
})
