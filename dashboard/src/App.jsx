import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Activity, LayoutDashboard, History } from 'lucide-react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-shell">
        {/* Global Navigation */}
        <nav className="global-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <Activity color="var(--accent-color)" size={22} />
            OMNISIGHT
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { to: '/', label: 'Home', icon: null },
              { to: '/dashboard', label: 'Command Center', icon: <LayoutDashboard size={16} /> },
              { to: '/incidents', label: 'Incident Log', icon: <History size={16} /> },
            ].map(({ to, label, icon }) => (
              <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
                transition: 'color 0.15s',
              })}>
                {icon}{label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Page Content */}
        <div className="app-page">
          <Routes>
            <Route path="/"          element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
