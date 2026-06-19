import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      language: 'bn', // Defaults to Bangla

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLanguage: (language) => set({ language }),

      login: (user, token) => set({ 
        user, 
        token, 
        language: user?.preferred_language || 'bn' 
      }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'petcareplus-auth', // local storage key
      partialize: (state) => ({ 
        token: state.token, 
        language: state.language 
      }),
    }
  )
)
