import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Cake, Ruler, Scale, Heart, Info,
    CheckCircle2, Pencil, Calendar, Heart as HeartFilled,
    PawPrint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PetDetailModal = ({ isOpen, onClose, pet }) => {
    const navigate = useNavigate();

    if (!pet) return null;

    const birthDate = pet.birth_date ? new Date(pet.birth_date) : null;
    const age = pet.age_display || (birthDate ? `${new Date().getFullYear() - birthDate.getFullYear()} years` : 'Age Unknown');

    // Data Normalization (match PetCard logic)
    const traits = (pet.traits || []).map(t => t.name || t);
    const photos = pet.media || pet.photos || [];
    const mainPhoto = photos[0]?.url || pet.photoURL || null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-transparent"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-[#C48B28] transition-all shadow-lg border border-white/20"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>

                        {/* Top Hero Section */}
                        <div className="relative h-48 shrink-0 bg-[#FEF9ED]">
                            {mainPhoto ? (
                                <img
                                    src={mainPhoto}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[#C48B28]/20 gap-2">
                                    <PawPrint size={40} strokeWidth={1} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">No Visuals</span>
                                </div>
                            )}
                            {/* Overlay Effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute bottom-5 left-6 right-6">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-white border border-white/30 flex items-center gap-1.5`}>
                                        <div className={`w-1 h-1 rounded-full ${pet.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                                        {pet.status === 'active' ? 'Active' : 'Archived'}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{pet.name || pet.pet_name}</h2>
                                <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest">{pet.breed || 'Mixed Breed'}</p>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                            <div className="grid grid-cols-4 gap-2.5 mb-6">
                                <div className="bg-[#FAF3E0]/50 rounded-xl p-3 flex flex-col items-center text-center">
                                    <Cake size={16} className="text-[#C48B28] mb-1.5" />
                                    <span className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-widest mb-0.5">Age</span>
                                    <span className="text-[10px] font-black text-[#402E11] truncate w-full">{age}</span>
                                </div>
                                <div className="bg-[#FAF3E0]/50 rounded-xl p-3 flex flex-col items-center text-center">
                                    <Heart size={16} className="text-[#C48B28] mb-1.5" />
                                    <span className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-widest mb-0.5">Gender</span>
                                    <span className="text-[10px] font-black text-[#402E11] capitalize truncate w-full">{pet.gender}</span>
                                </div>
                                <div className="bg-[#FAF3E0]/50 rounded-xl p-3 flex flex-col items-center text-center">
                                    <Ruler size={16} className="text-[#C48B28] mb-1.5" />
                                    <span className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-widest mb-0.5">Size</span>
                                    <span className="text-[10px] font-black text-[#402E11] capitalize truncate w-full">{pet.size_category || 'N/A'}</span>
                                </div>
                                <div className="bg-[#FAF3E0]/50 rounded-xl p-3 flex flex-col items-center text-center">
                                    <Scale size={16} className="text-[#C48B28] mb-1.5" />
                                    <span className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-widest mb-0.5">Weight</span>
                                    <span className="text-[10px] font-black text-[#402E11] truncate w-full">{pet.weight_kg ? `${pet.weight_kg} kg` : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Health & Medical */}
                                <div className="space-y-3">
                                    <h4 className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.2em] ml-1">Health & Medical</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <div className={`px-4 py-2.5 rounded-xl flex items-center gap-2.5 border ${pet.spayed_neutered ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-gray-50/50 border-gray-100 text-gray-400'}`}>
                                            <CheckCircle2 size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-wider">{pet.spayed_neutered ? 'Neutered' : 'Not Neutered'}</span>
                                        </div>
                                        <div className={`px-4 py-2.5 rounded-xl flex items-center gap-2.5 border ${pet.microchipped ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-gray-50/50 border-gray-100 text-gray-400'}`}>
                                            <Info size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-wider">{pet.microchipped ? 'Microchipped' : 'No Microchip'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Personality Traits */}
                                {traits.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.2em] ml-1">Personality Traits</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {traits.map((trait, i) => (
                                                <span key={i} className="px-3.5 py-2 bg-[#FAF3E0] text-[#C48B28] text-[9px] font-black uppercase tracking-wider rounded-xl border border-[#EBC176]/20">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Story */}
                                {(pet.description || pet.rehoming_story) && (
                                    <div className="space-y-3">
                                        <h4 className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.2em] ml-1">The Story</h4>
                                        <div className="bg-[#FAF3E0]/30 rounded-2xl p-5 border border-[#EBC176]/10">
                                            <p className="text-[10px] font-bold text-[#402E11]/70 leading-relaxed uppercase tracking-[0.05em]">
                                                {pet.description || pet.rehoming_story}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-[#EBC176]/10 bg-white flex items-center justify-between shrink-0">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#402E11]/40 hover:text-[#C48B28] transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => navigate(`/dashboard/pets/${pet.id}/edit`)}
                                className="bg-[#402E11] text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#C48B28] transition-all flex items-center gap-2.5 group"
                            >
                                <Pencil size={12} strokeWidth={3} />
                                Edit Profile
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PetDetailModal;
