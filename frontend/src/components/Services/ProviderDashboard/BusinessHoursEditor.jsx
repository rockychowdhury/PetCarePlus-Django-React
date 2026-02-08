import React, { useState, useEffect } from 'react';
import { Clock, Check, X } from 'lucide-react';
import Button from '../../common/Buttons/Button';
import { toast } from 'react-toastify';

const DAYS = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
];

const BusinessHoursEditor = ({ initialHours = [], onSave, isLoading }) => {
    // Map initial hours to local state or defaults
    const [hours, setHours] = useState([]);

    useEffect(() => {
        // Initialize state with all 7 days
        const initialized = DAYS.map(day => {
            const existing = initialHours.find(h => h.day === day.value);
            return {
                day: day.value,
                day_display: day.label,
                open_time: existing?.open_time || '09:00',
                close_time: existing?.close_time || '17:00',
                is_closed: existing?.is_closed ?? false, // Default to open if not specified, or closed? Let's say open M-F, closed S-S ideally but here default open.
                id: existing?.id
            };
        });
        setHours(initialized);
    }, [initialHours]);

    const handleChange = (dayValue, field, value) => {
        setHours(prev => prev.map(h =>
            h.day === dayValue ? { ...h, [field]: value } : h
        ));
    };

    const handleSave = () => {
        onSave(hours);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Weekly Hours</h3>
                    <p className="text-xs text-text-secondary">Operational baseline for standard service days</p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? 'Saving...' : 'Commit Changes'}
                </Button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3">
                {hours.map((day) => (
                    <div key={day.day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border border-border shadow-sm">
                        {/* Day Label */}
                        <div className="flex items-center justify-between sm:block sm:w-24 lg:w-28">
                            <span className="font-medium text-text-primary text-sm sm:text-base">{day.day_display}</span>
                            {/* Mobile: Show closed badge inline */}
                            {day.is_closed && (
                                <span className="sm:hidden text-xs text-text-tertiary italic px-2 py-1 bg-gray-100 rounded">Mark Closed</span>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            {/* Open/Closed Toggle */}
                            <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={!day.is_closed}
                                    onChange={(e) => handleChange(day.day, 'is_closed', !e.target.checked)}
                                    className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                                />
                                <span className="text-xs sm:text-sm text-text-secondary whitespace-nowrap">Mark Closed</span>
                            </label>

                            {/* Time Inputs */}
                            {!day.is_closed ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="time"
                                        value={day.open_time || ''}
                                        onChange={(e) => handleChange(day.day, 'open_time', e.target.value)}
                                        className="flex-1 sm:flex-none p-2 border border-border rounded-md text-sm min-w-0"
                                    />
                                    <span className="text-text-tertiary shrink-0">-</span>
                                    <input
                                        type="time"
                                        value={day.close_time || ''}
                                        onChange={(e) => handleChange(day.day, 'close_time', e.target.value)}
                                        className="flex-1 sm:flex-none p-2 border border-border rounded-md text-sm min-w-0"
                                    />
                                </div>
                            ) : (
                                <span className="hidden sm:inline text-sm text-text-tertiary italic px-2">Closed</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessHoursEditor;
