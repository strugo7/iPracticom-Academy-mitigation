/**
 * לשונית "ספריית Playbooks": שורת הפילטרים + הרשת, עם מצבי loading/error/success
 * (empty מטופל בתוך PlaybooksGrid). מקבל את תוצאת ה-hook כ-props — טהור לתצוגה.
 */
import { Alert, Loader } from '@/components/ui'
import type { usePlaybookLibrary } from '../hooks/usePlaybookLibrary'
import { PlaybookFilters } from './PlaybookFilters'
import { PlaybooksGrid } from './PlaybooksGrid'

export function LibraryPanel({
  library,
  canEdit,
  onCreate,
}: {
  library: ReturnType<typeof usePlaybookLibrary>
  canEdit: boolean
  onCreate: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <PlaybookFilters
        filters={library.filters}
        patchFilters={library.patchFilters}
        categoryOptions={library.categoryOptions}
        difficultyOptions={library.difficultyOptions}
        tagOptions={library.tagOptions}
      />
      {library.isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader label="טוען את ספריית ה-Playbooks…" />
        </div>
      ) : library.isError ? (
        <Alert kind="error" title="לא ניתן לטעון את ספריית ה-Playbooks">
          {library.error instanceof Error
            ? library.error.message
            : 'אירעה שגיאה בלתי-צפויה.'}
        </Alert>
      ) : (
        <PlaybooksGrid
          playbooks={library.playbooks}
          total={library.total}
          canEdit={canEdit}
          isFiltering={library.isFiltering}
          onCreate={onCreate}
          onResetFilters={library.resetFilters}
        />
      )}
    </div>
  )
}
