import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAPI from '../../hooks/useAPI';
import Button from '../../components/common/Buttons/Button';
import Avatar from '../../components/common/Display/Avatar';
import PetCard from '../../components/Pet/PetCard';
import NoResults from '../../components/common/Feedback/NoResults';
import {
  MapPin, Calendar, CheckCircle, Phone, Mail, Edit2,
  Star, Share2, Plus, Heart, PawPrint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfilePage = () => {
  const { user } = useAuth();
  const api = useAPI();
  const [activeTab, setActiveTab] = useState('about');

  // Fetch user pets 
  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ['myPets'],
    queryFn: async () => {
      try {
        const res = await api.get('/user/pets/');
        return res.data.results || res.data;
      } catch (e) {
        console.error("Failed to fetch pets", e);
        return [];
      }
    }
  });

  // Fetch listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: async () => {
      const res = await api.get('/pets/?owner=me&status=active');
      return res.data.results || res.data;
    }
  });

  if (!user) return (
    <div className="min-h-screen pt-40 text-center bg-[#FEF9ED]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#C48B28]/20 border-t-[#C48B28] rounded-full animate-spin" />
        <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Loading Profile...</span>
      </div>
    </div>
  );

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'mypets', label: 'My Pets' },
    { id: 'mylistings', label: 'Listings' },
  ];

  return (
    <div className="min-h-screen bg-[#FEF9ED] pb-32">
      {/* Visual Header Background */}
      <div className="h-[40vh] bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#EBC176_0%,_transparent_40%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#C48B28_0%,_transparent_40%)] opacity-10" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#402E11 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-[3rem] p-8 border border-[#EBC176]/20 shadow-xl shadow-[#C48B28]/5 relative overflow-hidden"
            >
              {/* Verified Decorator */}
              {user?.is_verified && (
                <div className="absolute top-0 right-0 bg-[#C48B28] text-white px-6 py-2 rounded-bl-[2rem] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  Verified
                </div>
              )}

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="p-1.5 bg-white rounded-full shadow-lg">
                    <Avatar
                      size="2xl"
                      initials={user?.first_name?.[0]}
                      photoURL={user?.photoURL}
                      className="w-32 h-32 md:w-40 md:h-40 border-4 border-[#FDFBF7] shadow-inner text-5xl font-logo bg-[#FEF9ED] text-[#C48B28]"
                    />
                  </div>
                </div>

                <h1 className="text-3xl font-black text-[#402E11] mb-2 tracking-tight">
                  {user?.first_name} {user?.last_name}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-3 text-[#402E11]/60 text-xs font-bold mb-8">
                  {user?.location_city && (
                    <span className="flex items-center gap-1 bg-[#FAF3E0] px-3 py-1.5 rounded-full text-[#C48B28]">
                      <MapPin size={12} />
                      {user.location_city}
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-[#FAF3E0] px-3 py-1.5 rounded-full text-[#C48B28]">
                    <Calendar size={12} />
                    Joined {new Date(user?.date_joined || Date.now()).getFullYear()}
                  </span>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-2 w-full mb-8">
                  <div className="bg-[#FEF9ED] rounded-2xl p-3 border border-[#EBC176]/20">
                    <span className="block text-xl font-black text-[#402E11]">{pets.length}</span>
                    <span className="text-[10px] font-bold text-[#402E11]/40 uppercase">Pets</span>
                  </div>
                  <div className="bg-[#FEF9ED] rounded-2xl p-3 border border-[#EBC176]/20">
                    <span className="block text-xl font-black text-[#402E11]">{listings.length}</span>
                    <span className="text-[10px] font-bold text-[#402E11]/40 uppercase">Listings</span>
                  </div>
                  <div className="bg-[#FEF9ED] rounded-2xl p-3 border border-[#EBC176]/20">
                    <span className="block text-xl font-black text-[#402E11] flex items-center justify-center gap-1">
                      5.0 <Star size={12} className="fill-[#C48B28] text-[#C48B28]" />
                    </span>
                    <span className="text-[10px] font-bold text-[#402E11]/40 uppercase">Rating</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <Link to="/dashboard/profile/edit" className="block w-full">
                    <button className="w-full py-4 bg-[#402E11] text-[#EBC176] rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-[#2A1E0B] transition-colors shadow-lg shadow-[#402E11]/20 flex items-center justify-center gap-2">
                      <Edit2 size={14} /> Edit Profile
                    </button>
                  </Link>
                  <button className="w-full py-4 bg-white border border-[#EBC176]/30 text-[#402E11] rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-[#FEF9ED] transition-colors flex items-center justify-center gap-2">
                    <Share2 size={14} /> Share Profile
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Contact Info Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20"
            >
              <h3 className="text-sm font-black text-[#402E11] uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C48B28]" /> Contact Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF9ED] text-[#C48B28] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-[#402E11]/40 uppercase">Email</span>
                    <span className="text-sm font-bold text-[#402E11]">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF9ED] text-[#C48B28] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-[#402E11]/40 uppercase">Phone</span>
                    {user.phone_number ? (
                      <span className="text-sm font-bold text-[#402E11]">{user.phone_number}</span>
                    ) : (
                      <Link to="/dashboard/profile/settings" className="text-sm font-bold text-[#C48B28] hover:underline">Add Phone Number</Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-[#EBC176]/10 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                                relative px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300
                                ${activeTab === tab.id
                      ? 'text-white shadow-lg shadow-[#C48B28]/20'
                      : 'text-[#402E11]/50 hover:text-[#402E11] hover:bg-[#FEF9ED]'
                    }
                            `}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#C48B28] rounded-[1.5rem]"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {/* ABOUT TAB */}
                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-[3rem] p-10 border border-[#EBC176]/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEF9ED] rounded-full -mr-20 -mt-20 opacity-50 blur-3xl" />

                    <h2 className="text-2xl font-black text-[#402E11] mb-6 relative">My Story</h2>
                    {user.bio ? (
                      <p className="text-[#402E11]/70 leading-relaxed text-lg font-medium relative max-w-2xl">
                        "{user.bio}"
                      </p>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-[#402E11]/40 font-bold mb-4">You haven't written a bio yet.</p>
                        <Link to="/dashboard/profile/settings" className="inline-flex items-center gap-2 text-[#C48B28] font-black uppercase text-xs tracking-widest hover:underline">
                          <Edit2 size={14} /> Write your story
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* MY PETS TAB */}
                {activeTab === 'mypets' && (
                  <motion.div
                    key="mypets"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {pets.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pets.map(pet => (
                          <Link key={pet.id} to={`/pets/${pet.id}`} className="block group">
                            <div className="bg-white rounded-[2.5rem] p-3 border border-[#EBC176]/10 hover:border-[#C48B28]/30 transition-all hover:shadow-xl hover:shadow-[#C48B28]/5">
                              <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#FEF9ED] relative mb-4">
                                <img
                                  src={pet.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"}
                                  alt={pet.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-[#402E11] uppercase tracking-wider">
                                  {pet.species}
                                </div>
                              </div>
                              <div className="px-4 pb-2">
                                <h3 className="text-xl font-black text-[#402E11] mb-1">{pet.pet_name}</h3>
                                <p className="text-[#402E11]/40 text-xs font-bold uppercase tracking-widest">{pet.breed}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                        <Link to="/dashboard/pets/create" className="group flex flex-col items-center justify-center bg-[#FEF9ED] border-2 border-dashed border-[#EBC176] rounded-[2.5rem] min-h-[300px] hover:bg-white transition-all cursor-pointer">
                          <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center text-[#C48B28] shadow-sm mb-4 group-hover:scale-110 transition-transform border border-[#EBC176]/20">
                            <Plus size={28} strokeWidth={2.5} />
                          </div>
                          <span className="text-[#C48B28] font-black uppercase text-xs tracking-[0.2em]">Add New Pet</span>
                        </Link>
                      </div>
                    ) : (
                      <NoResults
                        icon={PawPrint}
                        title="No pets added yet"
                        description="Add your furry friends to your profile to keep track of their care."
                        actionLabel="Add a Pet"
                        onReset={() => window.location.href = '/dashboard/pets/create'}
                      />
                    )}
                  </motion.div>
                )}

                {/* LISTINGS TAB */}
                {activeTab === 'mylistings' && (
                  <motion.div
                    key="mylistings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {listings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {listings.map(pet => (
                          <PetCard key={pet.id} pet={pet} viewMode="grid" />
                        ))}
                      </div>
                    ) : (
                      <NoResults
                        icon={Share2}
                        title="No active listings"
                        description="You aren't currently rehoming any pets."
                        actionLabel="Create Listing"
                        onReset={() => window.location.href = '/rehoming'}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
