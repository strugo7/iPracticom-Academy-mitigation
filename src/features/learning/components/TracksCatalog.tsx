/** 1:1 עם design-export/TracksCatalog.dc.html. */
import { useNavigate } from 'react-router-dom'
import { ZeroStates } from '@/components/ui'
import { TrackCard } from './TrackCard'
import type { TrackCatalogItem } from '../types'

export function TracksCatalog({ items }: { items: TrackCatalogItem[] }) {
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <ZeroStates
        title="עדיין לא שויכת למסלול הכשרה"
        cta="לספריית הידע"
        // אין עדיין דף-עיון בספריית הידע (KMS) — מפנה ל-/help, הנתיב הקיים
        // הקרוב ביותר, במקום קישור-מת.
        onCreate={() => navigate('/help')}
      />
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,360px))] justify-start gap-6">
      {items.map((item) => (
        <TrackCard key={item.track.id} item={item} />
      ))}
    </div>
  )
}
