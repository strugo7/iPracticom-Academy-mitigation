/**
 * דף תוכן ההכשרה — /trainings/:trackId. קורא ל-usePageHeader עם שם המסלול
 * האמיתי + קישור-חזרה, ברגע שהמסלול נטען (null בזמן טעינה — TopBar נופל
 * חזרה לכותרת הסטטית "ההכשרות שלי" עד אז).
 */
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Alert, Icon, Loader } from '@/components/ui'
import { usePageHeader } from '@/components/shell'
import { useTrackDetails } from '../hooks/useTrackDetails'
import { TrackProgressHeader } from '../components/TrackProgressHeader'
import { ModuleSection } from '../components/ModuleSection'

export function TrackDetailsPage() {
  const { trackId } = useParams<{ trackId: string }>()
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useTrackDetails(trackId, user?.id)

  usePageHeader(
    data
      ? {
          title: data.track.title ?? '',
          subtitle: 'תוכן ההכשרה',
          backTo: '/trainings',
          backLabel: 'ההכשרות שלי',
        }
      : null,
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader label="טוען את תוכן ההכשרה…" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-[1080px] px-8 py-10">
        <Alert kind="error" title="לא ניתן לטעון את המסלול">
          <p className="m-0">
            {error instanceof Error ? error.message : 'המסלול המבוקש לא נמצא.'}
          </p>
          <Link
            to="/trainings"
            className="mt-2 inline-block font-semibold text-accent hover:underline"
          >
            לחזרה לקטלוג ההכשרות
          </Link>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-8 py-6">
      <TrackProgressHeader viewModel={data} />
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-h4 font-semibold text-neutrals-charcoal">
          <Icon name="Menu" size={20} className="text-accent" />
          תוכן ההכשרה
        </h3>
        <div className="flex flex-col gap-4">
          {data.modules.map((m) => (
            <ModuleSection key={m.module.id} module={m} />
          ))}
        </div>
      </div>
    </div>
  )
}
