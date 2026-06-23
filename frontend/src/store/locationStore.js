import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLocationStore = create(
  persist(
    (set) => ({
      division: '',
      district: '',
      upazila: '',
      union: '',
      division_id: '',
      district_id: '',
      upazila_id: '',
      latitude: null,
      longitude: null,

      setLocation: (location) => set({
        division: location.division || '',
        district: location.district || '',
        upazila: location.upazila || '',
        union: location.union || '',
        division_id: location.division_id || '',
        district_id: location.district_id || '',
        upazila_id: location.upazila_id || '',
        latitude: location.latitude || null,
        longitude: location.longitude || null,
      }),

      clearLocation: () => set({ 
        division: 'all', district: '', upazila: '', union: '',
        division_id: 'all', district_id: '', upazila_id: '',
        latitude: null, longitude: null 
      }),
    }),
    {
      name: 'petcareplus-location',
    }
  )
)
