import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, AlertTriangle, MapPin, Heart, PawPrint, CheckCircle } from 'lucide-react';
import RehomingActionBar from './components/RehomingActionBar';
import { toast } from 'react-toastify';
import useRehoming from '../../hooks/useRehoming';
import usePets from '../../hooks/usePets';

const RehomingReviewPage = () => {
    const { formData, updateFormData, markStepComplete, petId } = useOutletContext();
    const navigate = useNavigate();
    const { useGetUserPets } = usePets();
    const { data: pets } = useGetUserPets();
    const { useCreateListing, useCreateRehomingRequest } = useRehoming();
    const createListingMutation = useCreateListing();
    const createRequestMutation = useCreateRehomingRequest();

    const petsList = Array.isArray(pets) ? pets : (pets?.results || []);
    const pet = petsList.find(p => p.id === petId);

    const handleSubmit = async () => {
        if (!formData.terms_accepted) {
            toast.warning("Please accept the terms and conditions");
            return;
        }

        try {
            // Step 1: Create the Rehoming Request
            const requestData = await createRequestMutation.mutateAsync({
                pet: petId,
                reason: formData.reason,
                urgency: formData.urgency,
                location_city: formData.location_city,
                location_state: formData.location_state,
                location_country: formData.location_country || 'Bangladesh',
                latitude: formData.latitude ? parseFloat(formData.latitude.toFixed(6)) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude.toFixed(6)) : null,
                ideal_home_notes: formData.ideal_home_notes,
                terms_accepted: formData.terms_accepted,
                status: 'pending' // Usually requests start as pending
            });

            // Step 2: Create the Listing using the Request ID
            await createListingMutation.mutateAsync({
                request_id: requestData.id,
                status: 'active'
            });

            toast.success("Listing published successfully!");
            navigate('/dashboard/rehoming?tab=listings');
        } catch (error) {
            console.error("Submission error:", error);
            const errorMessage = error.response?.data?.detail || "Failed to publish listing. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-[#402E11] mb-2 tracking-tight">Review & <span className="text-[#C48B28]">Publish</span></h1>
                <p className="text-[#402E11]/60 text-xs font-bold uppercase tracking-[0.15em]">One last look before it goes live</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-[#EBC176]/20 shadow-2xl shadow-[#402E11]/5 p-8 md:p-10 mb-8">
                {/* Pet Summary */}
                <div className="flex items-center gap-6 p-6 bg-[#FAF3E0]/40 rounded-3xl border border-[#EBC176]/10 mb-10">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-white shrink-0">
                        {pet?.media?.[0]?.url ? (
                            <img src={pet.media[0].url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#EBC176]/20 flex items-center justify-center text-[#C48B28]">
                                <PawPrint size={32} />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#402E11] mb-1">{pet?.name}</h2>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#C48B28]">
                            <span>{pet?.species}</span>
                            <span className="w-1 h-1 rounded-full bg-[#EBC176]/50" />
                            <span className="text-[#402E11]/40">{pet?.breed}</span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em] border-b border-[#EBC176]/10 pb-2">The Situation</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest block mb-1">Reason</span>
                                <p className="text-xs font-bold text-[#402E11] leading-relaxed line-clamp-3">{formData.reason || 'Not specified'}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest block mb-1">Urgency</span>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF3E0] rounded-full border border-[#EBC176]/20">
                                    <div className={`w-1.5 h-1.5 rounded-full ${formData.urgency === 'immediate' ? 'bg-red-500' : formData.urgency === 'soon' ? 'bg-[#C48B28]' : 'bg-[#5A856D]'}`} />
                                    <span className="text-[10px] font-black text-[#402E11] uppercase tracking-widest capitalize">{formData.urgency}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em] border-b border-[#EBC176]/10 pb-2">Location</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#FAF3E0] flex items-center justify-center text-[#C48B28]">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[#402E11]">{formData.location_city}, {formData.location_state}</p>
                                    <p className="text-[9px] font-bold text-[#402E11]/40">{formData.location_country || 'Bangladesh'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#EBF1ED] flex items-center justify-center text-[#5A856D]">
                                    <Heart size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-[#5A856D] uppercase tracking-widest">Ideal Home Set</p>
                                    <p className="text-[10px] font-bold text-[#402E11]/40 line-clamp-1">{formData.ideal_home_notes || 'No notes'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms Acceptance */}
                <label className="flex items-start gap-4 p-6 bg-[#FAF3E0]/20 rounded-3xl border border-[#EBC176]/10 cursor-pointer group hover:bg-[#FAF3E0]/40 transition-all">
                    <input
                        type="checkbox"
                        checked={formData.terms_accepted}
                        onChange={(e) => updateFormData({ terms_accepted: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded-lg border-2 border-[#EBC176]/30 text-[#C48B28] focus:ring-[#C48B28] transition-all cursor-pointer"
                    />
                    <div className="space-y-1">
                        <p className="text-[11px] font-black text-[#402E11] uppercase tracking-wider">Accept Terms and Safety Guidelines</p>
                        <p className="text-[10px] font-bold text-[#402E11]/40 leading-relaxed">
                            I understand that rehoming is a significant responsibility and agree to follow PetCarePlus safety guidelines to ensure the best outcome for my pet.
                        </p>
                    </div>
                </label>
            </div>

            {/* Final Action Bar */}
            <RehomingActionBar
                onBack={() => navigate('/rehoming/details')}
                onNext={handleSubmit}
                nextLabel={createListingMutation.isPending || createRequestMutation.isPending ? 'Publishing...' : 'Publish Listing'}
                nextIcon={CheckCircle}
                canNext={!createListingMutation.isPending && !createRequestMutation.isPending && formData.terms_accepted}
                isLoading={createListingMutation.isPending || createRequestMutation.isPending}
                variant="success"
                statusText="Final review before publishing"
            />
        </div>
    );
};

export default RehomingReviewPage;
