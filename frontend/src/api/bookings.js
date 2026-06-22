import client from './client'

export const bookingsApi = {
  getBookings: async (params) => {
    const response = await client.get('/bookings/', { params })
    return response.data
  },

  createBooking: async (bookingData) => {
    const response = await client.post('/bookings/', bookingData)
    return response.data
  },

  getBookingDetail: async (id) => {
    const response = await client.get(`/bookings/${id}/`)
    return response.data
  },

  updateBookingStatus: async (id, status) => {
    const response = await client.patch(`/bookings/${id}/`, { status })
    return response.data
  },

  /**
   * Get user's completed bookings for a specific provider.
   * Used by the review dialog to find reviewable bookings.
   */
  getCompletedBookingsForProvider: async (providerId) => {
    const response = await client.get('/bookings/', {
      params: { provider: providerId, status: 'completed' }
    })
    return response.data
  },
}
