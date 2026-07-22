/**
 * מסמך הנוהל (design-export/Policy Viewer.dc.html:75-148): כרטיס-נייר עם hero
 * (תגי קטגוריה/דרישת-חתימה, כותרת, מטא) וגוף הבלוקים. הבלוקים מרונדרים דרך
 * BlockRenderer של lessonPlayer (מקור-אמת יחיד, כולל סניטציה) — לא רינדור חוזר.
 * נוהל מסוג 'file' (ללא בלוקים) מציג כרטיס-קובץ להורדה/צפייה.
 */
import { BlockRenderer } from '@/features/lessonPlayer'
import { Button, Icon, Tag } from '@/components/ui'
import type { Procedure } from '@/types/entities'
import {
  blockAnchorId,
  estimateReadingMinutes,
  formatPolicyDate,
  sortedBlocks,
} from '../../services/policyViewerService'

interface PolicyDocumentProps {
  procedure: Procedure
}

export function PolicyDocument({ procedure }: PolicyDocumentProps) {
  const blocks = sortedBlocks(procedure.blocks)
  const readingMinutes = estimateReadingMinutes(blocks)
  const isFile = procedure.content_type === 'file'

  return (
    <article className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-neutrals-silver bg-white shadow-[0_11px_30px_rgba(4,13,55,0.05)]">
      {/* hero */}
      <div className="border-b border-[#EEF3F8] px-8 pb-6 pt-8 md:px-12">
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          {procedure.category && (
            <Tag type="blue">
              <Icon name="Preferences" size={13} />
              {procedure.category}
            </Tag>
          )}
          {procedure.requires_acknowledgement && (
            <Tag type="mission">
              <Icon name="Check" size={13} />
              דורש קריאה וחתימה
            </Tag>
          )}
        </div>
        <h1 className="mb-3.5 text-[32px] font-semibold leading-tight text-neutrals-charcoal">
          {procedure.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-small text-neutrals-lead">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Calendar" size={15} className="text-neutrals-nickel" />
            עודכן {formatPolicyDate(procedure.updated_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Clock" size={15} className="text-neutrals-nickel" />
            {readingMinutes} דק׳ קריאה
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
            <Icon name="File" size={15} />
            גרסה {procedure.version ?? '1.0'}
          </span>
        </div>
      </div>

      {/* body */}
      <div className="px-8 pb-10 pt-7 md:px-12">
        {isFile ? (
          <div className="flex items-center gap-3.5 rounded-2xl border border-neutrals-silver bg-[#FAFCFE] p-4">
            <span className="flex h-[54px] w-[46px] flex-none items-center justify-center rounded-[9px] bg-[#FBE9EA] text-hues-red">
              <Icon name="File" size={23} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-neutrals-charcoal">
                {procedure.title}
              </div>
              <div className="mt-0.5 text-small text-neutrals-nickel">
                מסמך PDF · לצפייה בנוהל המלא
              </div>
            </div>
            {procedure.file_url && (
              <a href={procedure.file_url} target="_blank" rel="noreferrer">
                <Button
                  variant="outlined"
                  leadingIcon={<Icon name="View" size={15} />}
                >
                  צפייה
                </Button>
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {blocks.map((block) => (
              <div
                key={block.id}
                id={blockAnchorId(block.id)}
                className="scroll-mt-20"
              >
                <BlockRenderer block={block} />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
