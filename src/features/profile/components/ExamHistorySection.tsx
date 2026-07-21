/**
 * היסטוריית מבחנים עם drill-down (doc 09 §3.6 — הדרישה המרכזית של השלב).
 * 1:1 עם design-export/UserProfile.dc.html (EXAM HISTORY). מצב-פתיחה מקומי
 * לקומפוננטה — לא ב-view-model (לא לוגיקה עסקית, רק UI state).
 */
import { useState } from 'react'
import { Badge, Icon } from '@/components/ui'
import type { ExamHistoryEntry } from '../types'
import { ExamAttemptDetail } from './ExamAttemptDetail'

function ExamAttemptRow({ entry }: { entry: ExamHistoryEntry }) {
  const [open, setOpen] = useState(false)
  const hasDetail = entry.questions.length > 0

  return (
    <div
      className={`overflow-hidden rounded-lg border ${
        open ? 'border-accent bg-neutrals-whisper' : 'border-neutrals-silver bg-white'
      }`}
    >
      <button
        type="button"
        onClick={() => hasDetail && setOpen((v) => !v)}
        disabled={!hasDetail}
        title={hasDetail ? undefined : 'אין פירוט שאלות שמור לניסיון זה'}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-start disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span
          className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md ${
            entry.passed ? 'bg-hues-mint text-success' : 'bg-hues-salmon/60 text-caution'
          }`}
        >
          <Icon name={entry.passed ? 'Check' : 'Close'} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-small font-semibold text-neutrals-charcoal">
            {entry.title}
          </div>
          <div className="text-[12.5px] text-neutrals-lead">
            {entry.submittedAtLabel} · {entry.questionCount} שאלות
          </div>
        </div>
        <span
          className={`text-[18px] font-semibold ${entry.passed ? 'text-success' : 'text-caution'}`}
        >
          {entry.scorePercent}%
        </span>
        <Badge color={entry.passed ? 'success' : 'caution'}>
          {entry.passed ? 'עבר' : 'נכשל'}
        </Badge>
        {hasDetail && (
          <span
            className={`shrink-0 text-neutrals-nickel transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <Icon name="ChevronDown" size={18} />
          </span>
        )}
      </button>
      {open && hasDetail && <ExamAttemptDetail questions={entry.questions} />}
    </div>
  )
}

export function ExamHistorySection({
  examHistory,
}: {
  examHistory: ExamHistoryEntry[]
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-1 flex items-center gap-2">
        <Icon name="File" size={18} className="text-accent" />
        <div className="text-small font-semibold text-neutrals-charcoal">
          היסטוריית מבחנים
        </div>
      </div>
      <div className="mb-4 text-tiny text-neutrals-lead">
        לחץ על מבחן כדי לראות את הפירוט וללמוד מהטעויות
      </div>

      {examHistory.length === 0 ? (
        <p className="m-0 text-tiny text-neutrals-lead">
          עדיין לא הגשת אף מבחן.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {examHistory.map((entry) => (
            <ExamAttemptRow key={entry.attemptId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
