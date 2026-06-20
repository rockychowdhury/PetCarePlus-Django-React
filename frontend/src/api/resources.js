import client from './client'

export const resourcesApi = {
  getResources: async (params) => {
    const response = await client.get('/resources/', { params })
    return response.data
  },
  getResourceDetail: async (id) => {
    const response = await client.get(`/resources/${id}/`)
    return response.data
  },
}
