import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BACKEND_URL from '../config';
import { MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/incidents`);
      setIncidents(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolveIncident = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/incidents/resolve`);
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading incidents...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Incident Log</h2>
        <button className="action-button" style={{ width: 'auto' }} onClick={fetchIncidents}>Refresh</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {incidents.map((inc) => (
          <div key={inc.incident_id} className={`panel ${inc.status === 'active' ? 'incident-card' : ''}`} style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, animation: inc.status === 'active' ? 'pulse-border 2s infinite' : 'none', border: inc.status === 'active' ? '1px solid var(--danger-color)' : '1px solid var(--border-color)' }}>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ padding: '1rem', backgroundColor: inc.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                {inc.status === 'active' ? <AlertTriangle size={32} color="var(--danger-color)" /> : <CheckCircle size={32} color="var(--success-color)" />}
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {inc.hazard_type.toUpperCase()} 
                  <span style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', borderRadius: '1rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                    {(inc.confidence * 100).toFixed(1)}% Conf
                  </span>
                </h3>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {new Date(inc.timestamp).toLocaleString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {inc.latitude.toFixed(6)}, {inc.longitude.toFixed(6)}</span>
                  <span>Drone: {inc.drone_id}</span>
                </div>
              </div>
            </div>

            <div>
              {inc.status === 'active' ? (
                <button className="action-button danger" style={{ width: 'auto' }} onClick={resolveIncident}>
                  RESOLVE INCIDENT
                </button>
              ) : (
                <div style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>RESOLVED</div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Incidents;
