const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mock = require('./mockData');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// REST API
app.get('/api/incidents', (req, res) => {
  res.json(mock.getIncidents());
});

app.post('/api/incidents', (req, res) => {
  const incidentData = req.body;
  mock.injectIncident(incidentData);
  io.emit('incident_alert', incidentData);
  res.json({ success: true, message: "Incident accepted and broadcasted" });
});

app.post('/api/incidents/resolve', (req, res) => {
  mock.clearActiveIncident();
  io.emit('incident_resolved');
  res.json({ success: true });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    active_drones: 1,
    broker_connected: true
  });
});

// WebSockets (Simulating MQTT / MAVLink bridge)
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Start emitting telemetry loop
  const telemetryInterval = setInterval(() => {
    const telemetry = mock.updateTelemetry();
    socket.emit('telemetry', telemetry);

    const newIncident = mock.triggerRandomIncident();
    if (newIncident) {
      socket.emit('incident_alert', newIncident);
    }
  }, 1000); // 1Hz telemetry update

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    clearInterval(telemetryInterval);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`OmniSight simple backend running on port ${PORT}`);
});
