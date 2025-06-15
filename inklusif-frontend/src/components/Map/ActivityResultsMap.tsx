import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Activity } from '../../services/activityService'; // Assuming Activity type
import { Link } from 'react-router-dom'; // For links in popups
import ReactDOMServer from 'react-dom/server'; // To render React components to string for popups

interface ActivityResultsMapProps {
  activities: Activity[];
  center?: [number, number]; // Optional: initial center
  zoom?: number; // Optional: initial zoom
}

// Custom Marker Icon (Orange)
const customMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6F61" width="32px" height="32px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>`
  ),
  iconSize: [32, 32], // Spec: pin markers 32x32 px
  iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
});


const ActivityResultsMap: React.FC<ActivityResultsMapProps> = ({ 
  activities, 
  center = [46.603354, 1.888334], // Default center of France
  zoom = 6 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null); // To manage markers group

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstanceRef.current = map;
      markersRef.current = L.layerGroup().addTo(map); // Initialize markers layer group

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    }

    // Update markers when activities change
    if (mapInstanceRef.current && markersRef.current) {
      const map = mapInstanceRef.current;
      const markersLayer = markersRef.current;
      
      markersLayer.clearLayers(); // Clear existing markers

      const validActivities = activities.filter(
        act => act.latitude != null && act.longitude != null && !isNaN(Number(act.latitude)) && !isNaN(Number(act.longitude))
      );

      if (validActivities.length > 0) {
        const bounds = L.latLngBounds([]);
        validActivities.forEach(activity => {
          const marker = L.marker([Number(activity.latitude), Number(activity.longitude)], { icon: customMarkerIcon })
            .addTo(markersLayer);
          
          // Create popup content with a link
          const popupContent = ReactDOMServer.renderToString(
            <div style={{fontFamily: 'var(--font-primary, sans-serif)', fontSize: '14px'}}>
              <h4 style={{margin: '0 0 5px 0', fontSize: '16px', color: 'var(--color-blue-primary)'}}>{activity.title}</h4>
              {activity.type && <p style={{margin: '0 0 8px 0'}}>Type: {activity.type}</p>}
              <Link 
                to={`/activities/${activity.id}`} 
                style={{
                  color: 'var(--color-orange-primary)', 
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }}
              >
                Voir les détails
              </Link>
            </div>
          );
          marker.bindPopup(popupContent);
          bounds.extend([Number(activity.latitude), Number(activity.longitude)]);
        });

        // Fit map to bounds if there are markers, otherwise use default view or last known view
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } else if (mapInstanceRef.current) {
        // No valid activities, reset to default view or last search location if available
        // For now, just set to default if no activities and map exists
         mapInstanceRef.current.setView(center, zoom);
      }
    }
    
    // Note: No cleanup function for mapInstanceRef.current.remove() here,
    // as this component might be re-rendered with new activities.
    // Map removal should happen if the SearchPage itself unmounts.
    // Or, if this component is unmounted while map view is active.
    // For now, map is persistent as long as map view is active.

  }, [activities, center, zoom]); // Re-run effect if these change

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: 'var(--card-border-radius, 8px)' }} />;
};

export default ActivityResultsMap;
