import client from './client'

export const guidelinesApi = {
  getAnimalTypes: async () => {
    const response = await client.get('/animals/')
    return response.data
  },

  getGuidelines: async (params) => {
    const response = await client.get('/guidelines/', { params })
    return response.data
  },

  getGuidelineDetail: async (id) => {
    const response = await client.get(`/guidelines/${id}/`)
    return response.data
  },

  getVaccinations: async (params) => {
    const response = await client.get('/vaccinations/', { params })
    return response.data
  },
}
