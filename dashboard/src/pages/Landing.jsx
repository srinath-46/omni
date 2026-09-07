import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Radio, Database, Eye, Cpu, MapPin, Bell, CheckCircle, AlertTriangle, Wifi, Server, Camera, Flame } from 'lucide-react';
import './Landing.css';

/* ── Particle canvas background ── */
const ParticleCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
        if (pts[i].x < 0 || pts[i].x > w) pts[i].vx *= -1;
        if (pts[i].y < 0 || pts[i].y > h) pts[i].vy *= -1;
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59,130,246,0.45)'; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.12 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(() => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="particle-canvas" />;
};

/* ── Scroll-triggered counter ── */
const Counter = ({ to, suffix = '', duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      const start = performance.now();
      const tick = (now) => { const p = Math.min((now - start) / duration, 1); setVal(Math.floor(p * to)); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(ref.current); return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── Use section ── */
const useVisible = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ────────── LIVE SYSTEM STATUS WIDGET ────────── */
const SystemStatus = () => {
  const [items, setItems] = useState([
    { label: 'Edge AI Engine',     status: 'online',  value: 'YOLOv8n · TRT INT8' },
    { label: 'MQTT Broker',        status: 'online',  value: 'Mosquitto · QoS 1' },
    { label: 'MAVLink Bridge',     status: 'online',  value: '921600 bps' },
    { label: 'Twilio SMS Gateway', status: 'standby', value: 'Armed · Ready' },
    { label: 'SQLite Cache',       status: 'online',  value: 'SQLCipher · Encrypted' },
    { label: 'WebRTC Stream',      status: 'online',  value: 'H.264 · 1080p' },
  ]);
  return (
    <div className="sys-status-grid">
      {items.map(({ label, status, value }) => (
        <div key={label} className={`sys-item sys-${status}`}>
          <div className="sys-dot" />
          <div>
            <div className="sys-label">{label}</div>
            <div className="sys-value">{value}</div>
          </div>
          <div className="sys-badge">{status.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
};

/* ────────── INCIDENT LIFECYCLE ────────── */
const LIFECYCLE = [
  { step: '01', title: 'Dual Camera Capture', desc: 'Synchronized 4K optical + FLIR thermal frames at 30fps via GStreamer pipeline', icon: Camera, color: '#60a5fa' },
  { step: '02', title: 'YOLOv8 Detection',    desc: 'TensorRT INT8 inference detects fire, smoke, collapse, accident & survivor classes at ≥0.65 confidence', icon: Eye, color: '#a78bfa' },
  { step: '03', title: 'Temporal Gate (×5)',  desc: 'Hazard must persist over 5 consecutive frames with IoU check — eliminates all false positives', icon: Shield, color: '#f59e0b' },
  { step: '04', title: 'RTK Geolocation',     desc: 'MAVLink pulls centimeter-accurate RTK GPS fix, altitude, heading from Pixhawk flight controller', icon: MapPin, color: '#10b981' },
  { step: '05', title: 'Incident Created',    desc: 'JSON incident object created with drone ID, hazard type, confidence, coordinates and timestamp', icon: Cpu, color: '#ef4444' },
  { step: '06', title: 'Multi-Channel Alert', desc: 'GPIO siren/strobe fires instantly on-drone. MQTT broadcasts event. Twilio SMS sent to responders', icon: Bell, color: '#f97316' },
];

/* ────────── DISASTER SCENARIOS ────────── */
const SCENARIOS = [
  {
    icon: '🔥', title: 'Wildfire Detection',
    tags: ['Fire Class', 'Smoke Class', 'Thermal'],
    desc: 'Thermal + optical fusion detects nascent fires before they spread. Drone autonomously circles the perimeter and reports GPS-tagged fire boundary.',
    accent: '#ef4444',
  },
  {
    icon: '🏗️', title: 'Structure Collapse',
    tags: ['Collapse Class', 'Survivor Class', 'Search & Rescue'],
    desc: 'Post-earthquake rubble surveyed autonomously. YOLOv8 flags survivors in debris using both IR heat signatures and optical visual cues.',
    accent: '#f59e0b',
  },
  {
    icon: '🚗', title: 'Road Accident Response',
    tags: ['Accident Class', 'GPS Dispatch', 'SMS Alert'],
    desc: 'Traffic accidents on highways detected from altitude. Exact coordinates dispatched to emergency services via Twilio within 3 seconds.',
    accent: '#3b82f6',
  },
  {
    icon: '🌊', title: 'Flood Monitoring',
    tags: ['Area Survey', 'Waypoint Patrol', 'RTH Failsafe'],
    desc: 'Autonomous grid-pattern patrol over flood zones. RTK positioning maps the extent of inundation. Battery <20% triggers automatic RTH.',
    accent: '#06b6d4',
  },
];

/* ────────── TECH STACK ────────── */
const STACK = [
  { name: 'YOLOv8-nano',   role: 'AI Detection',       bg: '#7c3aed' },
  { name: 'TensorRT INT8', role: 'GPU Acceleration',    bg: '#16a34a' },
  { name: 'NVIDIA Jetson', role: 'Edge Computing',      bg: '#15803d' },
  { name: 'MAVLink',       role: 'Flight Protocol',     bg: '#b45309' },
  { name: 'ArduPilot',     role: 'Autopilot',           bg: '#dc2626' },
  { name: 'Mosquitto',     role: 'MQTT Broker',         bg: '#0369a1' },
  { name: 'Twilio',        role: 'Emergency SMS',       bg: '#c2410c' },
  { name: 'React 18',      role: 'Command Dashboard',   bg: '#0284c7' },
  { name: 'Leaflet',       role: 'Live Geospatial Map', bg: '#15803d' },
  { name: 'WebRTC/H.264',  role: 'Video Streaming',     bg: '#7c3aed' },
  { name: 'SQLCipher',     role: 'Encrypted Cache',     bg: '#374151' },
  { name: 'Socket.io',     role: 'Real-time Events',    bg: '#111827' },
];

/* ────────── DRONE SVG ────────── */
const DroneSVG = () => (
  <svg className="drone-svg" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Arms */}
    {[[100,100,45,55],[140,100,195,55],[100,140,45,185],[140,140,195,185]].map(([x1,y1,x2,y2],i)=>(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round"/>
    ))}
    {/* Motor mounts */}
    {[[45,55],[195,55],[45,185],[195,185]].map(([cx,cy],i)=>(
      <g key={i}>
        <circle cx={cx} cy={cy} r="18" fill="#0f2744" stroke="#3b82f6" strokeWidth="2"/>
        <circle cx={cx} cy={cy} r="6" fill="#60a5fa"/>
        {/* Propeller */}
        <g className={`prop prop-${i}`} style={{transformOrigin:`${cx}px ${cy}px`}}>
          <ellipse cx={cx} cy={cy-18} rx="3" ry="15" fill="#3b82f6" opacity="0.7" transform={`rotate(${i*45})`}/>
          <ellipse cx={cx} cy={cy-18} rx="3" ry="15" fill="#93c5fd" opacity="0.5" transform={`rotate(${i*45+90})`}/>
        </g>
      </g>
    ))}
    {/* Body */}
    <rect x="95" y="95" width="50" height="50" rx="10" fill="#0f2744" stroke="#3b82f6" strokeWidth="2.5"/>
    {/* PCB lines */}
    <line x1="105" y1="108" x2="135" y2="108" stroke="#1d4ed8" strokeWidth="1" opacity="0.6"/>
    <line x1="105" y1="120" x2="135" y2="120" stroke="#1d4ed8" strokeWidth="1" opacity="0.6"/>
    <line x1="105" y1="132" x2="135" y2="132" stroke="#1d4ed8" strokeWidth="1" opacity="0.6"/>
    {/* CPU */}
    <rect x="108" y="111" width="24" height="18" rx="3" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1"/>
    <text x="120" y="123" textAnchor="middle" fontSize="6" fill="#60a5fa" fontFamily="monospace">JETSON</text>
    {/* Camera gimbal */}
    <circle cx="120" cy="148" r="9" fill="#0c1a3a" stroke="#60a5fa" strokeWidth="1.5"/>
    <circle cx="120" cy="148" r="4" fill="#60a5fa" opacity="0.8"/>
    <circle cx="120" cy="148" r="2" fill="white" opacity="0.6"/>
    {/* LED blink */}
    <circle cx="120" cy="96" r="3.5" fill="#ef4444" className="led-blink"/>
    {/* GPS antenna */}
    <line x1="120" y1="95" x2="120" y2="82" stroke="#10b981" strokeWidth="1.5"/>
    <circle cx="120" cy="80" r="4" fill="#10b981" opacity="0.7"/>
    {/* Signal lines from GPS */}
    {[-12,-6,0,6,12].map((dx,i)=>(
      <line key={i} x1="120" y1="80" x2={120+dx*2} y2="68" stroke="#10b981" strokeWidth="0.8" opacity={0.3+i*0.1}/>
    ))}
  </svg>
);

/* ══════════════════════════════ LANDING ══════════════════════════════ */
const Landing = () => {
  const [statsRef, statsVisible] = useVisible(0.3);
  const [lcRef, lcVisible]       = useVisible(0.1);
  const [scRef, scVisible]       = useVisible(0.1);
  const [stRef, stVisible]       = useVisible(0.1);
  const [ssRef, ssVisible]       = useVisible(0.1);

  return (
    <div className="landing-page">

      {/* ══ HERO ══ */}
      <section className="hero">
        <ParticleCanvas />

        <div className="hero-content">
          <div className="hero-badge"><span className="badge-dot"/>AI SIMULATION ACTIVE · JETSON NANO</div>
          <h1>Omni<span className="gradient-text">Sight</span></h1>
          <p className="hero-sub">
            AI-Powered Autonomous Drone for<br/>
            <strong>24/7 Disaster Monitoring &amp; Emergency Response</strong>
          </p>
          <p className="hero-desc">
            Detects fires, survivors, and accidents in real-time using YOLOv8-nano + TensorRT INT8 on a Jetson Nano — confirming hazards over 5 frames before dispatching GPS-tagged alerts via MQTT and Twilio to emergency responders.
          </p>
          <div className="hero-ctas">
            <Link to="/dashboard" className="btn-primary">Launch Command Center <ArrowRight size={18}/></Link>
            <Link to="/incidents" className="btn-secondary">Incident History</Link>
          </div>
          <div className="hero-tags">
            {['YOLOv8', 'TensorRT INT8', 'MAVLink', 'MQTT', 'RTK GPS', 'Twilio', 'WebRTC'].map(t=>(
              <span key={t} className="hero-tag">{t}</span>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/>
          <DroneSVG/>
          <div className="drone-data-chips">
            <div className="chip chip-green">🛰 RTK: FIXED_3D · ±2cm</div>
            <div className="chip chip-blue">📡 MQTT: Connected · QoS 1</div>
            <div className="chip chip-yellow">🔋 Battery: 82% · ~18 min</div>
          </div>
          {/* Live detection overlay box */}
          <div className="detection-overlay">
            <div className="det-header"><span className="det-dot"/>LIVE DETECTION</div>
            <div className="det-row"><span>Class</span><span className="det-val fire">FIRE</span></div>
            <div className="det-row"><span>Conf</span><span className="det-val">93.4%</span></div>
            <div className="det-row"><span>Gate</span><span className="det-val success">5/5 ✓</span></div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="stats-bar" ref={statsRef}>
        {[
          { val:96, suffix:'%',    label:'Detection Accuracy',      icon:'🎯' },
          { val:5,  suffix:' frames', label:'Temporal Gate Threshold', icon:'🔒' },
          { val:3,  suffix:'s',    label:'Alert Latency',           icon:'⚡' },
          { val:5,  suffix:'',     label:'Hazard Classes',          icon:'🔍' },
        ].map(({ val, suffix, label, icon }) => (
          <div key={label} className="stat-item">
            <div className="stat-icon">{icon}</div>
            <div className="stat-num">{statsVisible ? <Counter to={val} suffix={suffix}/> : `0${suffix}`}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </section>

      {/* ══ INCIDENT LIFECYCLE ══ */}
      <section className="lifecycle-section" ref={lcRef}>
        <div className={`section-head ${lcVisible ? 'fade-up visible' : 'fade-up'}`}>
          <h2>Incident Detection Lifecycle</h2>
          <p className="section-sub">Capture → Detect → Confirm → Locate → Alert → Communicate · End-to-end in under 3 seconds</p>
        </div>
        <div className="lifecycle-grid">
          {LIFECYCLE.map(({ step, title, desc, icon: Icon, color }, i) => (
            <div key={step} className={`lc-card ${lcVisible ? 'fade-up visible' : 'fade-up'}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="lc-step-num" style={{ color, borderColor: color }}>{step}</div>
              <div className="lc-icon" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={22} color={color}/>
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              {i < LIFECYCLE.length - 1 && <div className="lc-arrow" style={{ color }}>↓</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ══ DISASTER SCENARIOS ══ */}
      <section className="scenarios-section" ref={scRef}>
        <div className={`section-head ${scVisible ? 'fade-up visible' : 'fade-up'}`}>
          <h2>Disaster Scenarios</h2>
          <p className="section-sub">OmniSight autonomously responds to four critical hazard types</p>
        </div>
        <div className="scenarios-grid">
          {SCENARIOS.map(({ icon, title, tags, desc, accent }, i) => (
            <div key={title} className={`scenario-card ${scVisible ? 'fade-up visible' : 'fade-up'}`}
              style={{ animationDelay: `${i * 0.12}s`, '--accent': accent }}>
              <div className="sc-icon">{icon}</div>
              <h3>{title}</h3>
              <div className="sc-tags">
                {tags.map(t => <span key={t} className="sc-tag" style={{ borderColor: accent, color: accent }}>{t}</span>)}
              </div>
              <p>{desc}</p>
              <div className="sc-glow" style={{ background: `radial-gradient(ellipse at 50% 120%, ${accent}25 0%, transparent 65%)` }}/>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SYSTEM STATUS ══ */}
      <section className="status-section" ref={ssRef}>
        <div className={`section-head ${ssVisible ? 'fade-up visible' : 'fade-up'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <Wifi size={22} color="#10b981"/>
            <h2 style={{ marginBottom: 0 }}>Live System Status</h2>
            <span className="sys-live-badge">PROTOTYPE ONLINE</span>
          </div>
          <p className="section-sub">All OmniSight software modules are active in simulation mode</p>
        </div>
        <div className={ssVisible ? 'fade-up visible' : 'fade-up'}>
          <SystemStatus/>
        </div>
      </section>

      {/* ══ TECH STACK ══ */}
      <section className="stack-section" ref={stRef}>
        <div className={`section-head ${stVisible ? 'fade-up visible' : 'fade-up'}`}>
          <h2>Technology Stack</h2>
          <p className="section-sub">Every component specified in the OmniSight system architecture</p>
        </div>
        <div className={`stack-grid ${stVisible ? 'fade-up visible' : 'fade-up'}`}>
          {STACK.map(({ name, role, bg }) => (
            <div key={name} className="stack-chip" style={{ '--chip-bg': bg }}>
              <div className="chip-dot" style={{ background: bg }}/>
              <div>
                <div className="chip-name">{name}</div>
                <div className="chip-role">{role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta-section">
        <div className="cta-box fade-up visible">
          <div className="cta-icon">🚁</div>
          <h2>Explore the Live Simulation</h2>
          <p>Open the Command Center to fly the drone, watch the AI detect hazards in real-time, manage incidents, and see the complete telemetry dashboard.</p>
          <Link to="/dashboard" className="btn-primary large">Open Command Center <ArrowRight size={20}/></Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
