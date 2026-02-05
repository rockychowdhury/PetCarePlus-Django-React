import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAPI from './useAPI';

const useAdmin = () => {
    const api = useAPI();
    const queryClient = useQueryClient();

    // Role Requests
    const useGetRoleRequests = (filters = {}) => {
        return useQuery({
            queryKey: ['admin', 'role-requests', filters],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (filters.status && filters.status !== 'All') params.append('status', filters.status);
                if (filters.requested_role) params.append('requested_role', filters.requested_role);
                if (filters.search) params.append('search', filters.search);
                if (filters.page) params.append('page', filters.page);
                if (filters.ordering) params.append('ordering', filters.ordering);

                const res = await api.get(`/user/role-requests/?${params.toString()}`);
                return res.data;
            },
            keepPreviousData: true,
        });
    };

    const useApproveRoleRequest = () => {
        return useMutation({
            mutationFn: async ({ id, admin_notes }) => {
                const res = await api.post(`/user/role-requests/${id}/approve/`, { admin_notes });
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['admin', 'role-requests']);
            },
        });
    };

    const useRejectRoleRequest = () => {
        return useMutation({
            mutationFn: async ({ id, admin_notes }) => {
                const res = await api.post(`/user/role-requests/${id}/reject/`, { admin_notes });
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['admin', 'role-requests']);
            },
        });
    };

    // Providers
    const useGetProviders = (filters = {}) => {
        return useQuery({
            queryKey: ['admin', 'providers', filters],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (filters.search) params.append('search', filters.search);
                if (filters.status && filters.status !== 'All') params.append('verification_status', filters.status);
                if (filters.page) params.append('page', filters.page);
                if (filters.ordering) params.append('ordering', filters.ordering);

                const res = await api.get(`/admin-panel/providers/?${params.toString()}`);
                return res.data;
            },
            keepPreviousData: true,
        });
    };

    const useUpdateProviderStatus = () => {
        return useMutation({
            mutationFn: async ({ id, status }) => {
                const res = await api.post(`/services/providers/${id}/update_status/`, { status });
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['admin', 'providers']);
            },
        });
    };

    // User Management
    const useGetUsers = (filters = {}) => {
        return useQuery({
            queryKey: ['admin', 'users', filters],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (filters.role && filters.role !== 'All') params.append('role', filters.role);
                if (filters.status && filters.status !== 'All') {
                    if (filters.status === 'Active') params.append('is_active', 'true');
                    else if (filters.status === 'Banned') params.append('is_active', 'false');
                }
                if (filters.search) params.append('search', filters.search);
                if (filters.page) params.append('page', filters.page);
                if (filters.ordering) params.append('ordering', filters.ordering);

                const res = await api.get(`/admin-panel/users/?${params.toString()}`);
                return res.data;
            },
        });
    };

    const useToggleUserStatus = () => {
        return useMutation({
            mutationFn: async (id) => {
                const res = await api.post(`/admin-panel/users/${id}/toggle_status/`);
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['admin', 'users']);
            },
        });
    };

    const useVerifyUserEmail = () => {
        return useMutation({
            mutationFn: async (id) => {
                const res = await api.post(`/admin-panel/users/${id}/verify_email/`);
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['admin', 'users']);
            },
        });
    };

    const useGetUser = (id) => {
        return useQuery({
            queryKey: ['admin', 'user', id],
            queryFn: async () => {
                const res = await api.get(`/admin-panel/users/${id}/`);
                return res.data;
            },
            enabled: !!id,
        });
    };

    const useUpdateUser = () => {
        return useMutation({
            mutationFn: async ({ id, data }) => {
                const res = await api.patch(`/admin-panel/users/${id}/`, data);
                return res.data;
            },
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries(['admin', 'user', variables.id]);
                queryClient.invalidateQueries(['admin', 'users']);
            },
        });
    };

    const useDeleteUser = () => {
        return useMutation({
            mutationFn: async (id) => {
                await api.delete(`/admin-panel/users/${id}/`);
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['admin', 'users']);
            },
        });
    };

    // Listings
    const useGetListings = (filters = {}) => {
        return useQuery({
            queryKey: ['admin', 'listings', filters],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (filters.search) params.append('search', filters.search);
                if (filters.status && filters.status !== 'All') params.append('status', filters.status);
                if (filters.species && filters.species !== 'All') params.append('species', filters.species);
                if (filters.page) params.append('page', filters.page);
                if (filters.ordering) params.append('ordering', filters.ordering);

                const res = await api.get(`/admin-panel/pets/?${params.toString()}`);
                return res.data;
            },
            keepPreviousData: true,
        });
    };

    // Bookings
    const useGetBookings = (filters = {}) => {
        return useQuery({
            queryKey: ['admin', 'bookings', filters],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (filters.search) params.append('search', filters.search);
                if (filters.status && filters.status !== 'All') params.append('status', filters.status);
                if (filters.payment_status && filters.payment_status !== 'All') params.append('payment_status', filters.payment_status);
                if (filters.page) params.append('page', filters.page);
                if (filters.ordering) params.append('ordering', filters.ordering);

                const res = await api.get(`/admin-panel/bookings/?${params.toString()}`);
                return res.data;
            },
            keepPreviousData: true,
        });
    };

    // Analytics
    const useGetAnalytics = () => {
        return useQuery({
            queryKey: ['admin', 'analytics'],
            queryFn: async () => {
                const res = await api.get('/admin-panel/analytics/');
                return res.data;
            },
        });
    };

    return {
        useGetRoleRequests,
        useApproveRoleRequest,
        useRejectRoleRequest,
        useGetProviders,
        useUpdateProviderStatus,
        useGetUsers,
        useToggleUserStatus,
        useVerifyUserEmail,
        useGetUser,
        useUpdateUser,
        useDeleteUser,
        useGetListings,
        useGetBookings,
        useGetAnalytics,
    };
};

export default useAdmin;
