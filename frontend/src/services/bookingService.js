import { axiosInstance } from "../hooks/useAPI";

const ENDPOINT = '/services/bookings';

const bookingService = {
    /**
     * Create a new booking
     * @param {Object} data 
     */
    create: async (data) => {
        const response = await axiosInstance.post(ENDPOINT + '/', data);
        return response.data;
    },

    /**
     * List my bookings (as client or provider)
     * @param {Object} params - { status, booking_type, payment_status }
     */
    getAll: async (params) => {
        const response = await axiosInstance.get(ENDPOINT + '/', { params });
        return response.data;
    },

    /**
     * Get booking details
     * @param {number|string} id 
     */
    getById: async (id) => {
        const response = await axiosInstance.get(`${ENDPOINT}/${id}/`);
        return response.data;
    },

    /**
     * Perform an action on a booking (accept, reject, cancel, start, complete)
     * @param {number|string} id 
     * @param {string} action 
     * @param {Object} data 
     */
    performAction: async (id, action, data = {}) => {
        const response = await axiosInstance.post(`${ENDPOINT}/${id}/${action}/`, data);
        return response.data;
    },

    /**
     * Update booking status (Legacy/Direct patching)
     * @param {number|string} id 
     * @param {string} status 
     */
    updateStatus: async (id, status) => {
        const response = await axiosInstance.patch(`${ENDPOINT}/${id}/`, { status });
        return response.data;
    },

    /**
     * Full update of booking
     * @param {number|string} id 
     * @param {Object} data 
     */
    update: async (id, data) => {
        const response = await axiosInstance.patch(`${ENDPOINT}/${id}/`, data);
        return response.data;
    }
};

export default bookingService;
