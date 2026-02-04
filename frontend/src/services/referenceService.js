import { axiosInstance } from "../hooks/useAPI";

// Base path for services app is /services/
const BASE = '/services';

const referenceService = {
    getCategories: async () => {
        const response = await axiosInstance.get(`${BASE}/categories/`);
        return response.data;
    },

    getSpecies: async () => {
        const response = await axiosInstance.get(`${BASE}/species/`);
        return response.data;
    },

    getServiceOptions: async () => {
        const response = await axiosInstance.get(`${BASE}/options/`);
        return response.data;
    },

    getSpecializations: async () => {
        const response = await axiosInstance.get(`${BASE}/specializations/`);
        return response.data;
    }
};

export default referenceService;
