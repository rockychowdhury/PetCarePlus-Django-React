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
  Star, Share2, Plus, Heart, PawPrint, UserCheck, ChevronRight, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfilePage = () => {
  const { user: authUser } = useAuth();
  const api = useAPI();
  const [activeTab, setActiveTab] = useState('about');

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await api.get('/users/');
      return res.data;
    }
  });

  const { data: pets = [] } = useQuery({
    queryKey: ['myPets'],
    queryFn: async () => {
      try {
        const res = await api.get('/user/pets/');
        return res.data.results || res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['myListings'],
    queryFn: async () => {
      try {
        const res = await api.get('/pets/?owner=me&status=active');
        return res.data.results || res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const profile = userProfile || authUser;

  if (profileLoading && !profile) return (
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-4 border-[#C48B28]/20 border-t-[#C48B28] rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'about', label: 'About', icon: UserCheck },
    { id: 'mypets', label: 'My Pets', icon: PawPrint },
    { id: 'mylistings', label: 'Listings', icon: Share2 },
  ];

  return (
    <div className="w-full md:p-12 lg:p-20 bg-[#FEF9ED]/30 min-h-screen pt-32 md:pt-12">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 pb-12 border-b-2 border-[#EBC176]/10">
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-[#C48B28]/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Avatar
              size="xl"
              initials={profile?.first_name?.[0]}
              photoURL={profile?.photoURL}
              className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white shadow-2xl shadow-[#C48B28]/10 font-logo bg-white text-[#C48B28] relative z-10"
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div>
              <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-3 block">Citizen Member</span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#402E11] tracking-tighter leading-none">
                {profile?.full_name || `${profile?.first_name} ${profile?.last_name}`}
              </h1>
              <p className="text-xs font-bold text-[#402E11]/40 uppercase tracking-widest mt-4">
                Active member since {new Date(profile?.date_joined || Date.now()).getFullYear()}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link to="/dashboard/profile/edit">
                <button className="px-8 py-4 bg-[#C48B28] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#C48B28]/20">
                  Modify Identity
                </button>
              </Link>
              <button className="px-8 py-4 bg-white border-2 border-[#EBC176]/10 text-[#402E11] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FAF3E0]/30 transition-all flex items-center gap-2">
                <Share2 size={16} strokeWidth={3} /> Broadcast
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-8 px-6 py-4 bg-white/40 backdrop-blur-md rounded-3xl border border-[#EBC176]/10 shadow-sm md:self-center">
            <div className="text-center group cursor-default">
              <span className="block text-2xl font-black text-[#402E11] tracking-tighter group-hover:text-[#C48B28] transition-colors">{pets.length}</span>
              <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em]">Companions</span>
            </div>
            <div className="w-px bg-[#EBC176]/20 self-stretch" />
            <div className="text-center group cursor-default">
              <span className="block text-2xl font-black text-[#402E11] tracking-tighter group-hover:text-[#C48B28] transition-colors">{listings.length}</span>
              <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em]">Listings</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-10">
            {/* Detailed Info */}
            <div className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-[#EBC176]/10 shadow-xl shadow-[#C48B28]/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FAF3E0] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <h3 className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-8 relative z-10 flex items-center gap-2">
                <UserCheck size={14} strokeWidth={3} /> Identification
              </h3>
              <div className="space-y-6 relative z-10">
                {profile?.location_city && (
                  <div className="group/item flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] group-hover/item:scale-110 transition-transform">
                      <MapPin size={16} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest">Residency</p>
                      <p className="text-sm font-black text-[#402E11] truncate">{profile.location_city}</p>
                    </div>
                  </div>
                )}
                <div className="group/item flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] group-hover/item:scale-110 transition-transform">
                    <Mail size={16} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest">Electronic Mail</p>
                    <p className="text-sm font-black text-[#402E11] truncate">{profile?.email}</p>
                  </div>
                </div>
                {profile?.phone_number && (
                  <div className="group/item flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] group-hover/item:scale-110 transition-transform">
                      <Phone size={16} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest">Direct Contact</p>
                      <p className="text-sm font-black text-[#402E11]">{profile.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification */}
            <div className="bg-[#402E11] p-8 rounded-[2.5rem] space-y-8 shadow-2xl shadow-black/10 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mb-16 blur-2xl" />
              <h3 className="text-[10px] font-black text-[#EBC176] uppercase tracking-[0.3em] flex items-center gap-2 relative z-10">
                <CheckCircle size={14} strokeWidth={3} /> Authentication
              </h3>
              <div className="space-y-4 relative z-10">
                {[
                  { label: "Email Address", status: profile?.email_verified },
                  { label: "Mobile Device", status: profile?.phone_verified },
                  { label: "Identity Matrix", status: profile?.verified_identity },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{item.label}</span>
                    {item.status ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Verified</span>
                        <CheckCircle size={16} className="text-green-400" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-white/30 transition-colors" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex border-b-2 border-[#EBC176]/10 overflow-x-auto no-scrollbar pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-8 py-6 font-black text-[10px] uppercase tracking-[0.3em] transition-all relative flex items-center gap-3 whitespace-nowrap
                    ${activeTab === tab.id ? 'text-[#402E11]' : 'text-[#402E11]/30 hover:text-[#402E11]/60'}
                  `}
                >
                  <tab.icon size={14} strokeWidth={3} className={activeTab === tab.id ? 'text-[#C48B28]' : 'text-inherit'} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="tabActive" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#C48B28] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="prose prose-stone max-w-none bg-white p-8 md:p-12 rounded-[3rem] border border-[#EBC176]/10 shadow-xl shadow-[#C48B28]/5"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-[#C48B28]/10 rounded-xl">
                        <Quote size={20} className="text-[#C48B28]" strokeWidth={3} />
                      </div>
                      <h4 className="text-[10px] font-black text-[#402E11] uppercase tracking-[0.3em] m-0">Personal Manifest</h4>
                    </div>
                    {profile?.bio ? (
                      <p className="text-base md:text-lg text-[#402E11]/70 leading-relaxed font-bold italic tracking-tight m-0">
                        "{profile.bio}"
                      </p>
                    ) : (
                      <div className="text-center py-10 opacity-30">
                        <p className="font-black uppercase tracking-[0.4em] text-sm">Awaiting Narrative</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'mypets' && (
                  <motion.div
                    key="pets"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {pets.map(pet => (
                      <Link key={pet.id} to={`/pets/${pet.id}`} className="group p-5 bg-white rounded-3xl border border-[#EBC176]/10 hover:border-[#C48B28]/40 hover:shadow-2xl hover:shadow-[#C48B28]/10 transition-all flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#FEF9ED] border-2 border-[#EBC176]/10 group-hover:scale-105 transition-transform duration-500">
                          <img src={pet.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg font-black text-[#402E11] tracking-tight group-hover:text-[#C48B28] transition-colors truncate">{pet.pet_name}</h4>
                          <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest mt-1 truncate">{pet.breed || pet.species}</p>
                          <div className="flex items-center gap-1.5 mt-3">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Active Profile</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[#402E11]/10 group-hover:text-[#C48B28] group-hover:translate-x-1 transition-all" strokeWidth={3} />
                      </Link>
                    ))}
                    <Link
                      to="/dashboard/pets/create"
                      className="group p-6 bg-[#FEF9ED]/50 border-2 border-dashed border-[#EBC176]/30 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-[#C48B28] hover:shadow-xl transition-all h-[120px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#C48B28] shadow-sm group-hover:scale-110 transition-all">
                        <Plus size={20} strokeWidth={3} />
                      </div>
                      <span className="text-[9px] font-black text-[#5A3C0B]/40 uppercase tracking-widest">Register Companion</span>
                    </Link>
                  </motion.div>
                )}

                {activeTab === 'mylistings' && (
                  <motion.div
                    key="listings"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    {listings.length > 0 ? listings.map(pet => (
                      <PetCard key={pet.id} pet={pet} viewMode="list" variant="profile" />
                    )) : (
                      <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-[#EBC176]/20 text-center">
                        <p className="text-[10px] font-black text-[#402E11]/20 uppercase tracking-[0.4em]">Zero Passive Listings</p>
                      </div>
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
