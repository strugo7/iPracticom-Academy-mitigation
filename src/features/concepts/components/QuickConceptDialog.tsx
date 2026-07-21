/**
 * יצירת-מונח מהירה מתוך עורך-השיעור (החלטת-UX: דיאלוג inline, לא האשף המלא) —
 * המינימום ל-hover: מונח + תיאור-קצר + קטגוריה (חובה לפי SRS §1.9; ה-full_
 * description מקבל ברירת-מחדל מהתיאור הקצר וניתן להעשרה אחר-כך באשף המלא).
 * המונח נשמר כטיוטה; המילה שסומנה מוזנת כברירת-מחדל לשם-המונח.
 */
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Dialog,
  FieldLabel,
  SelectField,
  Textarea,
} from '@/components/ui'
import { apiClient } from '@/lib/api'
import { CONCEPT_CATEGORIES } from '@/lib/constants/enums'
import type { Concept } from '@/types/entities'
import { DEFAULT_CATEGORY, SHORT_DESCRIPTION_MAX } from '../constants'
import { emptyDraft } from '../services/conceptForm'
import { createConcept } from '../services/conceptService'
import { conceptsQueryKey } from '../hooks/useConceptGallery'

interface QuickConceptDialogProps {
  open: boolean
  /** המילה שסומנה בעורך — שם-המונח ההתחלתי. */
  initialTerm: string
  onClose: () => void
  onCreated: (concept: Concept) => void
}

export function QuickConceptDialog({
  open,
  initialTerm,
  onClose,
  onCreated,
}: QuickConceptDialogProps) {
  const queryClient = useQueryClient()
  const [term, setTerm] = useState(initialTerm)
  const [shortDescription, setShortDescription] = useState('')
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORY)
  const [error, setError] = useState<string | null>(null)

  // איפוס לערכי-הפתיחה בכל פתיחה מחדש (initialTerm משתנה לפי המילה שסומנה)
  const [seedTerm, setSeedTerm] = useState(initialTerm)
  if (open && seedTerm !== initialTerm) {
    setSeedTerm(initialTerm)
    setTerm(initialTerm)
    setShortDescription('')
    setCategory(DEFAULT_CATEGORY)
    setError(null)
  }

  const create = useMutation({
    mutationFn: () => {
      const short = shortDescription.trim()
      return createConcept(apiClient, {
        ...emptyDraft(),
        term: term.trim(),
        short_description: short,
        // full_description חובה ב-SRS — ממלאים מהתיאור הקצר, להעשרה באשף
        full_description: `<p>${short}</p>`,
        category,
      })
    },
    onSuccess: async (concept) => {
      await queryClient.invalidateQueries({ queryKey: conceptsQueryKey })
      onCreated(concept)
    },
    onError: () => setError('היצירה נכשלה. נסו שוב.'),
  })

  const submit = () => {
    if (!term.trim()) {
      setError('חובה להזין מונח.')
      return
    }
    if (!shortDescription.trim()) {
      setError('חובה להזין תיאור קצר — הוא מה שיוצג ב-hover.')
      return
    }
    create.mutate()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="מונח חדש"
      size="md"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            ביטול
          </Button>
          <Button variant="primary" onClick={submit} disabled={create.isPending}>
            {create.isPending ? 'יוצר…' : 'צור וסמן'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-small text-neutrals-lead">
          יצירה מהירה למונח שסומן בשיעור. אפשר להשלים הסבר מלא, דוגמאות וקישורים
          מאוחר יותר בעורך המונחים.
        </p>

        <div>
          <FieldLabel>מונח *</FieldLabel>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            dir="auto"
            className="h-11 w-full rounded-lg border border-neutrals-silver bg-white px-3 text-start text-body font-semibold text-neutrals-charcoal outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <FieldLabel hint="· מוצג ב-hover">תיאור קצר *</FieldLabel>
          <Textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            maxLength={SHORT_DESCRIPTION_MAX}
            rows={3}
            placeholder="משפט אחד שמסביר את המונח בקצרה…"
          />
        </div>

        <div>
          <FieldLabel>קטגוריה *</FieldLabel>
          <SelectField
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CONCEPT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
        </div>

        {error && <p className="text-[13px] text-caution">{error}</p>}
      </div>
    </Dialog>
  )
}
