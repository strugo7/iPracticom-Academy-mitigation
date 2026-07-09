import { type ReactNode } from 'react'

// Figma "02 - Audio / Player" (set 19:670) — LTR media layout (play on the LEFT):
//  - "Player":                full bar, whisper bg (#F2F4F8), rounded-full, filled play
//                             triangle, time 14px, long track, volume + 3-dot options on the right.
//  - "Player Inline":         no background, OUTLINE play triangle + time + thin silver track.
//  - "Player Inline – Playing": pause (two bars) + time + track with a dark (#697077) filled
//                             progress portion.
type AudioVariant = 'player' | 'inline' | 'inlinePlaying'

interface AudioPlayerProps {
  variant?: AudioVariant
  time?: string
  /** played fraction 0..1 (used by the playing variant) */
  progress?: number
}

function PlayFilled() {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 1.5v13l11-6.5L2 1.5Z" fill="currentColor" />
    </svg>
  )
}

function PlayOutline() {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 2.2v13.6L14 9 3 2.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PauseGlyph() {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1.5" y="1" width="3" height="14" rx="1" fill="currentColor" />
      <rect x="7.5" y="1" width="3" height="14" rx="1" fill="currentColor" />
    </svg>
  )
}

function VolumeGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 7.5h2.5L9 4.5v11L5.5 12.5H3v-5Z" fill="currentColor" />
      <path
        d="M12 7a3.5 3.5 0 0 1 0 6M14.5 4.5a7 7 0 0 1 0 11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function OptionsGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="4" r="1.6" fill="currentColor" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
      <circle cx="10" cy="16" r="1.6" fill="currentColor" />
    </svg>
  )
}

export function AudioPlayer({
  variant = 'player',
  time,
  progress = 0.36,
}: AudioPlayerProps): ReactNode {
  const pct = Math.min(Math.max(progress, 0), 1) * 100

  if (variant === 'player') {
    return (
      <div
        className="inline-flex items-center gap-4 w-[480px] max-w-full h-14 rounded-full bg-[#F2F4F8] px-5 font-sans"
        dir="ltr"
      >
        <button
          className="shrink-0 text-neutrals-charcoal cursor-pointer"
          aria-label="נגן"
        >
          <PlayFilled />
        </button>
        <span className="text-tiny text-neutrals-charcoal shrink-0 tabular-nums">
          {time ?? '0:00 / 5:48'}
        </span>
        <span className="relative flex-1 h-1 rounded-full bg-[#697077]" />
        <button
          className="shrink-0 text-neutrals-charcoal cursor-pointer"
          aria-label="עוצמה"
        >
          <VolumeGlyph />
        </button>
        <button
          className="shrink-0 text-neutrals-charcoal cursor-pointer"
          aria-label="אפשרויות"
        >
          <OptionsGlyph />
        </button>
      </div>
    )
  }

  const playing = variant === 'inlinePlaying'
  return (
    <div className="inline-flex items-center gap-3 font-sans" dir="ltr">
      <button
        className="inline-flex items-center justify-center w-6 h-6 shrink-0 text-neutrals-charcoal cursor-pointer"
        aria-label={playing ? 'השהה' : 'נגן'}
      >
        {playing ? <PauseGlyph /> : <PlayOutline />}
      </button>
      <span className="text-tiny text-neutrals-charcoal shrink-0 tabular-nums">
        {time ?? (playing ? '2:05 / 5:48' : '0:00 / 5:48')}
      </span>
      <span className="relative w-[122px] max-w-full h-1 rounded-full bg-neutrals-silver">
        {playing && (
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-[#181D24]"
            style={{ width: `${pct}%` }}
          />
        )}
      </span>
    </div>
  )
}
