/**
 * useAppSetting + טיוטה מקומית + דגל-dirty — כל סקשן עורך טיוטה עד לחיצה על
 * "שמור" (_savebar). הסנכרון מהשרת קורה פעם אחת (syncedRef) — לא דורס עריכה
 * פעילה של המשתמש בכל רענון-query.
 */
import { useEffect, useRef, useState } from 'react'
import { useAppSetting } from './useAppSetting'

export function useSettingDraft<T extends object>(
  key: string,
  fallback: T,
  description: string,
) {
  const setting = useAppSetting<T>(key, fallback, description)
  const [draft, setDraft] = useState<T>(fallback)
  const syncedRef = useRef(false)

  useEffect(() => {
    if (!setting.isLoading && !syncedRef.current) {
      syncedRef.current = true
      setDraft(setting.value)
    }
  }, [setting.isLoading, setting.value])

  const isDirty = JSON.stringify(draft) !== JSON.stringify(setting.value)

  return {
    draft,
    setDraft,
    // הערך השמור בשרת — משמש את onCancel לאיפוס הטיוטה (setDraft(value)).
    value: setting.value,
    isDirty,
    isLoading: setting.isLoading,
    isSaving: setting.isSaving,
    commit: () => setting.save(draft),
  }
}
