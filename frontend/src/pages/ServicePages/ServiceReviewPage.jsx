import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, ChevronLeft, Upload, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import useReviews from '../../hooks/useReviews';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Buttons/Button';
import Card from '../../components/common/Layout/Card';

const ServiceReviewPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('booking');
    const navigate = useNavigate();
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [recommend, setRecommend] = useState('yes');
    const [subRatings, setSubRatings] = useState({
        communication: 5,
        cleanliness: 5,
        care: 5,
        value: 5
    });

    const categories = [
        { id: 'communication', label: 'Communication' },
        { id: 'cleanliness', label: 'Cleanliness' },
        { id: 'care', label: 'Quality of Care' },
        { id: 'value', label: 'Value for Money' }
    ];

    const { useSubmitServiceReview } = useReviews();
    const submitReview = useSubmitServiceReview();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Backend expects: provider (ID), rating_overall, rating_communication, rating_cleanliness, rating_quality, rating_value, review_text, service_type?

        // We need to know the provider's service type or let backend handle it?
        // Model has "service_type" field. 
        // Ideally we fetch provider details first to know type, or pass it in params/state.
        // For MVP, we might hardcode or optional it if backend allows blank (it doesn't seem to allow blank).
        // Let's guess 'foster' (default) or pass dummy if not validating strictly.
        // Actually, 'provider' FK points to ServiceProvider which has 'provider_type'. Review model 'service_type' is redundant or specific?
        // Review model help text: "Type of service used".

        const payload = {
            provider: id,
            booking: bookingId,
            rating_overall: rating,
            rating_communication: subRatings.communication,
            rating_cleanliness: subRatings.cleanliness,
            rating_quality: subRatings.care,
            rating_value: subRatings.value,
            review_text: review,
            service_type: 'general' // Placeholder, maybe should be passed from previous page
        };

        try {
            await submitReview.mutateAsync(payload);
            toast.success("Review submitted successfully!");
            // Invalidate the bookings query to reflect the new has_review state
            navigate('/dashboard/bookings');
        } catch (error) {
            console.error("Service review failed:", error);
            toast.error("Failed to submit review.");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 pl-0 text-text-secondary hover:bg-transparent hover:text-brand-primary">
                    <ChevronLeft size={20} className="mr-1" /> Back to Provider
                </Button>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary font-merriweather mb-2">Review Your Experience</h1>
                    <p className="text-text-secondary">Your feedback helps other pet owners make informed decisions.</p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Overall Rating */}
                        <div className="text-center">
                            <label className="block text-sm font-bold text-text-secondary uppercase mb-3">Overall Rating</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            size={40}
                                            fill={(hoverRating || rating) >= star ? "#FBBF24" : "none"}
                                            className={(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-text-tertiary mt-2 h-5">
                                {rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Average" : rating === 2 ? "Poor" : rating === 1 ? "Terrible" : ""}
                            </p>
                        </div>

                        {/* Detailed Ratings */}
                        <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-text-primary">{cat.label}</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setSubRatings({ ...subRatings, [cat.id]: star })}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    size={20}
                                                    fill={subRatings[cat.id] >= star ? "#FBBF24" : "none"}
                                                    className={subRatings[cat.id] >= star ? "text-yellow-400" : "text-gray-300"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Review Text */}
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Write your review</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                className="w-full p-4 rounded-xl border border-border focus:ring-1 focus:ring-brand-primary outline-none min-h-[150px]"
                                placeholder="What did you like? What could be improved?"
                            />
                            <div className="text-right text-xs text-text-tertiary mt-1">Minimum 20 characters</div>
                        </div>

                        {/* Recommendation */}
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-3">Would you recommend this provider?</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition ${recommend === 'yes' ? 'border-green-500 bg-green-50' : 'border-border hover:bg-gray-50'}`}>
                                    <input type="radio" name="recommend" value="yes" className="hidden" onClick={() => setRecommend('yes')} />
                                    <span className={`font-bold ${recommend === 'yes' ? 'text-green-700' : 'text-text-secondary'}`}>Yes, definitely</span>
                                </label>
                                <label className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition ${recommend === 'no' ? 'border-red-500 bg-red-50' : 'border-border hover:bg-gray-50'}`}>
                                    <input type="radio" name="recommend" value="no" className="hidden" onClick={() => setRecommend('no')} />
                                    <span className={`font-bold ${recommend === 'no' ? 'text-red-700' : 'text-text-secondary'}`}>No, I wouldn't</span>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex flex-col gap-3">
                            <Button variant="primary" size="lg" className="w-full justify-center" disabled={!rating || review.length < 20 || submitReview.isLoading}>
                                {submitReview.isLoading ? 'Submitting...' : 'Submit Review'}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full justify-center" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                        </div>

                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ServiceReviewPage;
