/**
 * שלב 1 — פרטי בסיס (design-export/Term Editor.dc.html שורות 66-106):
 * מונח + סטטוס, תיאור קצר עם מונה-תווים, רשת-קטגוריות, ורמת-קושי.
 */
import { FieldLabel, Tabs, Textarea } from '@/components/ui'
import {
  CONCEPT_CATEGORIES,
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
} from '@/lib/constants/enums'
import {
  categoryMeta,
  DIFFICULTY_META,
  EDITABLE_STATUSES,
  type EditableConceptStatus,
  SHORT_DESCRIPTION_MAX,
  STATUS_META,
} from '../../constants'
import type { ConceptDraft, ConceptFieldError } from '../../types'
import { StepIntro, WizardCard } from './stepChrome'

interface StepBasicsProps {
  draft: ConceptDraft
  patch: (next: Partial<ConceptDraft>) => void
  errors: ConceptFieldError[]
}

export function StepBasics({ draft, patch, errors }: StepBasicsProps) {
  const shortLength = draft.short_description.length
  const termInvalid = errors.includes('term')
  const shortInvalid = errors.includes('short_description')

  /**
   * הרשת מציגה את 8 הקטגוריות הקנוניות, ובנוסף את הקטגוריה הנוכחית של המונח גם
   * אם היא קטגוריית-ציוד שאינה ביניהן — אחרת עריכת מונח קיים הייתה משנה לו את
   * הקטגוריה בשקט.
   */
  const options: string[] = (CONCEPT_CATEGORIES as readonly string[]).includes(
    draft.category,
  )
    ? [...CONCEPT_CATEGORIES]
    : [...CONCEPT_CATEGORIES, draft.category]

  return (
    <div className="flex flex-col gap-4">
      <StepIntro
        title="פרטי בסיס"
        description="המידע שמופיע בכרטיס המונח ובמאגר. את ההסבר המלא נוסיף בשלב הבא."
      />

      <WizardCard>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
            <FieldLabel>מונח *</FieldLabel>
            {/* dir="auto" ולא "ltr" כמו בעיצוב — מונח יכול להיות עברי או אנגלי
                (ראו ההערה ב-ConceptCard). */}
            <input
              value={draft.term}
              onChange={(e) => patch({ term: e.target.value })}
              placeholder="לדוגמה: VLAN"
              dir="auto"
              aria-invalid={termInvalid}
              className={`h-12 w-full rounded-lg border bg-white px-4 text-start text-[16px] font-semibold text-neutrals-charcoal outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30 ${
                termInvalid ? 'border-caution' : 'border-neutrals-silver'
              }`}
            />
            {termInvalid && (
              <p className="mt-2 text-[12px] text-caution">חובה להזין מונח.</p>
            )}
          </div>

          <div className="w-[220px] flex-none">
            <FieldLabel>סטטוס</FieldLabel>
            <Tabs
              variant="pill"
              tabs={EDITABLE_STATUSES.map((status) => ({
                id: status,
                label: STATUS_META[status].label,
              }))}
              value={draft.status}
              onChange={(id) => patch({ status: id as EditableConceptStatus })}
            />
          </div>
        </div>

        <div>
          <FieldLabel hint="· מוצג ב-hover ובכרטיס">תיאור קצר *</FieldLabel>
          <Textarea
            value={draft.short_description}
            onChange={(e) => patch({ short_description: e.target.value })}
            maxLength={SHORT_DESCRIPTION_MAX}
            rows={3}
            placeholder="משפט אחד שמסביר את המונח בקצרה…"
            aria-invalid={shortInvalid}
          />
          <div className="mt-2 flex items-center justify-between">
            {shortInvalid ? (
              <span className="text-[12px] text-caution">חובה להזין תיאור קצר.</span>
            ) : (
              <span />
            )}
            {/* dir="ltr" — מונה "0 / 140" הוא ביטוי מספרי; ב-RTL הוא היה מתהפך */}
            <span dir="ltr" className="text-[12px] text-neutrals-nickel">
              {`${shortLength} / ${SHORT_DESCRIPTION_MAX}`}
            </span>
          </div>
        </div>
      </WizardCard>

      <WizardCard>
        <div>
          <FieldLabel>קטגוריה *</FieldLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {options.map((category) => {
              const meta = categoryMeta(category)
              const CategoryIcon = meta.icon
              const selected = draft.category === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => patch({ category })}
                  aria-pressed={selected}
                  className={`flex flex-col items-start gap-2 rounded-lg border-[1.5px] p-3 text-start transition-colors ${
                    selected
                      ? `border-accent ${meta.bg}`
                      : 'border-neutrals-silver bg-white hover:border-neutrals-palladium'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.bg} ${meta.fg}`}
                  >
                    <CategoryIcon size={18} strokeWidth={2} />
                  </span>
                  <span
                    className={`text-[13.5px] font-semibold ${
                      selected ? 'text-neutrals-charcoal' : 'text-neutrals-lead'
                    }`}
                  >
                    {category}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </WizardCard>

      <WizardCard>
        <div>
          <FieldLabel>רמת קושי</FieldLabel>
          <Tabs
            variant="pill"
            tabs={DIFFICULTY_LEVELS.map((level: DifficultyLevel) => ({
              id: level,
              label: DIFFICULTY_META[level].label,
            }))}
            value={draft.difficulty_level}
            onChange={(id) => patch({ difficulty_level: id as DifficultyLevel })}
          />
        </div>
      </WizardCard>
    </div>
  )
}
