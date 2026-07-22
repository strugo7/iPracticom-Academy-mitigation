/**
 * אזור פרטי-המבחן בבונה (design-export/Exam Builder.dc.html שורות 102-183):
 * כותרת, סוג-מבחן + "מקושר אל" (track/module/topic/lesson — LinkedEntityField;
 * ל-standalone_exam בלבד נשאר בורר-קטגוריה ידני), קושי, ציון-מעבר, תגיות,
 * ובלוק מבחן-כניסה (תפקידי-יעד + מחלקות-יעד). controlled מול ExamDraft.
 */
import { Icon, Input, Tabs, Toggle } from '@/components/ui'
import {
  type DifficultyLevel,
  type ExamType,
  USER_ROLES,
  type UserRole,
} from '@/lib/constants/enums'
import { DIFFICULTY_META, EXAM_TYPE_META } from '../constants'
import { patchForLinkedEntity } from '../services/entityLinkPicker'
import { ExamIcon } from '../icons'
import type { ExamDraft } from '../types'
import { FieldLabel, NumberStepper, SelectField, TagEditor } from './fields'
import { LinkedEntityField } from './LinkedEntityField'

const EXAM_TYPE_TABS = (Object.keys(EXAM_TYPE_META) as ExamType[]).map(
  (id) => ({
    id,
    label: EXAM_TYPE_META[id].short,
  }),
)
const DIFFICULTY_TABS = (Object.keys(DIFFICULTY_META) as DifficultyLevel[]).map(
  (id) => ({ id, label: DIFFICULTY_META[id].label }),
)

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'עובד',
  instructor: 'מדריך',
  manager: 'מנהל',
  admin: 'אדמין',
}

/** צ'יפ-בחירה מרובה (design-export: badge נבחר / קו-מתאר לא-נבחר). */
function MultiChip({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
        selected
          ? 'bg-accent text-white'
          : 'border border-neutrals-silver bg-white text-neutrals-lead hover:border-neutrals-palladium'
      }`}
    >
      {label}
    </button>
  )
}

export function ExamDetailsCard({
  draft,
  onChange,
  categories,
}: {
  draft: ExamDraft
  onChange: (patch: Partial<ExamDraft>) => void
  categories: string[]
}) {
  const categoryOpts = categories.includes(draft.category)
    ? categories
    : [draft.category, ...categories]
  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-neutrals-silver bg-neutrals-whisper px-5 py-4">
        <Icon name="Settings" size={18} className="text-accent" />
        <h2 className="text-small font-semibold text-neutrals-charcoal">
          פרטי המבחן
        </h2>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <Input
          label="כותרת המבחן"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="שם המבחן…"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>סוג מבחן</FieldLabel>
            <Tabs
              variant="pill"
              tabs={EXAM_TYPE_TABS}
              value={draft.examType}
              onChange={(id) => onChange({ examType: id as ExamType })}
            />
          </div>
          {draft.examType === 'standalone_exam' ? (
            <div>
              <FieldLabel>קטגוריה</FieldLabel>
              <SelectField
                value={draft.category}
                onChange={(e) => onChange({ category: e.target.value })}
              >
                {categoryOpts.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectField>
            </div>
          ) : (
            <LinkedEntityField
              draft={draft}
              categories={categories}
              onSelect={(entity) =>
                onChange(patchForLinkedEntity(entity, draft.category))
              }
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>רמת קושי</FieldLabel>
            <Tabs
              variant="pill"
              tabs={DIFFICULTY_TABS}
              value={draft.difficulty}
              onChange={(id) => onChange({ difficulty: id as DifficultyLevel })}
            />
          </div>
          <div>
            <FieldLabel>ציון מעבר</FieldLabel>
            <div className="flex items-center gap-3">
              <div className="w-28">
                <NumberStepper
                  value={draft.passingScore}
                  min={1}
                  max={100}
                  onChange={(passingScore) => onChange({ passingScore })}
                  suffix="%"
                />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutrals-whisper">
                <div
                  className="h-full rounded-full bg-accent-gradient"
                  style={{ width: `${Math.min(100, draft.passingScore)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>תגיות</FieldLabel>
          <TagEditor
            tags={draft.topicTags}
            onChange={(topicTags) => onChange({ topicTags })}
          />
        </div>

        {/* entrance exam */}
        <div className="rounded-lg bg-neutrals-whisper p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-hues-sky text-accent">
                <ExamIcon name="entrance" size={18} />
              </span>
              <div>
                <div className="text-small font-semibold text-neutrals-charcoal">
                  מבחן כניסה
                </div>
                <div className="text-[12px] text-neutrals-lead">
                  סינון מועמדים לפי תפקיד ומחלקה
                </div>
              </div>
            </div>
            <Toggle
              checked={draft.isEntrance}
              onChange={(checked) => onChange({ isEntrance: checked })}
            />
          </div>

          {draft.isEntrance && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-neutrals-silver pt-4 sm:grid-cols-2">
              <div>
                <FieldLabel>תפקידי יעד</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {USER_ROLES.map((role) => (
                    <MultiChip
                      key={role}
                      label={ROLE_LABELS[role]}
                      selected={draft.targetRoles.includes(role)}
                      onToggle={() =>
                        onChange({
                          targetRoles: toggle(draft.targetRoles, role),
                        })
                      }
                    />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>מחלקות יעד</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {categories.map((dept) => (
                    <MultiChip
                      key={dept}
                      label={dept}
                      selected={draft.targetDepartments.includes(dept)}
                      onToggle={() =>
                        onChange({
                          targetDepartments: toggle(
                            draft.targetDepartments,
                            dept,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
