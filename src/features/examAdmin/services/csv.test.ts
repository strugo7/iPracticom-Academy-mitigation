import { describe, expect, it } from 'vitest'
import { parseCsv, toCsv } from './csv'

describe('parseCsv', () => {
  it('שדות פשוטים + שורות', () => {
    expect(parseCsv('a,b\n1,2\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })
  it('פסיק ושורה בתוך ציטוט', () => {
    expect(parseCsv('"a,b","c\nd"')).toEqual([['a,b', 'c\nd']])
  })
  it('מרכאות מוברחות ("")', () => {
    expect(parseCsv('"say ""hi"""')).toEqual([['say "hi"']])
  })
  it('מסיר BOM ומטפל ב-CRLF', () => {
    expect(parseCsv('﻿a,b\r\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })
})

describe('toCsv → parseCsv round-trip', () => {
  it('שומר ערכים עם תווים מיוחדים', () => {
    const rows = [
      ['id', 'text'],
      ['1', 'שלום, עולם'],
      ['2', 'שורה\nחדשה'],
      ['3', 'מרכאות "כאלה"'],
    ]
    expect(parseCsv(toCsv(rows))).toEqual(rows)
  })
})
