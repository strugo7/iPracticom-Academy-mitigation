/** 1:1 עם design-export/ModuleSection.dc.html — accordion, פתוח כברירת-מחדל כשזה המודול הנוכחי. */
import { useState } from 'react'
import { Icon } from '@/components/ui'
import { TopicGroup } from './TopicGroup'
import type { ModuleViewModel } from '../types'

export function ModuleSection({
  module: moduleVm,
}: {
  module: ModuleViewModel
}) {
  const { module, moduleNumber, topics, lessonsDone, lessonsTotal, isCurrent } =
    moduleVm
  const [open, setOpen] = useState(isCurrent)
  const done = lessonsTotal > 0 && lessonsDone >= lessonsTotal
  const percent =
    lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-6 text-start transition-colors hover:bg-neutrals-whisper"
      >
        <div
          className={`flex h-12 w-12 flex-none items-center justify-center [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] ${
            done ? 'bg-hues-mint text-success' : 'bg-hues-sky text-accent'
          }`}
        >
          {done ? (
            <Icon name="Check" size={22} />
          ) : (
            <span className="text-[18px] font-semibold">{moduleNumber}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-[19px] font-semibold text-neutrals-charcoal">
              {module.title}
            </h3>
            {module.estimated_duration != null && (
              <span className="text-[12.5px] font-normal text-neutrals-lead">
                · כ-{module.estimated_duration} דק׳
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <span className="text-[13px] text-neutrals-lead">
              {topics.length} נושאים · {lessonsTotal} שיעורים
            </span>
            <div className="flex min-w-[160px] max-w-[280px] flex-1 items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-hues-sky">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${done ? 'bg-success' : 'bg-accent-gradient'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span
                className={`whitespace-nowrap text-[12.5px] font-semibold ${done ? 'text-success' : 'text-accent'}`}
              >
                {lessonsDone}/{lessonsTotal}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-neutrals-whisper text-neutrals-lead transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
        >
          <Icon name="ChevronDown" size={20} />
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-6 border-t border-neutrals-silver px-6 pb-6 pt-2">
          {topics.map((topicVm) => (
            <TopicGroup key={topicVm.topic.id} topic={topicVm} />
          ))}
        </div>
      )}
    </section>
  )
}
