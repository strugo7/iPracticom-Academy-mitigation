/**
 * חלקים משותפים לרינדור הצמתים בנגן — תג-הסוג (pill), הערת-משנה (note),
 * וכפתור קישור-חיצוני (hyperlink). כולם נגזרים משפת-צבעי-הצמתים (constants).
 */
import { NODE_VISUALS } from '../../constants'
import type { FlowHyperlink, FlowNodeType } from '../../schemas'
import { PlayerIcon, type PlayerIconName } from '../icons'

const PILL_ICON: Record<FlowNodeType, PlayerIconName> = {
  start: 'play',
  question: 'question',
  action: 'wrench',
  solution: 'check',
  end: 'close',
  linked_flow: 'link',
}

/** תג-הסוג של הצומת — pill צבעוני + טקסט (בלי נקודה, DS §6). */
export function NodePill({ type }: { type: FlowNodeType }) {
  const visual = NODE_VISUALS[type]
  return (
    <span
      className="mb-[18px] inline-flex items-center gap-[7px] self-start rounded-full px-[13px] py-[5px] text-[12.5px] font-bold"
      style={{ color: visual.pillText, background: visual.pillBg }}
    >
      <PlayerIcon name={PILL_ICON[type]} size={14} />
      {visual.label}
    </span>
  )
}

/** הערת-משנה של צומת/אופציה (`note`) — מידע משלים עדין (מסמך 07 §33). */
export function NoteHint({ note }: { note: string }) {
  return (
    <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#EAF0F6] bg-[#FBFDFF] px-3.5 py-[11px]">
      <PlayerIcon name="info" size={16} className="flex-none text-accent" />
      <span className="text-[12.5px] leading-snug text-neutrals-lead">
        {note}
      </span>
    </div>
  )
}

/** קישור חיצוני (`hyperlink{url,label}`) — "פתח מדריך" (מסמך 07 §34). */
export function HyperlinkButton({ hyperlink }: { hyperlink: FlowHyperlink }) {
  return (
    <a
      href={hyperlink.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#E3E9F0] bg-white px-3.5 py-2 text-[13px] font-semibold text-accent no-underline transition hover:border-[#CFD8E3]"
    >
      <PlayerIcon name="external" size={15} />
      {hyperlink.label?.trim() || 'פתח מדריך'}
    </a>
  )
}
