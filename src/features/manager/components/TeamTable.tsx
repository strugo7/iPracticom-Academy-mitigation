/** טבלת צוות המחלקה, מיון-לחיצה-על-כותרת (doc 10 §4.5). */
import { useState } from 'react'
import { Badge, Icon, ProgressBar } from '@/components/ui'
import {
  sortTeamRows,
  type TeamSortDir,
  type TeamSortKey,
} from '../services/managerDashboardService'
import type { MemberStatus, TeamMemberRow } from '../types'

const STATUS_BADGE: Record<
  MemberStatus,
  { color: 'success' | 'accent' | 'caution'; label: string }
> = {
  done: { color: 'success', label: 'הושלם' },
  active: { color: 'accent', label: 'פעיל' },
  risk: { color: 'caution', label: 'בסיכון' },
}

const COLUMNS: { key: TeamSortKey; label: string; defaultDir: TeamSortDir }[] = [
  { key: 'name', label: 'עובד', defaultDir: 'asc' },
  { key: 'track', label: 'מסלול מוקצה', defaultDir: 'asc' },
  { key: 'progress', label: 'התקדמות', defaultDir: 'desc' },
  { key: 'score', label: 'ציון ממוצע', defaultDir: 'desc' },
  { key: 'last', label: 'פעילות אחרונה', defaultDir: 'asc' },
  { key: 'status', label: 'סטטוס', defaultDir: 'asc' },
]

interface TeamTableProps {
  rows: TeamMemberRow[]
  onSelectEmployee: (userId: string) => void
}

export function TeamTable({ rows, onSelectEmployee }: TeamTableProps) {
  const [sortKey, setSortKey] = useState<TeamSortKey>('progress')
  const [sortDir, setSortDir] = useState<TeamSortDir>('desc')

  const sorted = sortTeamRows(rows, sortKey, sortDir)

  const toggleSort = (key: TeamSortKey, defaultDir: TeamSortDir) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(defaultDir)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon name="User" size={19} className="text-accent" />
          <h3 className="text-small font-semibold text-neutrals-charcoal">
            צוות המחלקה
          </h3>
        </div>
        <span className="text-tiny text-neutrals-lead">
          לחיצה על שורה — פרופיל מלא של העובד
        </span>
      </div>
      <p className="mb-4 text-tiny text-neutrals-nickel">
        מיון: לחיצה על כותרת עמודה
      </p>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-small text-neutrals-lead">
          אין עדיין עובדים משויכים למחלקה זו.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-neutrals-silver">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key, col.defaultDir)}
                    className="cursor-pointer select-none whitespace-nowrap px-3 py-2 text-start text-tiny font-semibold text-neutrals-lead"
                  >
                    {col.label}{' '}
                    <span className="text-accent">
                      {sortKey === col.key ? (sortDir === 'desc' ? '▼' : '▲') : ''}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.userId}
                  onClick={() => onSelectEmployee(row.userId)}
                  className="cursor-pointer border-b border-neutrals-silver transition-colors hover:bg-neutrals-whisper"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-gradient text-[14px] font-semibold text-white">
                        {row.initial}
                      </span>
                      <span className="whitespace-nowrap text-small font-semibold text-neutrals-charcoal">
                        {row.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-small text-neutrals-charcoal">
                    {row.trackTitle ?? '—'}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        percent={row.progress}
                        done={row.status === 'done'}
                        className="min-w-20 flex-1"
                      />
                      <span className="w-10 flex-none text-small font-semibold text-neutrals-charcoal">
                        {row.progress}%
                      </span>
                    </div>
                  </td>
                  <td
                    className={`px-3 py-4 text-small font-semibold ${
                      !row.hasExamAttempt
                        ? 'text-neutrals-lead'
                        : row.avgScore >= 85
                          ? 'text-success'
                          : row.avgScore >= 70
                            ? 'text-neutrals-charcoal'
                            : 'text-caution'
                    }`}
                  >
                    {row.hasExamAttempt ? row.avgScore : '—'}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-4 text-tiny ${
                      row.lastActivityDays !== null && row.lastActivityDays >= 10
                        ? 'text-caution'
                        : 'text-neutrals-charcoal'
                    }`}
                  >
                    {row.lastActivityLabel}
                  </td>
                  <td className="px-3 py-4">
                    <Badge color={STATUS_BADGE[row.status].color}>
                      {STATUS_BADGE[row.status].label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
