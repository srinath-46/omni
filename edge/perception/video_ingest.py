import cv2
import os
import urllib.request

class VideoIngest:
    def __init__(self, source=0):
        """
        Initialize video capture.
        If source=0 fails, automatically download and use a sample video.
        """
        self.source = source
        self.cap = cv2.VideoCapture(source, cv2.CAP_DSHOW)
        
        # If webcam fails, fallback to sample video
        if not self.cap.isOpened() and source == 0:
            print("Webcam failed. Falling back to sample video simulation...")
            sample_video_path = "sample_fire.mp4"
            if not os.path.exists(sample_video_path):
                print("Downloading sample video...")
                url = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                urllib.request.urlretrieve(url, sample_video_path)
            
            self.source = sample_video_path
            self.cap = cv2.VideoCapture(sample_video_path)
            
        if not self.cap.isOpened():
            print(f"Error: Could not open video source {self.source}")

    def get_frame(self):
        """
        Read the next frame from the video source.
        """
        if not self.cap.isOpened():
            return None
            
        ret, frame = self.cap.read()
        if not ret:
            # If using a video file, loop it continuously
            if isinstance(self.source, str):
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()
            else:
                return None
                
        return frame

    def release(self):
        self.cap.release()
