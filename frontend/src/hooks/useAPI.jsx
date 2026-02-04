import axios from "axios";
import { baseURL } from "../utils/baseURL";
import { authObserver } from "../utils/AuthObserver";

// Shared axios instance for the app
export const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// Track refresh in-flight to prevent stampede
let refreshPromise = null;

const refreshAccessToken = async () => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(`${baseURL}/user/token/refresh/`, {}, { withCredentials: true })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // Only attempt refresh once per request
        if ((status === 401 || status === 403) && !originalRequest?._retry) {
            originalRequest._retry = true;
            try {
                await refreshAccessToken();
                return axiosInstance(originalRequest);
            } catch (refreshErr) {
                // Refresh failed - notify listeners (AuthContext) to logout
                authObserver.notify();
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

const useAPI = () => axiosInstance;

export default useAPI;