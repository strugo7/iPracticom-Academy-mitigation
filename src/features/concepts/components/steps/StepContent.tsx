/**
 * שלב 2 — תוכן ההסבר (design-export/Term Editor.dc.html שורות 109-145):
 * עורך התיאור המלא (HTML) ורשימת דוגמאות ניתנת להוספה/הסרה.
 */
import { Badge, FieldLabel, Icon, IconButton, Textarea } from '@/components/ui'
import type { ConceptDraft, ConceptFieldError } from '../../types'
import { ConceptRichText } from '../ConceptRichText'
import { AddRowButton, StepIntro, WizardCard } from './stepChrome'

interface StepContentProps {
  draft: ConceptDraft
  patch: (next: Partial<ConceptDraft>) => void
  errors: ConceptFieldError[]
}

export function StepContent({ draft, patch, errors }: StepContentProps) {
  const invalid = errors.includes('full_description')

  const setExample = (index: number, text: string) =>
    patch({
      examples: draft.examples.map((e, i) => (i === index ? text : e)),
    })

  const removeExample = (index: number) =>
    patch({ examples: draft.examples.filter((_, i) => i !== index) })

  return (
    <div className="flex flex-col gap-4">
      <StepIntro
        title="תוכן ההסבר"
        description="ההסבר המלא והדוגמאות שמופיעים בתצוגת המונח."
      />

      <WizardCard>
        <div>
          <FieldLabel>תיאור מלא *</FieldLabel>
          <ConceptRichText
            value={draft.full_description}
            onChange={(full_description) => patch({ full_description })}
            invalid={invalid}
          />
          {invalid ? (
            <p className="mt-2.5 text-[12px] text-caution">
              חובה להזין הסבר מלא למונח.
            </p>
          ) : (
            <p className="mt-2.5 text-[12px] leading-relaxed text-neutrals-nickel">
              תומך בטקסט מעוצב — מודגש, רשימות וקישורים. הטקסט נשמר כ-HTML ומוצג
              בתצוגת המונח.
            </p>
          )}
        </div>
      </WizardCard>

      <WizardCard>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel>דוגמאות</FieldLabel>
          <Badge color="accent">{draft.examples.length}</Badge>
        </div>

        {draft.examples.length > 0 && (
          <ol className="flex flex-col gap-2">
            {draft.examples.map((example, index) => (
              // אין מזהה יציב לדוגמה (מערך מחרוזות ב-SRS) — המפתח הוא המיקום,
              // וזה תקין כאן: השורות אינן ממוינות מחדש, רק נוספות/נמחקות.
              // biome-ignore lint/suspicious/noArrayIndexKey: ראו הערה למעלה
              <li key={index} className="flex items-start gap-3">
                <span className="mt-3 flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg bg-hues-sky text-small font-semibold text-accent">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Textarea
                    value={example}
                    onChange={(e) => setExample(index, e.target.value)}
                    rows={2}
                    placeholder="תיאור דוגמה מהשטח…"
                    aria-label={`דוגמה ${index + 1}`}
                  />
                </div>
                <span className="mt-2">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={`הסרת דוגמה ${index + 1}`}
                    onClick={() => removeExample(index)}
                  >
                    <Icon name="Remove" size={17} />
                  </IconButton>
                </span>
              </li>
            ))}
          </ol>
        )}

        <AddRowButton onClick={() => patch({ examples: [...draft.examples, ''] })}>
          הוסף דוגמה
        </AddRowButton>
      </WizardCard>
    </div>
  )
}
