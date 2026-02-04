import React, { useState } from 'react';
import { Star, MessageCircle, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Card from '../../../../components/common/Layout/Card';
import useServices from '../../../../hooks/useServices';
import useAPI from '../../../../hooks/useAPI';

const ReviewsManager = ({ provider }) => {
    const { useRespondToReview } = useServices();
    const respondMutation = useRespondToReview();

    const [replyModal, setReplyModal] = useState({ isOpen: false, review: null });
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const reviews = provider.reviews || [];

    const handleOpenReply = (review) => {
        setReplyModal({ isOpen: true, review });
        setReplyText('');
    };

    const handleCloseReply = () => {
        setReplyModal({ isOpen: false, review: null });
        setReplyText('');
    };

    const handleSubmitReply = async () => {
        if (!replyText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setSubmitting(true);
        try {
            await respondMutation.mutateAsync({
                providerId: provider.id,
                reviewId: replyModal.review.id,
                response: replyText
            });
            toast.success('Response posted successfully');
            handleCloseReply();
        } catch (error) {
            console.error(error);
            toast.error('Failed to post response');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white flex flex-col items-center justify-center text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{provider.rating || '0.0'}</div>
                    <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={20}
                                className={`${star <= Math.round(provider.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm">Overall Rating</p>
                </Card>

                <Card className="p-6 bg-white col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Communication', value: provider.avg_communication || 0 },
                            { label: 'Cleanliness', value: provider.avg_cleanliness || 0 },
                            { label: 'Service Quality', value: provider.avg_quality || 0 },
                            { label: 'Value', value: provider.avg_value || 0 },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-4">
                                <span className="w-32 text-sm text-gray-600">{item.label}</span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full"
                                        style={{ width: `${(item.value / 5) * 100}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-sm font-medium text-gray-900">{item.value.toFixed(1)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900">Recent Reviews ({reviews.length})</h3>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                        <Filter size={16} /> Filter
                    </button>
                </div>

                <div className="divide-y divide-gray-200">
                    {reviews.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No reviews yet.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold">
                                            {review.reviewer?.first_name?.[0] || review.client_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {review.reviewer?.first_name || review.client_name || 'Anonymous'}
                                            </h4>
                                            <p className="text-xs text-gray-500">{format(new Date(review.created_at), 'MMM dd, yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="flex bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold text-sm">
                                        {review.rating_overall || review.rating} <Star size={14} className="ml-1 fill-current" />
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    {review.review_text || review.comment}
                                </p>

                                {/* Provider Response */}
                                {review.provider_response ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 ml-8 text-sm">
                                        <span className="font-bold text-gray-900 block mb-1">Your Response:</span>
                                        <p className="text-gray-600">{review.provider_response}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {review.response_date && `Responded on ${format(new Date(review.response_date), 'MMM dd, yyyy')}`}
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleOpenReply(review)}
                                        className="text-sm text-brand-primary font-medium hover:underline flex items-center gap-1"
                                    >
                                        <MessageCircle size={14} /> Respond to review
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {replyModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Respond to Review</h2>
                            <button onClick={handleCloseReply} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Review by {replyModal.review?.reviewer?.first_name || 'Anonymous'}</p>
                            <p className="text-sm text-gray-700">{replyModal.review?.review_text || replyModal.review?.comment}</p>
                        </div>

                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your response..."
                            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none"
                            rows={4}
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={handleCloseReply}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReply}
                                disabled={submitting}
                                className="px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
                            >
                                {submitting ? 'Posting...' : 'Post Response'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsManager;
