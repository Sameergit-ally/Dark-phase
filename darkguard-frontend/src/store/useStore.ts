import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  full_name?: string
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  showAuthModal: boolean

  setUser: (user: User | null) => void
  setShowAuthModal: (show: boolean) => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  showAuthModal: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isAuthLoading: false }),

  setShowAuthModal: (show) => set({ showAuthModal: show }),

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    if (data.session) {
      localStorage.setItem('darkguard_token', data.session.access_token)
      set({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
        },
        isAuthenticated: true,
        showAuthModal: false,
      })
    }
  },

  signup: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    if (error) throw error
    if (data.session) {
      localStorage.setItem('darkguard_token', data.session.access_token)
      set({
        user: {
          id: data.user!.id,
          email: data.user!.email || '',
          full_name: fullName,
        },
        isAuthenticated: true,
        showAuthModal: false,
      })
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('darkguard_token')
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        localStorage.setItem('darkguard_token', data.session.access_token)
        const user = data.session.user
        set({
          user: {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name,
          },
          isAuthenticated: true,
          isAuthLoading: false,
        })
      } else {
        set({ user: null, isAuthenticated: false, isAuthLoading: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isAuthLoading: false })
    }
  },
}))
