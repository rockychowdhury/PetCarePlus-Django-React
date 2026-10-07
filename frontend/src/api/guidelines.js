import client from './client'

export const guidelinesApi = {
  getAnimalTypes: async () => {
    const response = await client.get('/animals/')
    return response.data
  },
}
