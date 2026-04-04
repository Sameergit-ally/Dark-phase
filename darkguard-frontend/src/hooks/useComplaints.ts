import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export function useComplaints(enabled = true) {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data } = await api.get('/complaints')
      return data.complaints || []
    },
    enabled,
  })
}

export function useGenerateComplaint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (scanId: string) => {
      const { data } = await api.post('/complaints/generate', { scan_id: scanId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
    },
  })
}
