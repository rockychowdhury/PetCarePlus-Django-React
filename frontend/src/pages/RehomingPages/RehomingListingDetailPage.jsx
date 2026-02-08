import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Share2, Heart, Flag, Shield, ChevronLeft, ChevronRight, MapPin, Calendar, MessageCircle, Info, PawPrint, CheckCircle2, Cake, Ruler, Clock } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Card from '../../components/common/Layout/Card';
import Button from '../../components/common/Buttons/Button';
import useAuth from '../../hooks/useAuth';
import useRehoming from '../../hooks/useRehoming';

import ApplicationOptionsModal from '../../components/common/Modals/ApplicationOptionsModal';

const RehomingListingDetailPage = () => {
    const { id } = useParams();
    const { user, getUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentImage, setCurrentImage] = useState(0);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Hooks
    const { useGetListingDetail } = useRehoming();
    const { data: listing, isLoading, error } = useGetListingDetail(id);

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % (listing.pet.photos?.length || 1));
    const prevImage = () => setCurrentImage((prev) => (prev - 1 + (listing.pet.photos?.length || 1)) % (listing.pet.photos?.length || 1));

    const photos = listing?.pet?.photos || [];
    const displayPhotos = photos.length > 0 ? photos.map(p => p.url || p) : ['https://via.placeholder.com/800x600?text=No+Photo'];

    const handleStartApplication = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!user) {
            toast.error("Please login to apply");
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        setIsVerifying(true);
        try {
            await getUser();
            setIsApplicationModalOpen(true);
        } catch (err) {
            console.error("Profile check failed:", err);
            setIsApplicationModalOpen(true);
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading && !listing) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEF9ED]">
            <div className="w-12 h-12 rounded-full border-4 border-[#C48B28]/10 border-t-[#C48B28] animate-spin" />
            <ApplicationOptionsModal
                isOpen={isApplicationModalOpen}
                onClose={() => setIsApplicationModalOpen(false)}
                listingId={id}
            />
            <Toaster position="bottom-center" />
        </div>
    );

    if (error || !listing) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEF9ED]">
            Listing not found.
            <ApplicationOptionsModal
                isOpen={isApplicationModalOpen}
                onClose={() => setIsApplicationModalOpen(false)}
                listingId={id}
            />
            <Toaster position="bottom-center" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FEF9ED] pb-24 font-sans text-[#402E11]">
            {/* Breadcrumb / Nav */}
            <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-10">
                <Link to="/pets" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#C48B28] hover:text-[#402E11] transition-colors mb-8">
                    <ChevronLeft size={14} strokeWidth={3} /> Back to Search
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Gallery Section */}
                        <div className="space-y-6">
                            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#402E11]/5 group bg-white border border-[#EBC176]/20">
                                <img src={displayPhotos[currentImage]} alt={listing.pet.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />

                                {/* Navigation Arrows */}
                                {displayPhotos.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/20 backdrop-blur-xl border border-white/40 rounded-full text-white hover:bg-white hover:text-[#C48B28] transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 duration-500 shadow-lg">
                                            <ChevronLeft size={24} strokeWidth={3} />
                                        </button>
                                        <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/20 backdrop-blur-xl border border-white/40 rounded-full text-white hover:bg-white hover:text-[#C48B28] transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 duration-500 shadow-lg">
                                            <ChevronRight size={24} strokeWidth={3} />
                                        </button>
                                        <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl text-white text-[10px] font-black tracking-[0.2em] border border-white/10 uppercase">
                                            {currentImage + 1} / {displayPhotos.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {displayPhotos.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4 pt-2">
                                    {displayPhotos.map((src, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImage(idx)}
                                            className={`relative w-20 h-20 rounded-[1.2rem] overflow-hidden flex-shrink-0 transition-all duration-300 ${currentImage === idx ? 'ring-2 ring-[#C48B28] ring-offset-4 ring-offset-[#FEF9ED] scale-105 shadow-xl' : 'opacity-60 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0'}`}
                                        >
                                            <img src={src} className="w-full h-full object-cover" alt="Thumb" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title & Key Stats */}
                        <div>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-[#C48B28]/10 text-[#C48B28] rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-[#C48B28]/20">
                                            {listing.pet.breed}
                                        </span>
                                        {listing.pet.status === 'active' && (
                                            <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-green-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Looking for Home
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-5xl font-black text-[#402E11] tracking-tighter mb-3 leading-none">{listing.pet.name}</h1>
                                    <div className="flex items-center gap-5 text-[#402E11]/40 text-[10px] font-black uppercase tracking-[0.15em]">
                                        <span className="flex items-center gap-2.5"><MapPin size={14} strokeWidth={2.5} className="text-[#C48B28]/60" /> {listing.location_city}, {listing.location_state}</span>
                                        <div className="w-1 h-1 rounded-full bg-[#EBC176]/40" />
                                        <span className="flex items-center gap-2.5"><Calendar size={14} strokeWidth={2.5} className="text-[#C48B28]/60" /> Posted {new Date(listing.published_at || listing.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* V2 Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Age', value: listing.pet.age_display || 'Unknown', icon: Cake },
                                    { label: 'Gender', value: listing.pet.gender, icon: Heart },
                                    { label: 'Size', value: listing.pet.size_category, icon: Ruler },
                                    { label: 'Urgency', value: listing.urgency?.replace(/_/g, ' ') || 'Normal', icon: Clock },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-[#FAF3E0]/40 p-5 rounded-[2.5rem] border border-[#EBC176]/10 flex flex-col justify-center items-center text-center group hover:bg-white hover:shadow-xl hover:shadow-[#402E11]/5 transition-all">
                                        <stat.icon size={18} className="text-[#C48B28] mb-2.5 opacity-80" />
                                        <p className="text-[8px] uppercase font-black tracking-[0.2em] text-[#C48B28]/60 mb-1">{stat.label}</p>
                                        <p className="font-black text-[#402E11] text-sm capitalize tracking-tight">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Personality Traits */}
                        {listing.pet.traits && listing.pet.traits.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-[0.3em] flex items-center gap-2">
                                    Personality Match
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {listing.pet.traits.map((trait, i) => (
                                        <span key={i} className="px-4 py-2.5 bg-white border border-[#EBC176]/20 rounded-2xl text-[#402E11]/80 font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md hover:border-[#C48B28]/30 hover:text-[#C48B28] transition-all cursor-default flex items-center gap-2">
                                            <PawPrint size={10} className="text-[#C48B28]/40" strokeWidth={3} />
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* About Section */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-[#402E11]/5 border border-[#EBC176]/10 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FAF3E0]/40 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />

                            <h2 className="text-2xl font-black text-[#402E11] tracking-tight relative z-10">About {listing.pet.name}</h2>
                            <p className="text-[#402E11]/70 text-base leading-loose whitespace-pre-wrap font-bold relative z-10">
                                {listing.reason}
                            </p>
                        </div>

                        {/* Ideal Home Section */}
                        {listing.ideal_home_notes && (
                            <div className="bg-gradient-to-br from-[#402E11] to-[#2c200c] p-10 rounded-[2.5rem] shadow-2xl shadow-[#402E11]/20 space-y-6 relative overflow-hidden text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8"></div>

                                <h3 className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] flex items-center gap-2 relative z-10">
                                    <Shield size={16} /> Ideal Home
                                </h3>
                                <div className="text-white/80 text-base leading-loose whitespace-pre-wrap relative z-10 font-bold">
                                    {listing.ideal_home_notes}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8 space-y-8">

                            {/* Primary Action Card - Merged Design */}
                            <div className="bg-[#588157] p-8 rounded-[2.5rem] shadow-2xl shadow-[#402E11]/10 border border-[#4a6e49] relative overflow-hidden text-center group">
                                {/* Decorative Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                                {/* Top Actions (Heart/Share) */}
                                <div className="absolute top-6 right-6 flex gap-2 z-20">
                                    <button className="p-3 rounded-full bg-black/10 hover:bg-white hover:text-rose-500 text-white transition-all backdrop-blur-sm">
                                        <Heart size={20} className="fill-transparent group-hover:fill-current transition-all" />
                                    </button>
                                    <button className="p-3 rounded-full bg-black/10 hover:bg-white hover:text-[#588157] text-white transition-all backdrop-blur-sm">
                                        <Share2 size={20} />
                                    </button>
                                </div>

                                <div className="relative z-10 pt-4">
                                    {/* Header */}
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">Interested?</p>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4">
                                        Adopt<br />
                                        <span className="text-[#FFD896]">{listing.pet.name}</span>
                                    </h2>
                                    <p className="text-white/80 text-[11px] font-medium leading-relaxed mb-8 px-2">
                                        Start by submitting an inquiry. The owner will review your application and get in touch.
                                    </p>

                                    {/* Owner Info - Translucent Card */}
                                    <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 mb-8 border border-white/10 text-left">
                                        <div className="w-12 h-12 rounded-xl bg-[#FEF9ED] p-0.5 shrink-0">
                                            {listing.owner?.photoURL ? (
                                                <img src={listing.owner.photoURL} alt="Owner" className="w-full h-full object-cover rounded-[0.6rem]" />
                                            ) : (
                                                <div className="w-full h-full bg-[#EBC176] rounded-[0.6rem] flex items-center justify-center text-white font-black text-lg">
                                                    {listing.owner?.first_name?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-0.5">Listed By</p>
                                            <p className="font-black text-white text-base tracking-tight">{listing.owner?.first_name} {listing.owner?.last_name}</p>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="space-y-3">
                                        {user?.id !== listing.owner?.id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleStartApplication}
                                                    disabled={isVerifying}
                                                    className="w-full py-4 text-[#402E11] bg-[#FAF3E0] hover:bg-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-black/5 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    {isVerifying ? "Verifying..." : "Start Application"}
                                                    {!isVerifying && <ChevronRight size={16} strokeWidth={3} />}
                                                </button>

                                                {listing.owner?.phone_number ? (
                                                    <button
                                                        onClick={() => {
                                                            const message = encodeURIComponent(`Hi ${listing.owner.first_name}, I'm interested in adopting ${listing.pet.name}!`);
                                                            window.open(`https://wa.me/${listing.owner.phone_number}?text=${message}`, '_blank');
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white hover:brightness-110 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-green-900/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                                    >
                                                        <MessageCircle size={16} strokeWidth={3} />
                                                        WhatsApp
                                                    </button>
                                                ) : (
                                                    <div className="w-full py-4 bg-black/20 text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center cursor-not-allowed">
                                                        Contact info hidden
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/dashboard/applications"
                                                    className="w-full flex items-center justify-center gap-2 py-4 text-[#402E11] bg-[#FAF3E0] hover:bg-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-black/5 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                                >
                                                    View Applications
                                                </Link>
                                                <div className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2 backdrop-blur-sm">
                                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                    Active Listing
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mt-8 flex items-center justify-center gap-2">
                                        <Shield size={12} /> Secure Adoption Process
                                    </p>
                                </div>
                            </div>

                            {/* Safety Card */}
                            <div className="bg-[#FEF9ED] p-6 rounded-[2.5rem] border border-[#EBC176]/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#fffced] rounded-bl-full -mr-6 -mt-6 pointer-events-none transition-transform group-hover:scale-110" />
                                <h4 className="font-black text-[#402E11] text-xs mb-4 flex items-center gap-2 relative z-10">
                                    <Shield size={16} className="text-[#C48B28]" strokeWidth={2.5} /> Safety Guidelines
                                </h4>
                                <ul className="space-y-3 relative z-10">
                                    {['Meet in public places', 'Bring a friend along', 'Verified Identity Check'].map((tip, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-[#402E11]/70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#C48B28]" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ApplicationOptionsModal
                isOpen={isApplicationModalOpen}
                onClose={() => setIsApplicationModalOpen(false)}
                listingId={id}
            />
            <Toaster position="bottom-center" />
        </div>
    );
};

export default RehomingListingDetailPage;
