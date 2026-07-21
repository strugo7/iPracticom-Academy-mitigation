import { describe, expect, it } from 'vitest'
import type { MediaAsset, MediaUsageRef } from '@/types/entities'
import { EMPTY_MEDIA_FILTERS, type MediaFilters } from '../types'
import {
  countByType,
  filterMedia,
  hasActiveFilters,
  tagOptions,
  topicOptions,
} from './mediaSearch'

function m(id: string, over: Partial<MediaAsset>): MediaAsset {
  return {
    id,
    created_date: '2026-01-01T00:00:00.000Z',
    updated_date: '2026-01-01T00:00:00.000Z',
    title: `נכס ${id}`,
    file_url: `https://x/${id}`,
    file_type: 'image',
    ...over,
  }
}

const use = (n: number): MediaUsageRef[] =>
  Array.from({ length: n }, (_, i) => ({ ref_type: 'question', label: `q${i}` }))

const filters = (over: Partial<MediaFilters>): MediaFilters => ({
  ...EMPTY_MEDIA_FILTERS,
  ...over,
})

describe('filterMedia — search', () => {
  const assets = [
    m('1', { title: 'מצלמת אבטחה', tags: ['מצלמות'], topic: 'אבטחה' }),
    m('2', { title: 'לוח MikroTik', tags: ['רשתות'], topic: 'רשתות' }),
  ]

  it('matches by title', () => {
    expect(filterMedia(assets, filters({ search: 'מצלמת' })).map((a) => a.id)).toEqual(['1'])
  })
  it('matches by tag', () => {
    expect(filterMedia(assets, filters({ search: 'רשתות' })).map((a) => a.id)).toEqual(['2'])
  })
  it('matches by topic', () => {
    expect(filterMedia(assets, filters({ search: 'אבטחה' })).map((a) => a.id)).toEqual(['1'])
  })
  it('empty search returns all', () => {
    expect(filterMedia(assets, EMPTY_MEDIA_FILTERS)).toHaveLength(2)
  })
})

describe('filterMedia — type / usage / topic / tag', () => {
  const assets = [
    m('img', { file_type: 'image', usage: use(3), topic: 'רשתות', tags: ['a'] }),
    m('vid', { file_type: 'video', usage: [], topic: 'אבטחה', tags: ['b'] }),
    m('pdf', { file_type: 'pdf', usage: use(1), topic: 'רשתות', tags: ['a', 'b'] }),
  ]

  it('filters by file type', () => {
    expect(filterMedia(assets, filters({ type: 'video' })).map((a) => a.id)).toEqual(['vid'])
  })
  it('filters used only', () => {
    expect(filterMedia(assets, filters({ usage: 'used' })).map((a) => a.id).sort()).toEqual(['img', 'pdf'])
  })
  it('filters unused only', () => {
    expect(filterMedia(assets, filters({ usage: 'unused' })).map((a) => a.id)).toEqual(['vid'])
  })
  it('filters by topic', () => {
    expect(filterMedia(assets, filters({ topic: 'רשתות' })).map((a) => a.id).sort()).toEqual(['img', 'pdf'])
  })
  it('filters by tag', () => {
    expect(filterMedia(assets, filters({ tag: 'b' })).map((a) => a.id).sort()).toEqual(['pdf', 'vid'])
  })
})

describe('filterMedia — sort', () => {
  const assets = [
    m('old', { created_date: '2026-01-01T00:00:00.000Z', usage: use(1), topic: 'ב' }),
    m('new', { created_date: '2026-03-01T00:00:00.000Z', usage: use(5), topic: 'א' }),
    m('mid', { created_date: '2026-02-01T00:00:00.000Z', usage: use(0), topic: 'ג' }),
  ]

  it('recent = newest first', () => {
    expect(filterMedia(assets, filters({ sort: 'recent' })).map((a) => a.id)).toEqual(['new', 'mid', 'old'])
  })
  it('most-used = highest usage first', () => {
    expect(filterMedia(assets, filters({ sort: 'most-used' })).map((a) => a.id)).toEqual(['new', 'old', 'mid'])
  })
  it('topic = alphabetical by topic (he)', () => {
    expect(filterMedia(assets, filters({ sort: 'topic' })).map((a) => a.id)).toEqual(['new', 'old', 'mid'])
  })
})

describe('option collectors', () => {
  const assets = [
    m('1', { file_type: 'image', topic: 'רשתות', tags: ['מצלמות', 'התקנה'] }),
    m('2', { file_type: 'image', topic: 'אבטחה', tags: ['מצלמות'] }),
    m('3', { file_type: 'pdf', topic: 'רשתות', tags: [] }),
  ]

  it('countByType groups by type', () => {
    expect(countByType(assets)).toEqual({ image: 2, pdf: 1 })
  })
  it('topicOptions is unique and sorted', () => {
    expect(topicOptions(assets)).toEqual(['אבטחה', 'רשתות'])
  })
  it('tagOptions is unique and sorted', () => {
    expect(tagOptions(assets)).toEqual(['התקנה', 'מצלמות'])
  })
})

describe('hasActiveFilters', () => {
  it('false for defaults (sort only is not active)', () => {
    expect(hasActiveFilters(filters({ sort: 'most-used' }))).toBe(false)
  })
  it('true when a real filter is set', () => {
    expect(hasActiveFilters(filters({ type: 'pdf' }))).toBe(true)
    expect(hasActiveFilters(filters({ search: 'x' }))).toBe(true)
    expect(hasActiveFilters(filters({ tag: 'a' }))).toBe(true)
  })
})
