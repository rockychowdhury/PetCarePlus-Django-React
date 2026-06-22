import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export const ProviderMap = ({ providers, isLoading }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerGroupRef = useRef(null);
  const { language } = useLanguage();
  
  // Default Bangladesh center
  const defaultCenter = [23.6850, 90.3563];
  const defaultZoom = 6;

  useEffect(() => {
    // Initialize map
    if (!leafletMapRef.current && window.L && mapRef.current) {
      leafletMapRef.current = window.L.map(mapRef.current).setView(defaultCenter, defaultZoom);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);

      markerGroupRef.current = window.L.featureGroup().addTo(leafletMapRef.current);
    }

    return () => {
      // Let Leaflet manage itself or uncomment cleanup if strict mode causes issues
      // if (leafletMapRef.current) {
      //   leafletMapRef.current.remove();
      //   leafletMapRef.current = null;
      // }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !window.L || !markerGroupRef.current) return;

    // Clear existing markers
    markerGroupRef.current.clearLayers();

    let hasMarkers = false;

    if (providers && providers.length > 0) {
      providers.forEach(provider => {
        if (provider.latitude && provider.longitude) {
          hasMarkers = true;
          
          // Define custom icon (optional, using default for now)
          const marker = window.L.marker([provider.latitude, provider.longitude]);
          
          const popupContent = `
            <div style="min-width: 200px; padding: 4px;">
              <h3 style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111827;">${provider.business_name}</h3>
              <p style="font-size: 12px; color: #4b5563; margin-bottom: 12px;">${provider.provider_type}</p>
              <a href="/providers/${provider.id}" style="display: block; width: 100%; text-align: center; background-color: #10b981; color: white; padding: 6px 0; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none;">
                ${language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
              </a>
            </div>
          `;
          
          marker.bindPopup(popupContent);
          markerGroupRef.current.addLayer(marker);
        }
      });

      // Fit map to markers if there are any
      if (hasMarkers && markerGroupRef.current.getLayers().length > 0) {
        leafletMapRef.current.fitBounds(markerGroupRef.current.getBounds(), { padding: [50, 50] });
      } else {
        leafletMapRef.current.setView(defaultCenter, defaultZoom);
      }
    } else {
      leafletMapRef.current.setView(defaultCenter, defaultZoom);
    }
  }, [providers, language]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-card rounded-2xl border border-border/80 animate-pulse">
        <p className="text-muted-foreground font-semibold text-sm">
          {language === 'bn' ? 'ম্যাপ লোড হচ্ছে...' : 'Loading Map...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-border/80 shadow-sm relative z-0">
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
    </div>
  );
};

export default ProviderMap;
