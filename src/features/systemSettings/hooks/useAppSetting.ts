/** גישה+שמירה גנרית למפתח-AppSetting יחיד — react-query מעל settingsService. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { getSetting, saveSetting } from '../services/settingsService'

export function appSettingQueryKey(key: string) {
  return ['systemSettings', 'appSetting', key] as const
}

export function useAppSetting<T extends object>(
  key: string,
  fallback: T,
  description: string,
) {
  const queryClient = useQueryClient()
  const queryKey = appSettingQueryKey(key)

  const query = useQuery({
    queryKey,
    queryFn: () => getSetting<T>(apiClient, key, fallback),
  })

  const mutation = useMutation({
    mutationFn: (value: T) =>
      saveSetting(apiClient, key, query.data?.record ?? null, value, description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    value: query.data?.value ?? fallback,
    isLoading: query.isPending,
    isError: query.isError,
    save: (value: T) => mutation.mutateAsync(value),
    isSaving: mutation.isPending,
  }
}
