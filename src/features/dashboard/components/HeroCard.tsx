/**
 * Hero "המשך ללמוד" (docs/02_Dashboard_ClaudeDesign_Brief.md §2) — המסלול
 * המוקצה + טבעת ההתקדמות הכללית. מצב ריק: משתמש בלי assigned_track_id.
 */
import { useNavigate } from 'react-router-dom'
import { Button, Card, Icon } from '@/components/ui'
import { ZeroStates } from '@/components/ui/compounded/ZeroStates'
import { RingProgress } from '@/components/ui/dashboard/RingPie'

interface HeroCardProps {
  trackTitle: string | null
  avgProgress: number
  lessonsRemaining: number
  hasAssignedTrack: boolean
}

export function HeroCard({
  trackTitle,
  avgProgress,
  lessonsRemaining,
  hasAssignedTrack,
}: HeroCardProps) {
  const navigate = useNavigate()

  if (!hasAssignedTrack) {
    return (
      <ZeroStates
        title="טרם שויכת למסלול הכשרה"
        cta="לספריית ההדרכות"
        onCreate={() => navigate('/trainings')}
      />
    )
  }

  return (
    <Card
      padding="lg"
      className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between"
    >
      <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-start">
        <span className="text-tiny-bold text-accent">המסלול שלי</span>
        <h3 className="text-h3 font-semibold text-neutrals-charcoal">
          {trackTitle}
        </h3>
        <p className="text-small text-neutrals-lead">
          {lessonsRemaining > 0
            ? `נשארו ${lessonsRemaining} שיעורים`
            : 'סיימת את כל השיעורים במסלול'}
        </p>
        <Button
          className="mt-2"
          onClick={() => navigate('/trainings')}
          trailingIcon={<Icon name="ChevronLeft" size={18} />}
        >
          המשך ללמוד
        </Button>
      </div>
      <RingProgress value={avgProgress} label={`${avgProgress}%`} size={140} />
    </Card>
  )
}
