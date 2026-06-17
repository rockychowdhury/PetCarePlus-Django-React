import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLocationStore = create(
  persist(
    (set) => ({
      division: '',
      district: '',
      upazila: '',
      union: '',
      latitude: null,
      longitude: null,

      setLocation: (location) => set({
        division: location.division || '',
        district: location.district || '',
        upazila: location.upazila || '',
        union: location.union || '',
        latitude: location.latitude || null,
        longitude: location.longitude || null,
      }),

      clearLocation: () => set({ division: '', district: '', upazila: '', union: '', latitude: null, longitude: null }),
    }),
    {
      name: 'petcareplus-location',
    }
  )
)
