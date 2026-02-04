import React from 'react';
import {
    Heart, MapPin, Clock, Sparkles, ShieldCheck,
    Home, Share2, LayoutGrid, List as ListIcon,
    Calendar, CheckCircle2, Info, Trash2, Archive, RotateCcw, Pencil, Eye,
    Cake, Ruler, Scale, Users, PawPrint
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PetCard = ({ pet, viewMode = 'grid', variant = 'listing', onDelete, onToggleActive, onView, isPreview = false }) => {
    const isProfile = variant === 'profile';

    // -------------------------------------------------------------------------
    // 1. Data Normalization
    // -------------------------------------------------------------------------
    let data = {};

    if (!isProfile && pet.pet) {
        // --- CASE A: Rehoming Listing (Public) ---
        // Structure: { id, pet: {...}, owner: {...}, status, urgency, location_city, ... }
        const p = pet.pet;
        const o = pet.owner || {};

        data = {
            id: pet.id, // Listing ID used for navigation
            name: p.name || 'Unnamed Pet',
            species: p.species || 'Pet',
            breed: p.breed || 'Mixed Breed',
            age: p.age_display || 'Age Unknown',
            gender: p.gender || 'Unknown',

            // Image
            photo: p.main_photo || (p.photos && p.photos[0]?.url) || null,

            // Location
            city: pet.location_city || 'Nearby',
            state: pet.location_state || '',

            // Physical & Health from nested pet
            size: p.size_category || 'N/A',
            weight: p.weight_kg ? `${parseFloat(p.weight_kg).toFixed(2)} kg` : 'N/A',
            isNeutered: p.spayed_neutered,
            isChipped: p.microchipped,

            // Badges & Status
            status: pet.status,
            urgency: pet.urgency, // 'immediate', 'soon', 'flexible'
            isUrgent: pet.urgency === 'immediate',

            // Engagement
            views: pet.view_count || 0,
            applications: pet.application_count || 0,

            // Trust
            isVerified: o.verified_identity || o.pet_owner_verified,

            // Traits from nested pet
            traits: p.traits || []
        };

        // Construct formatting
        data.locationLabel = data.state ? `${data.city}, ${data.state}` : data.city;
        data.metaLine = `${data.species} • ${data.breed} • ${data.age} • ${data.gender === 'male' ? 'Male ♂️' : data.gender === 'female' ? 'Female ♀️' : data.gender}`;

    } else {
        // --- CASE B: User Profile (Dashboard) ---
        // Structure: { id, name, species, ... } direct flat object
        data = {
            id: pet.id,
            name: pet.name || pet.pet_name || 'Unnamed',
            species: pet.species || 'Pet',
            breed: pet.breed || 'Mixed',
            age: pet.age_display || (pet.birth_date ? `${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} years` : 'Age Unknown'),
            gender: pet.gender || 'Unknown',

            photo: (pet.media && pet.media[0]?.url) || pet.photoURL || null,

            city: pet.location_city || 'Nearby',
            state: pet.location_state || '',

            status: pet.status,
            weight: pet.weight_kg ? `${parseFloat(pet.weight_kg).toFixed(2)} lbs` : 'N/A',
            size: pet.size_category || 'N/A',
            isNeutered: pet.spayed_neutered,
            isChipped: pet.microchipped,
            traits: (pet.traits || []).map(t => t.name || t), // Handle objects or strings
            created_at: pet.created_at ? new Date(pet.created_at).toLocaleDateString() : 'Unknown',

            // Defaults
            isUrgent: false,
            views: 0,
            applications: 0,
            isVerified: false
        };
        data.locationLabel = data.state ? `${data.city}, ${data.state}` : data.city;
    }

    // -------------------------------------------------------------------------
    // 2. Render Components
    // -------------------------------------------------------------------------

    // --- User Dashboard Card (Profile) used in "My Pets" ---
    if (isProfile) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col max-w-[280px] w-full mx-auto"
            >
                {/* Image Section with Status Badge */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#FEF9ED]">
                    {data.photo ? (
                        <img
                            src={data.photo}
                            alt={data.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#C48B28]/20 gap-2">
                            <PawPrint size={32} strokeWidth={1.5} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">No Photo Uploaded</span>
                        </div>
                    )}

                    {/* Status Badge - Top Left */}
                    <div className="absolute top-2 left-2">
                        <div className={`px-2 py-0.5 text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm ${isPreview ? 'bg-[#C48B28]' : (data.status === 'active' ? 'bg-[#C48B28]' : 'bg-[#402E11]/70')
                            }`}>
                            <div className={`w-1 h-1 rounded-full ${isPreview ? 'bg-white animate-pulse' : (data.status === 'active' ? 'bg-white animate-pulse' : 'bg-gray-300')}`} />
                            {isPreview ? 'Preview' : (data.status === 'active' ? 'Active' : 'Inactive')}
                        </div>
                    </div>

                    {/* Edit Button - Top Right (Hidden in Preview) */}
                    {!isPreview && (
                        <Link
                            to={`/dashboard/pets/${data.id}/edit`}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#402E11] hover:bg-[#C48B28] hover:text-white transition-all shadow-sm"
                        >
                            <Pencil size={10} />
                        </Link>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-3 flex flex-col gap-2.5">
                    {/* Pet Name & Type */}
                    <div>
                        <h3 className="text-sm font-black text-[#402E11] leading-tight mb-0.5 truncate">{data.name}</h3>
                        <p className="text-[9px] font-bold text-[#402E11]/50 uppercase tracking-widest truncate">
                            {data.species} • {data.breed}
                        </p>
                    </div>

                    {/* Stats Grid - Ultra Compact */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Cake size={10} className="text-[#C48B28] flex-shrink-0" />
                            <p className="text-[10px] font-bold text-[#402E11] truncate">{data.age}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-[#C48B28] flex-shrink-0 leading-none">
                                {data.gender.toLowerCase() === 'female' ? '♀' : data.gender.toLowerCase() === 'male' ? '♂' : '?'}
                            </span>
                            <p className="text-[10px] font-bold text-[#402E11] capitalize truncate">{data.gender}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Ruler size={10} className="text-[#C48B28] flex-shrink-0" />
                            <p className="text-[10px] font-bold text-[#402E11] capitalize truncate">{data.size}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Scale size={10} className="text-[#C48B28] flex-shrink-0" />
                            <p className="text-[10px] font-bold text-[#402E11] truncate">{data.weight}</p>
                        </div>
                    </div>

                    {/* Health Status - Tiny pills */}
                    <div className="flex items-center gap-1.5">
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${data.isNeutered ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                            }`}>
                            <CheckCircle2 size={8} />
                            {data.isNeutered ? 'Neutered' : 'Not'}
                        </div>
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${data.isChipped ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
                            }`}>
                            <Info size={8} />
                            {data.isChipped ? 'Chipped' : 'No Chip'}
                        </div>
                    </div>

                    {/* Traits */}
                    {data.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {data.traits.slice(0, 2).map((trait, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-themev2-surface/20 text-themev2-text/70 text-[8px] font-bold rounded border border-themev2-surface/40">
                                    {trait}
                                </span>
                            ))}
                            {data.traits.length > 2 && (
                                <span className="px-1.5 py-0.5 text-themev2-text/50 text-[8px] font-bold">
                                    +{data.traits.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-1.5 mt-auto pt-1">
                        <button
                            onClick={() => onView && onView(pet)}
                            className="flex-1 bg-[#402E11] text-white h-7 rounded-lg flex items-center justify-center text-[9px] font-bold uppercase tracking-wide hover:bg-[#C48B28] transition-all shadow-sm"
                        >
                            View
                        </button>
                        {onToggleActive && (
                            <button
                                onClick={() => onToggleActive(pet)}
                                className="w-7 h-7 flex items-center justify-center border border-[#EBC176]/40 rounded-lg text-[#402E11]/60 hover:text-[#C48B28] hover:bg-[#FAF3E0] transition-all"
                            >
                                {data.status === 'active' ? <Archive size={12} /> : <RotateCcw size={12} />}
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(pet.id)}
                                className="w-7 h-7 flex items-center justify-center border border-red-100 bg-red-50 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    // --- Compact Listing Card (New Design - Matching ServiceCard) ---
    if (variant === 'compact-listing' || variant === 'listing-compact') {
        const SpeciesIcon = data.species?.toLowerCase() === 'cat' ? Cake : // Replace with Cat icon if imported, using Cake as placeholder or fix imports
            data.species?.toLowerCase() === 'dog' ? Home : // Replace with Dog icon
                Heart; // Fallback

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
                {/* Image Section - 4:3 Aspect Ratio to match Services */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#FEF9ED]">
                    <Link to={`/pets/${data.id}`} className="block w-full h-full">
                        {data.photo ? (
                            <img
                                src={data.photo}
                                alt={data.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#C48B28]/20 gap-1">
                                <PawPrint size={24} strokeWidth={1.5} />
                                <span className="text-[7px] font-black uppercase tracking-widest">No Photo</span>
                            </div>
                        )}
                    </Link>

                    {/* Top Right Heart (Optional, similar to ServiceCard commented out, but good for Pets) */}
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-brand-primary transition-all shadow-sm opacity-0 group-hover:opacity-100">
                        <Heart size={16} />
                    </button>

                    {/* Urgency Badge if Urgent */}
                    {data.isUrgent && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-status-error text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-sm">
                            <Clock size={12} strokeWidth={3} /> Immediate
                        </div>
                    )}
                </div>

                {/* Content Section - Matches ServiceCard p-5 */}
                <div className="p-5 flex flex-col flex-1">

                    {/* Species/Breed Label - Top Header */}
                    <div className="flex items-center gap-2 mb-1.5 text-text-tertiary">
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">
                            {data.species} • {data.breed}
                        </span>
                    </div>

                    {/* Title */}
                    <Link to={`/pets/${data.id}`} className="block mb-2">
                        <h3 className="text-lg font-bold text-text-primary leading-tight group-hover:text-brand-primary transition-colors line-clamp-1">
                            {data.name}
                        </h3>
                    </Link>

                    {/* Meta Row (Age, Gender, Location) - Replaces Rating */}
                    <div className="flex flex-col gap-1 mb-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <span>{data.age}</span>
                            <span className="text-gray-300">•</span>
                            <span className="capitalize">{data.gender}</span>
                            <span className="text-gray-300">•</span>
                            <span className="capitalize">{data.size}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-text-secondary mt-1">
                            <MapPin size={14} />
                            <span className="text-xs font-medium truncate">{data.locationLabel}</span>
                        </div>
                    </div>

                    {/* Traits Tags */}
                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                        {data.traits.slice(0, 2).map((trait, i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-text-secondary capitalize">
                                {trait}
                            </span>
                        ))}
                        {data.traits.length > 2 && (
                            <span className="px-2.5 py-1 text-text-tertiary text-[10px] font-bold">
                                +{data.traits.length - 2}
                            </span>
                        )}
                    </div>


                    {/* Footer / Status & Action */}
                    {/* Footer / Status & Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                        {/* Status */}
                        <div>
                            {data.isVerified ? (
                                <div className="flex items-center gap-1.5 text-brand-primary text-[10px] font-bold uppercase tracking-wider">
                                    <ShieldCheck size={14} strokeWidth={2.5} /> Verified
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Available</span>
                            )}
                        </div>

                        {/* View Button - Updated Style */}
                        <Link
                            to={`/pets/${data.id}`}
                            className="px-6 py-2 bg-white border border-gray-100 text-brand-primary rounded-full text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                            View
                        </Link>
                    </div>

                </div>
            </motion.div>
        );
    }

    // --- Public Rehoming Listing Card (The Original/Large Layout) ---
    // Matches docs/listcard.txt

    // --- Public Rehoming Listing Card (The New Premium Layout) ---
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group bg-white rounded-[2.5rem] border border-[#EBC176]/20 overflow-hidden hover:shadow-2xl hover:shadow-[#EBC176]/10 transition-all duration-300 flex flex-col h-full ${viewMode === 'list' ? 'md:flex-row' : ''}`}
        >
            {/* Media Section */}
            <div className={`relative bg-[#FEF9ED] flex items-center justify-center overflow-hidden transition-colors duration-500 ${viewMode === 'list' ? 'w-full md:w-80 h-48 md:h-full' : 'h-36'}`}>
                <Link to={`/rehoming/listings/${data.id}`} className="block h-full w-full text-inherit">
                    {data.photo ? (
                        <img
                            src={data.photo}
                            alt={data.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#C48B28]/20 gap-2">
                            <PawPrint size={viewMode === 'list' ? 48 : 32} strokeWidth={1} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Pending Visuals</span>
                        </div>
                    )}
                </Link>

                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Badges */}
                <div className="absolute top-4 inset-x-4 flex justify-between items-start pointer-events-none">
                    <div>
                        {data.isUrgent && (
                            <div className="px-3 py-1 bg-status-error text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 shadow-sm">
                                <Clock size={12} strokeWidth={3} /> Immediate
                            </div>
                        )}
                    </div>

                    <button className="pointer-events-auto p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all active:scale-90 border border-white/20 shadow-sm z-20">
                        <Heart size={18} fill="currentColor" className="fill-transparent hover:fill-current transition-all" />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-4 flex flex-col flex-1 relative bg-white">
                {/* Species & Breed Label */}
                <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-black text-themev2-text/30 uppercase tracking-[0.2em] truncate whitespace-nowrap">
                        {data.species} • {data.breed}
                    </span>
                </div>

                {/* Name & Basic Info */}
                <div className="mb-4">
                    <Link to={`/rehoming/listings/${data.id}`} className="block group/link">
                        <h3 className="text-sm font-black text-themev2-text tracking-tight group-hover/link:text-[#C48B28] transition-colors leading-tight mb-1">
                            {data.name}
                        </h3>
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-themev2-text/60">
                            <span>{data.age}</span>
                            <span className="text-themev2-text/20">•</span>
                            <span className="capitalize">{data.gender}</span>
                            <span className="text-themev2-text/20">•</span>
                            <span className="capitalize">{data.size}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-themev2-text/30 mt-1">
                        <MapPin size={10} strokeWidth={2.5} className="text-[#C48B28]/40" />
                        <span className="text-[10px] font-bold">{data.locationLabel}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4 items-start align-top min-h-[36px] mt-auto">
                    {data.traits.slice(0, 3).map((trait, idx) => (
                        <span
                            key={idx}
                            className="px-2.5 py-1 bg-[#FDF8F3]/50 border border-[#EBC176]/20 rounded-md text-[10px] font-bold text-themev2-text/60 shadow-sm whitespace-nowrap hover:bg-[#FDF8F3] transition-colors cursor-default"
                        >
                            {trait}
                        </span>
                    ))}
                    {data.traits.length > 3 && (
                        <span className="text-[10px] font-bold text-themev2-text/30 ml-1 py-1">+{data.traits.length - 3} more</span>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-[#EBC176]/10 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 group/apps cursor-help"
                        title={`Total application is ${data.applications}`}
                    >
                        <div className="w-9 h-9 rounded-xl bg-[#FEF2D5] flex items-center justify-center text-[#C48B28] shadow-sm border border-[#EBC176]/20 transition-all group-hover/apps:bg-[#C48B28] group-hover/apps:text-white">
                            <Users size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-black text-themev2-text/40 group-hover/apps:text-[#C48B28] transition-colors">
                            {data.applications}
                        </span>
                    </div>

                    <Link
                        to={`/rehoming/listings/${data.id}`}
                        className="px-6 py-2.5 bg-[#D4A056] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C48B28] transition-all shadow-md shadow-[#D4A056]/10 active:scale-95"
                    >
                        Details
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(PetCard);
