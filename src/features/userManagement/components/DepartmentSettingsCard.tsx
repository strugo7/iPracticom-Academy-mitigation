/**
 * כרטיס-הגדרות המחלקה הנבחרת (design-export שורות 89-152): כותרת+נתיב,
 * תיאור, ושיוך-מנהל-מחלקה — הדגש המרכזי של מסמך 26 ("פעולת-הרשאה" שפותחת
 * את דשבורד-הניהול, ManagerDashboard). "ערוך" פותח DepartmentFormDialog.
 */
import { useState } from 'react'
import { Badge, Button, Icon } from '@/components/ui'
import { avatarHueClass, initialsOf } from '../constants'
import { BuildingIcon, ManagerAssignIcon, ShieldCheckIcon } from '../icons'
import type { Department, User } from '@/types/entities'

interface Props {
  department: Department
  path: string[]
  memberCount: number
  candidates: User[]
  currentManager: User | null
  onAssignManager: (userId: string | null) => void
  onEdit: () => void
}

export function DepartmentSettingsCard({
  department,
  path,
  memberCount,
  candidates,
  currentManager,
  onAssignManager,
  onEdit,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <section className="mb-4 overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex items-start gap-4 border-b border-neutrals-silver p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-gradient text-white">
          <BuildingIcon size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-h4 font-semibold text-neutrals-charcoal">
              {department.name}
            </h2>
            <Badge color="accent">{memberCount} חברים</Badge>
          </div>
          <div className="mt-1 text-small text-neutrals-nickel">
            {path.join('  ›  ')}
          </div>
          {department.description && (
            <p className="mt-2 text-small leading-relaxed text-neutrals-charcoal">
              {department.description}
            </p>
          )}
        </div>
        <Button
          variant="outlined"
          onClick={onEdit}
          leadingIcon={<Icon name="Edit" size={15} />}
        >
          ערוך
        </Button>
      </div>

      <div className="p-5">
        <div className="relative">
          <label className="mb-2 flex items-center gap-2 text-tiny-bold text-neutrals-lead">
            <ManagerAssignIcon size={14} className="text-success" />
            מנהל המחלקה
          </label>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((o) => !o)}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-start transition-colors ${
              currentManager
                ? 'border-success bg-hues-mint'
                : 'border-neutrals-silver bg-white hover:border-neutrals-palladium'
            }`}
          >
            {currentManager ? (
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white ${avatarHueClass(currentManager.id)}`}
              >
                {initialsOf(currentManager.full_name)}
              </span>
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutrals-whisper text-neutrals-nickel">
                <Icon name="User" size={20} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              {currentManager ? (
                <>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-body text-neutrals-charcoal">
                      {currentManager.full_name}
                    </span>
                    <Badge color="success">מנהל</Badge>
                  </span>
                  <span
                    dir="ltr"
                    className="mt-0.5 block text-end text-tiny text-neutrals-nickel"
                  >
                    {currentManager.email}
                  </span>
                </>
              ) : (
                <>
                  <span className="block font-semibold text-small text-neutrals-lead">
                    לא הוגדר מנהל מחלקה
                  </span>
                  <span className="mt-0.5 block text-tiny text-neutrals-nickel">
                    בחרו משתמש שינהל את המחלקה
                  </span>
                </>
              )}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-small text-accent">
              החלף
              <Icon name="ChevronDown" size={15} />
            </span>
          </button>

          {pickerOpen && (
            <div
              role="listbox"
              className="absolute inset-inline-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-lg border border-neutrals-silver bg-white shadow-menu"
            >
              <div className="border-b border-neutrals-silver p-3 text-tiny font-semibold text-neutrals-nickel">
                בחרו מנהל מבין חברי המחלקה
              </div>
              <div className="flex max-h-[232px] flex-col gap-1 overflow-y-auto p-2">
                {candidates.length === 0 && (
                  <div className="p-3 text-small text-neutrals-nickel">
                    אין חברים במחלקה זו
                  </div>
                )}
                {candidates.map((candidate) => {
                  const active = candidate.id === currentManager?.id
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onAssignManager(candidate.id)
                        setPickerOpen(false)
                      }}
                      className={`flex items-center gap-3 rounded-lg p-2 text-start transition-colors ${
                        active ? 'bg-hues-mint' : 'hover:bg-neutrals-whisper'
                      }`}
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white ${avatarHueClass(candidate.id)}`}
                      >
                        {initialsOf(candidate.full_name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-small text-neutrals-charcoal">
                          {candidate.full_name}
                        </span>
                      </span>
                      {active && (
                        <Icon name="Check" size={17} className="shrink-0 text-success" />
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  onAssignManager(null)
                  setPickerOpen(false)
                }}
                className="flex w-full items-center gap-2 border-t border-neutrals-silver p-3 text-start font-semibold text-small text-neutrals-nickel transition-colors hover:bg-hues-salmon hover:text-caution"
              >
                <Icon name="Close" size={15} />
                ללא מנהל מחלקה
              </button>
            </div>
          )}

          {currentManager && (
            <div className="mt-3 flex items-start gap-3 rounded-lg bg-hues-mint p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success text-white">
                <ShieldCheckIcon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-small text-hues-teal">
                  גישת ניהול הופעלה
                </div>
                <div className="mt-1 text-tiny leading-relaxed text-hues-teal">
                  כמנהל המחלקה, <strong>{currentManager.full_name}</strong> מקבל
                  גישה לדשבורד ניהול המחלקה ולנתוני {memberCount} העובדים —
                  התקדמות, ציונים והשלמת הכשרות.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
