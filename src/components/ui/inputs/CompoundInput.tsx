import { type ReactNode } from 'react'
import { ArrowDropDownIcon, PlayIcon } from './icons'

// Compund Input (4089:8325)
// A dropdown-style input (top, rounded top corners) stacked on a "Selected Content"
// panel (bottom, rounded bottom corners) that holds the chosen content.
//
// Figma facts: header shows only the bold label "שם שדה" (Hint + info icon are visible:false).
// Top box content in RTL (right→left): Search icon, Value, Arrow Drop Down (left).
// Selected Content panel default = audio player; RTL order: track (right), time, play (left).
interface CompoundInputProps {
  label?: string
  value?: string
  /** content rendered inside the lower "Selected Content" panel */
  children?: ReactNode
  className?: string
}

export function CompoundInput({
  label = 'שם שדה',
  value = 'ערך',
  children,
  className = '',
}: CompoundInputProps) {
  return (
    <div
      className={`flex flex-col gap-2 font-sans w-[427px] max-w-full ${className}`}
      dir="rtl"
    >
      {/* header — only the label is visible in Figma */}
      <div className="flex items-center px-[15px]">
        <span className="text-small font-semibold text-neutrals-charcoal">
          {label}
        </span>
      </div>

      {/* stacked box: input on top + content panel below */}
      <div className="flex flex-col">
        {/* New Input — top, rounded top corners only. In the Compound the Search icon is
            hidden in Figma; RTL order = Value (right), Arrow Drop Down (left). */}
        <div className="flex items-center gap-2 h-10 px-4 py-2 bg-white border border-neutrals-palladium rounded-t-lg">
          <span className="flex-1 text-body leading-6 text-neutrals-nickel">
            {value}
          </span>
          <ArrowDropDownIcon className="shrink-0 text-accent" />
        </div>

        {/* Selected Content slot — bottom, rounded bottom corners, shares top border */}
        <div className="flex flex-col gap-2 min-h-10 px-4 py-2 bg-white border border-t-0 border-neutrals-palladium rounded-b-lg">
          {children ?? <AudioPlayerContent />}
        </div>
      </div>
    </div>
  )
}

// Default selected content from Figma: an inline audio player.
// RTL order (right→left): track, time, play.
function AudioPlayerContent() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-sm bg-neutrals-silver" />
      <span className="text-tiny text-neutrals-charcoal">0:00 / 5:48</span>
      <PlayIcon className="shrink-0 text-neutrals-charcoal" />
    </div>
  )
}
