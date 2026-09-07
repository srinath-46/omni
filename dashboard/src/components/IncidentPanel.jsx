import React from 'react';
import { AlertTriangle, MapPin, Radio, Bell, ShieldAlert } from 'lucide-react';

const IncidentPanel = ({ incident }) => {
  if (!incident) {
    return (
      <div className="panel">
        <div className="panel-header">Active Incidents</div>
        <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--success-color)' }}>
          No active incidents detected.
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">Active Incident</div>
      <div className="panel-content">
        <div className="incident-card">
          <div className="incident-header">
            <AlertTriangle size={24} />
            {incident.hazard_type.toUpperCase()} DETECTED
          </div>
          
          <div className="incident-details">
            <div className="data-row">
              <span className="data-label">Confidence:</span>
              <span className="data-value" style={{ color: 'var(--danger-color)' }}>{(incident.confidence * 100).toFixed(1)}%</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">Location:</span>
              <span className="data-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} />
                {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
              </span>
            </div>

            <div className="data-row">
              <span className="data-label">Status:</span>
              <span className="data-value" style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>CONFIRMED</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 1rem 1rem' }}>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Automated Actions Taken</h4>
          
          <div className="data-row">
            <span className="data-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={14} /> Local Siren & Strobe
            </span>
            <span className="data-value" style={{ color: incident.local_siren_active ? 'var(--success-color)' : 'var(--text-secondary)' }}>
              {incident.local_siren_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          
          <div className="data-row">
            <span className="data-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={14} /> Twilio SMS Dispatch
            </span>
            <span className="data-value" style={{ color: 'var(--success-color)' }}>
              SENT
            </span>
          </div>

          <div className="data-row">
            <span className="data-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={14} /> MQTT Notification
            </span>
            <span className="data-value" style={{ color: 'var(--success-color)' }}>
              PUBLISHED
            </span>
          </div>

          <button className="action-button danger">OVERRIDE / DISMISS ALARM</button>
        </div>
      </div>
    </div>
  );
};

export default IncidentPanel;
