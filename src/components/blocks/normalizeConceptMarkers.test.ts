import { describe, expect, it } from 'vitest'
import { normalizeConceptMarkers } from './sanitizeHtml'

const ID = '69ad41969ce5e531485ad491'

describe('normalizeConceptMarkers (migrateConceptMarkers)', () => {
  it('ממיר סימון מיושן ⟦id⟧טקסט⟦/c⟧ לפורמט הקנוני', () => {
    expect(normalizeConceptMarkers(`שלום ⟦${ID}⟧אתחול פורט⟦/c⟧ עולם`)).toBe(
      `שלום <span data-concept-id="${ID}" class="concept-term">אתחול פורט</span> עולם`,
    )
  })

  it('ממיר גם כשהסימון עטוף ב-span כחול inline (הצורה האמיתית בדאטה)', () => {
    const legacy = `<span style="background-color: rgba(37, 99, 235, 0.15); color: rgb(37, 99, 235);">⟦${ID}⟧אתחול פורט⟦/c⟧</span>`
    expect(normalizeConceptMarkers(legacy)).toContain(
      `<span data-concept-id="${ID}" class="concept-term">אתחול פורט</span>`,
    )
  })

  it('ממיר כמה סימונים באותו טקסט', () => {
    const a = '69cc1ac06f87f9da3c085724'
    const b = '69cc9a426db7434f9beaf91c'
    const out = normalizeConceptMarkers(`⟦${a}⟧א⟦/c⟧ ו-⟦${b}⟧ב⟦/c⟧`)
    expect(out).toBe(
      `<span data-concept-id="${a}" class="concept-term">א</span> ו-<span data-concept-id="${b}" class="concept-term">ב</span>`,
    )
  })

  it('לא נוגע בפורמט הקנוני (אידמפוטנטי) ולא בסימוני ⟦pwd⟧', () => {
    const canonical = `<span data-concept-id="${ID}" class="concept-term">X</span>`
    expect(normalizeConceptMarkers(canonical)).toBe(canonical)
    expect(normalizeConceptMarkers('⟦pwd⟧סוד⟦/pwd⟧')).toBe('⟦pwd⟧סוד⟦/pwd⟧')
  })

  it('טקסט רגיל עובר ללא שינוי', () => {
    expect(normalizeConceptMarkers('<p>טקסט <strong>מודגש</strong></p>')).toBe(
      '<p>טקסט <strong>מודגש</strong></p>',
    )
  })
})
