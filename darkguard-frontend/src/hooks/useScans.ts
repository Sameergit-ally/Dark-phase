import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function useScans(enabled = true) {
  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const { data } = await api.get('/user/stats')
      return data
    },
    enabled,
    refetchInterval: 30000,
  })
}

export function useUserStats(enabled = true) {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data } = await api.get('/user/stats')
      return data
    },
    enabled,
    refetchInterval: 60000,
  })
}
