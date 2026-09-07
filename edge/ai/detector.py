from ultralytics import YOLO

class Detector:
    def __init__(self, model_path='yolov8n.pt', confidence_threshold=0.65):
        """
        Initialize the YOLOv8 model for simulation.
        In production, this would load a TensorRT engine.
        """
        print(f"Loading model {model_path}...")
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold
        
        # Mapping COCO classes to our hazard classes for simulation purposes
        # Since standard YOLOv8n is trained on COCO, we'll pretend certain objects are hazards
        # For a real disaster drone, a custom trained model would be used.
        # Let's map 'cell phone' (class 67) or 'bottle' (class 39) as a 'fire' for easy webcam testing.
        self.hazard_mapping = {
            67: 'fire',      # Cell phone -> fire
            39: 'smoke',     # Bottle -> smoke
            0: 'survivor'    # Person -> survivor
        }

    def process_frame(self, frame):
        """
        Run inference on the frame.
        :param frame: OpenCV image
        :return: list of detected hazards (dictionaries)
        """
        results = self.model(frame, verbose=False)[0]
        
        hazards = []
        for box in results.boxes:
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            
            if conf >= self.confidence_threshold:
                if cls_id in self.hazard_mapping:
                    hazard = {
                        'type': self.hazard_mapping[cls_id],
                        'confidence': conf,
                        'box': box.xyxy[0].tolist() # [x1, y1, x2, y2]
                    }
                    hazards.append(hazard)
                    
        return hazards
