/** ברירות מחדל (design-export שורות 208-232) — ערכים המוחלים על מבחנים/שיעורים חדשים. */
import { useState } from 'react'
import { Icon, NumberStepper } from '@/components/ui'
import { APP_SETTING_KEYS, DEFAULT_LEARNING_DEFAULTS } from '../constants'
import { SlidersIcon, StarIcon } from '../icons'
import { useSettingDraft } from '../hooks/useSettingDraft'
import { SaveBar } from './SaveBar'

export function DefaultsSection() {
  const defaults = useSettingDraft(
    APP_SETTING_KEYS.learningDefaults,
    DEFAULT_LEARNING_DEFAULTS,
    'ברירות מחדל למבחנים ושיעורים',
  )
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await defaults.commit()
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const rows = [
    {
      key: 'exam_time_minutes' as const,
      icon: <Icon name="Clock" size={22} />,
      label: 'זמן מבחן ברירת מחדל',
      desc: 'הזמן המוקצב למבחן חדש',
      unit: 'דקות',
      min: 5,
      max: 180,
      step: 5,
    },
    {
      key: 'xp_per_lesson' as const,
      icon: <StarIcon size={22} />,
      label: 'XP לשיעור',
      desc: 'נקודות ניסיון על השלמת שיעור',
      unit: 'XP',
      min: 10,
      max: 200,
      step: 10,
    },
    {
      key: 'passing_score' as const,
      icon: <Icon name="Check" size={22} />,
      label: 'ציון מעבר',
      desc: 'הציון המינימלי להשלמת מבחן',
      unit: '%',
      min: 50,
      max: 100,
      step: 5,
    },
  ]

  return (
    <div className="animate-[fadeIn_0.24s_ease]">
      <div className="mb-5">
        <h2 className="m-0 flex items-center gap-2.5 text-[21px] font-semibold text-neutrals-charcoal">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-hues-sky text-accent">
            <SlidersIcon size={18} />
          </span>
          ברירות מחדל
        </h2>
        <p className="mt-2 text-small leading-relaxed text-neutrals-lead">
          ערכים שמוחלים אוטומטית על מבחנים ושיעורים חדשים. ניתן לשנות לכל פריט בנפרד.
        </p>
      </div>

      <section className="mb-6 rounded-2xl bg-white px-5 py-1 shadow-card">
        {rows.map((row, i) => (
          <div
            key={row.key}
            className={`flex items-center gap-3.5 py-4 ${i < rows.length - 1 ? 'border-b border-neutrals-whisper' : ''}`}
          >
            <span className="flex size-[42px] flex-none items-center justify-center rounded-[11px] bg-hues-sky text-accent">
              {row.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-small text-neutrals-charcoal">{row.label}</div>
              <div className="mt-0.5 text-tiny text-neutrals-lead">{row.desc}</div>
            </div>
            <div className="w-[150px] flex-none">
              <NumberStepper
                value={defaults.draft[row.key]}
                onChange={(v) => {
                  const clamped = Math.min(row.max, Math.max(row.min, v))
                  defaults.setDraft({ ...defaults.draft, [row.key]: clamped })
                }}
                min={row.min}
                max={row.max}
                suffix={row.unit}
              />
            </div>
          </div>
        ))}
      </section>

      <SaveBar
        visible={defaults.isDirty}
        saved={saved}
        isSaving={defaults.isSaving}
        onSave={handleSave}
        onCancel={() => defaults.setDraft(defaults.value)}
      />
    </div>
  )
}
