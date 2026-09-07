import requests
import time

import os

class Dispatcher:
    def __init__(self, backend_url=None):
        self.backend_url = backend_url or os.environ.get("BACKEND_URL", "http://localhost:3001")
        print(f"Initialized Dispatcher pointing to {backend_url}")

    def dispatch_incident(self, hazard):
        """
        Sends the confirmed incident to the Command Center backend.
        We will simulate the MQTT publish by making a REST API call to a specific endpoint,
        or we can just print it for simulation if the backend doesn't have a POST endpoint yet.
        (Since our backend generates random incidents right now, we could just log it here 
        or you could add a POST endpoint to your backend to accept real drone data).
        """
        incident_data = {
            "incident_id": f"INC-SIM-{int(time.time())}",
            "drone_id": "UAV-SIM-01",
            "hazard_type": hazard['type'],
            "confidence": hazard['confidence'],
            "latitude": 13.082715,
            "longitude": 80.270718,
            "local_siren_active": True,
            "timestamp": time.time(),
            "status": "active"
        }
        
        print(f"\n[DISPATCHER] 🚨 CRITICAL ALERT! 🚨")
        print(f"Dispatching confirmed {hazard['type'].upper()} to Command Center!")
        print(f"Data: {incident_data}\n")
        
        try:
            response = requests.post(f"{self.backend_url}/api/incidents", json=incident_data, timeout=2)
            if response.status_code == 200:
                print(f"[DISPATCHER] ✅ Successfully dispatched to Command Center!")
            else:
                print(f"[DISPATCHER] ⚠️ Failed to dispatch. Status Code: {response.status_code}")
        except Exception as e:
            print(f"[DISPATCHER] ❌ Connection error to Command Center: {e}")
        
        return incident_data
