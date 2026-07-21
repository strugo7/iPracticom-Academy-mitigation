/** 1:1 עם design-export/UserProfile.dc.html (בלוק הסטטיסטיקות — 5 אריחים). */
import { Icon } from '@/components/ui'
import type { ProfileStatTile } from '../types'

export function ProfileStatsBlock({ stats }: { stats: ProfileStatTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((tile) => (
        <div
          key={tile.key}
          className="rounded-2xl bg-white p-5 shadow-card"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-hues-sky text-accent">
            <Icon name={tile.icon} size={19} />
          </div>
          <div className="text-[26px] font-semibold leading-none text-neutrals-charcoal">
            {tile.value}
          </div>
          <div className="mt-2 text-tiny font-semibold text-neutrals-lead">
            {tile.label}
          </div>
        </div>
      ))}
    </div>
  )
}
