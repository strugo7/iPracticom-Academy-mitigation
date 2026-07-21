import { describe, expect, it } from 'vitest'
import {
  detectFileType,
  fileNameFor,
  formatBytes,
  formatUploadDate,
} from './mediaFormat'

describe('formatBytes', () => {
  it('bytes under 1KB', () => {
    expect(formatBytes(512)).toBe('512 B')
  })
  it('rounds to KB', () => {
    expect(formatBytes(419840)).toBe('410 KB')
  })
  it('one decimal for MB under 10', () => {
    expect(formatBytes(1468006)).toBe('1.4 MB')
  })
  it('whole number for MB at/over 10', () => {
    expect(formatBytes(50331648)).toBe('48 MB')
  })
  it('handles null / invalid', () => {
    expect(formatBytes(null)).toBe('—')
    expect(formatBytes(undefined)).toBe('—')
    expect(formatBytes(-5)).toBe('—')
  })
})

describe('fileNameFor', () => {
  it('appends extension by type', () => {
    expect(fileNameFor({ title: 'מדריך', file_type: 'pdf' })).toBe('מדריך.pdf')
    expect(fileNameFor({ title: 'הדרכה', file_type: 'video' })).toBe('הדרכה.mp4')
  })
  it('falls back when type missing', () => {
    expect(fileNameFor({ title: 'x', file_type: null })).toBe('x.file')
  })
})

describe('formatUploadDate', () => {
  it('formats an ISO date in Hebrew', () => {
    const out = formatUploadDate('2026-06-12T09:00:00.000Z')
    expect(out).toContain('2026')
    expect(out).toContain('יוני')
  })
  it('handles empty / invalid', () => {
    expect(formatUploadDate(null)).toBe('—')
    expect(formatUploadDate('not-a-date')).toBe('—')
  })
})

describe('detectFileType', () => {
  const file = (type: string) => new File([''], 'x', { type })
  it('maps known mime types', () => {
    expect(detectFileType(file('image/png'))).toBe('image')
    expect(detectFileType(file('image/gif'))).toBe('gif')
    expect(detectFileType(file('video/mp4'))).toBe('video')
    expect(detectFileType(file('application/pdf'))).toBe('pdf')
  })
  it('returns null for unsupported', () => {
    expect(detectFileType(file('application/zip'))).toBeNull()
  })
})
