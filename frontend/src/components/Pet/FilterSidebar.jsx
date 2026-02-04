import React, { useState, useEffect, useRef } from 'react';
import {
    MapPin,
    Check,
    ChevronDown,
    Search,
    Filter,
    X,
    Navigation,
    Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shared Helper Components ---

const FilterSection = ({ title, children, subtitle }) => {
    return (
        <div className="border-b border-[#EBC176]/10 last:border-0 py-4">
            <div className="flex items-center justify-between w-full mb-3">
                <h3 className="text-[10px] font-black text-themev2-text uppercase tracking-widest">{title}</h3>
                {subtitle && <span className="text-[11px] font-bold text-themev2-text/50 italic">{subtitle}</span>}
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};

const CheckboxItem = ({ label, checked, onChange, colorClass = "bg-[#C48B28]", subLabel }) => (
    <label className="flex items-start gap-3 cursor-pointer group py-1.5">
        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${checked ? `border-[#C48B28] ${colorClass}` : 'bg-white border-[#EBC176]/40 group-hover:border-[#C48B28]/60'}`}>
            {checked && <Check size={10} className="text-white" strokeWidth={4} />}
        </div>
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
        <div className="flex flex-col">
            <span className={`text-[13px] font-bold transition-colors ${checked ? 'text-themev2-text' : 'text-themev2-text/60 group-hover:text-themev2-text'}`}>{label}</span>
            {subLabel && <span className="text-[11px] text-themev2-text/50 font-bold">{subLabel}</span>}
        </div>
    </label>
);

const RadioItem = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group py-1.5">
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-[#C48B28]' : 'bg-white border-[#EBC176]/40 group-hover:border-[#C48B28]/60'}`}>
            {checked && <div className="w-2 h-2 rounded-full bg-[#C48B28]" />}
        </div>
        <input type="radio" className="hidden" checked={checked} onChange={onChange} />
        <span className={`text-[13px] font-bold transition-colors ${checked ? 'text-themev2-text' : 'text-themev2-text/60 group-hover:text-themev2-text'}`}>{label}</span>
    </label>
);


const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {

    // Config Options
    const speciesOptions = [
        { id: 'dog', label: 'Dogs' },
        { id: 'cat', label: 'Cats' },
        { id: 'rabbit', label: 'Rabbits' },
        { id: 'bird', label: 'Birds' },
    ];


    const sizeOptions = [
        { id: 'small', label: 'Small', sub: 'Under 25 lbs' },
        { id: 'medium', label: 'Medium', sub: '26 - 60 lbs' },
        { id: 'large', label: 'Large', sub: '61 - 100 lbs' },
    ];

    const genderOptions = [
        { id: 'male', label: 'Male' },
        { id: 'female', label: 'Female' },
    ];


    // --- Location Logic (Synced with ServiceFilterSidebar) ---
    const [locationInput, setLocationInput] = useState(filters.location || '');
    const [radiusInput, setRadiusInput] = useState(filters.radius || 50);

    // Hover preview state
    const [showHover, setShowHover] = useState(false);
    const [hoverValue, setHoverValue] = useState(null);
    const [hoverPercent, setHoverPercent] = useState(0);
    const sliderRef = useRef(null);

    useEffect(() => {
        setLocationInput(filters.location || '');
        setRadiusInput(filters.radius || 50);
    }, [filters.location, filters.radius]);

    const handleRadiusChange = (e) => {
        const val = e.target.value;
        setRadiusInput(val);

        // If we are using nearby coordinate search, update the nearby param string
        if (filters.nearby) {
            const [lat, lng] = filters.nearby.split(',');
            onFilterChange('nearby', `${lat},${lng},${val}`);
        } else {
            // Otherwise just update the standalone radius (for city search)
            onFilterChange('radius', val);
        }
    };

    const handleSliderMoving = (e) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        // Calculate raw percentage based on mouse position
        const rawPercent = (e.clientX - rect.left) / rect.width;
        // Clamp between 0 and 1
        const percent = Math.max(0, Math.min(1, rawPercent));
        // Interpolate value between 5 and 500
        const val = Math.round(5 + (500 - 5) * percent);

        setHoverValue(val);
        setHoverPercent(percent * 100);
    };

    return (
        <div className="w-full flex flex-col p-8 bg-[#FEF9ED] rounded-[2.5rem] border border-[#EBC176]/20 shadow-sm overflow-hidden h-full">
            {/* Sidebar Header */}
            <div className="mb-10 pt-2">
                <h2 className="text-xl font-black text-themev2-text tracking-tighter mb-2 leading-none">Refine your search</h2>
                <p className="text-[11px] font-bold text-themev2-text/30 leading-relaxed">
                    Narrow down your search results to find the perfect pet.
                </p>
            </div>

            {/* 1. Location Section */}
            <div className="border-b border-[#EBC176]/10 py-4 pt-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-themev2-text uppercase tracking-widest">Location</h3>
                    <span className="text-[11px] font-bold text-themev2-text/50 italic">Within radius</span>
                </div>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={async () => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    async (position) => {
                                        const lat = position.coords.latitude;
                                        const lng = position.coords.longitude;
                                        let name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                                        try {
                                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                                            const data = await response.json();
                                            name = data.address?.city || data.address?.town || data.address?.village || data.display_name || name;
                                        } catch (error) { console.error(error); }
                                        onFilterChange('updateLocation', { lat, lng, radius: radiusInput, name });
                                    },
                                    (err) => alert('Enable location services.')
                                );
                            }
                        }}
                        className="flex-1 px-2 py-3 bg-[#D4A056] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#C48B28] transition-all shadow-md shadow-[#D4A056]/10 active:scale-95 flex items-center justify-center gap-1.5"
                    >
                        <Navigation size={12} />
                        My location
                    </button>

                    <button
                        onClick={() => onFilterChange('openLocationPicker', true)}
                        className="flex-1 px-2 py-3 bg-white border border-[#EBC176]/30 text-themev2-text/70 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FAF3E0] transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                    >
                        <Map size={12} />
                        On map
                    </button>
                </div>

                {filters.location && (
                    <div className="mb-4 px-4 py-2.5 bg-white border border-[#EBC176]/20 rounded-xl flex items-center justify-between group shadow-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <MapPin size={12} className="text-[#D4A056] shrink-0" />
                            <span className="text-[11px] font-bold text-themev2-text truncate">{filters.location}</span>
                        </div>
                        <button onClick={() => onFilterChange('location', '')} className="text-[#EBC176] hover:text-[#C48B28] transition-colors"><X size={14} /></button>
                    </div>
                )}

                <div className="px-1 relative group mt-2">
                    <div
                        className="flex items-center h-10 relative"
                        ref={sliderRef}
                        onMouseMove={handleSliderMoving}
                        onMouseEnter={() => setShowHover(true)}
                        onMouseLeave={() => setShowHover(false)}
                    >
                        <input
                            type="range"
                            min="5"
                            max="500"
                            step="5"
                            value={radiusInput}
                            onChange={handleRadiusChange}
                            className="w-full h-1.5 bg-[#EBC176]/20 rounded-full appearance-none cursor-pointer accent-[#C48B28] range-slider"
                        />

                        {/* Tooltip - Only show on hover for accurate placement preview */}
                        <AnimatePresence>
                            {showHover && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: -44 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    style={{
                                        left: `${hoverPercent}%`,
                                        marginLeft: '-2px' // Slight nudge to fix "bit right" alignment
                                    }}
                                    className="absolute -translate-x-1/2 pointer-events-none z-50 px-2.5 py-1.5 bg-[#402E11] text-white text-[10px] font-black rounded-lg whitespace-nowrap shadow-2xl"
                                >
                                    {hoverValue} km
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#402E11]" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between px-0.5 mt-[-4px]">
                        <span className="text-[11px] font-black text-[#402E11]/30 uppercase tracking-widest">5km</span>
                        <span className="text-[11px] font-black text-[#402E11]/30 uppercase tracking-widest">500km</span>
                    </div>
                </div>
            </div>

            {/* 2. Species */}
            <FilterSection title="Pet Species" subtitle="Pick one">
                <div className="flex flex-col gap-1">
                    <RadioItem
                        label="Any Species"
                        checked={!filters.species}
                        onChange={() => onFilterChange('species', '')}
                    />
                    {speciesOptions.map(option => (
                        <RadioItem
                            key={option.id}
                            label={option.label}
                            checked={filters.species === option.id}
                            onChange={() => onFilterChange('species', option.id)}
                        />
                    ))}
                </div>
            </FilterSection>


            {/* 4. Gender */}
            <FilterSection title="Gender">
                <div className="flex flex-col gap-1">
                    {genderOptions.map(option => (
                        <CheckboxItem
                            key={option.id}
                            label={option.label}
                            checked={filters.gender === option.id}
                            onChange={() => onFilterChange('gender', filters.gender === option.id ? '' : option.id)}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* 5. Size */}
            <FilterSection title="Pet Size">
                <div className="flex flex-col gap-1">
                    {sizeOptions.map(option => (
                        <CheckboxItem
                            key={option.id}
                            label={option.label}
                            subLabel={option.sub}
                            checked={filters.size === option.id}
                            onChange={() => onFilterChange('size', filters.size === option.id ? '' : option.id)}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* 6. Age Range */}
            <FilterSection title="Age Range">
                <div className="flex flex-col gap-1">
                    {[
                        { id: '', label: 'Any age' },
                        { id: 'baby', label: 'Puppy / Kitten (< 1yr)' },
                        { id: 'adult', label: 'Adult (1-10 yrs)' },
                        { id: 'senior', label: 'Senior (10+ yrs)' },
                    ].map(option => (
                        <RadioItem
                            key={option.id}
                            label={option.label}
                            checked={filters.age_range === option.id || (!filters.age_range && option.id === '')}
                            onChange={() => onFilterChange('age_range', option.id)}
                        />
                    ))}
                </div>
            </FilterSection>



            {/* 7. Trust & Safety */}
            <FilterSection title="Trust & Safety">
                <div className="flex flex-col gap-1">
                    <CheckboxItem
                        label="Verified Owners"
                        subLabel="ID verified for safety"
                        checked={filters.verified_owner === 'true'}
                        onChange={() => onFilterChange('verified_owner', filters.verified_owner === 'true' ? '' : 'true')}
                    />
                </div>
            </FilterSection>

            {/* Reset Button */}
            <button
                onClick={onClearFilters}
                className="w-full py-4 mt-8 bg-white border border-[#EBC176] text-[#C48B28] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#FAF3E0] transition-all active:scale-95 shadow-sm"
            >
                Reset all filters
            </button>

            <style>{`
                .range-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: #C48B28;
                    border: 3px solid #FEF9ED;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(196, 139, 40, 0.3);
                    position: relative;
                    z-index: 10;
                }
                .range-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    background: #C48B28;
                    border: 3px solid #FEF9ED;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(196, 139, 40, 0.3);
                }
            `}</style>

        </div>
    );
};

export default FilterSidebar;

