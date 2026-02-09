import React, { useState } from 'react';
import { X, Calendar, PawPrint, CheckCircle, AlertCircle, Loader, ArrowRight, Home, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import useServices from '../../hooks/useServices';
import usePets from '../../hooks/usePets';
import Button from '../../components/common/Buttons/Button';
import { toast } from 'react-toastify';
import { providerService } from '../../services';

const BookingModal = ({ isOpen, onClose, provider, initialService }) => {
    const [step, setStep] = useState(1);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('09:00'); // Default time
    const [selectedPet, setSelectedPet] = useState(null);
    const [notes, setNotes] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    // Pet selection state
    const [petSearchQuery, setPetSearchQuery] = useState('');
    const [currentPetPage, setCurrentPetPage] = useState(1);
    const PETS_PER_PAGE = 6;

    const { useCreateBooking } = useServices();
    const createBooking = useCreateBooking();

    const { useGetMyPets } = usePets();
    const {
        data: myPets,
        isLoading: isInitialLoading,
        isRefetching,
        isError,
        refetch: refetchPets
    } = useGetMyPets();

    const isLoading = isInitialLoading || isRefetching;

    // Refetch pets when modal opens to ensure fresh data
    React.useEffect(() => {
        if (isOpen) {
            refetchPets();
        } else {
            // Reset state when modal closes
            setStep(1);
            setSelectedPet(null);
            setPetSearchQuery('');
            setCurrentPetPage(1);
            setNotes('');
        }
    }, [isOpen, refetchPets]);

    // Determine booking type logic
    const getBookingType = () => {
        if (!provider) return 'range';

        // Check specifics first
        if (provider.vet_details) return 'appointment';
        if (provider.groomer_details) return 'appointment';
        if (provider.foster_details) return 'range';

        // Check service name if passed
        if (initialService) {
            const name = initialService.name?.toLowerCase() || '';
            if (name.includes('walk') || name.includes('visit') || name.includes('groom') || name.includes('consultation')) return 'appointment';
            if (name.includes('sitting') || name.includes('boarding')) return 'range';
        }

        // Fallback to category check
        const catName = provider.category?.name?.toLowerCase() || '';
        const catSlug = provider.category?.slug?.toLowerCase() || '';

        if (catSlug === 'veterinary' || catName.includes('vet')) return 'appointment';
        if (catSlug === 'training' || catName.includes('train')) return 'appointment';
        if (catSlug === 'groomer' || catName.includes('groom')) return 'appointment';
        if (catSlug === 'walking' || catName.includes('walking')) return 'appointment';

        return 'range'; // Default for Sitting, Foster, etc.
    };

    const isAppointment = getBookingType() === 'appointment';

    // Fetch availability when date changes
    const fetchAvailability = async (date) => {
        if (!provider || !date) return;

        setLoadingAvailability(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const data = await providerService.getAvailability(provider.id, dateStr);

            setAvailableSlots(data.available_slots || []);
            if (data.available_slots?.length > 0) {
                setSelectedTime(data.available_slots[0]);
            }
        } catch (error) {
            console.error('Failed to fetch availability:', error);
            toast.error('Could not load available times');
            setAvailableSlots([]);
        } finally {
            setLoadingAvailability(false);
        }
    };

    // Fetch availability when date changes and it's an appointment
    React.useEffect(() => {
        if (isAppointment && startDate && isOpen) {
            fetchAvailability(startDate);
        }
    }, [startDate, isAppointment, isOpen]);



    // Pricing Calculation
    const calculateTotal = () => {
        if (!provider) return { total: 0, rate: 0, days: 0, label: 'Free' };

        let rate = 0;
        let days = 1;
        let label = 'Flat Rate'; // or 'Per Night', 'Per Visit'

        // 1. Determine Rate based on Provider Type & Service
        // Priority: Service Option Price -> Provider Specific Detail Rate -> Default

        if (initialService && (initialService.base_price || initialService.price)) {
            rate = parseFloat(initialService.price || initialService.base_price);
            if (!rate) rate = 0; // handle null
            if (isAppointment) label = 'Per Session';
        } else {
            // Fallbacks based on provider details
            const details = provider.service_specific_details || {};
            const slug = provider.category?.slug;

            if (slug === 'veterinary') {
                rate = 0; // Consult fee handling complex
                label = 'Consultation';
            } else if (slug === 'grooming') {
                rate = parseFloat(details.base_price) || 0;
                label = 'Starting At';
            } else if (slug === 'training') {
                rate = parseFloat(details.private_session_rate) || 0;
                label = 'Per Session';
            } else if (slug === 'foster') {
                rate = parseFloat(details.daily_rate) || 0;
                label = 'Per Night';
            } else if (slug === 'pet_sitting' || slug === 'boarding' || slug === 'pet-sitting') {
                const isWalking = initialService?.name?.toLowerCase().includes('walk') || provider.category?.slug === 'walking';
                if (isWalking) {
                    rate = parseFloat(details.walking_rate) || 0;
                    label = 'Per Walk';
                } else {
                    rate = parseFloat(details.house_sitting_rate) || parseFloat(details.drop_in_rate) || 0;
                    label = 'Per Night';
                }
            }
        }

        // 2. Determine Duration
        if (!isAppointment) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Calculate difference in days, inclusive? usually nights for boarding
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            days = diffDays > 0 ? diffDays : 1; // Minimum 1 day/night
        } else {
            // Appointment is usually 1 unit
            days = 1;
        }

        return {
            total: rate * days,
            rate: rate,
            days: days,
            label: label,
            isEstimate: true
        };
    };

    const pricing = calculateTotal();

    const handleNext = () => setStep(prev => prev + 1);

    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!selectedPet || !provider) return;

        try {
            // Combine Date + Time for Start Date if appointment
            let finalStart = new Date(startDate);
            let finalEnd = new Date(endDate);

            if (isAppointment) {
                const [hours, minutes] = selectedTime.split(':');
                finalStart.setHours(parseInt(hours), parseInt(minutes));
                finalEnd = new Date(finalStart);
                finalEnd.setHours(finalStart.getHours() + 1); // Default 1 hour duration
            }

            const response = await createBooking.mutateAsync({
                provider: provider.id,
                pet: selectedPet.id,
                service_option: initialService?.id || null,
                booking_type: isAppointment ? 'standard' : 'recurring',
                booking_date: finalStart.toISOString().split('T')[0], // YYYY-MM-DD
                booking_time: isAppointment ? selectedTime : null,
                start_datetime: finalStart.toISOString(),
                end_datetime: finalEnd.toISOString(),
                special_requirements: notes,
                agreed_price: pricing.total.toFixed(2)
            });

            // Redirect to payment checkout
            toast.success('Booking created! Redirecting to checkout...');
            onClose();
            setStep(1); // Reset

            // Use window.location to navigate (or pass navigate if available)
            window.location.href = `/checkout/${response.id}`;
        } catch (error) {
            console.error(error);
            toast.error('Failed to create booking.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#402E11]/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#FEF9ED] rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-[#EBC176]/20 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[#EBC176]/20 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black text-[#402E11] tracking-tight truncate pr-4">
                        Book {provider?.business_name}
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white border border-[#EBC176]/20 rounded-full text-[#C48B28] hover:bg-[#FAF3E0] transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
                    {step === 1 && (
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28] shrink-0">
                                        <Calendar size={20} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Select Date & Time</h3>
                                </div>

                                <div className="space-y-6">
                                    {/* Date Picker */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-themev2-text/40 uppercase tracking-widest mb-2">
                                                {isAppointment ? 'Date' : 'Start Date'}
                                            </label>
                                            <div className="relative">
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={(date) => {
                                                        setStartDate(date);
                                                        if (isAppointment) setEndDate(date);
                                                    }}
                                                    selectsStart
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    className="w-full px-5 py-4 bg-[#FAF3E0] border border-[#EBC176]/10 rounded-2xl text-[11px] font-black text-themev2-text uppercase tracking-widest focus:ring-0 focus:border-[#C48B28]/50 outline-none cursor-pointer"
                                                    minDate={new Date()}
                                                />
                                            </div>
                                        </div>
                                        {!isAppointment && (
                                            <div>
                                                <label className="block text-[9px] font-black text-themev2-text/40 uppercase tracking-widest mb-2">End Date</label>
                                                <DatePicker
                                                    selected={endDate}
                                                    onChange={(date) => setEndDate(date)}
                                                    selectsEnd
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    minDate={startDate}
                                                    className="w-full px-5 py-4 bg-[#FAF3E0] border border-[#EBC176]/10 rounded-2xl text-[11px] font-black text-themev2-text uppercase tracking-widest focus:ring-0 focus:border-[#C48B28]/50 outline-none cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Time Slot Picker */}
                                    {isAppointment && (
                                        <div>
                                            <label className="block text-[9px] font-black text-themev2-text/40 uppercase tracking-widest mb-4">
                                                Preferred Time
                                                {loadingAvailability && <span className="ml-2 text-[8px] font-bold text-[#C48B28]/50 tracking-normal">(Syncing...)</span>}
                                            </label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {(availableSlots.length > 0 ? availableSlots : ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']).map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`px-4 py-3 text-[10px] font-black rounded-xl border transition-all uppercase tracking-widest ${selectedTime === time
                                                            ? 'bg-[#C48B28] text-white border-[#C48B28] shadow-lg shadow-[#C48B28]/20'
                                                            : 'bg-white text-themev2-text/60 border-[#EBC176]/20 hover:border-[#C48B28]/50'
                                                            }`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-themev2-text/40 uppercase tracking-widest mb-4">Additional Notes</label>
                                <textarea
                                    className="w-full p-6 bg-[#FAF3E0] border border-[#EBC176]/10 rounded-[2rem] text-[11px] font-bold text-themev2-text/60 placeholder-themev2-text/30 outline-none focus:border-[#C48B28]/40 resize-none uppercase tracking-widest leading-loose"
                                    rows={3}
                                    placeholder="Any special instructions?..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28] shrink-0">
                                    <PawPrint size={20} />
                                </div>
                                <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Select Your Pet</h3>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-12 flex-col items-center gap-4">
                                    <Loader className="animate-spin text-[#C48B28]" size={32} />
                                    <p className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest animate-pulse">Fetching your pets...</p>
                                </div>
                            ) : isError ? (
                                <div className="text-center py-12 bg-red-50 rounded-[2.5rem] border border-dashed border-red-200">
                                    <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Failed to load pets.</p>
                                    <button
                                        onClick={() => refetchPets()}
                                        className="px-6 py-3 bg-white border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : myPets?.results?.length > 0 ? (
                                <>
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search pets by name..."
                                            value={petSearchQuery}
                                            onChange={(e) => {
                                                setPetSearchQuery(e.target.value);
                                                setCurrentPetPage(1); // Reset to first page on search
                                            }}
                                            className="w-full px-5 py-4 pl-12 bg-[#FAF3E0] border border-[#EBC176]/10 rounded-2xl text-[11px] font-bold text-themev2-text placeholder-themev2-text/30 outline-none focus:border-[#C48B28]/40 uppercase tracking-widest"
                                        />
                                        <PawPrint size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28]/40" />
                                    </div>

                                    {/* Pet Grid */}
                                    {(() => {
                                        // Filter pets by search query
                                        const filteredPets = myPets.results.filter(pet =>
                                            pet.name.toLowerCase().includes(petSearchQuery.toLowerCase())
                                        );

                                        // Calculate pagination
                                        const totalPages = Math.ceil(filteredPets.length / PETS_PER_PAGE);
                                        const startIndex = (currentPetPage - 1) * PETS_PER_PAGE;
                                        const paginatedPets = filteredPets.slice(startIndex, startIndex + PETS_PER_PAGE);

                                        return (
                                            <>
                                                {filteredPets.length > 0 ? (
                                                    <>
                                                        {/* Scrollable Grid Container */}
                                                        <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {paginatedPets.map(pet => (
                                                                    <div
                                                                        key={pet.id}
                                                                        onClick={() => setSelectedPet(pet)}
                                                                        className={`p-4 rounded-[1.5rem] border group cursor-pointer transition-all ${selectedPet?.id === pet.id
                                                                            ? 'bg-[#FAF3E0] border-[#C48B28] shadow-lg shadow-[#C48B28]/10 scale-[1.02]'
                                                                            : 'bg-white border-[#EBC176]/20 hover:border-[#C48B28]/50 hover:shadow-md'
                                                                            }`}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-3">
                                                                            {/* Pet Image */}
                                                                            <div className="relative w-16 h-16 rounded-2xl bg-[#FAF3E0] overflow-hidden border-2 border-white shadow-sm">
                                                                                {pet.media?.[0]?.url ? (
                                                                                    <img src={pet.media[0].url} alt={pet.name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-[#C48B28]/30">
                                                                                        <PawPrint size={24} />
                                                                                    </div>
                                                                                )}
                                                                                {/* Selected Badge */}
                                                                                {selectedPet?.id === pet.id && (
                                                                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#C48B28] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#C48B28]/30">
                                                                                        <CheckCircle size={14} />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {/* Pet Info */}
                                                                            <div className="text-center w-full">
                                                                                <p className="text-sm font-black text-themev2-text tracking-tight truncate">{pet.name}</p>
                                                                                <p className="text-[8px] font-black text-[#C48B28] uppercase tracking-widest mt-1">{pet.species}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Pagination Controls */}
                                                        {totalPages > 1 && (
                                                            <div className="flex items-center justify-between pt-4 border-t border-[#EBC176]/10">
                                                                <p className="text-[9px] font-black text-themev2-text/40 uppercase tracking-widest">
                                                                    Page {currentPetPage} of {totalPages}
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => setCurrentPetPage(prev => Math.max(1, prev - 1))}
                                                                        disabled={currentPetPage === 1}
                                                                        className="px-4 py-2 bg-white border border-[#EBC176]/20 rounded-xl text-[9px] font-black text-themev2-text uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#C48B28]/50 transition-all"
                                                                    >
                                                                        Prev
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setCurrentPetPage(prev => Math.min(totalPages, prev + 1))}
                                                                        disabled={currentPetPage === totalPages}
                                                                        className="px-4 py-2 bg-white border border-[#EBC176]/20 rounded-xl text-[9px] font-black text-themev2-text uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#C48B28]/50 transition-all"
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8 bg-[#FAF3E0]/30 rounded-[2rem] border border-dashed border-[#EBC176]/30">
                                                        <PawPrint size={24} className="text-[#C48B28]/20 mx-auto mb-3" />
                                                        <p className="text-[9px] font-black text-themev2-text/40 uppercase tracking-widest">
                                                            No pets match "{petSearchQuery}"
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </>
                            ) : (
                                <div className="text-center py-12 bg-[#FAF3E0]/30 rounded-[2.5rem] border border-dashed border-[#EBC176]/30">
                                    <PawPrint size={32} className="text-[#C48B28]/20 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest mb-6">No pet profiles found.</p>
                                    <button
                                        onClick={() => window.open('/dashboard/pets/create', '_blank')}
                                        className="px-10 py-4 bg-[#C48B28] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#C48B28]/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Create Pet Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-sm">
                                <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-8">Booking Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28] shadow-sm">
                                                {isAppointment ? <Clock size={18} /> : <Home size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-themev2-text/40 uppercase tracking-widest">When</p>
                                                <p className="text-[11px] font-black text-themev2-text uppercase tracking-widest mt-1">
                                                    {format(startDate, 'MMM dd, yyyy')}
                                                    {isAppointment && <span className="text-[#C48B28] ml-2 font-black">{selectedTime}</span>}
                                                    {!isAppointment && <span className="text-themev2-text ml-1 opacity-40">- {format(endDate, 'MMM dd')}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-themev2-text/40 uppercase tracking-widest">Estimate</p>
                                            <p className="text-2xl font-black text-themev2-text tracking-tight mt-1">
                                                {pricing.total > 0 ? `$${pricing.total.toFixed(2)}` : 'QuoteReq'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-[#FAF3E0]/30 rounded-2xl border border-[#EBC176]/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm">
                                                {selectedPet?.media?.[0]?.url ? (
                                                    <img src={selectedPet.media[0].url} alt={selectedPet.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#C48B28]/30 bg-white"><PawPrint size={20} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-themev2-text tracking-tight">{selectedPet?.name}</p>
                                                <p className="text-[8px] font-black text-[#C48B28] uppercase tracking-widest">{selectedPet?.species}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-themev2-text uppercase tracking-widest">{initialService?.name || 'Standard'}</p>
                                            <p className="text-[8px] font-black text-themev2-text/40 uppercase tracking-widest">Selected Service</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {createBooking.isError && (
                                <div className="flex items-center gap-3 text-red-600 p-5 bg-red-50 rounded-[1.5rem] border border-red-100">
                                    <AlertCircle size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Failed to create booking. Please try again.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 sm:p-8 border-t border-[#EBC176]/20 bg-[#FAF3E0]/30 flex justify-between items-center shrink-0">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="text-[11px] font-black text-themev2-text/40 uppercase tracking-[0.2em] hover:text-[#402E11] transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 2 && !selectedPet}
                            className={`px-6 sm:px-10 py-3.5 sm:py-4 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${step === 2 && !selectedPet ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#C48B28] text-white shadow-xl shadow-[#C48B28]/20 hover:scale-105 active:scale-95 flex items-center gap-2'}`}
                        >
                            Next Step <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={createBooking.isPending}
                            className="px-6 sm:px-10 py-3.5 sm:py-4 bg-[#C48B28] text-white rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {createBooking.isPending ? 'Confirming...' : 'Complete Booking'}
                            {!createBooking.isPending && <CheckCircle size={16} />}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default BookingModal;
