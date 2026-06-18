import apiClient from './client'

export const animalsApi = {
  // Get all animal types
  getAnimalTypes: async () => {
    const { data } = await apiClient.get('/animals/types/')
    return data
  },
}
