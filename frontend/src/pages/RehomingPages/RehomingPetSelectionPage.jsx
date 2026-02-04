import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { PlusCircle, CheckCircle2, AlertCircle, Edit2, Search, ArrowLeft, ArrowRight, PawPrint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import usePets from '../../hooks/usePets';
import RehomingActionBar from './components/RehomingActionBar';

const RehomingPetSelectionPage = () => {
    const { setPetId, markStepComplete } = useOutletContext();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { useGetUserPets } = usePets();
    const { data: pets, isLoading } = useGetUserPets({ exclude_active_listings: true });

    const [selectedPetId, setSelectedPetId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const petsList = Array.isArray(pets) ? pets : (pets?.results || []);

    const filteredPets = petsList.filter(pet =>
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pet.breed && pet.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (pet.species && pet.species.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const selectedPet = petsList.find(p => p.id === selectedPetId);

    const handlePetClick = (pet) => {
        if (!pet.profile_is_complete) {
            navigate(`/dashboard/pets/${pet.id}/edit`, {
                state: { returnTo: '/rehoming/select-pet' }
            });
            return;
        }

        if (selectedPetId === pet.id) {
            setSelectedPetId(null);
        } else {
            setSelectedPetId(pet.id);
        }
    };

    const handleContinue = () => {
        if (selectedPetId) {
            setPetId(selectedPetId);
            markStepComplete('selection');
            navigate('/rehoming/situation');
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-[#C48B28]/20 border-t-[#C48B28] rounded-full animate-spin" />
            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Finding your companions...</span>
        </div>
    );

    return (
        <div className="w-full pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 max-w-7xl mx-auto px-4">
                <div className="text-left w-full md:w-auto">
                    <h1 className="text-2xl md:text-3xl font-black text-[#402E11] tracking-tight">
                        Which pet are you <span className="text-[#C48B28]">rehoming?</span>
                    </h1>
                </div>

                {/* Search Bar - Compact */}
                <div className="w-full md:w-auto md:min-w-[320px] relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C48B28] group-focus-within:text-[#402E11] transition-colors">
                        <Search size={18} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or breed..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-[2rem] border border-[#EBC176]/20 bg-white shadow-lg shadow-[#402E11]/5 focus:shadow-xl focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/5 outline-none text-sm font-bold text-[#402E11] transition-all placeholder:text-[#402E11]/30"
                    />
                </div>
            </div>

            {/* Simple Empty State */}
            {petsList.length === 0 ? (
                <div className="max-w-2xl mx-auto py-10 px-6 text-center bg-white border-2 border-dashed border-[#EBC176]/30 rounded-[2.5rem] mb-8">
                    <div className="w-14 h-14 bg-[#FAF3E0] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C48B28]">
                        <PlusCircle size={28} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-black text-[#402E11] mb-2 tracking-tight">No pets available</h3>
                    <p className="text-[#402E11]/60 font-medium text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                        You don't have any pets on your profile that are available for rehoming at the moment.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/pets/create')}
                        className="bg-[#C48B28] text-white rounded-2xl px-8 py-3 font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-[#C48B28]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Add a Pet
                    </button>
                </div>
            ) : filteredPets.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-[#FAF3E0] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#C48B28]">
                        <Search size={24} strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-black text-[#402E11] mb-2">No matches found</h3>
                    <p className="text-[#402E11]/60 text-xs font-bold">Try broadening your search criteria.</p>
                </div>
            ) : (
                /* Pet Grid - Premium Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredPets.map(pet => {
                            const isSelected = selectedPetId === pet.id;
                            const isComplete = pet.profile_is_complete;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={pet.id}
                                    onClick={() => handlePetClick(pet)}
                                    className={`
                                        relative rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 group bg-white
                                        ${isSelected
                                            ? 'ring-4 ring-[#C48B28] shadow-2xl scale-[1.03]'
                                            : 'border border-[#EBC176]/10 hover:shadow-2xl hover:-translate-y-2'
                                        }
                                    `}
                                >
                                    {/* Selection Glow */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-[#C48B28]/5 z-10" />
                                    )}

                                    {/* Selection Badge */}
                                    {isSelected && (
                                        <div className="absolute top-4 right-4 z-30 bg-[#C48B28] text-white rounded-full p-1.5 shadow-xl animate-in zoom-in-50 duration-300">
                                            <CheckCircle2 size={16} strokeWidth={3} />
                                        </div>
                                    )}

                                    {/* Incomplete Status */}
                                    {!isComplete && (
                                        <div className="absolute top-4 left-4 z-30 bg-white/90 backdrop-blur-md text-[#A66D00] border border-[#EBC176]/50 text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 uppercase tracking-widest">
                                            <AlertCircle size={12} strokeWidth={3} /> Incomplete
                                        </div>
                                    )}

                                    {/* Pet Image Container */}
                                    <div className="aspect-[4/3] bg-[#FAF3E0] relative overflow-hidden">
                                        {pet.media && pet.media.length > 0 ? (
                                            <img src={pet.media[0].url} alt={pet.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[#C48B28]">
                                                <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center mb-2">
                                                    <PawPrint size={20} strokeWidth={2.5} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">No Portrait</span>
                                            </div>
                                        )}

                                        {/* Incomplete Actions Overlay */}
                                        {!isComplete && (
                                            <div className="absolute inset-0 bg-[#402E11]/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm z-20">
                                                <div className="bg-white text-[#402E11] text-[10px] font-black px-5 py-2.5 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-2xl">
                                                    <Edit2 size={12} strokeWidth={2.5} /> Update Profile
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Info */}
                                    <div className={`p-6 text-center transition-all duration-500 ${isSelected ? 'bg-transparent' : 'bg-white'}`}>
                                        <h3 className={`text-xl font-black mb-1 transition-colors duration-300 ${isSelected ? 'text-[#402E11]' : 'text-[#402E11]'}`}>
                                            {pet.name}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#C48B28]">
                                            <span>{pet.species || 'Companion'}</span>
                                            {pet.breed && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-[#EBC176]/50" />
                                                    <span className="text-[#402E11]/40">{pet.breed}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Premium Action Bar - Clean & Modern */}
            <RehomingActionBar
                onBack={() => navigate(-1)}
                onNext={handleContinue}
                canNext={!!selectedPetId}
                statusText={!selectedPetId ? 'Select a pet to proceed' : `Proceed with ${petsList.find(p => p.id === selectedPetId)?.name}`}
            />
        </div >
    );
};

export default RehomingPetSelectionPage;
