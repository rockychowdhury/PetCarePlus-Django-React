import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLocationStore = create(
  persist(
    (set) => ({
      division: '',
      district: '',
      upazila: '',

      setLocation: (location) => set({
        division: location.division || '',
        district: location.district || '',
        upazila: location.upazila || '',
      }),

      clearLocation: () => set({ division: '', district: '', upazila: '' }),
    }),
    {
      name: 'petcareplus-location',
    }
  )
)
