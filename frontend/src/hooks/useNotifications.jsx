import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAPI from './useAPI';

const useNotifications = () => {
    const api = useAPI();
    const queryClient = useQueryClient();

    const useGetNotifications = () => {
        return useQuery({
            queryKey: ['notifications'],
            queryFn: async () => {
                const response = await api.get('/notifications/');
                return response.data;
            },
        });
    };

    const useMarkRead = () => {
        return useMutation({
            mutationFn: async (id) => {
                const response = await api.post(`/notifications/${id}/mark_read/`);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['notifications']);
            },
        });
    };

    const useMarkAllRead = () => {
        return useMutation({
            mutationFn: async () => {
                const response = await api.post('/notifications/mark_all_read/');
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['notifications']);
            },
        });
    };

    const useDismiss = () => {
        return useMutation({
            mutationFn: async (id) => {
                const response = await api.post(`/notifications/${id}/dismiss/`);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['notifications']);
            },
        });
    };

    return {
        useGetNotifications,
        useMarkRead,
        useMarkAllRead,
        useDismiss
    };
};

export default useNotifications;
