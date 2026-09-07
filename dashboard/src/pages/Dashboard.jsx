import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import BACKEND_URL from '../config';
import VideoPanel from '../components/VideoPanel';
import LiveMap from '../components/LiveMap';
import IncidentPanel from '../components/IncidentPanel';
import DroneStatus from '../components/DroneStatus';
import DroneControls from '../components/DroneControls';

// Simulated waypoint patrol path around Chennai
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

// HOME position as an ARRAY (same format as waypoints)
const HOME = [13.0827, 80.2707];
const SPEED = 0.00006;

function Dashboard() {
  const [connected, setConnected] = useState(false);

  // Local simulated drone state
  const [dronePos, setDronePos] = useState({ lat: 13.0827, lng: 80.2707 });
  const [altitude, setAltitude] = useState(35.4);
  const [heading, setHeading] = useState(182.5);
  const [battery, setBattery] = useState(100);
  const [flightPath, setFlightPath] = useState([[13.0827, 80.2707]]);

  // Flight mode: 'patrol' | 'manual' | 'rth'
  const [flightMode, setFlightMode] = useState('patrol');

  const waypointIdx = useRef(0);
  const manualTimeout = useRef(null);
  const dronePosRef = useRef(dronePos);
  dronePosRef.current = dronePos;

  const [incidentData, setIncidentData] = useState(null);
  const [liveTelemFromBackend, setLiveTelemFromBackend] = useState(null);

  // Backend WebSocket connection (optional)
  useEffect(() => {
    const socket = io(BACKEND_URL, { timeout: 3000 });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('telemetry', (data) => setLiveTelemFromBackend(data));
    socket.on('incident_alert', (data) => setIncidentData(data));
    socket.on('incident_resolved', () => setIncidentData(null));
    return () => socket.disconnect();
  }, []);

  // Drain battery slowly
  useEffect(() => {
    const t = setInterval(() => {
      setBattery(b => Math.max(0, parseFloat((b - 0.02).toFixed(2))));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // AUTO-PATROL / RTH: runs when flightMode is 'patrol' or 'rth'
  useEffect(() => {
    if (flightMode === 'manual') return;

    const interval = setInterval(() => {
      const pos = dronePosRef.current;

      // Pick target waypoint
      const target = flightMode === 'rth'
        ? HOME
        : WAYPOINTS[(waypointIdx.current + 1) % WAYPOINTS.length];

      const dlat = target[0] - pos.lat;
      const dlng = target[1] - pos.lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);

      if (dist < 0.0002) {
        if (flightMode === 'rth') {
          setFlightMode('patrol'); // arrived home, resume patrol
          return;
        }
        waypointIdx.current = (waypointIdx.current + 1) % WAYPOINTS.length;
        return;
      }

      const newLat = pos.lat + (dlat / dist) * SPEED;
      const newLng = pos.lng + (dlng / dist) * SPEED;
      const angle = Math.atan2(dlng, dlat) * (180 / Math.PI);

      setHeading(parseFloat(angle.toFixed(1)));
      setDronePos({ lat: newLat, lng: newLng });
      setFlightPath(prev => [...prev.slice(-100), [newLat, newLng]]);
    }, 200);

    return () => clearInterval(interval);
  }, [flightMode]);

  // MANUAL MOVE
  const handleMove = useCallback((dir) => {
    setFlightMode('manual');
    const step = 0.0004;
    setDronePos(prev => {
      let { lat, lng } = prev;
      if (dir === 'north') { lat += step; setHeading(0); }
      if (dir === 'south') { lat -= step; setHeading(180); }
      if (dir === 'east')  { lng += step; setHeading(90); }
      if (dir === 'west')  { lng -= step; setHeading(270); }
      setFlightPath(fp => [...fp.slice(-100), [lat, lng]]);
      return { lat, lng };
    });
    // Return to patrol after 5s of inactivity
    if (manualTimeout.current) clearTimeout(manualTimeout.current);
    manualTimeout.current = setTimeout(() => setFlightMode('patrol'), 5000);
  }, []);

  const handleAltChange = useCallback((dir) => {
    setAltitude(a => parseFloat((Math.max(5, a + (dir === 'up' ? 2 : -2))).toFixed(1)));
  }, []);

  const handleRTH = useCallback(() => {
    if (manualTimeout.current) clearTimeout(manualTimeout.current);
    setFlightMode('rth');
  }, []);

  const handleTriggerIncident = useCallback(() => {
    const pos = dronePosRef.current;
    const inc = {
      incident_id: `INC-MANUAL-${Date.now()}`,
      drone_id: 'UAV-01',
      hazard_type: 'fire',
      confidence: 0.934,
      latitude: pos.lat,
      longitude: pos.lng,
      local_siren_active: true,
      timestamp: Date.now(),
      status: 'active'
    };
    setIncidentData(inc);
    axios.post(`${BACKEND_URL}/api/incidents`, inc).catch(() => {});
  }, []);

  const handleClearIncident = useCallback(() => {
    setIncidentData(null);
    axios.post(`${BACKEND_URL}/api/incidents/resolve`).catch(() => {});
  }, []);

  // Build droneData — always use local sim in manual/rth mode
  const isLocalMode = flightMode !== 'patrol' || !liveTelemFromBackend;
  const droneData = isLocalMode ? {
    drone_id: 'UAV-01',
    latitude: dronePos.lat,
    longitude: dronePos.lng,
    altitude_m: altitude,
    heading_deg: heading,
    battery: battery.toFixed(1),
    rtk_fix: 'FIXED_3D'
  } : {
    ...liveTelemFromBackend,
    altitude_m: altitude,
    heading_deg: heading,
  };

  const modeLabel = flightMode === 'manual' ? '[ MANUAL ]'
    : flightMode === 'rth' ? '[ RETURN TO HOME ]' : '';
  const modeColor = flightMode === 'manual' ? 'var(--warning-color)' : 'var(--accent-color)';

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-title">
          <Activity size={22} />
          UAV-01 MISSION CONTROL
          {modeLabel && (
            <span style={{ fontSize: '0.75rem', color: modeColor, marginLeft: '0.5rem' }}>
              {modeLabel}
            </span>
          )}
        </div>
        <div className="header-status">
          <div className="status-badge">
            <div className={`status-dot ${connected ? 'active' : ''}`}></div>
            Backend: {connected ? 'Connected' : 'Offline'}
          </div>
          <div className="status-badge">
            <div className="status-dot active"></div>
            Simulation: Active
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        <VideoPanel incident={incidentData} />
        <LiveMap droneData={droneData} incidentData={incidentData} flightPath={flightPath} />

        <div className="side-section">
          <IncidentPanel incident={incidentData} />
          <DroneStatus droneData={droneData} />
          <DroneControls
            onMove={handleMove}
            onAltChange={handleAltChange}
            onRTH={handleRTH}
            onTriggerIncident={handleTriggerIncident}
            onClearIncident={handleClearIncident}
          />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
