import React from 'react';
import { Battery, Navigation, Compass, Signal, Crosshair, ArrowUpCircle } from 'lucide-react';

const DroneStatus = ({ droneData }) => {
  if (!droneData) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        UAV Telemetry
      </div>
      <div className="panel-content" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={24} color="var(--accent-color)" style={{ transform: `rotate(${droneData.heading_deg}deg)` }} />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{droneData.drone_id}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: IN FLIGHT</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: droneData.battery > 20 ? 'var(--success-color)' : 'var(--danger-color)' }}>
              <Battery size={16} /> {droneData.battery}%
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
              <ArrowUpCircle size={14} /> Altitude
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{droneData.altitude_m} m</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
              <Compass size={14} /> Heading
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{droneData.heading_deg}°</div>
          </div>
        </div>

        <div className="data-row">
          <span className="data-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crosshair size={14} /> GPS Fix
          </span>
          <span className="data-value" style={{ color: 'var(--success-color)' }}>
            {droneData.rtk_fix}
          </span>
        </div>
        
        <div className="data-row">
          <span className="data-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Signal size={14} /> MAVLink Signal
          </span>
          <span className="data-value" style={{ color: 'var(--success-color)' }}>
            98%
          </span>
        </div>

        <button className="action-button" style={{ marginTop: '1.5rem' }}>RETURN TO HOME</button>
      </div>
    </div>
  );
};

export default DroneStatus;
