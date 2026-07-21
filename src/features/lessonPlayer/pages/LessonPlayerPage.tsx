/**
 * נגן-השיעור — /trainings/:trackId/lessons/:lessonId. v2 בלבד (מסמך 19);
 * שיעורי legacy v1 נופלים ל-LessonNotSupportedScreen. lesson_started נורה
 * עם טעינת השיעור; לחיצה על "סיים שיעור" יוצרת lesson_completed (+ אולי
 * topic/track_completed) ומעבירה למסך סיום (useLessonProgressEvents).
 */
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Loader } from '@/components/ui'
import { usePageHeader } from '@/components/shell'
import { useLessonPlayer } from '../hooks/useLessonPlayer'
import { useLessonProgressEvents } from '../hooks/useLessonProgressEvents'
import { isPlayableLesson } from '../services/lessonPlayerService'
import type { CompleteLessonOutcome } from '../services/progressEvents'
import { ConceptHoverLayer } from '@/features/concepts'
import { BlockRenderer } from '../components/BlockRenderer'
import { LessonCompletionScreen } from './LessonCompletionScreen'
import { LessonNotSupportedScreen } from './LessonNotSupportedScreen'

export function LessonPlayerPage() {
  const { trackId, lessonId } = useParams<{
    trackId: string
    lessonId: string
  }>()
  const { data, isLoading, isError, error } = useLessonPlayer(lessonId)
  const [completion, setCompletion] = useState<CompleteLessonOutcome | null>(
    null,
  )

  const playable = data ? isPlayableLesson(data.lesson) : false
  const { finishLesson } = useLessonProgressEvents(
    trackId as string,
    playable ? data?.lesson : undefined,
  )

  usePageHeader(
    data
      ? {
          title: data.lesson.title ?? '',
          subtitle: 'שיעור',
          backTo: `/trainings/${trackId}`,
          backLabel: 'תוכן ההכשרה',
        }
      : null,
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader label="טוען את השיעור…" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-[1080px] px-8 py-10">
        <Alert kind="error" title="לא ניתן לטעון את השיעור">
          <p className="m-0">
            {error instanceof Error ? error.message : 'השיעור המבוקש לא נמצא.'}
          </p>
          <Link
            to={`/trainings/${trackId}`}
            className="mt-2 inline-block font-semibold text-accent hover:underline"
          >
            לחזרה לתוכן ההכשרה
          </Link>
        </Alert>
      </div>
    )
  }

  if (!playable) {
    return <LessonNotSupportedScreen trackId={trackId as string} />
  }

  if (completion) {
    return (
      <LessonCompletionScreen
        trackId={trackId as string}
        xpReward={data.lesson.xp_reward ?? 10}
        topicCompleted={completion.topicCompleted}
        trackCompleted={completion.trackCompleted}
      />
    )
  }

  const blocks = (data.lesson.blocks ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)

  async function handleFinish() {
    const outcome = await finishLesson()
    setCompletion(outcome ?? { topicCompleted: false, trackCompleted: false })
  }

  return (
    // ConceptHoverLayer: הופך את סימוני-המונח בתוכן ל-tooltip + ניווט (§Concept)
    <ConceptHoverLayer>
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 px-8 py-8">
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
          <button
          type="button"
          onClick={handleFinish}
          className="mt-4 self-center rounded-lg bg-accent px-6 py-3 font-semibold text-white shadow-[0_6px_14px_rgba(0,117,219,0.24)]"
        >
          סיים שיעור
        </button>
      </div>
    </ConceptHoverLayer>
  )
}
