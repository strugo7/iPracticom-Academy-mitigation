/**
 * פאנל ההגדרות (ContentManager, doc 12) — צד שמאל (RTL): breadcrumb + כותרת
 * הפריט הנבחר, שכפל/מחק, אזהרת מודול-משותף, CTA לעורך השיעורים, כרטיס הפרטים
 * (NodeSettingsForm) ו-save-bar. מנהל draft מקומי + ולידציית zod לפני שמירה.
 */
import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Icon } from '@/components/ui'
import type { ContentStatus } from '@/lib/constants/enums'
import { TYPE_META } from '../constants'
import { nodeEditSchema } from '../schemas'
import { nodeMetaRows } from '../services/nodeSettings'
import type { ContentNode, LessonNode } from '../types'
import { NodeTypeIcon } from './nodeVisuals'
import { NodeSettingsForm, type SettingsDraft } from './NodeSettingsForm'

function statusOf(node: ContentNode): ContentStatus {
  const raw =
    node.kind === 'track'
      ? node.track.status
      : node.kind === 'module'
        ? node.module.status
        : node.kind === 'topic'
          ? node.topic.status
          : node.lesson.status
  return raw && raw !== 'deleted' ? raw : 'draft'
}

function descriptionOf(node: ContentNode): string {
  switch (node.kind) {
    case 'track':
      return node.track.description ?? ''
    case 'module':
      return node.module.description ?? ''
    case 'topic':
      return node.topic.description ?? ''
    case 'lesson':
      return node.lesson.introduction_text ?? ''
  }
}

function draftFromNode(node: ContentNode): SettingsDraft {
  return {
    title: node.title === 'ללא כותרת' ? '' : node.title,
    description: descriptionOf(node),
    status: statusOf(node),
    difficulty:
      node.kind === 'track'
        ? (node.track.difficulty_level ?? 'beginner')
        : 'beginner',
  }
}

export function NodeSettingsPanel({
  node,
  breadcrumb,
  onSave,
  onDuplicate,
  onDelete,
  onEditLesson,
  isSaving,
  saveError,
}: {
  node: ContentNode
  breadcrumb: string
  onSave: (node: ContentNode, input: SettingsDraft) => Promise<void>
  onDuplicate: (node: ContentNode) => void
  onDelete: (node: ContentNode) => void
  onEditLesson: (node: LessonNode) => void
  isSaving: boolean
  saveError: string | null
}) {
  const initial = useMemo(() => draftFromNode(node), [node])
  const [draft, setDraft] = useState<SettingsDraft>(initial)
  const [validationError, setValidationError] = useState<string | null>(null)

  // איפוס ה-draft כשמחליפים node נבחר (או כשהעץ נטען-מחדש אחרי שמירה)
  useEffect(() => {
    setDraft(initial)
    setValidationError(null)
  }, [initial])

  const type = TYPE_META[node.kind]
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

  const handleChange = (patch: Partial<SettingsDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
    setValidationError(null)
  }

  const handleSave = async () => {
    const parsed = nodeEditSchema.safeParse({
      title: draft.title,
      description: draft.description || undefined,
      status: draft.status,
      difficulty: node.kind === 'track' ? draft.difficulty : undefined,
    })
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'קלט לא תקין')
      return
    }
    await onSave(node, draft)
  }

  return (
    <section
      aria-label="הגדרות הפריט הנבחר"
      className="min-w-0 flex-1 overflow-y-auto p-8"
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
        {/* selected header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {breadcrumb && (
              <div className="mb-2 text-[12.5px] font-semibold text-neutrals-nickel">
                {breadcrumb}
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-hues-sky text-accent">
                <NodeTypeIcon kind={node.kind} size={20} />
              </span>
              <div>
                <h2 className="m-0 text-h4 font-semibold leading-tight text-neutrals-charcoal">
                  {node.title}
                </h2>
                <span className="text-[13px] text-neutrals-lead">
                  {type.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="white"
              leadingIcon={<Icon name="Duplicate" size={16} />}
              onClick={() => onDuplicate(node)}
            >
              שכפל
            </Button>
            <Button
              variant="red"
              leadingIcon={<Icon name="RemoveCircle" size={16} />}
              onClick={() => onDelete(node)}
            >
              מחק
            </Button>
          </div>
        </div>

        {/* shared-module warning */}
        {node.kind === 'module' && node.sharedCount > 1 && (
          <div className="flex items-center gap-3 rounded-xl border border-hues-indigo bg-hues-sky px-4 py-3">
            <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-white text-accent">
              <Icon name="Warning" size={18} />
            </span>
            <div className="flex-1">
              <div className="text-tiny-bold text-hues-cobalt">מודול משותף</div>
              <div className="text-[13px] text-neutrals-lead">
                עריכה תשפיע על <strong>{node.sharedCount} מסלולים</strong> שמשתמשים
                במודול זה.
              </div>
            </div>
          </div>
        )}

        {/* lesson → editor CTA (עורך השיעורים — שלב 6.2) */}
        {node.kind === 'lesson' && (
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-[linear-gradient(120deg,#181D24_0%,#1d3a55_100%)] px-6 py-5 shadow-card">
            <div className="flex items-center gap-3.5">
              <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-xl bg-[rgba(46,180,255,0.18)] text-hues-indigo">
                <Icon name="Play" size={22} />
              </span>
              <div>
                <div className="text-base font-semibold text-white">
                  עריכת תוכן השיעור
                </div>
                <div className="mt-0.5 text-[13px] text-[#AEB9C6]">
                  פתיחת עורך השיעורים — וידאו, שקופיות ובחנים
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              trailingIcon={<Icon name="ArrowWest" size={17} />}
              onClick={() => onEditLesson(node)}
            >
              ערוך תוכן
            </Button>
          </div>
        )}

        {saveError && <Alert kind="error" title="שמירה נכשלה">{saveError}</Alert>}
        {validationError && (
          <Alert kind="warning" title="קלט לא תקין">
            {validationError}
          </Alert>
        )}

        <NodeSettingsForm
          node={node}
          typeLabel={type.label}
          metaRows={nodeMetaRows(node)}
          draft={draft}
          onChange={handleChange}
        />

        {/* save bar */}
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          <span className="inline-flex items-center gap-2 text-[13px] text-neutrals-lead">
            {dirty ? (
              'יש שינויים שלא נשמרו'
            ) : (
              <>
                <Icon name="Check" size={15} className="text-success" />
                כל השינויים נשמרו
              </>
            )}
          </span>
          <div className="flex items-center gap-2.5">
            <Button
              variant="white"
              disabled={!dirty || isSaving}
              onClick={() => setDraft(initial)}
            >
              ביטול
            </Button>
            <Button
              variant="primary"
              disabled={!dirty || isSaving}
              onClick={handleSave}
            >
              {isSaving ? 'שומר…' : 'שמירה'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
