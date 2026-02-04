import { axiosInstance } from "../hooks/useAPI";

const ENDPOINT = '/services/providers';

const providerService = {
    /**
     * List all providers with filters
     * @param {Object} params - { category, city, state, min_rating, search, etc. }
     */
    getAll: async (params) => {
        const response = await axiosInstance.get(ENDPOINT + '/', { params });
        return response.data;
    },

    /**
     * Get provider details by ID
     * @param {number|string} id 
     */
    getById: async (id) => {
        const response = await axiosInstance.get(`${ENDPOINT}/${id}/`);
        return response.data;
    },

    /**
     * Get availability for a provider
     * @param {number|string} id 
     * @param {string} date - YYYY-MM-DD
     */
    getAvailability: async (id, date) => {
        const response = await axiosInstance.get(`${ENDPOINT}/${id}/availability/`, {
            params: { date }
        });
        return response.data;
    },

    /**
     * Get reviews for a provider
     * @param {number|string} id 
     * @param {Object} params - { page, ordering }
     */
    getReviews: async (id, params) => {
        const response = await axiosInstance.get(`${ENDPOINT}/${id}/reviews/`, { params });
        return response.data;
    },

    /**
     * Upload media for a provider (send ImgBB URL)
     * @param {number|string} id 
     * @param {Object} data - { file_url, thumbnail_url, is_primary, alt_text }
     */
    uploadMedia: async (id, data) => {
        const response = await axiosInstance.post(`${ENDPOINT}/${id}/media/`, data);
        return response.data;
    },

    /**
   * Register as a new provider
   * @param {Object} data 
   */
    create: async (data) => {
        const response = await axiosInstance.post(ENDPOINT + '/', data);
        return response.data;
    },

    /**
     * My Provider Profile
     */
    getMe: async () => {
        try {
            const response = await axiosInstance.get(ENDPOINT + '/me/');
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    },

    /**
   * Get provider dashboard stats/analytics
   */
    getAnalytics: async () => {
        const response = await axiosInstance.get(ENDPOINT + '/analytics/');
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await axiosInstance.get('/services/provider/dashboard-stats/');
        return response.data;
    },

    /**
     * Update provider settings/profile
       * @param {number|string} id 
       * @param {Object} data 
       */
    update: async (id, data) => {
        const response = await axiosInstance.patch(`${ENDPOINT}/${id}/`, data);
        return response.data;
    },
    /**
     * Update business hours
     */
    updateHours: async (id, data) => {
        const response = await axiosInstance.post(`${ENDPOINT}/${id}/update_hours/`, data);
        return response.data;
    },

    /**
     * Submit application for verification
     */
    submitApplication: async (id) => {
        const response = await axiosInstance.post(`${ENDPOINT}/${id}/submit_application/`);
        return response.data;
    },

    /**
     * Respond to a review
     */
    respondToReview: async (providerId, reviewId, responseText) => {
        const response = await axiosInstance.post(`${ENDPOINT}/${providerId}/reviews/${reviewId}/respond/`, { response: responseText });
        return response.data;
    }
};

export default providerService;
