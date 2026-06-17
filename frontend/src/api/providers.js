import client from './client'

export const providersApi = {
  getProviders: async (params) => {
    const response = await client.get('/providers/', { params })
    return response.data
  },

  getProviderDetail: async (id) => {
    const response = await client.get(`/providers/${id}/`)
    return response.data
  },

  registerProvider: async (providerData) => {
    const response = await client.post('/providers/', providerData)
    return response.data
  },

  updateProvider: async (id, providerData) => {
    const response = await client.patch(`/providers/${id}/`, providerData)
    return response.data
  },

  getProviderServices: async (providerId) => {
    const response = await client.get(`/providers/${providerId}/services/`)
    return response.data
  },

  addProviderService: async (providerId, serviceData) => {
    const response = await client.post(`/providers/${providerId}/services/`, serviceData)
    return response.data
  },

  getReviews: async (providerId) => {
    const response = await client.get(`/providers/${providerId}/reviews/`)
    return response.data
  },

  createReview: async (reviewData) => {
    const response = await client.post('/reviews/', reviewData)
    return response.data
  },
}
