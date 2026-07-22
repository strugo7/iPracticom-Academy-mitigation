/**
 * פאנל הגדרות-הנוהל (design-export/Policy Editor.dc.html) — תקציר, קטגוריה,
 * גרסה, סטטוס, שיוך-מחלקות, עובדים ספציפיים, מתג קרא-וחתום, וטווח-נמענים.
 * הכותרת עצמה חיה בסרגל-העליון. מחלקות/עובדים נטענים מהדאטה האמיתי.
 */
import {
  Avatar,
  Checkbox,
  FieldLabel,
  Icon,
  initialsFromName,
  SelectField,
  Tabs,
  Textarea,
  Toggle,
} from '@/components/ui'
import type { Department, User } from '@/types/entities'
import {
  avatarColor,
  POLICY_CATEGORIES,
  POLICY_EDITOR_STATUS_TABS,
} from '../../constants'
import type { PolicyDraft } from '../../types'

interface PolicySettingsPanelProps {
  draft: PolicyDraft
  departments: Department[]
  users: User[]
  reach: number
  onPatch: (patch: Partial<PolicyDraft>) => void
}

export function PolicySettingsPanel({
  draft,
  departments,
  users,
  reach,
  onPatch,
}: PolicySettingsPanelProps) {
  const toggleDepartment = (name: string) => {
    const next = draft.departments.includes(name)
      ? draft.departments.filter((d) => d !== name)
      : [...draft.departments, name]
    onPatch({ departments: next })
  }

  const toggleEmployee = (id: string) => {
    const next = draft.assignedUserIds.includes(id)
      ? draft.assignedUserIds.filter((u) => u !== id)
      : [...draft.assignedUserIds, id]
    onPatch({ assignedUserIds: next })
  }

  // קטגוריה עשויה להגיע כערך שאינו ברשימת-ההיצע — נכלל כדי שלא ייעלם.
  const categoryOptions = [...new Set([draft.category, ...POLICY_CATEGORIES])]

  return (
    <aside className="flex w-[320px] flex-none flex-col gap-5 overflow-y-auto border-s border-neutrals-silver bg-white p-5">
      <h2 className="text-body font-semibold text-neutrals-charcoal">
        הגדרות הנוהל
      </h2>

      <div>
        <FieldLabel>תקציר</FieldLabel>
        <Textarea
          value={draft.summary}
          onChange={(e) => onPatch({ summary: e.target.value })}
          placeholder="תיאור קצר של הנוהל…"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <FieldLabel>קטגוריה</FieldLabel>
          <SelectField
            value={draft.category}
            onChange={(e) => onPatch({ category: e.target.value })}
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-24 flex-none">
          <FieldLabel>גרסה</FieldLabel>
          <input
            value={draft.version}
            onChange={(e) => onPatch({ version: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutrals-silver bg-white px-3 text-body text-neutrals-charcoal outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <FieldLabel>סטטוס</FieldLabel>
        <Tabs
          variant="pill"
          tabs={POLICY_EDITOR_STATUS_TABS}
          value={draft.status}
          onChange={(id) => onPatch({ status: id as PolicyDraft['status'] })}
        />
      </div>

      <div>
        <FieldLabel>שיוך מחלקות</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => {
            const on = draft.departments.includes(dept.name)
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => toggleDepartment(dept.name)}
                className={`rounded-full border px-3 py-1.5 text-small font-semibold transition-colors ${
                  on
                    ? 'border-accent bg-hues-sky text-accent'
                    : 'border-neutrals-silver bg-white text-neutrals-lead hover:border-neutrals-palladium'
                }`}
              >
                {dept.name}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <FieldLabel hint="(בנוסף למחלקות)">עובדים ספציפיים</FieldLabel>
        <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2.5 rounded-lg px-1 py-1"
            >
              <Checkbox
                checked={draft.assignedUserIds.includes(user.id)}
                onChange={() => toggleEmployee(user.id)}
              />
              <Avatar
                initials={initialsFromName(user.full_name)}
                size={28}
                color={avatarColor(user.id)}
              />
              <div className="min-w-0">
                <div className="truncate text-small font-semibold text-neutrals-charcoal">
                  {user.full_name}
                </div>
                <div className="truncate text-[11px] text-neutrals-nickel">
                  {user.department ?? 'ללא מחלקה'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`rounded-xl border p-3.5 ${
          draft.requiresAcknowledgement
            ? 'border-accent bg-hues-sky/40'
            : 'border-neutrals-silver bg-neutrals-whisper'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-8 items-center justify-center rounded-lg ${
                draft.requiresAcknowledgement
                  ? 'bg-accent text-white'
                  : 'bg-neutrals-silver text-neutrals-nickel'
              }`}
            >
              <Icon name="Check" size={16} />
            </span>
            <div>
              <div className="text-small font-semibold text-neutrals-charcoal">
                קרא וחתום
              </div>
              <div className="text-[11px] text-neutrals-nickel">
                דרישת אישור קריאה מהמשויכים
              </div>
            </div>
          </div>
          <Toggle
            checked={draft.requiresAcknowledgement}
            onChange={(checked) =>
              onPatch({ requiresAcknowledgement: checked })
            }
          />
        </div>
        {draft.requiresAcknowledgement && (
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-neutrals-lead">
            יישלח מייל לכל המשויכים עם קישור לנוהל, ויידרש אישור קריאה חתום.
            ההתקדמות תופיע בדוח המעקב.
          </p>
        )}
      </div>

      <p className="text-small text-neutrals-lead">
        פרסום ישלח את הנוהל ל-
        <strong className="text-neutrals-charcoal">{reach}</strong> נמענים.
      </p>
    </aside>
  )
}
