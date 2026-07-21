/**
 * פעולות ספריית המדיה (העלאה / העתקת-URL / הורדה / החלפה / תגיות / נושא / מחיקה)
 * עם ה-toasts הנלווים. מרכז את הלוגיקה שמחוץ לרינדור, כך שהעמוד רק מרכיב UI.
 * ההעלאה עוברת דרך buildUploadInput (blob בפיתוח; R2 אמיתי ב-Phase 12).
 */
import { useRef } from 'react'
import type { MediaAsset } from '@/types/entities'
import { buildUploadInput } from '../services/mediaUpload'
import type { MediaAssetView } from '../types'
import { useMediaMutations } from './useMediaMutations'
import { useMediaToasts } from './useMediaToasts'

export function useMediaActions() {
  const mutations = useMediaMutations()
  const { toasts, notify } = useMediaToasts()
  const replaceTargetId = useRef<string | null>(null)

  /** מעלה קבצים נתמכים; מדווח כמה נוצרו וכמה דולגו (סוג לא-נתמך). */
  const uploadFiles = async (files: File[]) => {
    const built = await Promise.all(files.map((f) => buildUploadInput(f)))
    const valid = built.filter((i): i is NonNullable<typeof i> => i !== null)
    for (const input of valid) await mutations.create(input)

    const skipped = files.length - valid.length
    if (valid.length > 0) {
      notify(
        'success',
        `הועלו ${valid.length} קבצים${skipped ? ` · דולגו ${skipped} לא-נתמכים` : ''}`,
      )
    } else if (skipped > 0) {
      notify('error', `כל הקבצים (${skipped}) אינם מסוג נתמך`)
    }
  }

  const copyUrl = async (view: MediaAssetView) => {
    try {
      await navigator.clipboard.writeText(view.asset.file_url)
      notify('success', 'ה-URL הועתק ללוח')
    } catch {
      notify('error', 'לא ניתן להעתיק את ה-URL')
    }
  }

  const download = (view: MediaAssetView) => {
    const link = document.createElement('a')
    link.href = view.asset.file_url
    link.download = view.asset.title
    link.rel = 'noopener'
    link.target = '_blank'
    link.click()
  }

  /** מסמן איזה נכס יוחלף (העמוד פותח את בורר-הקבצים מיד אחרי). */
  const beginReplace = (id: string) => {
    replaceTargetId.current = id
  }

  const completeReplace = async (file: File) => {
    const id = replaceTargetId.current
    if (!id) return
    const input = await buildUploadInput(file)
    if (!input) {
      notify('error', 'סוג הקובץ אינו נתמך')
      return
    }
    await mutations.replaceFile(id, input)
    notify('success', 'הקובץ הוחלף')
  }

  const setTags = (asset: MediaAsset, tags: string[]) =>
    void mutations.setTags(asset.id, tags)
  const setTopic = (asset: MediaAsset, topic: string | null) =>
    void mutations.setTopic(asset.id, topic)

  return {
    toasts,
    isPending: mutations.isPending,
    uploadFiles,
    copyUrl,
    download,
    beginReplace,
    completeReplace,
    setTags,
    setTopic,
    remove: (id: string) => mutations.remove(id),
  }
}
