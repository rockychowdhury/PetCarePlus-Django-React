import client from './client'

export const authApi = {
  login: async (email, password) => {
    const response = await client.post('/auth/login/', { email, password })
    return response.data
  },

  register: async (userData) => {
    const response = await client.post('/auth/register/', userData)
    return response.data
  },

  getMe: async () => {
    const response = await client.get('/auth/me/')
    return response.data
  },

  updateMe: async (profileData) => {
    const response = await client.patch('/auth/me/', profileData)
    return response.data
  },
}
