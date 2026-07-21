/**
 * מסמכים ו-PDF (design-export/System Settings.dc.html שורות 292-322) — גודל-
 * עמוד (A4/Letter/A5) + 4 דגלי-הפקה מעל pdf_export_defaults. הסקשן האחרון מ-
 * SECTION_DEFS. אייקוני השורות מרגיסטר ה-DS (Image/File) + local (WatermarkIcon/
 * QrIcon) — נוהל-הפער §6.1: אין אייקון מומצא.
 */
import { useState } from 'react'
import { Icon, Toggle } from '@/components/ui'
import { APP_SETTING_KEYS, DEFAULT_PDF_EXPORT_DEFAULTS } from '../constants'
import { QrIcon, WatermarkIcon } from '../icons'
import { useSettingDraft } from '../hooks/useSettingDraft'
import type { PdfExportDefaultsValue, PdfPageSize } from '../types'
import { SaveBar } from './SaveBar'

const PAGE_SIZES: { value: PdfPageSize; label: string; dims: string }[] = [
  { value: 'A4', label: 'A4', dims: '210 × 297 מ״מ' },
  { value: 'Letter', label: 'Letter', dims: '216 × 279 מ״מ' },
  { value: 'A5', label: 'A5', dims: '148 × 210 מ״מ' },
]

type PdfFlagKey = keyof Omit<PdfExportDefaultsValue, 'page_size'>

const PDF_FLAGS: { key: PdfFlagKey; icon: React.ReactNode; label: string; desc: string }[] = [
  { key: 'show_logo', icon: <Icon name="Image" size={20} />, label: 'כותרת עם לוגו', desc: 'הצגת לוגו האקדמיה בראש כל עמוד' },
  { key: 'show_page_numbers', icon: <Icon name="File" size={20} />, label: 'מספור עמודים בפוטר', desc: 'הוספת "עמוד X מתוך Y" בתחתית' },
  { key: 'show_watermark', icon: <WatermarkIcon size={20} />, label: 'סימן מים', desc: 'סימן מים עדין ברקע המסמך' },
  { key: 'show_qr_code', icon: <QrIcon size={20} />, label: 'קוד QR לאימות', desc: 'קוד לאימות מקוריות התעודה' },
]

export function DocumentsSection() {
  const pdf = useSettingDraft(
    APP_SETTING_KEYS.pdfExportDefaults,
    DEFAULT_PDF_EXPORT_DEFAULTS,
    'ברירות מחדל להפקת PDF',
  )
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await pdf.commit()
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="animate-[fadeIn_0.24s_ease]">
      <div className="mb-5">
        <h2 className="m-0 flex items-center gap-2.5 text-[21px] font-semibold text-neutrals-charcoal">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-hues-sky text-accent">
            <Icon name="File" size={18} />
          </span>
          מסמכים ו-PDF
        </h2>
        <p className="mt-2 text-small leading-relaxed text-neutrals-lead">
          הגדרות הפקת תעודות וקובצי PDF מתוך האקדמיה.
        </p>
      </div>

      {/* PAGE SIZE CARD */}
      <section className="mb-4 rounded-2xl bg-white p-5 shadow-card">
        <h3 className="m-0 mb-3.5 text-[16px] font-semibold text-neutrals-charcoal">גודל עמוד</h3>
        <div className="flex flex-wrap gap-2.5">
          {PAGE_SIZES.map((p) => {
            const on = pdf.draft.page_size === p.value
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => pdf.setDraft({ ...pdf.draft, page_size: p.value })}
                className={`flex min-w-[120px] flex-none flex-col items-start gap-0.5 rounded-[13px] border-[1.5px] px-4 py-3.5 text-start transition-colors ${
                  on ? 'border-accent bg-hues-sky' : 'border-neutrals-silver bg-white hover:border-accent'
                }`}
              >
                <span className={`text-[15px] font-semibold ${on ? 'text-accent' : 'text-neutrals-charcoal'}`}>
                  {p.label}
                </span>
                <span className="font-sans text-tiny text-neutrals-nickel">{p.dims}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* PDF FLAGS CARD */}
      <section className="mb-6 rounded-2xl bg-white px-5 py-1 shadow-card">
        {PDF_FLAGS.map((f, i) => (
          <div
            key={f.key}
            className={`flex items-center gap-3.5 py-4 ${
              i < PDF_FLAGS.length - 1 ? 'border-b border-neutrals-whisper' : ''
            }`}
          >
            <span className="flex size-10 flex-none items-center justify-center rounded-[11px] bg-neutrals-whisper text-neutrals-lead">
              {f.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-small text-neutrals-charcoal">{f.label}</div>
              <div className="mt-0.5 text-tiny text-neutrals-lead">{f.desc}</div>
            </div>
            <Toggle
              checked={pdf.draft[f.key]}
              onChange={(v) => pdf.setDraft({ ...pdf.draft, [f.key]: v })}
            />
          </div>
        ))}
      </section>

      <SaveBar
        visible={pdf.isDirty}
        saved={saved}
        isSaving={pdf.isSaving}
        onSave={handleSave}
        onCancel={() => pdf.setDraft(pdf.value)}
      />
    </div>
  )
}
