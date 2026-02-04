import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const ServiceLocationMap = ({ provider }) => {
    if (!provider) return null;

    // Get coordinates from address or fallback to direct fields
    const lat = provider.address?.coordinates?.lat || provider.latitude;
    const lng = provider.address?.coordinates?.lng || provider.longitude;

    // Get address
    const address = provider.address
        ? `${provider.address.line1}, ${provider.address.city}, ${provider.address.state} ${provider.address.zip}`
        : `${provider.address_line1 || ''}, ${provider.city}, ${provider.state} ${provider.zip_code}`;

    // If no coordinates, show placeholder
    if (!lat || !lng) {
        return (
            <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-500">
                    <MapPin size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold">Location Not Available</p>
                    <p className="text-sm mt-1">{address}</p>
                </div>
            </div>
        );
    }

    // Google Maps Static API URL (no API key needed for basic maps)
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red%7C${lat},${lng}&scale=2`;

    // Google Maps link to open in new tab
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    return (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Map Image */}
            <div className="h-64 bg-gray-100 relative">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${lat},${lng}&hl=es&z=15&output=embed`}
                    allowFullScreen
                    title="Service Location"
                />

                {/* Overlay with "View Larger Map" button */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white shadow-lg rounded-full px-6 py-3 font-bold text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <ExternalLink size={16} />
                        Open in Google Maps
                    </a>
                </div>
            </div>

            {/* Address Info */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-start gap-3">
                    <MapPin className="text-brand-primary shrink-0 mt-1" size={20} />
                    <div>
                        <p className="font-semibold text-gray-900">{address}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceLocationMap;
