import React, { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Navigation, Loader } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const LocationMarkerHandler = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
};

// Component to move map to specific coordinates
const MapController = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { duration: 1.5 });
        }
    }, [center, map]);

    return null;
};

const LocationMapModal = ({ isOpen, onClose, onConfirm, initialPosition = [23.8103, 90.4125], initialSearch = '' }) => {
    const [position, setPosition] = useState(initialPosition);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [locationName, setLocationName] = useState('');
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Effect to handle initial search when modal opens
    useEffect(() => {
        if (isOpen && initialSearch && !position) {
            handleSearch(initialSearch);
        }
    }, [isOpen, initialSearch]);

    // Geocode search using Nominatim (OpenStreetMap)
    const handleSearch = async (query) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Geocoding error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Reverse geocode to get location name from coordinates
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const name = data.address?.city || data.address?.town || data.address?.village ||
                data.address?.county || data.display_name?.split(',')[0] ||
                `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setLocationName(name);
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    // Update location name when position changes
    useEffect(() => {
        if (position) {
            reverseGeocode(position[0], position[1]);
        }
    }, [position]);

    // Handle search result selection
    const handleSelectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setPosition([lat, lng]);
        setLocationName(result.display_name);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Handle current location
    const handleUseCurrentLocation = () => {
        setIsGettingCurrentLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setPosition([lat, lng]);
                    setIsGettingCurrentLocation(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to get your current location. Please ensure location permissions are enabled.');
                    setIsGettingCurrentLocation(false);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
            setIsGettingCurrentLocation(false);
        }
    };

    // Handle confirm
    const handleConfirm = () => {
        if (position) {
            onConfirm({
                lat: position[0],
                lng: position[1],
                name: locationName
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Choose Location</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Click on map or search for a location</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex gap-2">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for a city, address, or landmark..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                            />
                            {isSearching && (
                                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary animate-spin" size={16} />
                            )}
                        </div>

                        {/* Current Location Button */}
                        <button
                            onClick={handleUseCurrentLocation}
                            disabled={isGettingCurrentLocation}
                            className="px-4 py-2.5 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary-dark transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 text-sm whitespace-nowrap"
                        >
                            {isGettingCurrentLocation ? (
                                <Loader className="animate-spin" size={16} />
                            ) : (
                                <Navigation size={16} />
                            )}
                            <span className="hidden sm:inline">Current Location</span>
                        </button>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectSearchResult(result)}
                                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex items-start gap-2"
                                >
                                    <MapPin size={16} className="text-brand-primary mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-gray-900 truncate">{result.display_name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map Container */}
                <div className="flex-1 relative bg-gray-100">
                    <MapContainer
                        center={position}
                        zoom={13}
                        className="h-full w-full"
                        zoomControl={true}
                        style={{ zIndex: 1 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarkerHandler position={position} setPosition={setPosition} />
                        <MapController center={position} />
                    </MapContainer>

                    {/* Selected Location Info Overlay */}
                    {locationName && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white/98 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-brand-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-gray-900 truncate">{locationName}</div>
                                    <div className="text-[10px] text-gray-500">
                                        {position[0].toFixed(6)}, {position[1].toFixed(6)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!position}
                        className="px-6 py-2.5 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary-dark transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationMapModal;
