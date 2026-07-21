/**
 * כפתור "העלה מדיה" — פותח בורר-קבצים (ריבוי קבצים) ומדווח דרך onFiles.
 * שדה-הקובץ יושב לצד הכפתור (לא בתוכו — קינון interactive אינו HTML תקין).
 */
import { useRef } from 'react'
import { Button, Icon } from '@/components/ui'
import { UPLOAD_ACCEPT_ATTR } from '../constants'

interface UploadButtonProps {
  onFiles: (files: File[]) => void
  isBusy: boolean
}

export function UploadButton({ onFiles, isBusy }: UploadButtonProps) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button
        variant="primary"
        disabled={isBusy}
        onClick={() => ref.current?.click()}
        leadingIcon={<Icon name="Upload" size={16} />}
      >
        העלה מדיה
      </Button>
      <input
        ref={ref}
        type="file"
        multiple
        accept={UPLOAD_ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : []
          e.target.value = ''
          if (files.length) onFiles(files)
        }}
      />
    </>
  )
}
