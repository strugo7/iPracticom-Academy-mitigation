/**
 * צפייה בנוהל + קרא-וחתום — /policies/:procedureId (design-export/Policy
 * Viewer.dc.html). מסך-מלא ממוקד (כמו נגן/עורך): פס-קריאה, כותרת עם ברדקרמב
 * וסטטוס, מסמך-נייר עם תוכן-עניינים, וסרגל-אישור דביק. שער-הקריאה (reachedEnd)
 * נגזר מגלילה; החתימה דרך usePolicyAcknowledgement. RLS: read `{}` — כל מאומת.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Icon, IconButton, Loader } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { usePolicy } from '../hooks/usePolicy'
import { usePolicyAcknowledgement } from '../hooks/usePolicyAcknowledgement'
import { buildToc, sortedBlocks } from '../services/policyViewerService'
import { AcknowledgeBar } from '../components/viewer/AcknowledgeBar'
import { PolicyDocument } from '../components/viewer/PolicyDocument'
import { PolicyTOC } from '../components/viewer/PolicyTOC'
import { ReadingProgressBar } from '../components/viewer/ReadingProgressBar'

/** אחוז-גלילה שממנו ואילך המסמך נחשב "נקרא עד הסוף". */
const READ_END_RATIO = 0.985

export function PolicyViewerPage() {
  const { procedureId } = useParams<{ procedureId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isLoading, isError, notFound, procedure, refetch } =
    usePolicy(procedureId)
  const { acknowledgement, isSigned, sign } =
    usePolicyAcknowledgement(procedureId)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [reachedEnd, setReachedEnd] = useState(false)

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const scrollable = el.scrollHeight - el.clientHeight
    // מסמך שאינו נגלל (קצר / קובץ) — נחשב נקרא מיד.
    if (scrollable <= 4) {
      setProgress(100)
      setReachedEnd(true)
      return
    }
    const ratio = el.scrollTop / scrollable
    setProgress(Math.round(ratio * 1000) / 10)
    if (ratio >= READ_END_RATIO) setReachedEnd(true)
  }, [])

  // מדידה ראשונית אחרי שהתוכן נטען (מסמך קצר → reachedEnd מיד).
  useEffect(() => {
    if (procedure) onScroll()
  }, [procedure, onScroll])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper">
        <Loader />
      </div>
    )
  }

  if (isError || notFound || !procedure) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper p-6">
        <div className="w-full max-w-md">
          <Alert kind="error" title="הנוהל לא נמצא">
            <div className="flex items-center gap-3">
              <span>לא הצלחנו לטעון את הנוהל המבוקש.</span>
              <Button variant="outlined" onClick={() => refetch()}>
                נסה שוב
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    )
  }

  const hasBlocks = sortedBlocks(procedure.blocks).length > 0
  const toc = buildToc(sortedBlocks(procedure.blocks))
  const signerName = user?.full_name ?? 'משתמש'
  const signerRole = user?.department ?? ''

  return (
    <div className="relative flex h-svh flex-col bg-neutrals-whisper">
      <ReadingProgressBar percent={progress} />

      {/* top bar */}
      <header className="z-40 flex-none border-b border-neutrals-silver bg-white">
        <div className="flex items-center justify-between gap-3.5 px-6 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <IconButton
              variant="outline"
              size="md"
              aria-label="חזרה"
              onClick={() => navigate(-1)}
            >
              <Icon name="ChevronRight" size={19} />
            </IconButton>
            <div className="flex min-w-0 items-center gap-1.5 text-[13px] text-neutrals-nickel">
              <span>נהלים</span>
              <Icon
                name="ChevronLeft"
                size={14}
                className="text-neutrals-palladium"
              />
              <span className="truncate font-semibold text-neutrals-slate">
                {procedure.title}
              </span>
            </div>
          </div>
          <div className="flex flex-none items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
                isSigned
                  ? 'bg-hues-mint text-hues-teal'
                  : 'bg-hues-yellow/30 text-[#8A6E00]'
              }`}
            >
              <Icon name={isSigned ? 'Check' : 'Clock'} size={13} />
              {isSigned ? 'נחתם' : 'ממתין לאישור'}
            </span>
            <Button
              variant="white"
              leadingIcon={<Icon name="Export" size={15} />}
              onClick={() => window.print()}
            >
              הדפסה
            </Button>
          </div>
        </div>
      </header>

      {/* scroll area */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div
          data-tutorial="policy-viewer-content"
          className="mx-auto flex max-w-[1080px] items-start gap-7 px-7 pb-[150px] pt-8"
        >
          {hasBlocks && (
            <div className="hidden lg:block">
              <PolicyTOC items={toc} attachmentName={null} />
            </div>
          )}
          <PolicyDocument procedure={procedure} />
        </div>
      </div>

      {procedure.requires_acknowledgement && (
        <div data-tutorial="policy-acknowledge-bar">
          <AcknowledgeBar
            policyTitle={procedure.title}
            reachedEnd={reachedEnd}
            isSigned={isSigned}
            acknowledgement={acknowledgement}
            signerName={signerName}
            signerRole={signerRole}
            isSigning={sign.isPending}
            onSign={() => sign.mutate()}
            onFinish={() => navigate(-1)}
          />
        </div>
      )}
    </div>
  )
}
