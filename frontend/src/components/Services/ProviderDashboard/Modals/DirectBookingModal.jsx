import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Dog, CheckCircle2, Search, DollarSign, Mail, Phone, ChevronDown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useServices from '../../../../hooks/useServices';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
    addDays
} from 'date-fns';

// Custom Date Picker Component
const DatePicker = ({ value, onChange }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef(null);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync currentMonth with value if provided
    useEffect(() => {
        if (value) {
            setCurrentMonth(new Date(value));
        }
    }, [value]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-[#402E11]">{format(currentMonth, 'MMMM yyyy')}</span>
                    <ChevronDown size={14} className="text-[#402E11]/30" />
                </div>
                <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="p-1 hover:bg-[#FAF3E0] rounded-lg transition-colors text-[#402E11]">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} className="p-1 hover:bg-[#FAF3E0] rounded-lg transition-colors text-[#402E11]">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-[#402E11]/40 py-1">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                const isSelected = value && isSameDay(day, new Date(value));

                days.push(
                    <div
                        key={day}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(format(cloneDay, 'yyyy-MM-dd'));
                            setShowCalendar(false);
                        }}
                        className={`
                            relative h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition-all
                            ${!isSameMonth(day, monthStart) ? 'text-[#402E11]/10' : 'text-[#402E11]'}
                            ${isSelected ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-[#FAF3E0]'}
                            ${isToday(day) && !isSelected ? 'text-blue-500 bg-blue-50' : ''}
                        `}
                    >
                        {formattedDate}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day} className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-1">{rows}</div>;
    };



    return (
        <div className="relative" ref={calendarRef}>
            <div
                onClick={() => setShowCalendar(!showCalendar)}
                className="relative cursor-pointer group"
            >
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28] group-hover:scale-110 transition-transform" />
                <div className="w-full pl-10 pr-4 py-3 bg-white border border-[#F0F0F0] rounded-xl text-sm font-bold text-[#402E11] flex items-center justify-between group-hover:border-[#EBC176]/50 transition-colors">
                    <span>{value ? format(parseISO(value), 'MM/dd/yyyy') : 'Select Date'}</span>
                    <Calendar size={14} className="text-[#402E11]/30" />
                </div>
            </div>

            <AnimatePresence>
                {showCalendar && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#F0F0F0] p-4 w-[280px] z-50"
                    >
                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}

                        <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex justify-between items-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange('');
                                    setShowCalendar(false);
                                }}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-700"
                            >
                                Clear
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(format(new Date(), 'yyyy-MM-dd'));
                                    setShowCalendar(false);
                                }}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-700"
                            >
                                Today
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Custom Dropdown Component
const Dropdown = ({ options, value, onChange, placeholder, icon: Icon, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-bold text-[#402E11] flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-[#EBC176] ring-1 ring-[#EBC176]' : 'border-[#F0F0F0] hover:border-[#EBC176]/50'
                    }`}
            >
                {Icon && <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28]" />}
                <span className="truncate pr-2">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`text-[#402E11]/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#F0F0F0] z-[60] max-h-[250px] overflow-y-auto custom-scrollbar"
                    >
                        {options.map((option, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(option.value);
                                }}
                                className={`px-4 py-3 text-xs font-bold text-[#402E11] cursor-pointer transition-colors border-b border-[#F0F0F0] last:border-0 ${option.value === value ? 'bg-[#FAF3E0] text-[#C48B28]' : 'hover:bg-[#FAF9F6]'
                                    }`}
                            >
                                {option.label}
                            </div>
                        ))}
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-xs text-center text-gray-400 font-medium">No options available</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Custom Time Picker Component
const TimeColumn = ({ options, value, onSelect, label }) => (
    <div className="flex-1 h-40 overflow-y-auto custom-scrollbar text-center border-r last:border-0 border-[#F0F0F0]">
        <div className="text-[9px] font-black text-[#C48B28] uppercase tracking-widest sticky top-0 bg-white py-1 z-10">{label}</div>
        {options.map(opt => (
            <div
                key={opt}
                onClick={(e) => { e.stopPropagation(); onSelect(opt); }}
                className={`py-2 text-xs font-bold cursor-pointer transition-colors ${
                    opt === value ? 'bg-[#402E11] text-white' : 'text-[#402E11] hover:bg-[#FAF9F6]'
                }`}
            >
                {opt.toString().padStart(2, '0')}
            </div>
        ))}
    </div>
);

const TimePicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Initial state from value ("HH:mm")
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [period, setPeriod] = useState('AM');

    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':').map(Number);
            const isPM = h >= 12;
            setPeriod(isPM ? 'PM' : 'AM');
            setSelectedHour(h % 12 || 12);
            setSelectedMinute(m);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTimeChange = (h, m, p) => {
        setSelectedHour(h);
        setSelectedMinute(m);
        setPeriod(p);

        // Convert to 24h
        let hour24 = h === 12 ? 0 : h;
        if (p === 'PM') {
            hour24 = h === 12 ? 12 : h + 12;
        }
        
        const formattedTime = `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        onChange(formattedTime);
    };

    const formatDisplay = () => {
       const h = selectedHour.toString().padStart(2, '0');
       const m = selectedMinute.toString().padStart(2, '0');
       return `${h}:${m} ${period}`;
    };

    return (
        <div className="relative" ref={containerRef}>
             <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-bold text-[#402E11] flex items-center justify-between cursor-pointer transition-all group ${
                    isOpen ? 'border-[#EBC176] ring-1 ring-[#EBC176]' : 'border-[#F0F0F0] hover:border-[#EBC176]/50'
                }`}
            >
                <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28] group-hover:scale-110 transition-transform" />
                <span>{formatDisplay()}</span>
                <ChevronDown size={14} className={`text-[#402E11]/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

             <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#F0F0F0] z-[60] overflow-hidden flex"
                    >
                        <TimeColumn 
                            label="Hour"
                            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} 
                            value={selectedHour} 
                            onSelect={(h) => handleTimeChange(h, selectedMinute, period)} 
                        />
                        <TimeColumn 
                            label="Min"
                            options={Array.from({ length: 60 }, (_, i) => i)} 
                            value={selectedMinute} 
                            onSelect={(m) => handleTimeChange(selectedHour, m, period)} 
                        />
                        <div className="flex-1 h-40 overflow-y-auto text-center custom-scrollbar">
                             <div className="text-[9px] font-black text-[#C48B28] uppercase tracking-widest sticky top-0 bg-white py-1 z-10">Val</div>
                             {['AM', 'PM'].map(p => (
                                <div
                                    key={p}
                                    onClick={(e) => { e.stopPropagation(); handleTimeChange(selectedHour, selectedMinute, p); }}
                                    className={`py-6 text-xs font-bold cursor-pointer transition-colors ${
                                        p === period ? 'bg-[#402E11] text-white' : 'text-[#402E11] hover:bg-[#FAF9F6]'
                                    }`}
                                >
                                    {p}
                                </div>
                             ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DirectBookingModal = ({ isOpen, onClose, provider }) => {
    const { useCreateBooking, useGetMyBookings } = useServices();
    const createBookingMutation = useCreateBooking();
    const { data: pastBookings } = useGetMyBookings();

    const [step, setStep] = useState(1);
    const [bookingType, setBookingType] = useState('walk_in'); // 'registered' or 'walk_in'

    // Form Data
    const [formData, setFormData] = useState({
        service_id: '', // ServiceOption ID or empty for standard
        booking_date: format(new Date(), 'yyyy-MM-dd'),
        booking_time: '09:00',
        duration: 1,

        // Walk-in
        guest_client_name: '',
        guest_pet_name: '',
        guest_email: '',
        guest_phone: '',

        // Registered
        userId: null,
        petId: null,

        // Financials
        price: '',
        payment_status: 'pending', // 'paid' or 'pending'
        payment_method: 'cash',

        notes: ''
    });

    // Extract Past Clients, Guests, and their Pets
    const { pastClients, clientPetsMap, pastGuests } = React.useMemo(() => {
        const clients = new Map();
        const guests = new Map(); // Key: name|email to ensure uniqueness
        const petsMap = {};

        pastBookings?.results?.forEach(b => {
            // 1. Registered Clients
            if (b.client) {
                if (!clients.has(b.client.id)) {
                    clients.set(b.client.id, b.client);
                }

                if (b.pet) {
                    if (!petsMap[b.client.id]) petsMap[b.client.id] = [];
                    if (!petsMap[b.client.id].find(p => p.id === b.pet.id)) {
                        petsMap[b.client.id].push(b.pet);
                    }
                }
            }
            // 2. Guest Clients
            else if (b.guest_client_name) {
                const key = `${b.guest_client_name.toLowerCase()}|${b.guest_email || ''}`;

                if (!guests.has(key)) {
                    guests.set(key, {
                        name: b.guest_client_name,
                        email: b.guest_email,
                        phone: b.guest_phone,
                        pets: b.guest_pet_name ? [b.guest_pet_name] : []
                    });
                } else {
                    const g = guests.get(key);
                    if (b.guest_pet_name && !g.pets.includes(b.guest_pet_name)) {
                        g.pets.push(b.guest_pet_name);
                    }
                }
            }
        });

        return {
            pastClients: Array.from(clients.values()),
            clientPetsMap: petsMap,
            pastGuests: Array.from(guests.values())
        };
    }, [pastBookings]);

    // Helper to get services list based on provider type
    const getServiceOptions = () => {
        if (provider.category?.slug === 'veterinary') return provider.vet_details?.services_offered || [];
        // Add other categories...
        // For simplicity, we'll try to extract "services_offered" or "service_menu" or generic list
        // Or if nothing, return empty and use "Standard Visit"

        const options = [];
        if (provider.vet_details?.services_offered) return provider.vet_details.services_offered;

        // Construct standard options if none found (e.g. for sitter/foster/trainer if simple)
        if (provider.sitter_details) {
            if (provider.sitter_details.offers_dog_walking) options.push({ id: 'walking', name: 'Dog Walking', base_price: provider.sitter_details.walking_rate });
            if (provider.sitter_details.offers_drop_in_visits) options.push({ id: 'drop_in', name: 'Drop-in Visit', base_price: provider.sitter_details.drop_in_rate });
        }

        return options;
    };

    const serviceOptions = getServiceOptions();

    // Auto-fill handler for guests
    const handleGuestSelect = (guestStr) => {
        if (!guestStr) return;
        const guest = JSON.parse(guestStr);
        setFormData({
            ...formData,
            guest_client_name: guest.name,
            guest_email: guest.email || '',
            guest_phone: guest.phone || '',
            guest_pet_name: guest.pets[0] || '' // Default to first pet
        });
    };

    const handleSubmit = async () => {
        // ... (existing handleSubmit logic is fine, no changes needed inside it regarding payload structure, 
        // as formData is updated by handleGuestSelect)
        try {
            const payload = {
                provider: provider.id,
                booking_date: formData.booking_date,
                booking_time: formData.booking_time,
                agreed_price: formData.price,
                special_requirements: formData.notes,
                payment_method: formData.payment_status === 'paid' ? formData.payment_method : 'platform',
                payment_status: formData.payment_status
            };

            // Handle Type Specifics
            if (bookingType === 'walk_in') {
                if (!formData.guest_client_name || !formData.guest_pet_name) {
                    return toast.error("Guest Name and Pet Name are required");
                }
                payload.guest_client_name = formData.guest_client_name;
                payload.guest_pet_name = formData.guest_pet_name;
                payload.guest_email = formData.guest_email;
                payload.guest_phone = formData.guest_phone;
            } else {
                // Registered: Use selected IDs
                if (!formData.userId) return toast.error("Please select a client.");

                payload.client = formData.userId;
                if (formData.petId) {
                    payload.pet = formData.petId;
                } else {
                    return toast.error("Please select a pet.");
                }
            }

            // Service Option
            if (formData.service_id && typeof formData.service_id === 'number') {
                payload.service_option = formData.service_id;
            } else {
                payload.booking_type = 'standard';
            }

            await createBookingMutation.mutateAsync(payload);
            toast.success("Booking created successfully");
            onClose();
            setStep(1);
            setFormData({ ...formData, guest_client_name: '', guest_pet_name: '' });

        } catch (error) {
            console.error(error);
            toast.error("Failed to create booking");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">

            <div
                className="fixed inset-0 bg-[#402E11]/15 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] max-w-2xl w-full p-0 relative z-10 shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 bg-[#FAF9F6] border-b border-[#EAE6E2] flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#402E11] tracking-tight">Direct Entry Portal</h2>
                        <p className="text-[10px] font-bold text-[#C48B28] uppercase tracking-[0.2em]">New Appointment</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#402E11]/40 hover:text-[#402E11] border border-[#EAE6E2]">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                    {/* 1. Client Type Toggle */}
                    <div className="bg-[#FAF9F6] p-1.5 rounded-xl flex">
                        <button
                            onClick={() => setBookingType('walk_in')}
                            className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bookingType === 'walk_in' ? 'bg-white text-[#402E11] shadow-sm' : 'text-[#402E11]/40'
                                }`}
                        >
                            Walk-In Guest
                        </button>
                        <button
                            onClick={() => setBookingType('registered')}
                            className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bookingType === 'registered' ? 'bg-white text-[#402E11] shadow-sm' : 'text-[#402E11]/40'
                                }`}
                        >
                            Registered Client
                        </button>
                    </div>

                    {/* 2. Client Details (Registered) */}
                    {bookingType === 'registered' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Past Client</label>
                                    <Dropdown
                                        icon={User}
                                        placeholder="Select Recent Client..."
                                        value={formData.userId}
                                        onChange={(val) => setFormData({ ...formData, userId: val, petId: '' })}
                                        options={pastClients.map(client => ({
                                            value: client.id,
                                            label: `${client.first_name} ${client.last_name}${client.email ? ` (${client.email})` : ''}`
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Pet</label>
                                    <Dropdown
                                        icon={Dog}
                                        placeholder="Select Pet..."
                                        value={formData.petId}
                                        onChange={(val) => setFormData({ ...formData, petId: val })}
                                        disabled={!formData.userId}
                                        options={formData.userId && clientPetsMap[formData.userId] ? clientPetsMap[formData.userId].map(pet => ({
                                            value: pet.id,
                                            label: `${pet.name} (${pet.species})`
                                        })) : []}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Client Details (Walk-in) */}
                    {bookingType === 'walk_in' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            {/* Past Guest Quick Selection */}
                            {pastGuests.length > 0 && (
                                <div>
                                    <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Quick Fill: Return Guest</label>
                                    <div className="relative">
                                        <Dropdown
                                            icon={Sparkles}
                                            placeholder="Select a previous guest to auto-fill..."
                                            onChange={(val) => handleGuestSelect(val)}
                                            options={pastGuests.map(guest => ({
                                                value: JSON.stringify(guest),
                                                label: `${guest.name} ${guest.email ? `(${guest.email})` : ''} - ${guest.pets.join(', ')}`
                                            }))}
                                        />
                                    </div>
                                    <div className="my-4 border-b border-[#FAF3E0]"></div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Guest Name *</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28]" />
                                        <input
                                            value={formData.guest_client_name}
                                            onChange={(e) => setFormData({ ...formData, guest_client_name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-[#FAF3E0]/30 border border-[#EBC176]/20 rounded-xl text-sm font-bold text-[#402E11]"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Pet Name *</label>
                                    <div className="relative">
                                        <Dog size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28]" />
                                        <input
                                            value={formData.guest_pet_name}
                                            onChange={(e) => setFormData({ ...formData, guest_pet_name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-[#FAF3E0]/30 border border-[#EBC176]/20 rounded-xl text-sm font-bold text-[#402E11]"
                                            placeholder="e.g. Bella"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28]/60" />
                                    <input
                                        value={formData.guest_email}
                                        onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#F0F0F0] rounded-xl text-xs font-bold text-[#402E11]"
                                        placeholder="Email (Optional)"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28]/60" />
                                    <input
                                        value={formData.guest_phone}
                                        onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#F0F0F0] rounded-xl text-xs font-bold text-[#402E11]"
                                        placeholder="Phone (Optional)"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Service & Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Service Date</label>
                            <DatePicker
                                value={formData.booking_date}
                                onChange={(date) => setFormData({ ...formData, booking_date: date })}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Time</label>
                            <TimePicker
                                value={formData.booking_time}
                                onChange={(time) => setFormData({ ...formData, booking_time: time })}
                            />
                        </div>
                    </div>

                    {/* 4. Service Selection */}
                    <div>
                        <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Service Option</label>
                        <div className="relative">
                            <Dropdown
                                value={formData.service_id}
                                placeholder="Select Service..."
                                onChange={(val) => {
                                    const opt = serviceOptions.find(o => o.id === val);
                                    setFormData({
                                        ...formData,
                                        service_id: val,
                                        price: opt ? opt.base_price : formData.price
                                    });
                                }}
                                options={[
                                    { value: '', label: 'Standard Service (Custom)' },
                                    ...serviceOptions.map(opt => ({
                                        value: opt.id,
                                        label: `${opt.name} - $${opt.base_price}`
                                    }))
                                ]}
                            />
                        </div>
                    </div>

                    {/* 5. Financials */}
                    <div className="bg-[#FAF9F6] p-6 rounded-[2rem] border border-[#EAE6E2] space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-[#402E11] uppercase tracking-widest">Revenue Collection</label>
                            <button
                                onClick={() => setFormData({ ...formData, payment_status: formData.payment_status === 'paid' ? 'pending' : 'paid' })}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${formData.payment_status === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {formData.payment_status === 'paid' && <CheckCircle2 size={10} />}
                                {formData.payment_status === 'paid' ? 'Collected' : 'Pending'}
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28]" />
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#EAE6E2] rounded-xl text-lg font-black text-[#402E11]"
                                />
                            </div>
                            {formData.payment_status === 'paid' && (
                                <div className="flex-1 relative">
                                    <Dropdown
                                        value={formData.payment_method}
                                        onChange={(val) => setFormData({ ...formData, payment_method: val })}
                                        options={[
                                            { value: 'cash', label: 'Cash' },
                                            { value: 'woof_pay', label: 'Platform (Card)' },
                                            { value: 'card', label: 'Terminal (External)' }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 6. Submit Button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-[#402E11] text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4"
                    >
                        Confirm Booking
                    </button>

                </div>
            </motion.div>
        </div>
    );
};

export default DirectBookingModal;
