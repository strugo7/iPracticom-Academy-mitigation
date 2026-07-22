import { useState } from 'react'
import { Tabs } from '@/components/ui'
import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/** משתמש ברכיב Tabs הקיים של ה-DS AS-IS — הפאנל (תוכן) מנוהל כאן. */
export function TabsBlock({ data }: { data: ParsedBlockDataMap['tabs'] }) {
  const [activeId, setActiveId] = useState(data.tabs[0]?.id ?? '')
  const active = data.tabs.find((t) => t.id === activeId) ?? data.tabs[0]

  if (!active) return null

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        tabs={data.tabs.map((t) => ({ id: t.id, label: t.title }))}
        value={activeId}
        onChange={setActiveId}
      />
      <div>
        {active.image_url && (
          <img
            src={active.image_url}
            alt=""
            className="mb-3 w-full rounded-lg object-cover"
          />
        )}
        <div
          className="text-[15px] text-neutrals-charcoal"
          // מסונן דרך sanitizeRichText (DOMPurify)
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(active.content) }}
        />
      </div>
    </div>
  )
}
