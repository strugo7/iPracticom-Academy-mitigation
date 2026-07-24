/**
 * טופס-המשוב (FlowFeedback) שאחרי solution/end — "האם עזר?" (חובה), דירוג-כוכבים,
 * מצב-רוח-הלקוח, והערות חופשיות (מסמך 07 §4). controlled: value+onChange; ההגשה
 * ב-chrome. עיצוב 1:1 מ-FlowPlayer.dc.html.
 */
import { Textarea } from '@/components/ui'
import { SENTIMENTS } from '../constants'
import type { CustomerSentiment } from '../schemas'
import type { FeedbackDraft } from '../types'
import { PlayerIcon, type PlayerIconName } from './icons'

const MOOD_ICON: Record<CustomerSentiment, PlayerIconName> = {
  angry: 'moodAngry',
  frustrated: 'moodFrown',
  neutral: 'moodMeh',
  positive: 'moodSmile',
}

interface FeedbackFormProps {
  value: FeedbackDraft
  onChange: (next: FeedbackDraft) => void
  /** הודעת-ולידציה (was_helpful חובה) — מוצגת תחת שאלת "האם עזר?". */
  error?: string | null
}

function FieldTitle({ children }: { children: string }) {
  return <div className="mb-2.5 text-[14.5px] font-bold">{children}</div>
}

export function FeedbackForm({ value, onChange, error }: FeedbackFormProps) {
  const set = (patch: Partial<FeedbackDraft>) =>
    onChange({ ...value, ...patch })
  const yes = value.was_helpful === true
  const no = value.was_helpful === false

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="text-center">
        <h1 className="mb-1.5 text-[23px] font-extrabold">איך היה הפתרון?</h1>
        <p className="text-[14px] text-neutrals-lead">
          המשוב שלך עוזר לנו לשפר את ה-Playbooks.
        </p>
      </div>

      <div>
        <FieldTitle>האם ה-Playbook עזר?</FieldTitle>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => set({ was_helpful: true })}
            aria-pressed={yes}
            className="flex flex-1 items-center justify-center gap-2 rounded-[13px] border-[1.5px] py-3.5 text-[15px] font-bold transition"
            style={{
              background: yes ? '#E6F6EF' : '#fff',
              color: yes ? '#178050' : '#3D4753',
              borderColor: yes ? '#22C55E' : '#E3E9F0',
            }}
          >
            <PlayerIcon name="thumbUp" size={18} />
            כן, עזר
          </button>
          <button
            type="button"
            onClick={() => set({ was_helpful: false })}
            aria-pressed={no}
            className="flex flex-1 items-center justify-center gap-2 rounded-[13px] border-[1.5px] py-3.5 text-[15px] font-bold transition"
            style={{
              background: no ? '#FDECEC' : '#fff',
              color: no ? '#C53A3F' : '#3D4753',
              borderColor: no ? '#E5484D' : '#E3E9F0',
            }}
          >
            <PlayerIcon name="thumbDown" size={18} />
            לא ממש
          </button>
        </div>
        {error && (
          <p className="mt-2 text-[12.5px] font-semibold text-caution">
            {error}
          </p>
        )}
      </div>

      <div>
        <FieldTitle>דירוג כללי</FieldTitle>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = value.rating != null && n <= value.rating
            return (
              <button
                key={n}
                type="button"
                onClick={() => set({ rating: n })}
                aria-label={`דירוג ${n}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E3E9F0] transition"
                style={{
                  background: active ? '#FFF8E6' : '#fff',
                  color: active ? '#F5B301' : '#CFD8E3',
                }}
              >
                <PlayerIcon
                  name="star"
                  size={22}
                  fill={active ? '#F5B301' : 'none'}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <FieldTitle>מצב הרוח של הלקוח</FieldTitle>
        <div className="flex gap-2.5">
          {SENTIMENTS.map((mood) => {
            const active = value.customer_sentiment === mood.value
            return (
              <button
                key={mood.value}
                type="button"
                onClick={() => set({ customer_sentiment: mood.value })}
                aria-label={mood.label}
                aria-pressed={active}
                className="flex aspect-square flex-1 items-center justify-center rounded-[14px] border-[1.5px] transition"
                style={{
                  background: active ? `${mood.color}18` : '#fff',
                  borderColor: active ? mood.color : '#E3E9F0',
                  color: active ? mood.color : '#9AA5B1',
                }}
              >
                <PlayerIcon name={MOOD_ICON[mood.value]} size={26} />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <FieldTitle>הערות (אופציונלי)</FieldTitle>
        <Textarea
          rows={3}
          value={value.feedback_text}
          onChange={(e) => set({ feedback_text: e.target.value })}
          placeholder="מה אפשר לשפר? פרטים שעזרו או הפריעו…"
        />
      </div>
    </div>
  )
}
