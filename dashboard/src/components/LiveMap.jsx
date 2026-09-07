import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Drone Icon (blue)
const droneIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;animation:droneFloat 2s ease-in-out infinite;">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="1.5"/>
      <circle cx="18" cy="18" r="6" fill="#3b82f6"/>
      <line x1="18" y1="2" x2="18" y2="12" stroke="#3b82f6" stroke-width="2"/>
      <line x1="18" y1="24" x2="18" y2="34" stroke="#3b82f6" stroke-width="2"/>
      <line x1="2" y1="18" x2="12" y2="18" stroke="#3b82f6" stroke-width="2"/>
      <line x1="24" y1="18" x2="34" y2="18" stroke="#3b82f6" stroke-width="2"/>
      <circle cx="5" cy="5" r="3" fill="#60a5fa"/>
      <circle cx="31" cy="5" r="3" fill="#60a5fa"/>
      <circle cx="5" cy="31" r="3" fill="#60a5fa"/>
      <circle cx="31" cy="31" r="3" fill="#60a5fa"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20]
});

// Custom Fire Incident Icon (red)
const incidentIcon = new L.DivIcon({
  className: '',
  html: `<div style="animation:pulse 1s ease-in-out infinite;">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="15" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="2"/>
      <text x="16" y="21" text-anchor="middle" font-size="16">🔥</text>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18]
});

// Component to pan map to drone position smoothly
const MapFollower = ({ position }) => {
  const map = useMap();
  const lat = position ? position[0] : null;
  const lng = position ? position[1] : null;
  useEffect(() => {
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      map.panTo([lat, lng], { animate: true, duration: 0.4 });
    }
  }, [lat, lng]);
  return null;
};

// Simulated drone waypoint patrol route around Chennai
const WAYPOINTS = [
  [13.0827, 80.2707],
  [13.0845, 80.2730],
  [13.0860, 80.2750],
  [13.0850, 80.2720],
  [13.0835, 80.2695],
  [13.0820, 80.2680],
  [13.0810, 80.2700],
  [13.0820, 80.2720],
];

const LiveMap = ({ droneData, incidentData, flightPath = [] }) => {
  const displayDrone = droneData
    ? { lat: droneData.latitude, lng: droneData.longitude, altitude: droneData.altitude_m, battery: droneData.battery }
    : { lat: 13.0827, lng: 80.2707, altitude: 35, battery: 100 };

  return (
    <div className="panel map-section">
      <div className="panel-header">
        Live Geospatial Map — UAV-01 Patrol
      </div>
      <div className="panel-content">
        <style>{`
          @keyframes droneFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.2)} }
          .leaflet-popup-content-wrapper { background:#1a1a24; color:#e2e8f0; border:1px solid rgba(255,255,255,0.15); }
          .leaflet-popup-tip { background:#1a1a24; }
        `}</style>
        <MapContainer
          center={[13.0827, 80.2707]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Drone flight trail */}
          <Polyline
            positions={flightPath}
            pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.6, dashArray: '4 4' }}
          />

          {/* Drone marker */}
          <Marker position={[displayDrone.lat, displayDrone.lng]} icon={droneIcon}>
            <Popup>
              <strong style={{ color: '#3b82f6' }}>UAV-01</strong><br />
              Alt: {displayDrone.altitude} m<br />
              Battery: {displayDrone.battery}%<br />
              GPS: FIXED_3D
            </Popup>
          </Marker>

          {/* Waypoint markers */}
          {WAYPOINTS.map((wp, i) => (
            <Circle
              key={i}
              center={wp}
              radius={10}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.4, weight: 1 }}
            />
          ))}

          {/* Incident marker */}
          {incidentData && incidentData.latitude && (
            <>
              <Marker position={[incidentData.latitude, incidentData.longitude]} icon={incidentIcon}>
                <Popup>
                  <strong style={{ color: '#ef4444' }}>{incidentData.hazard_type?.toUpperCase()} CONFIRMED</strong><br />
                  Confidence: {(Number(incidentData.confidence) * 100).toFixed(1)}%<br />
                  Siren: {incidentData.local_siren_active ? '🔊 ACTIVE' : 'Off'}
                </Popup>
              </Marker>
              <Circle
                center={[incidentData.latitude, incidentData.longitude]}
                radius={120}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, dashArray: '6 4' }}
              />
            </>
          )}

          <MapFollower position={[displayDrone.lat, displayDrone.lng]} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;
