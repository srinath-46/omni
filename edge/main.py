import cv2
import time
from perception.video_ingest import VideoIngest
from ai.detector import Detector
from ai.temporal_gate import TemporalGate
from incidents.dispatcher import Dispatcher

def main():
    print("Starting OmniSight Simulated Edge AI...")
    
    # 1. Initialize Video (0 = webcam)
    print("Connecting to camera...")
    camera = VideoIngest(source=0)
    
    # 2. Initialize AI
    detector = Detector(model_path='yolov8n.pt', confidence_threshold=0.60)
    
    # 3. Initialize Temporal Gate (requires 5 consecutive frames)
    gate = TemporalGate(required_frames=5, timeout_seconds=2.0)
    
    # 4. Initialize Dispatcher
    dispatcher = Dispatcher()
    
    print("\n--- SYSTEM ONLINE ---")
    print("Hold up a cell phone (simulates FIRE) or a bottle (simulates SMOKE) to the camera!")
    print("Press 'q' to quit.\n")
    
    try:
        while True:
            # Capture frame
            frame = camera.get_frame()
            if frame is None:
                print("End of video stream.")
                break
                
            # Run inference
            hazards = detector.process_frame(frame)
            
            # Draw bounding boxes for visual debugging
            for h in hazards:
                box = h['box']
                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, f"{h['type'].upper()} {h['confidence']:.2f}", 
                            (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                
            # Pass to temporal gate
            confirmed = gate.add_detections(hazards)
            
            # Dispatch confirmed incidents
            for c in confirmed:
                dispatcher.dispatch_incident(c)
                # Show huge alert on the video feed
                cv2.putText(frame, f"ALARM: {c['type'].upper()} CONFIRMED!", 
                            (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
            
            # Display the video feed
            cv2.imshow("OmniSight Edge AI Simulation", frame)
            
            # Quit on 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    except KeyboardInterrupt:
        print("Interrupted by user.")
    finally:
        camera.release()
        cv2.destroyAllWindows()
        print("System shut down safely.")

if __name__ == "__main__":
    main()
