import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Circle, Mail, Phone, MapPin, Calendar, Clock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { format, differenceInYears } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAPI from '../../hooks/useAPI';
import Button from '../../components/common/Buttons/Button';
import Badge from '../../components/common/Feedback/Badge';
import Modal from "../../components/common/Modal";

const OwnerApplicationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useAPI();
    const queryClient = useQueryClient();

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [actionNote, setActionNote] = useState('');

    // Fetch Application Details
    const { data: application, isLoading, error } = useQuery({
        queryKey: ['application', id],
        queryFn: async () => {
            const res = await api.get(`/rehoming/inquiries/${id}/`);
            return res.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ status, notes, rejection_reason }) => {
            return await api.post(`/rehoming/inquiries/${application.application.id}/update_status/`, {
                status,
                owner_notes: notes,
                rejection_reason
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['application', id]);
            toast.success("Application updated successfully");
            setIsApproveModalOpen(false);
            setIsRejectModalOpen(false);
            setActionNote('');
        },
        onError: () => toast.error("Failed to update application")
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-text-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-text-tertiary font-medium">Loading application...</p>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
                <div className="text-center">
                    <p className="text-status-error font-bold text-lg mb-4">Application not found</p>
                    <Button onClick={() => navigate(-1)}>Back to Applications</Button>
                </div>
            </div>
        );
    }

    const applicant = application.applicant;
    const pet = application.pet;
    const trust = application.trust_snapshot;
    const appData = application.application;
    const listing = application.listing;

    const age = applicant.date_of_birth ? differenceInYears(new Date(), new Date(applicant.date_of_birth)) : null;

    return (
        <div className="min-h-screen bg-bg-secondary py-8 px-4 ">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 hover:bg-transparent text-text-tertiary hover:text-text-primary"
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft size={18} className="mr-2" /> Back to Applications
                </Button>

                {/* Main Card */}
                <div className="bg-bg-surface rounded-[32px] border border-border overflow-hidden shadow-sm">

                    {/* Header - Application For */}
                    <div className="px-8 pt-8 pb-6 border-b border-border">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-bg-secondary flex-shrink-0">
                                <img
                                    src={pet.primary_photo}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-text-tertiary font-medium mb-1">Application for</p>
                                <h1 className="text-2xl font-black text-text-primary">{pet.name}</h1>
                                <p className="text-sm text-text-secondary mt-1">
                                    {pet.breed} • {pet.gender} • {pet.species}
                                </p>
                            </div>
                            <Badge
                                variant={appData.status === 'approved_meet_greet' ? 'success' : appData.status === 'pending_review' ? 'warning' : 'neutral'}
                                className="text-[10px] font-black uppercase tracking-wider px-3 py-2"
                            >
                                {appData.status.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                    </div>

                    {/* Applicant Section */}
                    <div className="px-8 py-6 bg-bg-secondary border-b border-border">
                        <div className="flex items-start gap-6">
                            {/* Photo */}
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-bg-surface border-2 border-bg-surface shadow-sm flex-shrink-0">
                                <img
                                    src={applicant.photo_url}
                                    alt={applicant.full_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-black text-text-primary mb-1">{applicant.full_name}</h2>
                                        <p className="text-sm text-text-secondary">
                                            {age && `${age} years old • `}
                                            Member since {format(new Date(applicant.member_since), 'MMM yyyy')}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <Mail size={16} className="text-text-tertiary" />
                                        <span>{applicant.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <Phone size={16} className="text-text-tertiary" />
                                        <span>{applicant.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary md:col-span-2">
                                        <MapPin size={16} className="text-text-tertiary" />
                                        <span>{applicant.location.city}, {applicant.location.state}</span>
                                    </div>
                                </div>

                                {/* Verification Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {trust.email_verified && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold">
                                            <CheckCircle2 size={14} />
                                            <span>Email Verified</span>
                                        </div>
                                    )}
                                    {trust.phone_verified && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold">
                                            <CheckCircle2 size={14} />
                                            <span>Phone Verified</span>
                                        </div>
                                    )}
                                    {trust.identity_verified && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                            <CheckCircle2 size={14} />
                                            <span>Identity Verified</span>
                                        </div>
                                    )}
                                    {trust.profile_completed && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold">
                                            <CheckCircle2 size={14} />
                                            <span>Profile Complete</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Message */}
                    <div className="px-8 py-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-4">Application Message</h3>
                        <div className="bg-bg-secondary rounded-2xl p-6 border border-border">
                            <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                                {application.application_message.intro_message}
                            </p>
                        </div>
                    </div>

                    {/* Application Details */}
                    <div className="px-8 pb-8">
                        <div className="grid grid-cols-2 gap-4 p-6 bg-bg-secondary rounded-2xl border border-border">
                            <div>
                                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">Submitted</p>
                                <p className="text-text-primary font-bold">{format(new Date(appData.submitted_at), 'MMM d, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">Last Updated</p>
                                <p className="text-text-primary font-bold">{format(new Date(appData.last_updated_at), 'MMM d, yyyy')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {appData.status === 'pending_review' && (
                        <div className="px-8 pb-8 flex gap-3 justify-end">
                            <Button
                                variant="danger"
                                className="font-bold"
                                onClick={() => setIsRejectModalOpen(true)}
                            >
                                Reject Application
                            </Button>
                            <Button
                                className="bg-text-primary text-text-inverted hover:bg-black font-bold px-6"
                                onClick={() => setIsApproveModalOpen(true)}
                            >
                                Approve for Meet & Greet
                            </Button>
                        </div>
                    )}

                    {appData.status === 'approved_meet_greet' && (
                        <div className="px-8 pb-8 flex gap-3 justify-end">
                            <Button
                                variant="danger"
                                className="font-bold"
                                onClick={() => setIsRejectModalOpen(true)}
                            >
                                Reject Application
                            </Button>
                            <Button
                                className="bg-[#2E7D32] text-white hover:bg-[#1B5E20] font-bold px-6"
                                onClick={() => updateStatusMutation.mutate({ status: 'adopted' })}
                            >
                                Mark as Adopted
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Reject Application">
                <div className="space-y-4">
                    <p className="text-text-secondary">Are you sure you want to reject this application? The applicant will be notified.</p>
                    <textarea
                        className="w-full h-24 p-3 border border-border rounded-xl focus:ring-2 focus:ring-text-primary outline-none resize-none"
                        placeholder="Reason for rejection (optional)..."
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-500 text-white hover:bg-red-600 border-red-500"
                            onClick={() => updateStatusMutation.mutate({ status: 'rejected', rejection_reason: actionNote })}
                        >
                            Confirm Rejection
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Approve Modal */}
            <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="Approve for Meet & Greet">
                <div className="space-y-4">
                    <p className="text-text-secondary">Schedule a Meet & Greet with the applicant. Your contact details will be shared.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-primary uppercase">Date</label>
                            <input
                                type="date"
                                className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-text-primary outline-none text-sm"
                                id="meet-date"
                                min={format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-primary uppercase">Time</label>
                            <input
                                type="time"
                                className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-text-primary outline-none text-sm"
                                id="meet-time"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-primary uppercase">Additional Notes</label>
                        <textarea
                            className="w-full h-24 p-3 border border-border rounded-xl focus:ring-2 focus:ring-text-primary outline-none resize-none"
                            placeholder="Add location details or special instructions..."
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-text-primary text-text-inverted hover:bg-black"
                            onClick={() => {
                                const date = document.getElementById('meet-date').value;
                                const time = document.getElementById('meet-time').value;

                                if (!date || !time) {
                                    toast.error("Please select both date and time");
                                    return;
                                }

                                const combinedNote = `[SCHEDULED: ${date} ${time}] ${actionNote}`;
                                updateStatusMutation.mutate({ status: 'approved_meet_greet', notes: combinedNote });
                            }}
                        >
                            Confirm Approval
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default OwnerApplicationDetailPage;
