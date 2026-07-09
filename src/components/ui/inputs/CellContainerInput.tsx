import {
  PreferencesIcon,
  LocationIcon,
  EmoticonsIcon,
  ImageRoundIcon,
  SearchIcon,
} from './icons'

// 02 - Cell Contianer — "Input" variant (set 1496:2112 / inner 03 -Input \ Components 1426:3173).
//
// The Input container is a "New Input" box (r8, h40, fill #FFFFFF, border #BCC3CB w1,
// pad L16 R16 T8 B8, gap 8) whose content (Frame 1893) is laid out RTL (right→left):
//   - "Value" text "ערך" (18px/400, #9EA5AD) on the right edge
//   - a left-side action cluster (Frame 1894) holding, left→right:
//       • New Buttons pill "+ הוספת חדש" (r20, blue #0075DB text 16px/400)
//       • grey number Tag "054-1542-124" (r40, fill #E1E6EC, text 15px/400 #757D86, 7×7 dot)
//       • Search icon (#757D86)
//   - a glyph cluster (Frame 1899, gap 8) of four 18px icons (#757D86):
//       Preferences, Location, Emoticons, Image Round (avatar placeholder)
//
// Figma facts honored: all four glyphs + the search glyph are #757D86 (neutrals-lead),
// the pill/tag radii (20 / 40), tag fill #E1E6EC (neutrals-silver), tag text #757D86.

interface CellContainerInputProps {
  /** placeholder / value text — Figma: "ערך" */
  value?: string
  /** New Buttons pill label — Figma: "+ הוספת חדש" */
  addLabel?: string
  /** grey number tag text — Figma: "054-1542-124" */
  tagText?: string
  className?: string
}

export function CellContainerInput({
  value = 'ערך',
  addLabel = '+ הוספת חדש',
  tagText = '054-1542-124',
  className = '',
}: CellContainerInputProps) {
  return (
    <div
      className={`flex items-center gap-2 h-10 px-4 py-2 bg-white border border-neutrals-palladium rounded-lg font-sans w-[434px] max-w-full ${className}`}
      dir="rtl"
    >
      {/* Value (right edge in RTL) */}
      <span className="text-body leading-6 text-neutrals-nickel">{value}</span>

      {/* spacer pushes the action + glyph clusters to the left edge */}
      <span className="flex-1" />

      {/* Frame 1894 — action cluster: pill, grey number tag, search */}
      <div className="flex items-center gap-2">
        {/* New Buttons pill "+ הוספת חדש" (r20, blue) */}
        <button
          type="button"
          className="flex items-center h-7 px-3 rounded-[20px] text-small leading-5 text-accent hover:bg-hues-sky/40"
        >
          {addLabel}
        </button>

        {/* grey number Tag (r40, fill silver, text lead, 7×7 dot) */}
        <span className="flex items-center gap-1.5 h-6 px-[9px] rounded-[40px] bg-neutrals-silver">
          <span className="text-[15px] leading-6 text-neutrals-lead">
            {tagText}
          </span>
          <span className="w-[7px] h-[7px] rounded-full bg-neutrals-lead" />
        </span>

        {/* Search glyph */}
        <SearchIcon className="shrink-0 w-[18px] h-[18px] text-neutrals-lead" />
      </div>

      {/* Frame 1899 — glyph cluster (gap 8), all 18px #757D86 */}
      <div className="flex items-center gap-2">
        <PreferencesIcon className="shrink-0 w-[18px] h-[18px] text-neutrals-lead" />
        <LocationIcon className="shrink-0 w-[15px] h-[18px] text-neutrals-lead" />
        <EmoticonsIcon className="shrink-0 w-[18px] h-[18px] text-neutrals-lead" />
        {/* Image Round — avatar; in this container Figma renders the monochrome image glyph */}
        <ImageRoundIcon className="shrink-0 w-[18px] h-[18px] text-neutrals-lead" />
      </div>
    </div>
  )
}
