import apiClient from './client'

export const animalsApi = {
  getAnimalTypes: async () => {
    const { data } = await apiClient.get('/animals/')
    return data
  },
}
