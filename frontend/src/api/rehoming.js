import client from './client'

export const rehomingApi = {
  getListings: async (params) => {
    const response = await client.get('/rehoming/', { params })
    return response.data
  },

  getListingDetail: async (id) => {
    const response = await client.get(`/rehoming/${id}/`)
    return response.data
  },

  createListing: async (listingData) => {
    const response = await client.post('/rehoming/', listingData)
    return response.data
  },

  updateListing: async (id, listingData) => {
    const response = await client.patch(`/rehoming/${id}/`, listingData)
    return response.data
  },

  getApplications: async () => {
    const response = await client.get('/rehoming/applications/')
    return response.data
  },

  createApplication: async (applicationData) => {
    const response = await client.post('/rehoming/applications/', applicationData)
    return response.data
  },

  updateApplicationStatus: async (id, status) => {
    const response = await client.patch(`/rehoming/applications/${id}/`, { status })
    return response.data
  },
}
