import time

class TemporalGate:
    def __init__(self, required_frames=5, timeout_seconds=2.0):
        """
        Gate logic to require multiple consecutive detections before confirming an incident.
        :param required_frames: How many consecutive frames the hazard must be seen in.
        :param timeout_seconds: Reset counter if hazard not seen for this duration.
        """
        self.required_frames = required_frames
        self.timeout = timeout_seconds
        
        # Keep track of detection counts for each hazard type
        self.history = {}
        
    def add_detections(self, detections):
        """
        Update the gate with new detections from the current frame.
        :param detections: list of hazard dictionaries
        :return: List of CONFIRMED hazards
        """
        current_time = time.time()
        detected_types_in_frame = set()
        
        for d in detections:
            hazard_type = d['type']
            detected_types_in_frame.add(hazard_type)
            
            if hazard_type not in self.history:
                self.history[hazard_type] = {
                    'count': 1,
                    'last_seen': current_time,
                    'highest_conf': d['confidence']
                }
            else:
                # Check for timeout
                if current_time - self.history[hazard_type]['last_seen'] > self.timeout:
                    self.history[hazard_type]['count'] = 1
                else:
                    self.history[hazard_type]['count'] += 1
                    
                self.history[hazard_type]['last_seen'] = current_time
                self.history[hazard_type]['highest_conf'] = max(
                    self.history[hazard_type]['highest_conf'], 
                    d['confidence']
                )

        confirmed_hazards = []
        
        for h_type, data in list(self.history.items()):
            # If a previously tracked hazard isn't in this frame, check if it timed out
            if h_type not in detected_types_in_frame:
                if current_time - data['last_seen'] > self.timeout:
                    del self.history[h_type]
            else:
                # If it's in this frame and meets the required frame count, confirm it
                if data['count'] >= self.required_frames:
                    confirmed_hazards.append({
                        'type': h_type,
                        'confidence': data['highest_conf']
                    })
                    # Reset the count so we don't repeatedly trigger every single frame
                    data['count'] = 0 
                    
        return confirmed_hazards
