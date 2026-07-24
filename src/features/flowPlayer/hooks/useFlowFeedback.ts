/**
 * useFlowFeedback — mutation לשליחת FlowFeedback בסיום סשן. הזהות נלקחת מ-
 * lib/auth (לא מפרמטרי-לקוח); הפרטים הנתפסים-אוטומטית מורכבים ב-service.
 */
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { submitFlowFeedback } from '../services/flowPlayerService'
import type { FeedbackFormInput, FlowData, PlayableFlow } from '../schemas'
import type { PlayerState } from '../types'

export interface SubmitFeedbackVars {
  flow: Pick<PlayableFlow, 'id' | 'title'>
  flowData: FlowData
  form: FeedbackFormInput
  state: PlayerState
}

export function useFlowFeedback() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ flow, flowData, form, state }: SubmitFeedbackVars) => {
      if (!user) {
        throw new Error('לא ניתן לשלוח משוב ללא משתמש מחובר')
      }
      return submitFlowFeedback(apiClient, {
        flow,
        flowData,
        form,
        state,
        user: { id: user.id, full_name: user.full_name, email: user.email },
        now: new Date().toISOString(),
      })
    },
  })
}
