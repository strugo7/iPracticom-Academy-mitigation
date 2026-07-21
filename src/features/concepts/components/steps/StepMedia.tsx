/**
 * שלב 3 — מדיה וקישורים (design-export/Term Editor.dc.html שורות 148-194):
 * תמונת המונח דרך בורר-המדיה, ורשימת קישורים חיצוניים {כותרת, URL}.
 */
import { useState } from 'react'
import { Badge, Button, FieldLabel, Icon, IconButton } from '@/components/ui'
import type { ConceptExternalLink } from '@/types/entities'
import type { ConceptDraft } from '../../types'
import { ExternalLinkIcon } from '../../conceptIcons'
import { MediaPickerDialog } from '../MediaPickerDialog'
import { AddRowButton, StepIntro, WizardCard } from './stepChrome'

interface StepMediaProps {
  draft: ConceptDraft
  patch: (next: Partial<ConceptDraft>) => void
}

export function StepMedia({ draft, patch }: StepMediaProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const setLink = (
    index: number,
    field: keyof ConceptExternalLink,
    value: string,
  ) =>
    patch({
      external_links: draft.external_links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      ),
    })

  const removeLink = (index: number) =>
    patch({ external_links: draft.external_links.filter((_, i) => i !== index) })

  return (
    <div className="flex flex-col gap-4">
      <StepIntro
        title="מדיה וקישורים"
        description="תמונה ראשית למונח וקישורים חיצוניים להרחבה."
      />

      <WizardCard>
        <div>
          <FieldLabel>תמונת המונח</FieldLabel>
          <div className="flex flex-wrap items-center gap-4">
            {draft.image_url ? (
              <>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="h-[120px] w-[208px] flex-none overflow-hidden rounded-lg border border-neutrals-silver transition-colors hover:border-accent"
                >
                  <img
                    src={draft.image_url}
                    alt="תמונת המונח"
                    className="h-full w-full object-cover"
                  />
                </button>
                <div className="flex min-w-[200px] flex-1 flex-col items-start gap-2">
                  <p
                    dir="ltr"
                    className="max-w-full truncate text-right text-[12.5px] text-neutrals-nickel"
                  >
                    {draft.image_url}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outlined"
                      leadingIcon={<Icon name="Image" size={15} />}
                      onClick={() => setPickerOpen(true)}
                    >
                      החלף מדיה
                    </Button>
                    <Button variant="white" onClick={() => patch({ image_url: null })}>
                      הסר
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex h-[120px] w-[208px] flex-none flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-accent bg-hues-sky text-body font-semibold text-accent transition-colors hover:bg-hues-sky/70"
                >
                  <Icon name="Image" size={26} />
                  בחר מדיה
                </button>
                <p className="min-w-[200px] flex-1 text-small leading-relaxed text-neutrals-nickel">
                  בחרו תמונה מספריית המדיה. מומלץ יחס 16:10.
                </p>
              </>
            )}
          </div>
        </div>
      </WizardCard>

      <WizardCard>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel>קישורים חיצוניים</FieldLabel>
          <Badge color="accent">{draft.external_links.length}</Badge>
        </div>

        {draft.external_links.length > 0 && (
          <ul className="flex flex-col gap-2">
            {draft.external_links.map((link, index) => (
              // רשומות-קישור אינן ממוינות מחדש — רק נוספות/נמחקות מהסוף
              // biome-ignore lint/suspicious/noArrayIndexKey: אין מזהה יציב ל-{title,url}
              <li key={index} className="flex items-center gap-2">
                <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-neutrals-whisper text-neutrals-charcoal">
                  <ExternalLinkIcon size={16} />
                </span>
                <input
                  value={link.title}
                  onChange={(e) => setLink(index, 'title', e.target.value)}
                  placeholder="כותרת הקישור"
                  aria-label={`כותרת קישור ${index + 1}`}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-neutrals-silver bg-white px-3 text-body font-semibold text-neutrals-charcoal outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
                <input
                  value={link.url}
                  onChange={(e) => setLink(index, 'url', e.target.value)}
                  placeholder="https://"
                  dir="ltr"
                  aria-label={`כתובת קישור ${index + 1}`}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-neutrals-silver bg-white px-3 text-right text-[13.5px] text-neutrals-charcoal outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
                <IconButton
                  variant="ghost"
                  size="md"
                  aria-label={`הסרת קישור ${index + 1}`}
                  onClick={() => removeLink(index)}
                >
                  <Icon name="Close" size={17} />
                </IconButton>
              </li>
            ))}
          </ul>
        )}

        <AddRowButton
          onClick={() =>
            patch({
              external_links: [...draft.external_links, { title: '', url: '' }],
            })
          }
        >
          הוסף קישור
        </AddRowButton>
      </WizardCard>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(image_url) => patch({ image_url })}
        selectedUrl={draft.image_url}
      />
    </div>
  )
}
