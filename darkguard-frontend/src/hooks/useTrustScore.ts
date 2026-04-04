import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function useTrustScore(domain: string, enabled = true) {
  return useQuery({
    queryKey: ['trust-score', domain],
    queryFn: async () => {
      const { data } = await api.get(`/trust-score/${domain}`)
      return data
    },
    enabled: enabled && !!domain,
    retry: false,
  })
}

export function useLeaderboard(sort = 'worst', limit = 20) {
  return useQuery({
    queryKey: ['leaderboard', sort, limit],
    queryFn: async () => {
      const { data } = await api.get(`/leaderboard?sort=${sort}&limit=${limit}`)
      return data.entries || []
    },
  })
}
