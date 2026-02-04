import { axiosInstance } from "../hooks/useAPI";

const userService = {
    createRoleRequest: async (data) => {
        const response = await axiosInstance.post('/user/role-requests/', data);
        return response.data;
    },

    getAllRoleRequests: async () => {
        const response = await axiosInstance.get('/user/role-requests/');
        return response.data;
    }
};

export default userService;
