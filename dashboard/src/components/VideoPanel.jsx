import React, { useState, useEffect, useRef } from 'react';

const HAZARD_TYPES = ['FIRE', 'SMOKE', 'SURVIVOR'];

// Simulated optical feed: glowing fire animation on canvas
const OpticalCanvas = ({ detectionBox, incidentType }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const draw = () => {
      frameRef.current++;
      const t = frameRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Dark aerial background
      ctx.fillStyle = '#0a1a0a';
      ctx.fillRect(0, 0, w, h);

      // Draw grid (aerial view)
      ctx.strokeStyle = 'rgba(50,100,50,0.3)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw fire flames
      const cx = 200, cy = 160;
      for (let i = 0; i < 12; i++) {
        const flameH = 30 + Math.sin(t * 0.1 + i) * 15;
        const flameX = cx - 30 + i * 5 + Math.sin(t * 0.08 + i) * 4;
        const grad = ctx.createLinearGradient(flameX, cy, flameX, cy - flameH);
        grad.addColorStop(0, 'rgba(255,50,0,0.9)');
        grad.addColorStop(0.5, 'rgba(255,150,0,0.7)');
        grad.addColorStop(1, 'rgba(255,255,0,0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(flameX, cy - flameH / 2, 4 + Math.random() * 2, flameH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Smoke
      ctx.fillStyle = `rgba(80,80,80,${0.3 + Math.sin(t * 0.05) * 0.1})`;
      ctx.beginPath();
      ctx.arc(cx + Math.sin(t * 0.03) * 10, cy - 60, 28 + Math.sin(t * 0.07) * 5, 0, Math.PI * 2);
      ctx.fill();

      // Detection bounding box
      if (detectionBox) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.strokeRect(cx - 45, cy - 80, 90, 100);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`${incidentType || 'FIRE'} ${(93 + Math.sin(t * 0.1)).toFixed(1)}%`, cx - 43, cy - 84);
      }

      // Timestamp
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '10px monospace';
      ctx.fillText(`REC ● ${new Date().toLocaleTimeString()}`, 10, h - 10);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [detectionBox, incidentType]);

  return <canvas ref={canvasRef} width={420} height={280} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

// Thermal canvas: heat signature view
const ThermalCanvas = () => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const draw = () => {
      frameRef.current++;
      const t = frameRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#000510';
      ctx.fillRect(0, 0, w, h);

      // Hot spots (fire = white/yellow)
      const spots = [
        { x: 200, y: 155, r: 40, color: 'rgba(255,255,200,0.9)' },
        { x: 210, y: 150, r: 25, color: 'rgba(255,200,100,0.8)' },
      ];
      spots.forEach(s => {
        const grad = ctx.createRadialGradient(s.x + Math.sin(t * 0.05) * 3, s.y, 0, s.x, s.y, s.r + Math.sin(t * 0.07) * 5);
        grad.addColorStop(0, s.color);
        grad.addColorStop(0.5, 'rgba(200,50,0,0.5)');
        grad.addColorStop(1, 'rgba(0,0,50,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + 10, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cool area (teal/blue)
      const grad2 = ctx.createRadialGradient(100, 80, 0, 100, 80, 60);
      grad2.addColorStop(0, 'rgba(0,100,180,0.3)');
      grad2.addColorStop(1, 'rgba(0,0,50,0)');
      ctx.fillStyle = grad2;
      ctx.beginPath(); ctx.arc(100, 80, 60, 0, Math.PI * 2); ctx.fill();

      // Thermal label overlay
      ctx.fillStyle = 'rgba(0,255,255,0.7)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('IR THERMAL | FLIR SYS', 10, 20);
      ctx.fillStyle = 'rgba(255,255,0,0.6)';
      ctx.fillText(`TEMP MAX: ${(680 + Math.sin(t * 0.08) * 30).toFixed(0)}°C`, 10, 35);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width={420} height={280} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

const VideoPanel = ({ incident }) => {
  const [detectionVisible, setDetectionVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setDetectionVisible(v => !v);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel video-section">
      <div className="panel-header">
        Live Drone Video Feeds
      </div>
      <div className="panel-content video-grid">
        <div className="video-container">
          <div className="video-overlay">Optical / 4K</div>
          <OpticalCanvas detectionBox={detectionVisible} incidentType={incident?.hazard_type?.toUpperCase() || 'FIRE'} />
        </div>
        <div className="video-container">
          <div className="video-overlay">Thermal / IR</div>
          <ThermalCanvas />
        </div>
      </div>
    </div>
  );
};

export default VideoPanel;
