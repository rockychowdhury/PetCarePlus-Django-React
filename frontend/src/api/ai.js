import client from './client'

export const aiApi = {
  diagnose: async (payload) => {
    const response = await client.post('/ai/diagnose/', payload)
    return response.data
  },

  getSessions: async () => {
    const response = await client.get('/ai/sessions/')
    return response.data
  },

  getSessionDetail: async (sessionId) => {
    const response = await client.get(`/ai/sessions/${sessionId}/`)
    return response.data
  },

  polishText: async (text, language = 'bn') => {
    const response = await client.post('/ai/polish/', { text, language })
    return response.data
  },
}
