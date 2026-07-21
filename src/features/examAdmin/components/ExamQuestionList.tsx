/**
 * שאלות-המבחן בבונה (design-export/Exam Builder.dc.html שורות 185-238): רשימה
 * נגררת (dnd-kit) עם צ'יפ-מספר, badges, ניקוד-override (stepper אופקי), הסרה,
 * מצב-ריק, וכפתור-הוספה. order_index נגזר מהסדר בעת השמירה (examService).
 */
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge, Button, Icon, IconButton } from '@/components/ui'
import { ExamIcon } from '../icons'
import type { ExamQuestionRow } from '../types'
import { DifficultyBadge, QuestionTypeBadge } from './badges'

interface Props {
  rows: ExamQuestionRow[]
  onReorder: (from: number, to: number) => void
  onRemove: (questionId: string) => void
  onSetPoints: (questionId: string, points: number) => void
  onOpenAdd: () => void
}

function PointsStepper({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-none flex-col items-center gap-1">
      <span className="text-[12px] font-semibold text-neutrals-nickel">ניקוד</span>
      <div className="flex items-center gap-1 rounded-lg bg-neutrals-whisper p-1">
        <IconButton
          variant="white"
          size="sm"
          aria-label="הפחת ניקוד"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          <Icon name="Minus" size={12} />
        </IconButton>
        <span className="w-7 text-center text-small font-semibold text-neutrals-charcoal">
          {value}
        </span>
        <IconButton
          variant="white"
          size="sm"
          aria-label="הוסף ניקוד"
          onClick={() => onChange(value + 1)}
        >
          <Icon name="Plus" size={12} />
        </IconButton>
      </div>
    </div>
  )
}

function SortableExamRow({
  row,
  num,
  onRemove,
  onSetPoints,
}: {
  row: ExamQuestionRow
  num: number
  onRemove: () => void
  onSetPoints: (points: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.question.id })
  const q = row.question

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-3 rounded-2xl border border-neutrals-silver bg-white p-4 shadow-card transition-shadow ${
        isDragging ? 'z-10 opacity-70' : 'hover:border-neutrals-palladium hover:shadow-menu'
      }`}
    >
      <button
        type="button"
        aria-label="גרור לסידור"
        className="mt-1 flex-none cursor-grab text-neutrals-palladium transition-colors hover:text-accent"
        {...attributes}
        {...listeners}
      >
        <ExamIcon name="grip" size={18} />
      </button>
      <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-neutrals-whisper text-small font-semibold text-accent">
        {num}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-body font-semibold leading-snug text-neutrals-charcoal">
          {q.question_text}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <QuestionTypeBadge type={q.question_type} />
          <DifficultyBadge level={q.difficulty_level ?? 'intermediate'} />
          <span className="text-[12px] text-neutrals-nickel">{q.category}</span>
        </div>
      </div>
      <PointsStepper value={row.points} onChange={onSetPoints} />
      <IconButton variant="outline" size="sm" aria-label="הסר מהמבחן" onClick={onRemove}>
        <Icon name="Close" size={16} />
      </IconButton>
    </div>
  )
}

export function ExamQuestionList({
  rows,
  onReorder,
  onRemove,
  onSetPoints,
  onOpenAdd,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = rows.map((r) => r.question.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from !== -1 && to !== -1) onReorder(from, to)
  }

  const totalPoints = rows.reduce((s, r) => s + r.points, 0)

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-h4 font-semibold text-neutrals-charcoal">שאלות המבחן</h2>
          <Badge color="accent">{`${rows.length} שאלות · ${totalPoints} נק׳`}</Badge>
        </div>
        <Button
          variant="primary"
          onClick={onOpenAdd}
          leadingIcon={<Icon name="Plus" size={16} />}
        >
          הוסף שאלות
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-neutrals-palladium bg-white p-12 text-center">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-hues-sky text-accent">
            <ExamIcon name="exam" size={26} />
          </span>
          <div className="text-body font-semibold text-neutrals-charcoal">
            עדיין אין שאלות במבחן
          </div>
          <div className="mt-1 text-small text-neutrals-lead">
            לחצו על "הוסף שאלות" כדי לבחור מהמאגר או ליצור שאלה חדשה.
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <SortableExamRow
                  key={row.question.id}
                  row={row}
                  num={i + 1}
                  onRemove={() => onRemove(row.question.id)}
                  onSetPoints={(points) => onSetPoints(row.question.id, points)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          onClick={onOpenAdd}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-accent bg-white p-4 text-small font-semibold text-accent transition-colors hover:bg-hues-sky"
        >
          <Icon name="Plus" size={18} />
          הוסף עוד שאלות מהמאגר
        </button>
      )}
    </section>
  )
}
