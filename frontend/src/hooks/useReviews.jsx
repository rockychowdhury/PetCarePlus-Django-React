import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import useAPI from './useAPI';

const useReviews = () => {
    const api = useAPI();
    const queryClient = useQueryClient();

    // Submit Adoption Review
    const useSubmitAdoptionReview = () => {
        return useMutation({
            mutationFn: async (reviewData) => {
                const response = await api.post('/reviews/', reviewData);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['adoptionReviews']);
                // Maybe invalidate application to update status if needed
            },
        });
    };

    // Submit Service Review
    const useSubmitServiceReview = () => {
        return useMutation({
            mutationFn: async (reviewData) => {
                const response = await api.post('/services/reviews/', reviewData);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['serviceReviews']);
                queryClient.invalidateQueries(['serviceProvider']); // to update avg rating
                queryClient.invalidateQueries(['myBookings']); // to update has_review status on bookings
            },
        });
    };

    // Get My Reviews (Given)
    const useGetMyReviews = (filters = {}) => {
        return useQuery({
            queryKey: ['myServiceReviews', filters],
            queryFn: async () => {
                const response = await api.get('/services/reviews/', { params: filters });
                return response.data;
            }
        });
    };

    return {
        useSubmitAdoptionReview,
        useSubmitServiceReview,
        useGetMyReviews
    };
};

export default useReviews;
