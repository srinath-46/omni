import React, { useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import './DroneControls.css';

const DroneControls = ({ onMove, onAltChange, onRTH, onTriggerIncident, onClearIncident }) => {
  const pressedKeys = useRef(new Set());

  // Keyboard control support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (pressedKeys.current.has(e.key)) return;
      pressedKeys.current.add(e.key);
      switch (e.key) {
        case 'ArrowUp':    case 'w': onMove('north'); break;
        case 'ArrowDown':  case 's': onMove('south'); break;
        case 'ArrowLeft':  case 'a': onMove('west');  break;
        case 'ArrowRight': case 'd': onMove('east');  break;
        case 'q': onAltChange('up');   break;
        case 'e': onAltChange('down'); break;
      }
    };
    const handleKeyUp = (e) => pressedKeys.current.delete(e.key);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onMove, onAltChange]);

  return (
    <div className="panel drone-controls-panel">
      <div className="panel-header"><Zap size={14} /> Manual Flight Control</div>
      <div className="panel-content" style={{ padding: '1rem' }}>
        
        {/* Keyboard hint */}
        <div className="kbd-hint">⌨️ WASD / Arrow Keys to fly · Q/E for altitude</div>

        {/* D-Pad */}
        <div className="dpad-wrapper">
          <div className="dpad">
            <button className="dpad-btn top"    onMouseDown={() => onMove('north')}><ArrowUp size={18}/></button>
            <button className="dpad-btn left"   onMouseDown={() => onMove('west')}><ArrowLeft size={18}/></button>
            <div    className="dpad-center">▣</div>
            <button className="dpad-btn right"  onMouseDown={() => onMove('east')}><ArrowRight size={18}/></button>
            <button className="dpad-btn bottom" onMouseDown={() => onMove('south')}><ArrowDown size={18}/></button>
          </div>

          {/* Altitude column */}
          <div className="alt-col">
            <button className="alt-btn" onMouseDown={() => onAltChange('up')}>
              <ChevronUp size={18}/><span>ALT +</span>
            </button>
            <div className="alt-label">ALT</div>
            <button className="alt-btn" onMouseDown={() => onAltChange('down')}>
              <ChevronDown size={18}/><span>ALT -</span>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="ctrl-actions">
          <button className="ctrl-btn rth" onClick={onRTH}>
            <Home size={14} /> RTH
          </button>
          <button className="ctrl-btn fire" onClick={onTriggerIncident}>
            🔥 TRIGGER ALARM
          </button>
          <button className="ctrl-btn clear" onClick={onClearIncident}>
            ✓ CLEAR
          </button>
        </div>

      </div>
    </div>
  );
};

export default DroneControls;
