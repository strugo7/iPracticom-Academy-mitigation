/**
 * תוכן-הנוהל (design-export/Policy Viewer.dc.html:63-73): עוגני-כותרות ממוספרים
 * + כרטיס-מצורף (כשיש file_url). גלילה חלקה לעוגן בלחיצה.
 */
import { Icon } from '@/components/ui'
import type { PolicyTocItem } from '../../types'

interface PolicyTOCProps {
  items: PolicyTocItem[]
  attachmentName?: string | null
}

function scrollToAnchor(anchor: string) {
  document
    .getElementById(anchor)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function PolicyTOC({ items, attachmentName }: PolicyTOCProps) {
  return (
    <aside className="sticky top-[22px] flex w-[212px] flex-none flex-col gap-1.5">
      <div className="px-3 pb-1 text-[11.5px] font-semibold tracking-wide text-neutrals-nickel">
        תוכן הנוהל
      </div>
      {items.map((item) => (
        <button
          key={item.anchor}
          type="button"
          onClick={() => scrollToAnchor(item.anchor)}
          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-start text-[13px] font-semibold text-neutrals-lead transition-colors hover:bg-white hover:text-neutrals-charcoal"
        >
          <span className="flex size-[22px] flex-none items-center justify-center rounded-md bg-hues-sky text-[11px] font-semibold text-accent">
            {item.index}
          </span>
          {item.label}
        </button>
      ))}

      {attachmentName && (
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-neutrals-silver bg-white p-3">
          <div className="text-[11px] font-semibold text-neutrals-nickel">
            מצורף
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-[30px] flex-none items-center justify-center rounded-md bg-[#FBE9EA] text-hues-red">
              <Icon name="File" size={16} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-neutrals-charcoal">
                {attachmentName}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
