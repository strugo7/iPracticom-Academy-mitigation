/**
 * Inspector (מסמך 19 §1, שמאל-עליון): מאפייני-העיצוב של הבלוק הנבחר — גודל
 * טקסט, יישור, צבע טקסט, ונראות (styling/visibility, SRS §1.2.1). זהו משטח-
 * העיצוב היחיד; כפתור "עיצוב" בסרגל-הבלוק פשוט בוחר את הבלוק ומאיר את הפאנל.
 */
import { Icon, Toggle } from '@/components/ui'
import { blockMeta } from '../blockCatalog'
import {
  ALIGN_OPTIONS,
  STRINGS,
  TEXT_COLOR_OPTIONS,
  TEXT_SIZE_OPTIONS,
} from '../constants'
import { EditorIcon } from '../editorIcons'
import type { EditorBlock } from '../types'

interface BlockInspectorProps {
  block: EditorBlock | null
  onStyle: (patch: Partial<NonNullable<EditorBlock['styling']>>) => void
  onToggleVisibility: (hidden: boolean) => void
}

const SEG = 'flex gap-0.5 rounded-[10px] border border-neutrals-silver bg-neutrals-whisper p-0.5'
const segBtn = (active: boolean) =>
  `flex-1 cursor-pointer rounded-md px-1.5 py-1.5 text-[12.5px] font-semibold transition-all ${
    active ? 'bg-white text-accent shadow-sm' : 'text-neutrals-lead'
  }`

export function BlockInspector({
  block,
  onStyle,
  onToggleVisibility,
}: BlockInspectorProps) {
  if (!block) {
    return (
      <div className="border-b border-neutrals-silver p-4 text-[13px] text-neutrals-nickel">
        {STRINGS.inspectorEmpty}
      </div>
    )
  }

  const meta = blockMeta(block.type)
  const styling = block.styling ?? {}
  const hidden = Boolean(block.visibility?.hidden)

  return (
    <div className="border-b border-neutrals-silver p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={`flex size-8 items-center justify-center rounded-[9px] ${meta.chipClass}`}
        >
          <EditorIcon name={meta.icon} size={17} />
        </span>
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold leading-tight text-neutrals-charcoal">
            {meta.label}
          </div>
          <div className="mt-0.5 text-[11.5px] text-neutrals-nickel">
            {STRINGS.inspectorSubtitle}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-neutrals-lead">
            {STRINGS.textSize}
          </label>
          <div className={SEG}>
            {TEXT_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => onStyle({ fontSize: opt.value })}
                className={segBtn((styling.fontSize ?? null) === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-neutrals-lead">
            {STRINGS.alignment}
          </label>
          <div className={SEG}>
            {ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.align}
                type="button"
                aria-label={opt.label}
                onClick={() => onStyle({ alignment: opt.align })}
                className={`flex flex-1 items-center justify-center rounded-md py-1.5 transition-all ${
                  styling.alignment === opt.align
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-neutrals-lead'
                }`}
              >
                <EditorIcon name={opt.icon} size={16} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-neutrals-lead">
            {STRINGS.textColor}
          </label>
          <div className="flex items-center gap-2">
            {TEXT_COLOR_OPTIONS.map((opt) => {
              const active = (styling.textColor ?? null) === opt.value
              return (
                <button
                  key={opt.label}
                  type="button"
                  aria-label={opt.label}
                  onClick={() => onStyle({ textColor: opt.value })}
                  style={{ background: opt.value ?? '#181D24' }}
                  className={`flex size-8 items-center justify-center rounded-[9px] transition-transform hover:scale-105 ${
                    active ? 'ring-2 ring-accent ring-offset-2' : ''
                  }`}
                >
                  {active && <Icon name="Check" size={15} className="text-white" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2.5 pt-0.5">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-neutrals-lead">
              {STRINGS.showToLearner}
            </div>
            <div className="mt-px text-[11px] text-neutrals-nickel">
              {STRINGS.showToLearnerHint}
            </div>
          </div>
          <Toggle checked={!hidden} onChange={(on) => onToggleVisibility(!on)} />
        </div>
      </div>
    </div>
  )
}
