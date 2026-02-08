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
        { id: 'schedule', label: 'Schedule', icon: Clock },
        { id: 'blocks', label: 'Time-Off', icon: CalendarIcon },
        { id: 'settings', label: 'Rules', icon: Settings2 },
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
            toast.error('Failed to load exceptions');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHours = async () => {
        setIsSavingHours(true);
        try {
            const response = await api.post(`/services/providers/${provider.id}/update_hours/`, hours);
            toast.success('Schedule updated');
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
        <div className="w-full pb-12 animate-in fade-in duration-300">
            {/* Inner Tabs Navigation */}
            <div className="flex gap-1.5 bg-[#FAF9F6] p-1.5 rounded-full mb-8 border border-[#EAE6E2] w-full sm:w-fit shadow-sm overflow-x-auto no-scrollbar flex-nowrap shrink-0">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] transition-all duration-300 relative whitespace-nowrap shrink-0 ${isActive
                                ? 'bg-white text-[#402E11] shadow-md shadow-[#C48B28]/10 border border-[#C48B28] ring-[0.5px] ring-[#C48B28]/20'
                                : 'text-[#402E11]/30 hover:text-[#402E11]/50 hover:bg-white/40'
                                }`}
                        >
                            <Icon size={12} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#C48B28]' : 'text-[#402E11]/20'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'schedule' && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-xl shadow-[#402E11]/5 border border-[#FAF9F6] relative overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-sm font-black text-[#402E11] tracking-tight">Weekly Hours</h2>
                                        <p className="text-[#402E11]/30 text-[9px] font-medium">Operational baseline for standard service days.</p>
                                    </div>
                                    <Button
                                        onClick={handleSaveHours}
                                        disabled={isSavingHours}
                                        className="w-full sm:w-auto bg-[#C48B28] hover:bg-[#B37A1F] text-white rounded-xl px-4 py-3 sm:py-2 font-bold text-[9px] uppercase tracking-[0.1em] transition-all shadow-md shadow-[#C48B28]/20 disabled:opacity-50"
                                    >
                                        {isSavingHours ? 'Syncing...' : 'Commit Changes'}
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {days.map((dayName, idx) => {
                                        const hour = hours.find(h => h.day === idx);
                                        const isClosed = !hour || hour.is_closed;

                                        return (
                                            <div key={dayName} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all gap-4 ${isClosed ? 'bg-[#FAF9F6]/30 border-[#EAE6E2]/50' : 'bg-white border-[#EAE6E2] shadow-sm'}`}>
                                                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-5 w-full sm:w-auto">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FDFBF7] border border-[#EAE6E2] flex items-center justify-center font-bold text-[#402E11] text-[10px] shadow-sm">
                                                            {dayName.substring(0, 3)}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className={`block text-xs font-bold ${isClosed ? 'text-[#402E11]/40' : 'text-[#402E11]'}`}>{dayName}</span>
                                                            <div className="sm:hidden">
                                                                {isClosed && (
                                                                    <span className="text-[7px] font-black uppercase tracking-widest text-[#402E11]/20">Closed</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleDayStatus(idx)}
                                                        className={`text-[7px] font-black uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-md border transition-all ${isClosed
                                                            ? 'text-brand-primary bg-white border-brand-primary/20 hover:bg-brand-primary/5'
                                                            : 'text-[#402E11]/30 bg-[#FAF9F6] border-[#EAE6E2] hover:text-[#402E11] hover:bg-white'}`}
                                                    >
                                                        {isClosed ? 'Open' : 'Close'}
                                                    </button>
                                                </div>

                                                {!isClosed && (
                                                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                        <div className="relative flex-1 sm:w-32">
                                                            <input
                                                                type="time"
                                                                value={hour.open_time || '09:00'}
                                                                onChange={(e) => updateTime(idx, 'open_time', e.target.value)}
                                                                className="w-full bg-[#FDFBF7] border border-[#EAE6E2] rounded-xl pl-3 pr-8 py-2.5 text-[10px] font-bold text-[#402E11] focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none shadow-sm transition-all uppercase"
                                                            />
                                                            <Clock size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#402E11]/30 pointer-events-none" />
                                                        </div>
                                                        <div className="w-2 h-[1px] bg-[#EAE6E2] shrink-0" />
                                                        <div className="relative flex-1 sm:w-32">
                                                            <input
                                                                type="time"
                                                                value={hour.close_time || '17:00'}
                                                                onChange={(e) => updateTime(idx, 'close_time', e.target.value)}
                                                                className="w-full bg-[#FDFBF7] border border-[#EAE6E2] rounded-xl pl-3 pr-8 py-2.5 text-[10px] font-bold text-[#402E11] focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none shadow-sm transition-all uppercase"
                                                            />
                                                            <Clock size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#402E11]/30 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                )}

                                                {isClosed && (
                                                    <div className="hidden sm:block px-5 py-2 rounded-xl bg-[#FDFBF7] border border-[#EAE6E2] text-[#402E11]/20 text-[8px] font-black uppercase tracking-[.2em]">
                                                        Unavailable
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
                        <div className="space-y-4">
                            <div className="bg-[#402E11] rounded-[2rem] p-6 text-white shadow-xl shadow-[#402E11]/10 relative overflow-hidden mb-6">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                                    <CalendarOff size={140} />
                                </div>
                                <div className="relative z-10 max-w-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-brand-primary">
                                            <Info size={14} />
                                        </div>
                                        <h2 className="text-sm font-black uppercase tracking-widest">Temporal Exceptions</h2>
                                    </div>
                                    <p className="text-white/60 text-xs font-bold leading-relaxed mb-6">
                                        Temporarily override your weekly schedule for holidays or vacations.
                                    </p>
                                    <div className="flex gap-4">
                                        <div>
                                            <div className="text-lg font-black text-brand-primary leading-none mb-1">{blocks.length}</div>
                                            <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Total exceptions</div>
                                        </div>
                                        <div className="w-[1px] bg-white/10" />
                                        <div>
                                            <div className="text-lg font-black text-green-400 leading-none mb-1">Live</div>
                                            <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Sync status</div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Booking constraints */}
                            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-[#402E11]/5 border border-[#FAF9F6]">
                                <h3 className="text-sm font-black text-[#402E11] mb-6 border-b border-[#FAF9F6] pb-4">Constraint Logic</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[9px] font-black text-[#402E11] uppercase tracking-widest">Advance Window</label>
                                            <span className="text-[10px] font-black text-brand-primary">{settings.advance_booking_days} Days</span>
                                        </div>
                                        <input
                                            type="range" min="7" max="180" step="7"
                                            value={settings.advance_booking_days}
                                            onChange={(e) => setSettings({ ...settings, advance_booking_days: parseInt(e.target.value) })}
                                            className="w-full accent-brand-primary h-1 bg-brand-accent rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-black text-[#402E11] uppercase tracking-widest mb-2">Minimum Lead Time</label>
                                        <select
                                            value={settings.min_lead_time_hours}
                                            onChange={(e) => setSettings({ ...settings, min_lead_time_hours: parseInt(e.target.value) })}
                                            className="w-full bg-[#FAF9F6] border border-[#EBC176]/30 rounded-xl px-3 py-2 text-[11px] font-black text-[#402E11] outline-none"
                                        >
                                            <option value={1}>1 Hr (Immediate)</option>
                                            <option value={12}>12 Hours</option>
                                            <option value={24}>24 Hours</option>
                                            <option value={48}>48 Hours</option>
                                            <option value={72}>72 Hours</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-black text-[#402E11] uppercase tracking-widest mb-2">Buffer Between</label>
                                        <select
                                            value={settings.meeting_buffer_minutes}
                                            onChange={(e) => setSettings({ ...settings, meeting_buffer_minutes: parseInt(e.target.value) })}
                                            className="w-full bg-[#FAF9F6] border border-[#EBC176]/30 rounded-xl px-3 py-2 text-[11px] font-black text-[#402E11] outline-none"
                                        >
                                            <option value={0}>No Buffer</option>
                                            <option value={15}>15 Minutes</option>
                                            <option value={30}>30 Minutes</option>
                                            <option value={60}>1 Hour</option>
                                        </select>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={isSavingSettings}
                                    className="mt-4 w-full bg-[#C48B28] hover:bg-[#B37A1F] text-white rounded-xl py-2 font-bold text-[8px] uppercase tracking-[0.15em] shadow-md shadow-[#C48B28]/10 transition-all active:scale-95"
                                >
                                    {isSavingSettings ? 'Synchronizing...' : 'Apply Logic'}
                                </Button>
                            </div>

                            {/* Automation settings */}
                            <div className="space-y-4">
                                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-[#402E11]/5 border border-[#FAF9F6]">
                                    <h3 className="text-sm font-black text-[#402E11] mb-6 border-b border-[#FAF9F6] pb-4">Automations</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-[#FAF9F6] rounded-xl border border-[#EBC176]/50">
                                            <div>
                                                <div className="text-[11px] font-black text-[#402E11]">Auto-Approve</div>
                                                <div className="text-[8px] text-[#402E11]/40 font-bold mt-0.5 uppercase tracking-wider">Instant confirmation</div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, auto_approve_bookings: !settings.auto_approve_bookings })}
                                                className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${settings.auto_approve_bookings ? 'bg-brand-primary' : 'bg-[#EAE6E2]'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-all ${settings.auto_approve_bookings ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </button>
                                        </div>

                                        <div className="p-4 bg-[#402E11]/[0.02] rounded-2xl border border-[#402E11]/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="text-brand-primary" size={12} />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-[#402E11]">Information</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-[#402E11]/50 leading-relaxed">
                                                Active <span className="text-[#402E11]">Auto-Approve</span> plus a <span className="text-[#402E11]">15m buffer</span> reduces management overhead significantly.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-4 shadow-xl shadow-[#402E11]/5 border border-[#FAF9F6] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                            <Bell size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-[#402E11] uppercase tracking-wider">Alert Configuration</div>
                                            <div className="text-[8px] text-green-500 font-bold uppercase tracking-widest">Active</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-[#402E11]/20" size={14} />
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
