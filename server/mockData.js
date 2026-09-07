// Simulate drone flight path around Chennai
const BASE_LAT = 13.082715;
const BASE_LNG = 80.270718;

let currentLat = BASE_LAT;
let currentLng = BASE_LNG;
let currentAlt = 35.4;
let currentHeading = 182.5;
let battery = 100;

// Incident DB
const incidents = [
  {
    incident_id: "INC-HIST-001",
    drone_id: "UAV-01",
    hazard_type: "smoke",
    confidence: 0.88,
    latitude: 13.083015,
    longitude: 80.271018,
    local_siren_active: false,
    timestamp: Date.now() - 86400000,
    status: "resolved"
  },
  {
    incident_id: "INC-HIST-002",
    drone_id: "UAV-02",
    hazard_type: "collapse",
    confidence: 0.95,
    latitude: 13.081500,
    longitude: 80.269000,
    local_siren_active: false,
    timestamp: Date.now() - 172800000,
    status: "resolved"
  }
];

let activeIncident = null;

const updateTelemetry = () => {
  // Simulate movement
  currentLat += (Math.random() - 0.5) * 0.0001;
  currentLng += (Math.random() - 0.5) * 0.0001;
  currentAlt += (Math.random() - 0.5) * 0.5;
  currentHeading = (currentHeading + (Math.random() - 0.5) * 5) % 360;
  
  // Drain battery
  battery = Math.max(0, battery - 0.01);

  return {
    drone_id: "UAV-01",
    latitude: currentLat,
    longitude: currentLng,
    altitude_m: currentAlt.toFixed(1),
    heading_deg: currentHeading.toFixed(1),
    battery: battery.toFixed(1),
    rtk_fix: "FIXED_3D"
  };
};

const triggerRandomIncident = () => {
  if (activeIncident) return activeIncident;

  // 5% chance every tick to detect something if no active incident
  if (Math.random() > 0.95) {
    const types = ["fire", "smoke", "accident", "survivor"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    activeIncident = {
      incident_id: `INC-${Math.floor(Math.random() * 1000)}`,
      drone_id: "UAV-01",
      hazard_type: type,
      confidence: (0.75 + Math.random() * 0.24).toFixed(3),
      latitude: currentLat,
      longitude: currentLng,
      local_siren_active: true,
      timestamp: Date.now(),
      status: "active"
    };
    
    incidents.unshift(activeIncident);
    return activeIncident;
  }
  return null;
};

const clearActiveIncident = () => {
  if (activeIncident) {
    activeIncident.status = "resolved";
    activeIncident.local_siren_active = false;
    activeIncident = null;
  }
};

const getIncidents = () => incidents;

const injectIncident = (incidentData) => {
  activeIncident = incidentData;
  incidents.unshift(activeIncident);
  return activeIncident;
};

module.exports = {
  updateTelemetry,
  triggerRandomIncident,
  clearActiveIncident,
  getIncidents,
  injectIncident
};
