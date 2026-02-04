
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Send, ArrowLeft, Paperclip, Image as ImageIcon, Info, ShieldCheck } from 'lucide-react';
import useAPI from '../../hooks/useAPI';
import useRehoming from '../../hooks/useRehoming';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Buttons/Button';

const ApplicationMailboxPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const api = useAPI();
    const { user } = useAuth();
    const { useGetListingDetail } = useRehoming();
    const { data: listing, isLoading, isError } = useGetListingDetail(id);
    const [message, setMessage] = useState(location.state?.initialMessage || '');
    const [accepted, setAccepted] = useState(false);

    const submitMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.post('/rehoming/inquiries/', payload);
        },
        onSuccess: () => {
            toast.success("Application sent successfully!");
            navigate('/dashboard/applications');
        },
        onError: (err) => {
            console.error(err);
            toast.error(err.response?.data?.detail || "Failed to send application.");
        }
    });

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="animate-pulse text-brand-primary font-bold tracking-widest uppercase text-xs">Loading Mailbox...</div>
        </div>
    );

    if (isError || !listing) return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="text-center space-y-4">
                <p className="text-text-secondary">Listing not found.</p>
                <Button variant="outline" onClick={() => navigate('/pets')}>Back to Pets</Button>
            </div>
        </div>
    );

    const { pet, owner } = listing;

    const handleSubmit = () => {
        if (message.length < 20) {
            toast.error("Please write a bit more about yourself (min 20 chars).");
            return;
        }
        submitMutation.mutate({
            listing_id: listing.id,
            message: message
        });
    };

    return (
        <div className="min-h-screen bg-[#FEF9ED] py-12 px-4 font-sans text-[#402E11]">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header / Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#402E11]/60 text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#C48B28] transition-colors"
                >
                    <ArrowLeft size={16} strokeWidth={2.5} /> Cancel Application
                </button>

                {/* Mailbox Container */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#402E11]/5 overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-[#EBC176]/20">

                    {/* Left Panel: Context */}
                    <div className="w-full md:w-80 bg-[#FAF3E0]/30 border-r border-[#EBC176]/20 p-8 flex flex-col gap-8">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C48B28] mb-4">Re: Adoption Inquiry</p>
                            <div className="bg-white p-4 rounded-[1.5rem] border border-[#EBC176]/20 shadow-sm space-y-4 group hover:shadow-md transition-all">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 relative">
                                    <img src={pet.main_photo} alt={pet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#402E11] tracking-tight">{pet.name}</h3>
                                    <p className="text-[10px] text-[#402E11]/60 font-bold uppercase tracking-wider">{pet.breed} • {pet.age_display}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#FEF9ED] border border-[#EBC176]/30 flex items-center justify-center text-[#C48B28] font-black text-lg shadow-sm">
                                    {owner.first_name[0]}
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-[#402E11]/40 uppercase tracking-[0.2em] mb-0.5">To Owner</p>
                                    <p className="text-sm font-black text-[#402E11] tracking-tight">{owner.first_name} {owner.last_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-lg shadow-sm">
                                    {user?.first_name?.[0] || 'M'}
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-[#402E11]/40 uppercase tracking-[0.2em] mb-0.5">From Applicant</p>
                                    <p className="text-sm font-black text-[#402E11] tracking-tight">{user?.first_name} {user?.last_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
                            <div className="flex gap-3">
                                <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-900/70 leading-relaxed font-bold">
                                    This conversation is secure. Avoid sharing financial info or deposit requests until you verify the owner in person.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Composition */}
                    <div className="flex-1 flex flex-col bg-white relative">
                        {/* Toolbar */}
                        <div className="h-16 border-b border-[#EBC176]/10 flex items-center px-8 gap-4">
                            <p className="text-[10px] font-black text-[#402E11]/30 mr-auto uppercase tracking-[0.2em]">New Message</p>
                            <p className="text-[10px] text-[#402E11]/30 font-black uppercase tracking-widest">
                                {message.trim() === '' ? 0 : message.trim().split(/\s+/).length} words
                            </p>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 p-8">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Why do you want to adopt this pet?

What attracted you to this specific pet?
Living Situation(home type, ownership, members etc)
Pet Experience & History
Daily Care Plan
etc"
                                className="w-full h-full resize-none outline-none text-[#402E11] placeholder:text-[#402E11]/20 leading-relaxed font-bold text-base bg-transparent border-2 border-transparent focus:border-blue-500/10 rounded-xl p-4 transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Footer / Send Action */}
                        <div className="p-8 border-t border-[#EBC176]/10 bg-[#FAF3E0]/10">
                            {/* Declaration */}
                            <div className="mb-6 flex items-start gap-3 group cursor-pointer select-none" onClick={() => setAccepted(!accepted)}>
                                <div className={`mt-0.5 w-6 h-6 rounded-lg border-[3px] flex items-center justify-center transition-all duration-200 ${accepted ? 'bg-[#C48B28] border-transparent' : 'bg-white border-[#EBC176] group-hover:border-[#C48B28]'}`}>
                                    <div className={`w-2.5 h-2.5 rounded-[2px] bg-white shadow-sm transition-all duration-200 ${accepted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                </div>
                                <label className="text-[11px] text-[#402E11]/60 leading-relaxed font-bold cursor-pointer">
                                    I confirm that all the information provided above is true and accurate to the best of my knowledge.
                                    I also agree to the <span className="text-[#C48B28] hover:underline">Terms of Service</span> and <span className="text-[#C48B28] hover:underline">Privacy Policy</span>.
                                </label>
                            </div>

                            <div className="flex items-center justify-end">
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={submitMutation.isPending}
                                    isDisabled={message.length < 20 || !accepted}
                                    className={`
                                        rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all flex items-center gap-2
                                        ${message.length >= 20 && accepted
                                            ? 'bg-[#98A886] hover:bg-[#869675] text-white shadow-[#98A886]/30 hover:-translate-y-0.5'
                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}
                                    `}
                                    rightIcon={<Send size={14} strokeWidth={3} />}
                                >
                                    Send Application
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApplicationMailboxPage;
