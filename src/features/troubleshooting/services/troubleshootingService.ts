/**
 * שכבת-הקריאות של feature פתרון-הבעיות מול apiClient (IResource). רק כאן נגזרות
 * קריאות ה-API; ה-hooks עוטפים ב-react-query (CLAUDE.md §8). המחיקה-הרכה
 * (`deleted_at`) והסינון ל-missing_flow נעשים ב-JS — ה-mock מסנן שוויון בלבד.
 */
import type { IApiClient } from '@/lib/api/types'
import type {
  TroubleshootingFlow,
  TroubleshootingSession,
} from '@/types/entities'

/** כל ה-Playbooks הפעילים (לא במחיקה-רכה), החדשים תחילה. */
export async function listPlaybooks(
  api: IApiClient,
): Promise<TroubleshootingFlow[]> {
  const flows = await api.troubleshootingFlows.findMany({
    sort: '-created_date',
  })
  return flows.filter((flow) => !flow.deleted_at)
}

/** שיחות-שירות שבהן חסר Playbook (missing_flow=true), החדשות תחילה. */
export async function listMissingSessions(
  api: IApiClient,
): Promise<TroubleshootingSession[]> {
  const sessions = await api.troubleshootingSessions.findMany({
    sort: '-created_date',
  })
  return sessions.filter((session) => session.missing_flow === true)
}
