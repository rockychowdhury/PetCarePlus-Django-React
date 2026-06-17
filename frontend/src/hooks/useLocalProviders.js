import { useQuery } from '@tanstack/react-query'
import { providersApi } from '../api/providers'
import { useAuthStore } from '../store/authStore'
import { useLocationStore } from '../store/locationStore'

export const useLocalProviders = (filters = {}) => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = !!useAuthStore((state) => state.token)

  // Retrieve temporary selected location for anonymous users
  const anonDivision = useLocationStore((state) => state.division)
  const anonDistrict = useLocationStore((state) => state.district)
  const anonUpazila = useLocationStore((state) => state.upazila)

  const queryParams = {
    ...filters,
  }

  // Inject location filters if not authenticated and location is selected
  if (!isAuthenticated) {
    if (anonDivision) queryParams.division = anonDivision
    if (anonDistrict) queryParams.district = anonDistrict
    if (anonUpazila) queryParams.upazila = anonUpazila
  }

  return useQuery({
    queryKey: [
      'providers',
      isAuthenticated,
      user?.district,
      anonDistrict,
      queryParams,
    ],
    queryFn: () => providersApi.getProviders(queryParams),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    keepPreviousData: true,
  })
}
