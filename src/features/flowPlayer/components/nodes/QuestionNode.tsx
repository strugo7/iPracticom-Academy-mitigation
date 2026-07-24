/**
 * צומת question — השאלה + ה-options[] ככפתורים גדולים מלאי-רוחב; לחיצה מנווטת.
 * לכל אופציה טקסט, הערה, מדיה-עזר (thumbnail→lightbox) וקישור חיצוני אם קיימים.
 * 1:1 מ-FlowPlayer.dc.html (המצב המרכזי של הנגן).
 */
import { NODE_VISUALS } from '../../constants'
import type { FlowNode, FlowOption } from '../../schemas'
import { PlayerIcon } from '../icons'
import { MediaThumb } from '../MediaThumb'
import { HyperlinkButton, NodePill, NoteHint } from './parts'

interface QuestionNodeProps {
  node: FlowNode
  onChoose: (optionIndex: number) => void
}

function OptionButton({
  option,
  onSelect,
}: {
  option: FlowOption
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3.5 rounded-[18px] border-[1.5px] border-[#E3E9F0] bg-white px-[18px] py-4 text-right shadow-[0_4px_14px_rgba(20,60,110,.06)] transition hover:-translate-y-0.5 hover:border-[#2EB4FF] hover:shadow-[0_10px_26px_rgba(20,60,110,.12)] active:scale-[.99]"
    >
      <span className="flex-1">
        <span className="block text-[18px] font-bold leading-snug">
          {option.text ?? 'המשך'}
        </span>
        {option.note && (
          <span className="mt-1 block text-[12.5px] leading-snug text-neutrals-lead">
            {option.note}
          </span>
        )}
        {option.hyperlink && <HyperlinkButton hyperlink={option.hyperlink} />}
      </span>
      {option.media.length > 0 ? (
        <MediaThumb media={option.media} />
      ) : (
        <PlayerIcon
          name="chevronBack"
          size={20}
          className="flex-none text-[#C2CCD8]"
        />
      )}
    </button>
  )
}

export function QuestionNode({ node, onChoose }: QuestionNodeProps) {
  return (
    <div className="flex flex-1 flex-col">
      <NodePill type="question" />
      <h1 className="mb-2 text-[25px] font-extrabold leading-[1.3]">
        {node.title ?? 'שאלה'}
      </h1>
      {node.description && (
        <p className="mb-6 text-[14.5px] leading-relaxed text-neutrals-lead">
          {node.description}
        </p>
      )}
      <div className="flex flex-col gap-3.5">
        {node.options.map((option, index) => (
          <OptionButton
            key={option.id ?? index}
            option={option}
            onSelect={() => onChoose(index)}
          />
        ))}
        {node.options.length === 0 && (
          <p
            className="rounded-xl bg-white px-4 py-3 text-[13px] text-neutrals-lead"
            style={{
              borderInlineStart: `3px solid ${NODE_VISUALS.end.accent}`,
            }}
          >
            אין אפשרויות בצומת זה — פנה לעורך ה-Playbook.
          </p>
        )}
      </div>
      {node.note && <NoteHint note={node.note} />}
    </div>
  )
}
