/**
 * לשונית "תסריטים חסרים": מצבי loading/error/success סביב טבלת השיחות החסרות
 * (empty מטופל בתוך MissingScriptsTable). מקבל את תוצאת ה-hook כ-props.
 */
import { Alert, Loader } from '@/components/ui'
import type { useMissingSessions } from '../hooks/useMissingSessions'
import { MissingScriptsTable } from './MissingScriptsTable'

export function MissingPanel({
  missing,
  canEdit,
}: {
  missing: ReturnType<typeof useMissingSessions>
  canEdit: boolean
}) {
  if (missing.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader label="טוען שיחות שירות…" />
      </div>
    )
  }
  if (missing.isError) {
    return (
      <Alert kind="error" title="לא ניתן לטעון את התסריטים החסרים">
        {missing.error instanceof Error
          ? missing.error.message
          : 'אירעה שגיאה בלתי-צפויה.'}
      </Alert>
    )
  }
  return <MissingScriptsTable sessions={missing.sessions} canEdit={canEdit} />
}
