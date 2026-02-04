import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    CalendarOff, Clock, Plus, ShieldCheck,
    Settings2, Calendar as CalendarIcon,
    Trash2, AlertCircle, Sparkles, ChevronRight,
    Search, Check, X, Bell, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import useAPI from '../../../../hooks/useAPI';
import useAuth from '../../../../hooks/useAuth';
import Button from '../../../../components/common/Buttons/Button';
import Badge from '../../../../components/common/Display/Badge';
import BlockTimeModal from '../Components/BlockTimeModal';
import BlockedTimesList from '../Components/BlockedTimesList';

const AvailabilityManager = () => {
    const { provider, setProvider } = useOutletContext();
    const api = useAPI();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('schedule'); // schedule, blocks, settings
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Standard Hours State
    const [hours, setHours] = useState([]);
    const [isSavingHours, setIsSavingHours] = useState(false);

    // Settings State
    const [settings, setSettings] = useState({
        advance_booking_days: 30,
        min_lead_time_hours: 24,
        meeting_buffer_minutes: 15,
        auto_approve_bookings: false,
        ...provider?.settings
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const tabs = [
        { id: 'schedule', label: 'Weekly Schedule', icon: Clock },
        { id: 'blocks', label: 'Time-Off & Exceptions', icon: CalendarIcon },
        { id: 'settings', label: 'Booking Preferences', icon: Settings2 },
    ];

    useEffect(() => {
        if (!provider?.id) return;
        setHours(provider.hours || []);
        fetchBlocks();
    }, [provider?.id, provider?.hours]);

    const fetchBlocks = async () => {
        try {
            const response = await api.get(`/services/providers/${provider.id}/availability_blocks/`);
            setBlocks(response.data);
        } catch (error) {
            console.error('Failed to fetch blocks:', error);
            toast.error('Failed to load availability blocks');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHours = async () => {
        setIsSavingHours(true);
        try {
            const response = await api.post(`/services/providers/${provider.id}/update_hours/`, hours);
            toast.success('Weekly schedule updated');
            if (setProvider) {
                setProvider(prev => ({ ...prev, hours: response.data.hours }));
            }
        } catch (error) {
            toast.error('Failed to save schedule');
        } finally {
            setIsSavingHours(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            const response = await api.post(`/services/providers/${provider.id}/update_settings/`, settings);
            toast.success('Preferences saved');
            if (setProvider) {
                setProvider(prev => ({ ...prev, settings: response.data.settings }));
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleCreateBlock = async (blockData) => {
        try {
            const response = await api.post(
                `/services/providers/${provider.id}/availability_blocks/`,
                blockData
            );
            setBlocks(prev => [response.data, ...prev]);
            setModalOpen(false);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteBlock = async (blockId) => {
        try {
            await api.delete(`/services/providers/${provider.id}/availability_blocks/${blockId}/`);
            setBlocks(prev => prev.filter(b => b.id !== blockId));
            toast.success('Block removed');
        } catch (error) {
            toast.error('Failed to remove block');
        }
    };

    const toggleDayStatus = (dayIndex) => {
        setHours(prev => {
            const existing = prev.find(h => h.day === dayIndex);
            if (existing) {
                return prev.map(h => h.day === dayIndex ? { ...h, is_closed: !h.is_closed } : h);
            } else {
                return [...prev, { day: dayIndex, open_time: '09:00', close_time: '17:00', is_closed: false }];
            }
        });
    };

    const updateTime = (dayIndex, field, value) => {
        setHours(prev => prev.map(h => h.day === dayIndex ? { ...h, [field]: value } : h));
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="max-w-[1200px] mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#402E11] rounded-2xl flex items-center justify-center text-[#C48B28] shadow-lg shadow-[#402E11]/10">
                            <Clock size={20} />
                        </div>
                        <Badge variant="info" className="bg-[#402E11]/5 text-[#402E11] border-transparent text-[9px] tracking-[0.2em] font-black uppercase px-3 py-1">
                            Operations Control
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-[#402E11]">Availability Center</h1>
                    <p className="text-[#402E11]/40 text-sm font-bold mt-2 max-w-md">
                        Master your service schedule: defined core hours, manage exceptions, and fine-tune booking constraints.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3"
                >
                    <Button
                        onClick={() => setModalOpen(true)}
                        variant="primary"
                        className="bg-[#C48B28] hover:bg-[#A37320] text-white rounded-2xl px-6 py-3 flex items-center gap-2.5 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#C48B28]/20"
                    >
                        <Plus size={18} />
                        Add Exception
                    </Button>
                </motion.div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex gap-1 bg-[#FAF9F6] p-1.5 rounded-[2rem] mb-10 border border-[#EAE6E2] w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.6rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-white text-[#402E11] shadow-xl shadow-[#402E11]/5 border border-[#EAE6E2]'
                                : 'text-[#402E11]/30 hover:text-[#402E11]/60'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'schedule' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#402E11]/5 border border-[#FAF9F6] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                    <Clock size={180} />
                                </div>
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#402E11]">Standard Weekly Hours</h2>
                                        <p className="text-[#402E11]/40 text-sm font-bold mt-1">Set your default operating times for each day of the week.</p>
                                    </div>
                                    <Button
                                        onClick={handleSaveHours}
                                        disabled={isSavingHours}
                                        className="bg-[#402E11] text-white rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest"
                                    >
                                        {isSavingHours ? 'Saving...' : 'Save Schedule'}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {days.map((dayName, idx) => {
                                        const hour = hours.find(h => h.day === idx);
                                        const isClosed = !hour || hour.is_closed;

                                        return (
                                            <div key={dayName} className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] border transition-all ${isClosed ? 'bg-[#FAF9F6]/50 border-transparent grayscale' : 'bg-white border-[#EAE6E2] shadow-sm'}`}>
                                                <div className="flex items-center gap-6 mb-4 md:mb-0">
                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAE6E2] flex items-center justify-center font-black text-[#402E11] shadow-sm">
                                                        {dayName.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <span className="block text-lg font-black text-[#402E11]">{dayName}</span>
                                                        <button
                                                            onClick={() => toggleDayStatus(idx)}
                                                            className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isClosed ? 'text-red-500' : 'text-green-500'}`}
                                                        >
                                                            {isClosed ? 'Closed • Mark Open' : 'Open • Mark Closed'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {!isClosed && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest ml-1">Opens at</span>
                                                            <input
                                                                type="time"
                                                                value={hour.open_time || '09:00'}
                                                                onChange={(e) => updateTime(idx, 'open_time', e.target.value)}
                                                                className="bg-[#FAF9F6] border border-[#EAE6E2] rounded-xl px-4 py-2.5 text-sm font-black text-[#402E11] focus:ring-2 focus:ring-[#C48B28] transition-all"
                                                            />
                                                        </div>
                                                        <div className="w-3 h-[2px] bg-[#EAE6E2] mt-4" />
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest ml-1">Closes at</span>
                                                            <input
                                                                type="time"
                                                                value={hour.close_time || '17:00'}
                                                                onChange={(e) => updateTime(idx, 'close_time', e.target.value)}
                                                                className="bg-[#FAF9F6] border border-[#EAE6E2] rounded-xl px-4 py-2.5 text-sm font-black text-[#402E11] focus:ring-2 focus:ring-[#C48B28] transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {isClosed && (
                                                    <div className="bg-white/60 px-6 py-3 rounded-xl border border-[#EAE6E2] text-[#402E11]/30 text-xs font-black uppercase tracking-widest">
                                                        Out of Office
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'blocks' && (
                        <div className="space-y-6">
                            <div className="bg-[#402E11] rounded-[3rem] p-10 text-white shadow-2xl shadow-[#402E11]/20 relative overflow-hidden mb-10">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none transform rotate-12Scale-[1.2]">
                                    <CalendarOff size={240} />
                                </div>
                                <div className="relative z-10 max-w-2xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#C48B28]">
                                            <Info size={18} />
                                        </div>
                                        <h2 className="text-xl font-black uppercase tracking-widest">Temporal Exceptions</h2>
                                    </div>
                                    <p className="text-white/60 text-lg font-bold leading-relaxed mb-8">
                                        Temporarily override your weekly schedule for holidays, vacations, or specific appointments. Blocked slots are instantly hidden from clients.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                                            <div className="text-2xl font-black text-[#C48B28] mb-1">{blocks.filter(b => !b.is_recurring).length}</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Active One-Time</div>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                                            <div className="text-2xl font-black text-[#C48B28] mb-1">{blocks.filter(b => b.is_recurring).length}</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Recurring Cycles</div>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                                            <div className="text-2xl font-black text-green-400 mb-1">Live</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">System Status</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <BlockedTimesList
                                blocks={blocks}
                                onDelete={handleDeleteBlock}
                                loading={loading}
                            />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Booking constraints */}
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#402E11]/5 border border-[#FAF9F6]">
                                <h3 className="text-xl font-black text-[#402E11] mb-8 border-b border-[#FAF9F6] pb-6">Constraints & Buffers</h3>
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-xs font-black text-[#402E11] uppercase tracking-[0.2em] mb-4">Advance Booking Window</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range" min="7" max="180" step="7"
                                                value={settings.advance_booking_days}
                                                onChange={(e) => setSettings({ ...settings, advance_booking_days: parseInt(e.target.value) })}
                                                className="flex-1 accent-[#C48B28]"
                                            />
                                            <span className="w-20 text-center font-black text-[#402E11] bg-[#FAF9F6] px-3 py-2 rounded-xl border border-[#EAE6E2] text-sm">{settings.advance_booking_days}d</span>
                                        </div>
                                        <p className="text-[10px] text-[#402E11]/40 font-bold mt-2">How many days into the future clients can book.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-[#402E11] uppercase tracking-[0.2em] mb-4">Minimum Lead Time</label>
                                        <div className="flex items-center gap-4">
                                            <select
                                                value={settings.min_lead_time_hours}
                                                onChange={(e) => setSettings({ ...settings, min_lead_time_hours: parseInt(e.target.value) })}
                                                className="flex-1 bg-[#FAF9F6] border border-[#EAE6E2] rounded-xl px-4 py-3 text-sm font-black text-[#402E11]"
                                            >
                                                <option value={1}>1 Hour (Instant)</option>
                                                <option value={12}>12 Hours</option>
                                                <option value={24}>24 Hours (Next Day)</option>
                                                <option value={48}>48 Hours (2 Days)</option>
                                                <option value={72}>72 Hours (3 Days)</option>
                                            </select>
                                        </div>
                                        <p className="text-[10px] text-[#402E11]/40 font-bold mt-2">Prevent last-minute bookings with a mandatory notice period.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-[#402E11] uppercase tracking-[0.2em] mb-4">Meeting Padding</label>
                                        <div className="flex items-center gap-4">
                                            <select
                                                value={settings.meeting_buffer_minutes}
                                                onChange={(e) => setSettings({ ...settings, meeting_buffer_minutes: parseInt(e.target.value) })}
                                                className="flex-1 bg-[#FAF9F6] border border-[#EAE6E2] rounded-xl px-4 py-3 text-sm font-black text-[#402E11]"
                                            >
                                                <option value={0}>No Buffer</option>
                                                <option value={15}>15 Minutes</option>
                                                <option value={30}>30 Minutes</option>
                                                <option value={60}>1 Hour</option>
                                            </select>
                                        </div>
                                        <p className="text-[10px] text-[#402E11]/40 font-bold mt-2">Automatically block time between successive appointments.</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={isSavingSettings}
                                    className="mt-12 w-full bg-[#402E11] text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest"
                                >
                                    {isSavingSettings ? 'Persisting...' : 'Apply Constraints'}
                                </Button>
                            </div>

                            {/* Automation settings */}
                            <div className="space-y-8">
                                <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#402E11]/5 border border-[#FAF9F6]">
                                    <h3 className="text-xl font-black text-[#402E11] mb-8 border-b border-[#FAF9F6] pb-6">Smart Automations</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-[#FAF9F6] rounded-2xl border border-[#EAE6E2]/50">
                                            <div>
                                                <div className="text-sm font-black text-[#402E11]">Auto-Approve Inquiries</div>
                                                <div className="text-[10px] text-[#402E11]/40 font-bold mt-0.5">Approve bookings immediately if slot is free.</div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, auto_approve_bookings: !settings.auto_approve_bookings })}
                                                className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${settings.auto_approve_bookings ? 'bg-green-500' : 'bg-[#EAE6E2]'}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-all ${settings.auto_approve_bookings ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        <div className="p-6 bg-[#402E11]/5 rounded-3xl border border-[#402E11]/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Sparkles className="text-[#C48B28]" size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#402E11]">Pro Tip</span>
                                            </div>
                                            <p className="text-sm font-bold text-[#402E11]/60 leading-relaxed">
                                                Enabling <span className="text-[#402E11]">Auto-Approve</span> with a <span className="text-[#402E11]">15-minute buffer</span> increases conversion rates by up to <span className="text-[#C48B28]">40%</span> while ensuring you're never overbooked.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#402E11]/5 border border-[#FAF9F6] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                                            <Bell size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-[#402E11]">Notification Health</div>
                                            <div className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-0.5">Optimized</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-[#402E11]/20" />
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modal Components */}
            <BlockTimeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreateBlock}
            />
        </div>
    );
};

export default AvailabilityManager;
