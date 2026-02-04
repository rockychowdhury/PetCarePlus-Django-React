import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, Heart, Shield, Edit2, Navigation, Search, Map as MapIcon, Loader } from 'lucide-react';
import RehomingActionBar from './components/RehomingActionBar';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import LocationMapModal from '../../components/Services/LocationMapModal';

const RehomingDetailsPage = () => {
    const { formData, updateFormData, markStepComplete } = useOutletContext();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [errors, setErrors] = useState({});

    // Initialize location from user profile if not set
    useEffect(() => {
        if (!formData.location_city && user) {
            updateFormData({
                location_city: user.location_city || '',
                location_state: user.location_state || '',
                location_country: user.location_country || 'Bangladesh',
                location_postal_code: user.location_postal_code || '',
                latitude: user.latitude || null,
                longitude: user.longitude || null,
                enable_location_edit: false
            });
        }
    }, [user, formData.location_city, updateFormData]);

    const validate = () => {
        const newErrors = {};
        if (!formData.location_city) newErrors.location_city = "City is required";
        if (!formData.location_state) newErrors.location_state = "State is required";
        if (!formData.latitude || !formData.longitude) {
            newErrors.location_coords = "Map location is required to calculate distances for adopters.";
        }
        if (!formData.ideal_home_notes || formData.ideal_home_notes.length < 50) {
            newErrors.ideal_home_notes = "Please describe the home in more detail (min 50 chars).";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            markStepComplete('details');
            navigate('/rehoming/review');
            window.scrollTo(0, 0);
        }
    };

    const toggleLocationEdit = () => {
        const newEditState = !formData.enable_location_edit;
        updateFormData({ enable_location_edit: newEditState });

        if (!newEditState && user) {
            updateFormData({
                location_city: user.location_city || '',
                location_state: user.location_state || '',
                location_country: user.location_country || 'Bangladesh',
                location_postal_code: user.location_postal_code || '',
                latitude: user.latitude || null,
                longitude: user.longitude || null
            });
        }
    };

    const handleUseCurrentLocation = () => {
        setIsDetectingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await response.json();

                        updateFormData({
                            location_city: data.address?.city || data.address?.town || data.address?.village || '',
                            location_state: data.address?.state || '',
                            location_country: data.address?.country || '',
                            location_postal_code: data.address?.postcode || '',
                            latitude: parseFloat(lat.toFixed(6)),
                            longitude: parseFloat(lng.toFixed(6)),
                            enable_location_edit: true
                        });
                    } catch (error) {
                        console.error('Reverse geocoding error:', error);
                        updateFormData({ latitude: lat, longitude: lng, enable_location_edit: true });
                    } finally {
                        setIsDetectingLocation(false);
                    }
                },
                (err) => {
                    console.error(err);
                    setIsDetectingLocation(false);
                    alert('Please enable location services.');
                }
            );
        } else {
            setIsDetectingLocation(false);
            alert('Geolocation not supported.');
        }
    };

    const geocodeAddress = async () => {
        const address = `${formData.location_city}, ${formData.location_state}, ${formData.location_country} ${formData.location_postal_code}`.trim();
        if (address.length < 5) return;

        setIsGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            if (data && data[0]) {
                updateFormData({
                    latitude: parseFloat(parseFloat(data[0].lat).toFixed(6)),
                    longitude: parseFloat(parseFloat(data[0].lon).toFixed(6))
                });
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleMapConfirm = async (result) => {
        const { lat, lng } = result;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();

            updateFormData({
                location_city: data.address?.city || data.address?.town || data.address?.village || '',
                location_state: data.address?.state || '',
                location_country: data.address?.country || '',
                location_postal_code: data.address?.postcode || '',
                latitude: parseFloat(lat.toFixed(6)),
                longitude: parseFloat(lng.toFixed(6)),
                enable_location_edit: true
            });
        } catch (error) {
            console.error('Map reverse geocoding error:', error);
            updateFormData({ latitude: lat, longitude: lng, enable_location_edit: true });
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-[#402E11] mb-2 tracking-tight">Listing <span className="text-[#C48B28]">Details</span></h1>
                <p className="text-[#402E11]/60 text-xs font-bold uppercase tracking-[0.15em]">Location and Requirements</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-[#EBC176]/20 shadow-2xl shadow-[#402E11]/5 p-8 md:p-10 mb-10">
                {/* Location Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-[#FAF3E0] flex items-center justify-center text-[#C48B28]">
                                <MapPin size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#402E11] tracking-tight">Location</h2>
                                <p className="text-[10px] font-bold text-[#402E11]/40 uppercase tracking-widest mt-0.5">Where is your pet located?</p>
                            </div>
                        </div>
                        {user?.location_city && (
                            <button
                                onClick={toggleLocationEdit}
                                className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.enable_location_edit ? 'bg-[#402E11] text-white' : 'bg-[#FAF3E0] text-[#C48B28] border-[#EBC176]/20 hover:bg-[#EBC176]/20'}`}
                            >
                                {formData.enable_location_edit ? 'Default' : 'Change'}
                            </button>
                        )}
                    </div>

                    {formData.enable_location_edit || !user?.location_city || (!formData.latitude && !formData.longitude) ? (
                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                            {(!formData.latitude || !formData.longitude) && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 mb-4">
                                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-[11px] font-black text-red-900 uppercase tracking-widest leading-tight">Coordinates Missing</p>
                                        <p className="text-[10px] font-bold text-red-700/70 mt-1">Please select your location on the map to help nearby adopters find you.</p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleUseCurrentLocation}
                                    disabled={isDetectingLocation}
                                    className="flex items-center justify-center gap-3 p-4 bg-[#FAF3E0]/40 rounded-2xl border-2 border-dashed border-[#EBC176]/20 hover:border-[#C48B28] hover:bg-[#FAF3E0] text-[#402E11]/60 hover:text-[#402E11] transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isDetectingLocation ? <Loader size={12} className="animate-spin" /> : <Navigation size={14} strokeWidth={3} />}
                                    Auto Detect
                                </button>
                                <button
                                    onClick={() => setIsMapModalOpen(true)}
                                    className="flex items-center justify-center gap-3 p-4 bg-[#FAF3E0]/40 rounded-2xl border-2 border-dashed border-[#EBC176]/20 hover:border-[#C48B28] hover:bg-[#FAF3E0] text-[#402E11]/60 hover:text-[#402E11] transition-all font-black text-[10px] uppercase tracking-widest"
                                >
                                    <MapIcon size={14} strokeWidth={3} />
                                    Pick on Map
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest ml-1">City</label>
                                    <input
                                        type="text"
                                        value={formData.location_city || ''}
                                        onChange={(e) => updateFormData({ location_city: e.target.value })}
                                        className={`w-full p-4 rounded-xl bg-[#FAF3E0]/30 border border-[#EBC176]/10 focus:border-[#C48B28] focus:bg-white outline-none transition-all font-bold text-sm ${errors.location_city ? 'border-red-300' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest ml-1">State</label>
                                    <input
                                        type="text"
                                        value={formData.location_state || ''}
                                        onChange={(e) => updateFormData({ location_state: e.target.value })}
                                        className={`w-full p-4 rounded-xl bg-[#FAF3E0]/30 border border-[#EBC176]/10 focus:border-[#C48B28] focus:bg-white outline-none transition-all font-bold text-sm ${errors.location_state ? 'border-red-300' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-[#FAF3E0]/40 rounded-[1.8rem] border border-[#EBC176]/10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest">Map Coordinates</span>
                                    <button
                                        onClick={geocodeAddress}
                                        disabled={isGeocoding}
                                        className="text-[9px] font-black text-[#402E11]/40 hover:text-[#402E11] transition-colors flex items-center gap-1.5 uppercase tracking-widest pb-0.5 border-b border-[#402E11]/10"
                                    >
                                        {isGeocoding ? <Loader size={10} className="animate-spin" /> : <Search size={10} strokeWidth={3} />}
                                        Update from Address
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-1">Latitude</span>
                                        <span className="text-sm font-black text-[#402E11] font-mono leading-none">{formData.latitude ? formData.latitude.toFixed(6) : '---'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-1">Longitude</span>
                                        <span className="text-sm font-black text-[#402E11] font-mono leading-none">{formData.longitude ? formData.longitude.toFixed(6) : '---'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-[#FAF3E0]/40 rounded-[2rem] border border-[#EBC176]/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#5A856D] animate-pulse" />
                                <div>
                                    <div className="text-sm font-black text-[#402E11]">{formData.location_city}, {formData.location_state}</div>
                                    <div className="text-[10px] font-bold text-[#402E11]/40 uppercase tracking-widest mt-0.5">Using Saved Profile Address</div>
                                </div>
                            </div>
                            {formData.latitude && (
                                <div className="text-[10px] font-mono text-[#402E11]/20">
                                    {formData.latitude.toFixed(3)}N, {formData.longitude.toFixed(3)}E
                                </div>
                            )}
                        </div>
                    )}
                    {(errors.location_city || errors.location_state || errors.location_coords) && (
                        <p className="mt-3 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={12} /> {errors.location_city || errors.location_state || errors.location_coords}
                        </p>
                    )}
                </div>

                {/* Ideal Home Section */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-[#EBF1ED] flex items-center justify-center text-[#5A856D]">
                                <Heart size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#402E11] tracking-tight">The Ideal Home</h2>
                                <p className="text-[10px] font-bold text-[#402E11]/40 uppercase tracking-widest mt-0.5">What are you looking for in an adopter?</p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${(formData.ideal_home_notes?.length || 0) >= 50 ? "text-[#5A856D]" : "text-[#402E11]/30"}`}>
                            {formData.ideal_home_notes?.length || 0} / 50 min
                        </span>
                    </div>

                    <textarea
                        value={formData.ideal_home_notes || ''}
                        onChange={(e) => updateFormData({ ideal_home_notes: e.target.value })}
                        placeholder="Describe the perfect home environment. Are kids okay? Fenced yard needed? No other pets?"
                        className={`w-full h-44 p-6 text-sm font-medium rounded-[1.8rem] bg-[#FAF3E0]/30 border-2 resize-none focus:ring-4 focus:ring-[#C48B28]/5 outline-none transition-all duration-300 ${errors.ideal_home_notes ? 'border-red-300 bg-red-50/30' : 'border-[#EBC176]/10 focus:border-[#C48B28] focus:bg-white'}`}
                    />
                    {errors.ideal_home_notes && (
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={12} /> {errors.ideal_home_notes}
                        </p>
                    )}
                </div>
            </div>

            {/* Premium Action Bar */}
            <RehomingActionBar
                onBack={() => navigate('/rehoming/situation')}
                onNext={handleNext}
                nextLabel="Review Listing"
                statusText="Set your location and preferences"
            />

            <LocationMapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                onConfirm={handleMapConfirm}
                initialPosition={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : [23.8103, 90.4125]}
                initialSearch={`${formData.location_city || ''}, ${formData.location_state || ''}, ${formData.location_country || ''} ${formData.location_postal_code || ''}`.trim()}
            />
        </div>
    );
};

export default RehomingDetailsPage;
