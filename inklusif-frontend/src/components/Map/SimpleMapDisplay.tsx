import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface SimpleMapDisplayProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerText?: string;
}

const SimpleMapDisplay: React.FC<SimpleMapDisplayProps> = ({
  latitude,
  longitude,
  zoom = 13,
  markerText = 'Activity Location',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null); // To store the map instance

  useEffect(() => {
    if (mapRef.current && typeof latitude === 'number' && typeof longitude === 'number') {
      // Initialize map only if it hasn't been initialized yet
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([latitude, longitude], zoom);
        mapInstanceRef.current = map; // Store instance

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(markerText)
          .openPopup();
      } else {
        // If map instance exists, just update its view and marker position
        const map = mapInstanceRef.current;
        map.setView([latitude, longitude], zoom);
        
        // Clear existing markers (optional, or update existing marker)
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });

        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(markerText)
          .openPopup();
      }
    }

    // Cleanup function to destroy the map instance when the component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerText]); // Re-run effect if these props change

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return <p>Location data is not available.</p>;
  }

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} />;
};

export default SimpleMapDisplay;
