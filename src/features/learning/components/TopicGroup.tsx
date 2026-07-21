/** 1:1 עם design-export/TopicGroup.dc.html. */
import { Icon } from '@/components/ui'
import { LessonRow } from './LessonRow'
import type { TopicViewModel } from '../types'

function topicDurationMinutes(topic: TopicViewModel): number {
  return topic.lessons.reduce(
    (sum, l) => sum + (l.lesson.duration_minutes ?? 0),
    0,
  )
}

export function TopicGroup({
  topic: topicVm,
  trackId,
}: {
  topic: TopicViewModel
  trackId: string
}) {
  const { topic, lessons, exam } = topicVm
  const minutes = topicDurationMinutes(topicVm)

  return (
    <div className="pe-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name="Menu" size={16} className="flex-none text-accent" />
          <h4 className="m-0 text-[15.5px] font-semibold text-neutrals-charcoal">
            {topic.title}
          </h4>
        </div>
        <span className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[12.5px] font-normal text-neutrals-lead">
          <Icon name="Clock" size={13} />
          {minutes} דק׳ · {lessons.length} שיעורים
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {lessons.map((lessonVm) => (
          <LessonRow
            key={lessonVm.lesson.id}
            kind="lesson"
            item={lessonVm}
            trackId={trackId}
          />
        ))}
        {exam && <LessonRow key={exam.id} kind="exam" exam={exam} />}
      </div>
    </div>
  )
}
