import client from './client'

export const petsApi = {
  getPets: async (params) => {
    const response = await client.get('/pets/', { params })
    return response.data
  },

  getPetDetail: async (id) => {
    const response = await client.get(`/pets/${id}/`)
    return response.data
  },

  addPet: async (petData) => {
    // Supports potential multipart/form-data for image upload
    const response = await client.post('/pets/', petData, {
      headers: {
        'Content-Type': petData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    })
    return response.data
  },

  updatePet: async (id, petData) => {
    const response = await client.patch(`/pets/${id}/`, petData, {
      headers: {
        'Content-Type': petData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    })
    return response.data
  },

  deletePet: async (id) => {
    const response = await client.delete(`/pets/${id}/`)
    return response.data
  },
}
