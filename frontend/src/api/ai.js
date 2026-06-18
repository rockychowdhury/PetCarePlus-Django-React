import client from './client'

export const aiApi = {
  createSession: async (animalTypeId) => {
    const response = await client.post('/ai/sessions/', { animal_type: animalTypeId })
    return response.data
  },

  sendChatMessage: async (sessionId, message, language = 'bn') => {
    const response = await client.post(`/ai/sessions/${sessionId}/chat/`, { message, language })
    return response.data
  },

  getSessionSummary: async (sessionId) => {
    const response = await client.get(`/ai/sessions/${sessionId}/`)
    return response.data
  },

  polishText: async (text, language = 'bn') => {
    const response = await client.post('/ai/polish/', { text, language })
    return response.data
  },
}
