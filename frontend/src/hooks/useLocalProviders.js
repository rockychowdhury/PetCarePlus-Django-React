import { useQuery } from '@tanstack/react-query'
import { providersApi } from '../api/providers'
import { useAuthStore } from '../store/authStore'
import { useLocationStore } from '../store/locationStore'

export const useLocalProviders = (filters = {}) => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = !!useAuthStore((state) => state.user)

  const {
    division: storeDiv,
    district: storeDist,
    upazila: storeUpz,
    union: storeUnion,
    latitude: storeLat,
    longitude: storeLng
  } = useLocationStore()

  const queryParams = {
    ...filters,
  }

  // Always inject available manual location fields
  if (storeDiv === 'all') {
    queryParams.division = 'all'
  } else {
    if (storeDiv) queryParams.division = storeDiv
    if (storeDist) queryParams.district = storeDist
    if (storeUpz) queryParams.upazila = storeUpz
    if (storeUnion) queryParams.union = storeUnion
  }

  // Inject GPS coordinates if available
  if (storeLat && storeLng) {
    queryParams.lat = storeLat
    queryParams.lng = storeLng
  }

  return useQuery({
    queryKey: [
      'providers',
      isAuthenticated,
      user?.district,
      storeDiv,
      storeDist,
      storeUpz,
      storeUnion,
      storeLat,
      storeLng,
      queryParams,
    ],
    queryFn: () => providersApi.getProviders(queryParams),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    keepPreviousData: true,
  })
}
