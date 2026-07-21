/**
 * טבלת מובילים (docs/02_Dashboard_ClaudeDesign_Brief.md §5) — Top-N לפי XP,
 * עם הדגשת שורת המשתמש הנוכחי (#2EB4FF עדין, לפי פרומפט האיטרציה במסמך).
 */
import { Card } from '@/components/ui'
import type { LeaderboardEntry } from '@/lib/services/leaderboardService'

interface LeaderboardCardProps {
  top: LeaderboardEntry[]
  currentUserId: string
  currentUserEntry: LeaderboardEntry | undefined
}

function LeaderboardRow({
  entry,
  highlighted,
}: {
  entry: LeaderboardEntry
  highlighted: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
        highlighted ? 'bg-hues-indigo/10' : ''
      }`}
    >
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-neutrals-whisper text-tiny-bold text-neutrals-lead">
        {entry.rank}
      </span>
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent-gradient text-tiny-bold text-white">
        {entry.full_name.charAt(0)}
      </span>
      <span className="min-w-0 flex-1 truncate text-small text-neutrals-charcoal">
        {entry.full_name}
      </span>
      <span className="flex-none text-tiny-bold text-accent">
        {entry.total_xp} XP
      </span>
    </div>
  )
}

export function LeaderboardCard({
  top,
  currentUserId,
  currentUserEntry,
}: LeaderboardCardProps) {
  const currentUserInTop = top.some((e) => e.user_id === currentUserId)

  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <h3 className="text-h4 font-semibold text-neutrals-charcoal">
        טבלת מובילים
      </h3>
      <div className="flex flex-col gap-1">
        {top.map((entry) => (
          <LeaderboardRow
            key={entry.user_id}
            entry={entry}
            highlighted={entry.user_id === currentUserId}
          />
        ))}
      </div>
      {!currentUserInTop && currentUserEntry && (
        <>
          <div className="border-t border-neutrals-silver" />
          <LeaderboardRow entry={currentUserEntry} highlighted />
        </>
      )}
    </Card>
  )
}
