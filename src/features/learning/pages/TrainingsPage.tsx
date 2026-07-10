/** דף "ההכשרות שלי" — /trainings. loading/error/success; empty מטופל בתוך TracksCatalog. */
import { useAuth } from '@/lib/auth'
import { Alert, Loader } from '@/components/ui'
import { useTrackCatalog } from '../hooks/useTrackCatalog'
import { TracksCatalog } from '../components/TracksCatalog'

export function TrainingsPage() {
  const { user } = useAuth()
  const { items, isLoading, isError, error } = useTrackCatalog(user?.id)

  return (
    <div className="mx-auto w-full max-w-[1240px] px-9 py-8">
      {isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader label="טוען את ההכשרות שלך…" />
        </div>
      )}
      {!isLoading && isError && (
        <Alert kind="error" title="לא ניתן לטעון את ההכשרות">
          {error instanceof Error ? error.message : 'אירעה שגיאה בלתי-צפויה.'}
        </Alert>
      )}
      {!isLoading && !isError && <TracksCatalog items={items} />}
    </div>
  )
}
