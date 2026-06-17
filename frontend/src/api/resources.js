import client from './client'

export const resourcesApi = {
  getGovtResources: async (params) => {
    const response = await client.get('/resources/', { params })
    return response.data
  },
}
