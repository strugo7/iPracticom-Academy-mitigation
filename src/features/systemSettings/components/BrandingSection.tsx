/** מיתוג (design-export שורות 164-206) — לוגו (URL, לא העלאת-קובץ — R2 עדיין לא מחובר), צבע-מותג, פוטר. */
import { useState } from 'react'
import { Icon, Input } from '@/components/ui'
import { APP_SETTING_KEYS, BRAND_COLOR_SWATCHES, DEFAULT_BRANDING } from '../constants'
import { PaletteIcon } from '../icons'
import { useSettingDraft } from '../hooks/useSettingDraft'
import { SaveBar } from './SaveBar'

export function BrandingSection() {
  const branding = useSettingDraft(APP_SETTING_KEYS.branding, DEFAULT_BRANDING, 'מיתוג — לוגו, צבע ופוטר')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await branding.commit()
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="animate-[fadeIn_0.24s_ease]">
      <div className="mb-5">
        <h2 className="m-0 flex items-center gap-2.5 text-[21px] font-semibold text-neutrals-charcoal">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-hues-sky text-accent">
            <PaletteIcon size={18} />
          </span>
          מיתוג
        </h2>
        <p className="mt-2 text-small leading-relaxed text-neutrals-lead">
          התאימו את הלוגו, צבעי המותג והפוטר שמופיעים בכל מסכי האקדמיה.
        </p>
      </div>

      <section className="mb-4 rounded-2xl bg-white p-5 shadow-card">
        <h3 className="m-0 mb-3.5 text-[16px] font-semibold text-neutrals-charcoal">לוגו</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-[200px] flex-none items-center justify-center rounded-2xl border border-neutrals-silver bg-neutrals-whisper">
            {branding.draft.logo_url ? (
              <img src={branding.draft.logo_url} alt="לוגו" className="max-h-[46px] max-w-[150px] object-contain" />
            ) : (
              <span className="text-tiny text-neutrals-nickel">אין לוגו מוגדר</span>
            )}
          </div>
          <div className="min-w-[200px] flex-1">
            <Input
              dir="ltr"
              value={branding.draft.logo_url ?? ''}
              onChange={(e) =>
                branding.setDraft({ ...branding.draft, logo_url: e.target.value || null })
              }
              placeholder="https://…/logo.svg"
              leadingIcon={<Icon name="Link" size={16} />}
            />
            <p className="mt-2.5 text-tiny leading-relaxed text-neutrals-nickel">
              קישור לתמונת PNG/SVG ברקע שקוף · גובה מומלץ 48px
            </p>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-2xl bg-white p-5 shadow-card">
        <h3 className="m-0 mb-1 text-[16px] font-semibold text-neutrals-charcoal">צבע מותג ראשי</h3>
        <p className="m-0 mb-4 text-small text-neutrals-lead">משמש לכפתורים, קישורים והדגשות בכל המערכת.</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {BRAND_COLOR_SWATCHES.map((hex) => {
            const active = branding.draft.primary_color === hex
            return (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => branding.setDraft({ ...branding.draft, primary_color: hex })}
                style={{ background: hex }}
                className={`relative size-[46px] rounded-xl transition-transform hover:scale-105 ${
                  active ? 'ring-2 ring-neutrals-charcoal ring-offset-2' : ''
                }`}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <Icon name="Check" size={20} />
                  </span>
                )}
              </button>
            )
          })}
          <div className="mx-1 h-[34px] w-px bg-neutrals-silver" />
          <div className="flex h-[46px] items-center gap-2 rounded-xl border border-neutrals-silver bg-neutrals-whisper px-3.5">
            <span
              className="size-5 rounded-md shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]"
              style={{ background: branding.draft.primary_color }}
            />
            <span dir="ltr" className="font-sans text-small font-semibold text-neutrals-charcoal">
              {branding.draft.primary_color}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl bg-white p-5 shadow-card">
        <h3 className="m-0 mb-1 text-[16px] font-semibold text-neutrals-charcoal">טקסט פוטר</h3>
        <p className="m-0 mb-3.5 text-small text-neutrals-lead">
          מופיע בתחתית מסכי האקדמיה ובמסמכי PDF מופקים.
        </p>
        <textarea
          value={branding.draft.footer_text}
          onChange={(e) => branding.setDraft({ ...branding.draft, footer_text: e.target.value })}
          rows={3}
          className="w-full resize-y rounded-xl border border-neutrals-silver bg-neutrals-whisper p-3.5 text-[14.5px] leading-relaxed text-neutrals-charcoal outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </section>

      <SaveBar
        visible={branding.isDirty}
        saved={saved}
        isSaving={branding.isSaving}
        onSave={handleSave}
        onCancel={() => branding.setDraft(branding.value)}
      />
    </div>
  )
}
