import client from './client'

export const savedApi = {
  getSavedItems: async (model_type = 'serviceprovider') => {
    const response = await client.get('/auth/saved/', {
      params: { model_type }
    })
    return response.data
  },

  toggleSavedItem: async (model_type, object_id) => {
    const response = await client.post('/auth/saved/toggle/', {
      model_type,
      object_id
    })
    return response.data
  },

  checkSavedStatus: async (model_type, object_id) => {
    const response = await client.get('/auth/saved/check/', {
      params: { model_type, object_id }
    })
    return response.data
  }
}
