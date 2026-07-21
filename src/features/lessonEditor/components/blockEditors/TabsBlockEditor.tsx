/**
 * עורך טאבים (שלב 6.4, מסמך 21 §3) — תצוגת-לומד חיה (TabsBlock של הנגן, מחליף
 * תוכן בלחיצה) מעל אזור-עריכה: שורה לכל לשונית עם כותרת ותוכן, הוסף/מחק/סדר
 * בגרירה. הכותרת טקסט-נקי (label של רכיב Tabs) → PlainInline; התוכן מרונדר
 * כ-HTML בנגן (sanitizeRichText) → RichTextField. image_url נשמר אך אינו נחשף
 * בעורך (תואם design-export/Lesson Editor.dc.html, שורות 465-492).
 */
import { TabsBlock } from '@/components/blocks/interactive/TabsBlock'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'
import { PlainInline } from '../../richtext/PlainInline'
import { RichTextField } from '../../richtext/RichTextField'
import { STRINGS } from '../../constants'
import { EditorIcon } from '../../editorIcons'
import {
  addTab,
  moveItem,
  readTabs,
  removeTab,
  setTabField,
} from '../../services/interactiveBlockOps'
import type { BlockEditorProps } from './types'
import { AddItemButton, ChromeHeader, SortableList, SortableRow } from './SortableRows'

export function TabsBlockEditor({ data, onChange }: BlockEditorProps) {
  const tabs = readTabs(data)
  const commit = (next: ReturnType<typeof readTabs>) => onChange({ tabs: next })

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {tabs.length > 0 && (
        <TabsBlock data={{ tabs } as ParsedBlockDataMap['tabs']} />
      )}

      <div className="border-t border-dashed border-neutrals-silver pt-4">
        <ChromeHeader
          icon={<EditorIcon name="tabs" size={15} />}
          label={STRINGS.tabsEditTitle}
        />

        {tabs.length === 0 ? (
          <p className="mb-3 text-[13px] text-neutrals-nickel">{STRINGS.tabsEmpty}</p>
        ) : (
          <SortableList
            ids={tabs.map((t) => t.id)}
            onReorder={(from, to) => commit(moveItem(tabs, from, to))}
          >
            {tabs.map((tab, i) => (
              <SortableRow
                key={tab.id}
                id={tab.id}
                num={i + 1}
                chipClass="bg-hues-yellow/20 text-hues-bronze"
                dragLabel={STRINGS.tabReorder}
                removeLabel={STRINGS.tabsRemoveTab}
                onRemove={() => commit(removeTab(tabs, i))}
              >
                <div className="flex flex-col gap-2">
                  <PlainInline
                    value={tab.title}
                    onChange={(v) => commit(setTabField(tabs, i, 'title', v))}
                    placeholder={STRINGS.tabTitlePlaceholder}
                    ariaLabel={`${STRINGS.tabNumber(i + 1)} — ${STRINGS.tabTitlePlaceholder}`}
                    className="rounded-[9px] border border-neutrals-silver bg-white px-2.5 py-2 text-[14px] font-semibold text-neutrals-charcoal"
                  />
                  <div className="rounded-[9px] border border-neutrals-silver bg-white px-2.5 py-2 text-[13.5px] leading-relaxed text-neutrals-lead">
                    <RichTextField
                      value={tab.content}
                      onChange={(v) => commit(setTabField(tabs, i, 'content', v))}
                      placeholder={STRINGS.tabContentPlaceholder}
                      ariaLabel={`${STRINGS.tabNumber(i + 1)} — ${STRINGS.tabContentPlaceholder}`}
                    />
                  </div>
                </div>
              </SortableRow>
            ))}
          </SortableList>
        )}

        <AddItemButton
          label={STRINGS.tabsAddTab}
          onClick={() => commit(addTab(tabs, STRINGS.newTabTitle))}
        />
      </div>
    </div>
  )
}
