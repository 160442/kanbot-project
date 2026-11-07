import { create } from 'zustand'
import type { User } from '@/types/api'
import { authApi } from '@/api/auth'
import { getStoredToken, setStoredToken } from '@/api/client'

interface AuthState {
  user: User | null
  token: string | null
  initialized: boolean
  initializing: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getStoredToken(),
  initialized: false,
  initializing: false,

  setAuth: (token, user) => {
    setStoredToken(token)
    set({ token, user, initialized: true, initializing: false })
  },

  clearAuth: () => {
    setStoredToken(null)
    set({ token: null, user: null, initialized: true, initializing: false })
  },

  initialize: async () => {
    const state = get()
    if (state.initializing || state.initialized) return
    set({ initializing: true })
    const token = getStoredToken()
    if (!token) {
      set({ token: null, user: null, initialized: true, initializing: false })
      return
    }
    try {
      const { user } = await authApi.me()
      set({ token, user, initialized: true, initializing: false })
    } catch {
      setStoredToken(null)
      set({ token: null, user: null, initialized: true, initializing: false })
    }
  },
}))
