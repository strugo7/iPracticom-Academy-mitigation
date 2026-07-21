/**
 * דף הפרופיל האישי — /profile (doc 09). היקף השלב הזה: זהות + מסלול משויך +
 * סטטיסטיקות + רדאר-ביצועים + היסטוריית מבחנים עם drill-down (הדרישה
 * המרכזית). גלריית תעודות/הערות/הגדרות-חשבון מוצגות כקלף "עדיין לא זמין" —
 * הישויות התומכות (UserCertificate/LessonNote) לא קיימות בשכבת הנתונים,
 * וניהול ההגדרות שייך למסמך 16 (ראו constants.ts).
 */
import { Alert, Icon, Loader } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import {
  PROFILE_CERTIFICATES_UNAVAILABLE_MESSAGE,
  PROFILE_NOTES_UNAVAILABLE_MESSAGE,
  PROFILE_SETTINGS_UNAVAILABLE_MESSAGE,
} from '../constants'
import { ExamHistorySection } from '../components/ExamHistorySection'
import { MyTrackCard } from '../components/MyTrackCard'
import { PerformanceRadar } from '../components/PerformanceRadar'
import { ProfileIdentityCard } from '../components/ProfileIdentityCard'
import { ProfileStatsBlock } from '../components/ProfileStatsBlock'
import { UnavailableSectionCard } from '../components/UnavailableSectionCard'
import { useProfilePage } from '../hooks/useProfilePage'

export function ProfilePage() {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useProfilePage(user?.id)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader label="טוען את הפרופיל…" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-8 py-10">
        <Alert kind="error" title="לא ניתן לטעון את הפרופיל">
          <p className="m-0">
            {error instanceof Error ? error.message : 'אירעה שגיאה בטעינת הנתונים.'}
          </p>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-8 py-6">
      <div className="flex justify-end">
        <button
          type="button"
          disabled
          title={PROFILE_SETTINGS_UNAVAILABLE_MESSAGE}
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-[20px] px-6 py-2 text-small font-semibold text-accent opacity-60"
        >
          <Icon name="Settings" size={17} />
          הגדרות חשבון
        </button>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ProfileIdentityCard identity={data.identity} />
        <MyTrackCard track={data.track} />
      </div>

      <ProfileStatsBlock stats={data.stats} />

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_1.25fr]">
        <PerformanceRadar radar={data.radar} />
        <UnavailableSectionCard
          icon="SuccessV"
          title="התעודות שלי"
          message={PROFILE_CERTIFICATES_UNAVAILABLE_MESSAGE}
        />
      </div>

      <ExamHistorySection examHistory={data.examHistory} />

      <UnavailableSectionCard
        icon="StickyNoteLine"
        title="ההערות שלי"
        message={PROFILE_NOTES_UNAVAILABLE_MESSAGE}
      />
    </div>
  )
}
