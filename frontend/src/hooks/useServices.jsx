import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerService, bookingService, referenceService, userService } from '../services';

const useServices = () => {
    const queryClient = useQueryClient();

    // --- Metadata Queries ---
    const useGetCategories = () => useQuery({
        queryKey: ['serviceCategories'],
        queryFn: referenceService.getCategories
    });

    const useGetSpecies = () => useQuery({
        queryKey: ['species'],
        queryFn: referenceService.getSpecies
    });

    const useGetServiceOptions = () => useQuery({
        queryKey: ['serviceOptions'],
        queryFn: referenceService.getServiceOptions
    });

    const useGetSpecializations = () => useQuery({
        queryKey: ['specializations'],
        queryFn: referenceService.getSpecializations
    });

    // --- Provider Queries ---
    const useGetProviders = (filters) => {
        return useQuery({
            queryKey: ['serviceProviders', filters],
            queryFn: async () => {
                const params = {};
                // Map frontend filters to API params
                if (filters.providerType) params.category = filters.providerType;
                if (filters.category) params.category = filters.category;

                // Location-based filtering (nearby takes precedence)
                if (filters.nearby) {
                    params.nearby = filters.nearby;
                } else {
                    if (filters.location) params.location_city = filters.location;
                    if (filters.radius) params.radius = filters.radius;
                }

                if (filters.search) params.search = filters.search;
                if (filters.species) params.species = filters.species;
                if (filters.min_rating) params.min_rating = filters.min_rating;
                if (filters.availability) params.availability = filters.availability;
                if (filters.services) params.services = filters.services;

                if (filters.ordering) params.ordering = filters.ordering;
                if (filters.sort) params.ordering = filters.sort;
                if (filters.page) params.page = filters.page;

                // Additional filters
                if (filters.verification_status) params.verification_status = filters.verification_status;
                if (filters.min_rating) params.min_rating = filters.min_rating;

                console.log('🚀 useGetProviders sending params to API:', params);

                return await providerService.getAll(params);
            }
        });
    };

    const useGetProvider = (id) => {
        return useQuery({
            queryKey: ['serviceProvider', id],
            queryFn: () => providerService.getById(id),
            enabled: !!id
        });
    };

    const useGetMyProviderProfile = (options = {}) => {
        return useQuery({
            queryKey: ['myServiceProvider'],
            queryFn: providerService.getMe,
            retry: false,
            ...options
        });
    };

    const useGetDashboardStats = () => {
        return useQuery({
            queryKey: ['providerDashboardStats'],
            queryFn: providerService.getDashboardStats
        });
    };

    const useCreateProviderProfile = () => {
        return useMutation({
            mutationFn: providerService.create,
            onSuccess: () => {
                queryClient.invalidateQueries(['serviceProviders']);
                queryClient.invalidateQueries(['userProfile']);
            }
        });
    };

    const useUpdateProviderProfile = () => {
        return useMutation({
            mutationFn: ({ id, data }) => providerService.update(id, data),
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries(['serviceProvider', variables.id]);
                queryClient.invalidateQueries(['myServiceProvider']);
            }
        });
    };

    const useUpdateProviderHours = () => {
        return useMutation({
            mutationFn: ({ id, data }) => providerService.updateHours(id, data),
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries(['serviceProvider', variables.id]);
                queryClient.invalidateQueries(['myServiceProvider']);
            }
        });
    };

    const useUpdateProviderMedia = () => {
        // Now using uploadMedia (multipart) or traditional update if strictly JSON metadata needed
        // Assuming we want to upload new media
        return useMutation({
            mutationFn: ({ id, data }) => providerService.uploadMedia(id, data),
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries(['serviceProvider', variables.id]);
                queryClient.invalidateQueries(['myServiceProvider']);
            }
        });
    };

    const useSubmitProviderApplication = () => {
        return useMutation({
            mutationFn: (id) => providerService.submitApplication(id),
            onSuccess: () => {
                queryClient.invalidateQueries(['myServiceProvider']);
                queryClient.invalidateQueries(['userProfile']);
            }
        });
    };

    // --- Booking Queries ---
    const useCreateBooking = () => {
        return useMutation({
            mutationFn: bookingService.create,
            onSuccess: () => {
                queryClient.invalidateQueries(['myBookings']);
            }
        });
    };

    const useGetMyBookings = () => useQuery({
        queryKey: ['myBookings'],
        queryFn: () => bookingService.getAll({}) // Empty params for now, API filters on user
    });

    const useBookingAction = () => {
        return useMutation({
            mutationFn: ({ id, action, data }) => {
                return bookingService.performAction(id, action, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['myBookings']);
            }
        });
    };

    const useRespondToReview = () => {
        return useMutation({
            mutationFn: ({ providerId, reviewId, response }) =>
                providerService.respondToReview(providerId, reviewId, response),
            onSuccess: () => {
                queryClient.invalidateQueries(['providerDashboardStats']);
                queryClient.invalidateQueries(['myServiceProvider']);
            }
        });
    };

    const useGetProviderAnalytics = () => {
        return useQuery({
            queryKey: ['providerAnalytics'],
            queryFn: providerService.getAnalytics
        });
    };

    // --- Settings ---
    const useUpdateProviderSettings = () => {
        return useMutation({
            mutationFn: ({ id, data }) => providerService.update(id, { settings: data }),
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries(['serviceProvider', variables.id]);
                queryClient.invalidateQueries(['myServiceProvider']);
            }
        });
    };

    // --- Role Requests ---
    const useCreateRoleRequest = () => {
        return useMutation({
            mutationFn: userService.createRoleRequest,
            onSuccess: () => {
                queryClient.invalidateQueries(['myRoleRequests']);
            }
        });
    };

    const useGetMyRoleRequests = () => useQuery({
        queryKey: ['myRoleRequests'],
        queryFn: userService.getAllRoleRequests
    });

    return {
        useGetCategories,
        useGetSpecies,
        useGetServiceOptions,
        useGetSpecializations,
        useGetProviders,
        useGetProvider,
        useGetMyProviderProfile,
        useCreateProviderProfile,
        useUpdateProviderProfile,
        useUpdateProviderHours,
        useUpdateProviderMedia,
        useSubmitProviderApplication,
        useCreateBooking,
        useGetMyBookings,
        useBookingAction,
        useCreateRoleRequest,
        useGetMyRoleRequests,
        useGetDashboardStats,
        useGetProviderAnalytics,
        useRespondToReview,
        useUpdateProviderSettings
    };
};

export default useServices;
