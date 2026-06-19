import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isInitializing: true,
      language: 'bn', // Defaults to Bangla

      setUser: (user) => set({ user, isInitializing: false }),
      setInitializing: (isInitializing) => set({ isInitializing }),
      setLanguage: (language) => set({ language }),

      login: (user) => set({ 
        user, 
        isInitializing: false,
        language: user?.preferred_language || 'bn' 
      }),
      logout: () => set({ user: null, isInitializing: false }),
    }),
    {
      name: 'petcareplus-auth', // local storage key
      partialize: (state) => ({ 
        language: state.language 
      }),
    }
  )
)
