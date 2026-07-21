/**
 * מודאל הגדרות-השיעור (מסמך 19 §5, SRS §1.2): כותרת, מבוא, מטרות-למידה,
 * משך, XP, אכיפת-רצף, מבחן-מקושר וסטטוס. בנוי על DS Dialog; שמירה מפעילה
 * persist ומעדכנת את מצב-העורך. משך/XP מוצגים לקריאה (עריכתם — פאנל נפרד).
 */
import { Button, Dialog, Icon, Input, Toggle } from '@/components/ui'
import { STATUS_OPTIONS, STRINGS } from '../constants'
import type { LessonSettingsDraft } from '../types'

interface LessonSettingsModalProps {
  open: boolean
  draft: LessonSettingsDraft
  linkedExamTitle: string | null
  onClose: () => void
  onChange: (patch: Partial<LessonSettingsDraft>) => void
  onSave: () => void
}

export function LessonSettingsModal({
  open,
  draft,
  linkedExamTitle,
  onClose,
  onChange,
  onSave,
}: LessonSettingsModalProps) {
  function setObjective(index: number, value: string) {
    const next = [...draft.learning_objectives]
    next[index] = value
    onChange({ learning_objectives: next })
  }
  function removeObjective(index: number) {
    onChange({
      learning_objectives: draft.learning_objectives.filter((_, i) => i !== index),
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-[11px] bg-hues-sky text-accent">
            <Icon name="Settings" size={21} />
          </span>
          <div>
            <div className="text-[18px] font-semibold text-neutrals-charcoal">
              {STRINGS.settings}
            </div>
            <div className="mt-0.5 text-[12.5px] text-neutrals-lead">
              {STRINGS.settingsSubtitle}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            {STRINGS.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            leadingIcon={<Icon name="Save" size={17} />}
          >
            {STRINGS.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label={STRINGS.settingsTitle}
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-neutrals-lead">
            {STRINGS.settingsIntro}
          </span>
          <textarea
            value={draft.introduction_text}
            onChange={(e) => onChange({ introduction_text: e.target.value })}
            className="min-h-[74px] resize-y rounded-xl border border-neutrals-silver bg-neutrals-whisper px-3.5 py-3 text-[14.5px] leading-relaxed text-neutrals-lead outline-none focus:border-accent"
          />
        </div>

        <div>
          <span className="mb-2 block text-[13px] font-semibold text-neutrals-lead">
            {STRINGS.settingsObjectives}
          </span>
          <div className="flex flex-col gap-2">
            {draft.learning_objectives.map((obj, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: מטרות ניתנות לעריכה במקום, אין מזהה יציב
              <div key={index} className="flex items-center gap-2.5">
                <span className="flex size-6 flex-none items-center justify-center rounded-full bg-hues-mint text-success">
                  <Icon name="Check" size={14} />
                </span>
                <Input
                  className="flex-1"
                  value={obj}
                  onChange={(e) => setObjective(index, e.target.value)}
                />
                <button
                  type="button"
                  aria-label={STRINGS.removeObjective}
                  onClick={() => removeObjective(index)}
                  className="flex size-9 flex-none items-center justify-center rounded-[10px] text-neutrals-nickel transition-colors hover:bg-hues-salmon hover:text-caution"
                >
                  <Icon name="Close" size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({ learning_objectives: [...draft.learning_objectives, ''] })
            }
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-[11px] border border-dashed border-hues-indigo bg-neutrals-whisper px-3.5 py-2.5 text-[13.5px] font-semibold text-accent transition-colors hover:bg-hues-sky"
          >
            <Icon name="Plus" size={16} />
            {STRINGS.addObjective}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label={STRINGS.settingsDuration}
            type="number"
            value={draft.duration_minutes ?? ''}
            onChange={(e) =>
              onChange({
                duration_minutes: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
          <Input
            label={STRINGS.settingsXp}
            type="number"
            value={draft.xp_reward ?? ''}
            onChange={(e) =>
              onChange({ xp_reward: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[13px] border border-neutrals-silver bg-neutrals-whisper px-4 py-3">
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-neutrals-charcoal">
              {STRINGS.settingsSequence}
            </div>
            <div className="mt-0.5 text-[12px] text-neutrals-nickel">
              {STRINGS.settingsSequenceHint}
            </div>
          </div>
          <Toggle
            checked={draft.require_previous_lesson}
            onChange={(on) => onChange({ require_previous_lesson: on })}
          />
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-neutrals-silver bg-white px-3.5 py-3">
          <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-hues-sky text-accent">
            <Icon name="SuccessV" size={16} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-neutrals-charcoal">
            {linkedExamTitle ?? STRINGS.noLinkedExam}
          </span>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-neutrals-lead">
            {STRINGS.settingsStatus}
          </span>
          <div className="inline-flex gap-0.5 rounded-xl border border-neutrals-silver bg-neutrals-whisper p-1">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ status: opt.value })}
                className={`rounded-[9px] px-4 py-2 text-[13px] font-semibold transition-all ${
                  draft.status === opt.value
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-neutrals-lead'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
