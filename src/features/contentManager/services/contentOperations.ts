/**
 * פעולות הכתיבה של מפעל התוכן (ContentManager, doc 12) מול שכבת ה-API.
 * טהור מ-React: מקבל IApiClient ומנתב כל פעולה לישות הנכונה לפי סוג ה-node.
 * ה-hook (useContentMutations) עוטף בפעולות react-query (invalidate/pending/error).
 *
 * סמנטיקה קריטית (SRS §1.2):
 * - מחיקת "מודול" ממסלול = מחיקת קישור ה-TrackModule בלבד, לא ה-SharedModule
 *   המשותף (שעלול לשרת מסלולים נוספים).
 * - סידור מודולים = עדכון order_index על ה-TrackModule, לא על ה-SharedModule.
 */
import type { IApiClient } from '@/lib/api'
import type { NodeEditInput } from '../schemas'
import {
  NEW_LESSON_TITLE,
  NEW_MODULE_TITLE,
  NEW_TOPIC_TITLE,
  NEW_TRACK_TITLE,
} from '../constants'
import type { ContentNode, ParentNode } from '../types'

const COPY_SUFFIX = ' (עותק)'

/** יצירת מסלול-טיוטה חדש בשורש. מחזיר את מזהה המסלול (לבחירה מיידית). */
export async function createTrack(api: IApiClient, order: number): Promise<string> {
  const track = await api.learningTracks.create({
    title: NEW_TRACK_TITLE,
    status: 'draft',
    order_index: order,
  })
  return track.id
}

/** יצירת ילד לפריט-הורה (מודול/נושא/שיעור). מחזיר את מזהה הישות שנוצרה. */
export async function addChild(
  api: IApiClient,
  parent: ParentNode,
  order: number,
): Promise<string> {
  switch (parent.kind) {
    case 'track': {
      const module = await api.sharedModules.create({
        title: NEW_MODULE_TITLE,
        status: 'draft',
      })
      await api.trackModules.create({
        track_id: parent.entityId,
        shared_module_id: module.id,
        order_index: order,
      })
      return module.id
    }
    case 'module': {
      const topic = await api.topics.create({
        shared_module_id: parent.entityId,
        title: NEW_TOPIC_TITLE,
        status: 'draft',
        order_index: order,
      })
      return topic.id
    }
    case 'topic': {
      const lesson = await api.moduleLessons.create({
        topic_id: parent.entityId,
        title: NEW_LESSON_TITLE,
        status: 'draft',
        editor_version: 'v2',
        order_index: order,
      })
      return lesson.id
    }
  }
}

/** שמירת עריכת הפאנל — ממופה לשדות הישות לפי סוג. */
export async function updateNode(
  api: IApiClient,
  node: ContentNode,
  input: NodeEditInput,
): Promise<void> {
  const { title, description, status, difficulty } = input
  switch (node.kind) {
    case 'track':
      await api.learningTracks.update(node.entityId, {
        title,
        description: description ?? null,
        status,
        difficulty_level: difficulty ?? null,
      })
      return
    case 'module':
      await api.sharedModules.update(node.entityId, {
        title,
        description: description ?? null,
        status,
      })
      return
    case 'topic':
      await api.topics.update(node.entityId, {
        title,
        description: description ?? null,
        status,
      })
      return
    case 'lesson':
      // לשיעור אין 'description' — התיאור ממופה ל-introduction_text (SRS §1.2)
      await api.moduleLessons.update(node.entityId, {
        title,
        introduction_text: description ?? null,
        status,
      })
      return
  }
}

/** מחיקה — מודול = ניתוק הקישור בלבד (ה-SharedModule המשותף נשמר). */
export async function deleteNode(api: IApiClient, node: ContentNode): Promise<void> {
  switch (node.kind) {
    case 'track':
      await api.learningTracks.delete(node.entityId)
      return
    case 'module':
      await api.trackModules.delete(node.trackModuleId)
      return
    case 'topic':
      await api.topics.delete(node.entityId)
      return
    case 'lesson':
      await api.moduleLessons.delete(node.entityId)
      return
  }
}

/** שכפול רדוד (ללא צאצאים) — יוצר עותק-טיוטה סמוך. מחזיר את מזהה העותק. */
export async function duplicateNode(
  api: IApiClient,
  node: ContentNode,
  order: number,
): Promise<string> {
  const copyTitle = `${node.title}${COPY_SUFFIX}`
  switch (node.kind) {
    case 'track': {
      const t = node.track
      const created = await api.learningTracks.create({
        title: copyTitle,
        description: t.description ?? null,
        category: t.category ?? null,
        difficulty_level: t.difficulty_level ?? null,
        estimated_hours: t.estimated_hours ?? null,
        status: 'draft',
        order_index: order,
      })
      return created.id
    }
    case 'module': {
      const m = node.module
      const copy = await api.sharedModules.create({
        title: copyTitle,
        description: m.description ?? null,
        estimated_duration: m.estimated_duration ?? null,
        status: 'draft',
      })
      await api.trackModules.create({
        track_id: node.trackId,
        shared_module_id: copy.id,
        order_index: order,
      })
      return copy.id
    }
    case 'topic': {
      const created = await api.topics.create({
        shared_module_id: node.sharedModuleId,
        title: copyTitle,
        description: node.topic.description ?? null,
        status: 'draft',
        order_index: order,
      })
      return created.id
    }
    case 'lesson': {
      const l = node.lesson
      const created = await api.moduleLessons.create({
        topic_id: node.topicId,
        title: copyTitle,
        introduction_text: l.introduction_text ?? null,
        duration_minutes: l.duration_minutes ?? null,
        editor_version: l.editor_version ?? 'v2',
        status: 'draft',
        order_index: order,
      })
      return created.id
    }
  }
}

/** סידור-מחדש בין אחים באותו הורה — מעדכן order_index לפי המיקום החדש. */
export async function reorderSiblings(
  api: IApiClient,
  ordered: ContentNode[],
): Promise<void> {
  await Promise.all(
    ordered.map((node, index) => {
      const order_index = index + 1
      switch (node.kind) {
        case 'track':
          return api.learningTracks.update(node.entityId, { order_index })
        case 'module':
          return api.trackModules.update(node.trackModuleId, { order_index })
        case 'topic':
          return api.topics.update(node.entityId, { order_index })
        case 'lesson':
          return api.moduleLessons.update(node.entityId, { order_index })
      }
    }),
  )
}
