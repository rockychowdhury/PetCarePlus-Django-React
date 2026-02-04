
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI';
import useAuth from '../../hooks/useAuth';
import useImgBB from '../../hooks/useImgBB';
import axios from 'axios';
import Card from '../../components/common/Layout/Card';
import Input from '../../components/common/Form/Input';
import Switch from '../../components/common/Form/Switch';
import Button from '../../components/common/Buttons/Button';
import WhatsAppVerifier from '../../components/Auth/WhatsAppVerifier';
import { User, Lock, Eye, Bell, Shield, Trash2, Camera, Upload, MapPin, Loader2, Navigation, Phone, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const PROFILE_SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'verification', label: 'Verification', icon: Shield },
  { id: 'delete', label: 'Delete Account', icon: Trash2 },
];

const ProfileSettingsPage = () => {
  const api = useAPI();
  const { user, getUser } = useAuth(); // getUser to refresh context
  const { uploadImage, uploading: imageUploading } = useImgBB();
  const [activeSection, setActiveSection] = useState('personal');
  const [locationLoading, setLocationLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [initialPhoneNumber, setInitialPhoneNumber] = useState('');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // Basic user profile fetch
  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/user/');
      return res.data;
    },
    // If context user is available, use it as placeholder data to avoid flicker
    placeholderData: user,
  });

  // Local state for form fields to handle auto-fill easily
  const [locationData, setLocationData] = useState({
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  // Sync location data when profile loads
  React.useEffect(() => {
    if (profile) {
      setLocationData({
        city: profile.location_city || '',
        state: profile.location_state || '',
        zip_code: profile.zip_code || '',
        country: profile.location_country || ''
      });
      if (profile.photoURL) {
        setPreviewImage(profile.photoURL);
      }
      // Store initial phone number for comparison
      setInitialPhoneNumber(profile.phone_number || '');
    }
  }, [profile]);


  // Mutation: Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.patch('/user/', payload);
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Profile updated successfully!');
      await queryClient.invalidateQueries(['me']);
      await getUser(); // Refresh auth context

      // Redirect back if applicable
      if (location.state?.from) {
        navigate(location.state.from);
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    },
  });

  // Mutation: Change Password
  const changePasswordMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/user/change-password/', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      document.getElementById('password-form')?.reset();
    },
    onError: (err) => {
      const errorData = err.response?.data;
      let msg = "Failed to change password.";
      if (errorData?.new_password) msg = errorData.new_password[0];
      else if (errorData?.old_password) msg = errorData.old_password[0];
      else if (errorData?.detail) msg = errorData.detail;
      toast.error(msg);
    }
  });

  /* ================= HANDLERS ================= */

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optimistic preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to ImgBB
    const result = await uploadImage(file);
    if (result && result.success) {
      setPreviewImage(result.url);
    } else {
      // Revert if failed
      if (profile?.photoURL) setPreviewImage(profile.photoURL);
      else setPreviewImage(null);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (res.data && res.data.address) {
          const addr = res.data.address;
          setLocationData({
            city: addr.city || addr.town || addr.village || '',
            state: addr.state || '',
            zip_code: addr.postcode || '',
            country: addr.country || ''
          });
          toast.success("Location updated!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch address details.");
      } finally {
        setLocationLoading(false);
      }
    }, (err) => {
      console.error(err);
      toast.error("Failed to get location. Please allow permissions.");
      setLocationLoading(false);
    });
  };

  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Construct payload
    const payload = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      phone_number: formData.get('phone'),
      location_city: locationData.city, // Use controlled state
      location_state: locationData.state,
      location_country: locationData.country,
      zip_code: locationData.zip_code,
      date_of_birth: formData.get('date_of_birth'),
      bio: formData.get('bio'),
    };

    // If we have a new image URL (that isn't the old one), add it.
    if (previewImage && previewImage !== profile?.photoURL && previewImage.startsWith('http')) {
      payload.photoURL = previewImage;
    }

    // Check if phone number changed - if so, reset verification status
    const newPhoneNumber = formData.get('phone');
    if (newPhoneNumber && newPhoneNumber !== initialPhoneNumber) {
      payload.phone_verified = false;
    }

    updateProfileMutation.mutate(payload);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    changePasswordMutation.mutate({
      old_password: currentPassword,
      new_password: newPassword
    });
  };

  /* ================= RENDERERS ================= */

  const renderPersonalInfo = () => (
    <div className="bg-white rounded-[3rem] p-10 border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAF3E0]/30 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-[#C48B28]/10 flex items-center justify-center text-[#C48B28] shadow-inner">
            <User size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#402E11] tracking-tight">Personal Details</h2>
            <p className="text-[11px] font-bold text-[#402E11]/40 uppercase tracking-widest">Update your public identity</p>
          </div>
        </div>

        {/* Profile photo upload row */}
        <div className="mb-12 flex flex-col sm:flex-row items-center gap-8 p-6 bg-[#FAF3E0]/20 rounded-[2.5rem] border border-[#EBC176]/20">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-white overflow-hidden border-4 border-white shadow-xl relative z-10 transition-transform group-hover:scale-105 duration-500">
              {imageUploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                  <Loader2 className="animate-spin text-white w-8 h-8" />
                </div>
              )}
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FAF3E0] text-[#C48B28]/30 font-black text-4xl">
                  {profile?.first_name?.[0] || 'U'}
                </div>
              )}
            </div>
            {/* Glow effect behind image */}
            <div className="absolute inset-0 bg-[#C48B28]/20 blur-2xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-lg font-black text-[#402E11] mb-2">Profile Photo</h3>
            <p className="text-xs text-[#402E11]/50 font-bold mb-6 max-w-[200px]">
              Upload a clear photo to build trust with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                className="rounded-xl px-6 py-3 bg-[#402E11] text-white hover:bg-[#C48B28] text-[10px] uppercase tracking-widest font-black shadow-lg shadow-[#402E11]/20 transition-all active:scale-95"
                onClick={() => fileInputRef.current?.click()}
                isDisabled={imageUploading}
              >
                {imageUploading ? 'Uploading...' : 'Choose Image'}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handlePersonalSubmit} className="space-y-8">
          {/* Name row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-[#402E11] uppercase tracking-widest mb-2 ml-1">First Name</label>
              <input
                name="first_name"
                defaultValue={profile?.first_name || ''}
                className="w-full h-14 rounded-2xl border border-[#EBC176]/30 bg-white px-5 text-[#402E11] font-bold focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 transition-all placeholder:text-[#402E11]/20"
                placeholder="e.g. John"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#402E11] uppercase tracking-widest mb-2 ml-1">Last Name</label>
              <input
                name="last_name"
                defaultValue={profile?.last_name || ''}
                className="w-full h-14 rounded-2xl border border-[#EBC176]/30 bg-white px-5 text-[#402E11] font-bold focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 transition-all placeholder:text-[#402E11]/20"
                placeholder="e.g. Doe"
              />
            </div>
          </div>

          {/* Email / Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="opacity-60">
              <label className="block text-xs font-black text-[#402E11] uppercase tracking-widest mb-2 ml-1">Email <span className="text-[10px] normal-case opacity-50 tracking-normal">(Read-only)</span></label>
              <input
                name="email"
                type="email"
                defaultValue={profile?.email || ''}
                readOnly
                className="w-full h-14 rounded-2xl border border-[#EBC176]/20 bg-[#FAF3E0]/30 px-5 text-[#402E11] font-bold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#402E11] uppercase tracking-widest mb-2 ml-1">Phone Number</label>
              <input
                name="phone"
                defaultValue={profile?.phone_number || ''}
                className="w-full h-14 rounded-2xl border border-[#EBC176]/30 bg-white px-5 text-[#402E11] font-bold focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 transition-all placeholder:text-[#402E11]/20"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-black text-[#402E11] uppercase tracking-widest">Location Details</label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="text-[10px] font-black uppercase tracking-widest text-[#C48B28] hover:text-[#402E11] flex items-center gap-1.5 transition-colors disabled:opacity-50 hover:bg-[#FAF3E0] px-3 py-1.5 rounded-lg"
              >
                {locationLoading ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} strokeWidth={2.5} />}
                {locationLoading ? 'Locating...' : 'Auto-Detect'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['city', 'state', 'zip_code', 'country'].map((field) => (
                <div key={field}>
                  <input
                    name={field}
                    value={locationData[field]}
                    onChange={(e) => setLocationData({ ...locationData, [field]: e.target.value })}
                    className="w-full h-14 rounded-2xl border border-[#EBC176]/30 bg-white px-5 text-[#402E11] font-bold focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 transition-all placeholder:text-[#402E11]/20 text-sm"
                    placeholder={field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Date of Birth & Bio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-[#402E11] uppercase tracking-widest mb-2 ml-1">Birth Date</label>
              <input
                name="date_of_birth"
                type="date"
                defaultValue={profile?.date_of_birth || ''}
                className="w-full h-14 rounded-2xl border border-[#EBC176]/30 bg-white px-5 text-[#402E11] font-bold focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 transition-all text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-[#402E11] uppercase tracking-widest mb-2 ml-1">About You</label>
              <textarea
                name="bio"
                defaultValue={profile?.bio || ''}
                maxLength={500}
                className="w-full min-h-[140px] rounded-[1.5rem] border border-[#EBC176]/30 bg-white px-6 py-5 text-sm text-[#402E11] font-bold placeholder:text-[#402E11]/20 focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 resize-none transition-all leading-relaxed"
                placeholder="Share a bit about your experience as a pet owner..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-10 border-t border-[#EBC176]/10">
            <Button
              type="submit"
              className="rounded-2xl bg-[#C48B28] hover:bg-[#b07d24] text-white px-10 py-4 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 transition-all hover:scale-105 active:scale-95"
              isLoading={updateProfileMutation.isLoading || imageUploading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="bg-white rounded-[3rem] p-10 border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-[#C48B28]/10 flex items-center justify-center text-[#C48B28] shadow-inner">
            <Lock size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#402E11] tracking-tight">Security & Auth</h2>
            <p className="text-[11px] font-bold text-[#402E11]/40 uppercase tracking-widest">Protect your account access</p>
          </div>
        </div>

        {/* Password Change Section */}
        <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-8 mb-12">
          <div className="bg-[#FAF3E0]/30 p-8 rounded-[2.5rem] border border-[#EBC176]/20">
            <h3 className="text-sm font-black text-[#402E11] uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C48B28]" />
              Change Password
            </h3>
            <div className="grid grid-cols-1 gap-6 max-w-lg">
              <div>
                <label className="block text-[10px] font-black text-[#402E11]/50 uppercase tracking-widest mb-1.5 ml-1">Current Password</label>
                <input
                  name="currentPassword"
                  type="password"
                  className="w-full h-14 rounded-2xl border border-[#EBC176]/30 bg-white px-5 text-[#402E11] font-bold focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 transition-all"
                  required
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#402E11]/50 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  className="w-full h-14 rounded-2xl border border-[#EBC176]/30 bg-white px-5 text-[#402E11] font-bold focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 transition-all"
                  required
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#402E11]/50 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="w-full h-14 rounded-2xl border border-[#EBC176]/30 bg-white px-5 text-[#402E11] font-bold focus:outline-none focus:border-[#C48B28] focus:ring-4 focus:ring-[#C48B28]/10 transition-all"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                className="rounded-2xl bg-[#402E11] hover:bg-[#C48B28] text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#402E11]/20 transition-all active:scale-95"
                isLoading={changePasswordMutation.isLoading}
              >
                Update Credentials
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 rounded-3xl border border-[#EBC176]/10 bg-white shadow-sm mt-4">
            <div>
              <p className="text-sm font-black text-[#402E11]">Two-Factor Authentication</p>
              <p className="text-xs text-[#402E11]/40 mt-1 font-bold">
                Add an extra layer of security (Coming Soon).
              </p>
            </div>
            <Switch
              label=""
              checked={false}
              onChange={() => { }}
              isDisabled
            />
          </div>
        </form>

        {/* Phone Verification Section */}
        <div className="border-t border-[#EBC176]/10 pt-10">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#C48B28]/10 flex items-center justify-center shrink-0 text-[#C48B28]">
              <Phone size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#402E11] mb-1">Phone Verification</h3>
              <p className="text-xs text-[#402E11]/50 font-bold max-w-md">
                Verify your phone number using WhatsApp for enhanced status and trust badges.
              </p>
            </div>
          </div>

          {profile?.phone_verified ? (
            <div className="bg-green-50/50 border border-green-100 rounded-[2rem] p-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Shield size={18} className="text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#402E11]">Verified successfully</p>
                  <p className="text-xs text-[#402E11]/50 font-bold mt-0.5">{profile.phone_number}</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-green-700/60 mt-2 pl-14">
                Your account is secured with a verified phone number.
              </p>
            </div>
          ) : (
            <div>
              {!profile?.phone_number ? (
                <div className="bg-[#FAF3E0]/30 border border-[#EBC176]/30 rounded-[2rem] p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#EBC176] flex items-center justify-center shrink-0 shadow-lg shadow-[#EBC176]/20">
                      <span className="text-white font-black text-lg">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#402E11] mb-2">Missing Contact Info</p>
                      <p className="text-xs text-[#402E11]/50 font-bold mb-4 leading-relaxed">
                        Please add your phone number in the Personal Info section first to unlock verification features.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveSection('personal')}
                        className="text-[10px] font-black uppercase tracking-widest text-[#C48B28] hover:text-[#402E11] flex items-center gap-2 transition-colors"
                      >
                        Go to Personal Info <ChevronRight size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-[#402E11]/5 border border-[#402E11]/10 rounded-[2rem] p-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#402E11] flex items-center justify-center shrink-0 shadow-lg text-white">
                        <Phone size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Unverified Number</p>
                        <p className="text-lg font-black text-[#402E11] tracking-tight">
                          {profile.phone_number}
                        </p>
                      </div>
                    </div>
                  </div>
                  <WhatsAppVerifier />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="bg-white rounded-[3rem] p-16 text-center border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5">
      <div className="w-20 h-20 bg-[#FAF3E0]/50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-[#402E11]/20 shadow-inner">
        <Eye size={32} strokeWidth={2.5} />
      </div>
      <h2 className="text-2xl font-black text-[#402E11] tracking-tight mb-3">Privacy Controls</h2>
      <p className="text-[#402E11]/50 font-bold max-w-sm mx-auto leading-relaxed mb-8">
        Granular visibility settings for your profile and contact info are currently under development.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF3E0] rounded-full text-[10px] font-black text-[#C48B28] uppercase tracking-widest">
        Coming Soon
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal': return renderPersonalInfo();
      case 'security': return renderSecurity();
      case 'privacy': return renderPrivacy();
      default: return (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5">
          <div className="w-20 h-20 bg-[#FAF3E0]/50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-[#402E11]/20 shadow-inner">
            {PROFILE_SECTIONS.find(s => s.id === activeSection)?.icon && React.createElement(PROFILE_SECTIONS.find(s => s.id === activeSection).icon, { size: 32, strokeWidth: 2.5 })}
          </div>
          <h2 className="text-2xl font-black text-[#402E11] tracking-tight mb-3">
            {PROFILE_SECTIONS.find(s => s.id === activeSection)?.label}
          </h2>
          <p className="text-[#402E11]/50 font-bold max-w-sm mx-auto leading-relaxed">
            This module is being fine-tuned for your experience. Check back soon for elite pet management controls.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="w-full md:p-12 lg:p-20 space-y-12 bg-[#FEF9ED]/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Account Center</span>
          <h1 className="text-5xl font-black text-[#402E11] tracking-tighter mb-4">
            Preferences
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-[#402E11]/60 font-bold text-sm">Fine-tune your professional pet care profile.</p>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-[#EBC176]/20 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C48B28] animate-pulse" />
              <span className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-widest leading-none">Settings Hub</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full xl:w-80 shrink-0">
          <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-[#EBC176]/20 p-5 sticky top-12 shadow-2xl shadow-[#402E11]/5">
            <div className="px-5 mb-5 space-y-1">
              <p className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.3em] opacity-50">Menu</p>
              <h4 className="text-sm font-black text-[#402E11] uppercase tracking-tight">Management</h4>
            </div>
            <nav className="space-y-2">
              {PROFILE_SECTIONS.map((section) => {
                const active = activeSection === section.id;
                const Icon = section.icon;
                const isDanger = section.id === 'delete';

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center justify-between gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all group relative overflow-hidden
                      ${active
                        ? isDanger
                          ? 'bg-status-error text-white shadow-xl shadow-status-error/20'
                          : 'bg-[#402E11] text-white shadow-2xl shadow-[#402E11]/30'
                        : isDanger
                          ? 'text-status-error hover:bg-status-error/5'
                          : 'text-[#402E11]/40 hover:bg-[#FAF3E0]/50 hover:text-[#402E11]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={18} strokeWidth={active ? 3 : 2.5} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {section.label}
                    </div>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-[#C48B28] shadow-lg shadow-[#C48B28]/50" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-10 pt-10 border-t border-[#EBC176]/10 px-5 pb-5">
              <div className="p-6 bg-[#FAF3E0]/40 rounded-[2rem] border border-[#EBC176]/10">
                <Shield className="text-[#C48B28] mb-3" size={24} strokeWidth={3} />
                <p className="text-[9px] font-black text-[#402E11] uppercase tracking-[0.2em] mb-1">Security Status</p>
                <p className="text-[10px] font-bold text-[#402E11]/40 leading-relaxed">
                  {profile?.phone_verified ? 'Account fully verified and secure.' : 'Please verify your phone number.'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {renderActiveSection()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
