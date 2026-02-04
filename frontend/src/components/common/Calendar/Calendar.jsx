import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

/**
 * Reusable Calendar Component
 * 
 * @param {Object} props
 * @param {Array} props.events - Array of event objects with { id, date, time, title, description, color, status }
 * @param {Function} props.onEventClick - Callback when an event is clicked (event) => {}
 * @param {Function} props.onDateClick - Callback when a date cell is clicked (date) => {}
 * @param {Function} props.onTimeSlotClick - Callback when a time slot is clicked (date, hour) => {}
 * @param {'week'|'month'|'day'} props.view - Calendar view mode
 * @param {Date} props.initialDate - Initial date to display
 * @param {number} props.startHour - Start hour for day/week view (default: 9)
 * @param {number} props.endHour - End hour for day/week view (default: 18)
 * @param {boolean} props.showTimeSlots - Whether to show time slots in week view
 * @param {React.ReactNode} props.renderEvent - Custom event renderer
 */
const Calendar = ({
    events = [],
    onEventClick = () => { },
    onDateClick = () => { },
    onTimeSlotClick = () => { },
    view = 'week',
    initialDate = new Date(),
    startHour = 9,
    endHour = 18,
    showTimeSlots = true,
    renderEvent = null,
    className = ''
}) => {
    const [currentDate, setCurrentDate] = useState(initialDate);

    // Navigation functions
    const goToNext = () => {
        if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        if (view === 'month') setCurrentDate(addWeeks(currentDate, 4));
    };

    const goToPrev = () => {
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        if (view === 'month') setCurrentDate(subWeeks(currentDate, 4));
    };

    const goToToday = () => setCurrentDate(new Date());

    // Generate time slots
    const timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
        const hour = startHour + i;
        return {
            hour,
            label: hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`
        };
    });

    // Get events for a specific date and optional hour
    const getEventsForSlot = (date, hour = null) => {
        return events.filter(event => {
            if (!event.date) return false;
            const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
            if (!isSameDay(eventDate, date)) return false;

            if (hour !== null && event.time) {
                const eventHour = parseInt(event.time.split(':')[0]);
                return eventHour === hour;
            }
            return hour === null;
        });
    };

    // Default event renderer
    const defaultRenderEvent = (event) => (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
            }}
            className={`mb-1 p-2 border-l-4 rounded text-xs cursor-pointer hover:shadow-md transition-all ${event.color || 'border-l-blue-500 bg-blue-50/50'
                }`}
        >
            <div className="font-bold text-gray-900 truncate">{event.title}</div>
            {event.time && <div className="text-gray-600 text-[10px] truncate mt-0.5">{event.time}</div>}
            {event.description && (
                <div className="text-gray-500 text-[10px] truncate">{event.description}</div>
            )}
        </div>
    );

    const eventRenderer = renderEvent || defaultRenderEvent;

    // Week View
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

        return (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-8 border-b border-gray-200">
                    <div className="p-3 bg-gray-50"></div>
                    {weekDays.map((day, idx) => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div
                                key={idx}
                                className={`p-3 text-center border-l border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${isToday ? 'bg-brand-primary/5' : 'bg-gray-50'
                                    }`}
                                onClick={() => onDateClick(day)}
                            >
                                <div className="text-xs font-bold text-gray-500 uppercase">
                                    {format(day, 'EEE')}
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${isToday ? 'text-brand-primary' : 'text-gray-900'
                                        }`}
                                >
                                    {format(day, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time Slots */}
                {showTimeSlots && (
                    <div className="overflow-y-auto max-h-[600px]">
                        {timeSlots.map((slot) => (
                            <div key={slot.hour} className="grid grid-cols-8 border-b border-gray-100">
                                {/* Time Label */}
                                <div className="p-3 text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200">
                                    {slot.label}
                                </div>

                                {/* Day Cells */}
                                {weekDays.map((day, dayIdx) => {
                                    const slotEvents = getEventsForSlot(day, slot.hour);
                                    return (
                                        <div
                                            key={dayIdx}
                                            className="p-2 border-l border-gray-100 min-h-[80px] hover:bg-gray-50 transition-colors relative cursor-pointer"
                                            onClick={() => onTimeSlotClick(day, slot.hour)}
                                        >
                                            {slotEvents.map((event) => eventRenderer(event))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Month View
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

        // Pad to start on Monday
        const firstDayOfWeek = monthStart.getDay();
        const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        return (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} className="p-3 text-center bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                    {/* Padding days */}
                    {Array.from({ length: paddingDays }).map((_, idx) => (
                        <div key={`pad-${idx}`} className="p-4 border-r border-b border-gray-100 bg-gray-50/30 min-h-[100px]"></div>
                    ))}

                    {/* Month days */}
                    {monthDays.map((day, idx) => {
                        const isToday = isSameDay(day, new Date());
                        const dayEvents = getEventsForSlot(day);

                        return (
                            <div
                                key={idx}
                                className={`p-2 border-r border-b border-gray-100 min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors ${isToday ? 'bg-brand-primary/5' : ''
                                    }`}
                                onClick={() => onDateClick(day)}
                            >
                                <div className={`text-sm font-bold mb-1 ${isToday ? 'text-brand-primary' : 'text-gray-900'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 3).map((event) => eventRenderer(event))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[10px] text-gray-500 font-medium">
                                            +{dayEvents.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Navigation Header */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                <button
                    onClick={goToPrev}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Previous"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">
                        {view === 'week'
                            ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM dd')} - ${format(
                                addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6),
                                'MMM dd, yyyy'
                            )}`
                            : format(currentDate, 'MMMM yyyy')}
                    </h2>
                </div>

                <button
                    onClick={goToNext}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Next"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar Views */}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
        </div>
    );
};

export default Calendar;
