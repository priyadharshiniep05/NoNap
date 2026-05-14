import cv2
import numpy as np
from ultralytics import YOLO
import dlib
import os
from dataclasses import dataclass

@dataclass
class DetectionResult:
    bounding_box: list
    landmarks_68: list
    confidence: float
    eye_roi: np.ndarray
    mouth_roi: np.ndarray

class FaceDetector:
    def __init__(self):
        # Load YOLOv8 face model
        print("Loading YOLOv8s face model...")
        self.yolo = YOLO("yolov8n-face.pt")
        
        # Load dlib shape predictor
        predictor_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'shape_predictor_68_face_landmarks.dat')
        if not os.path.exists(predictor_path):
            raise RuntimeError(f"Shape predictor not found at {predictor_path}. Run setup.sh.")
        self.predictor = dlib.shape_predictor(predictor_path)

    def detect(self, frame: np.ndarray) -> list[DetectionResult]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        results = self.yolo(frame, verbose=False)
        
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                
                # Expand box slightly for dlib
                dlib_rect = dlib.rectangle(x1, y1, x2, y2)
                landmarks = self.predictor(gray, dlib_rect)
                landmarks_list = [(landmarks.part(n).x, landmarks.part(n).y) for n in range(68)]
                
                # Crop ROIs (simplified bounding boxes around eyes and mouth)
                try:
                    left_eye_pts = np.array(landmarks_list[36:42])
                    right_eye_pts = np.array(landmarks_list[42:48])
                    mouth_pts = np.array(landmarks_list[48:68])
                    
                    # Eyes combined bounding box
                    eyes_pts = np.vstack((left_eye_pts, right_eye_pts))
                    ex, ey, ew, eh = cv2.boundingRect(eyes_pts)
                    eye_roi = frame[max(0, ey-10):ey+eh+10, max(0, ex-10):ex+ew+10]
                    
                    mx, my, mw, mh = cv2.boundingRect(mouth_pts)
                    mouth_roi = frame[max(0, my-10):my+mh+10, max(0, mx-10):mx+mw+10]
                except Exception:
                    eye_roi = np.zeros((10,10,3), dtype=np.uint8)
                    mouth_roi = np.zeros((10,10,3), dtype=np.uint8)

                detections.append(DetectionResult(
                    bounding_box=[x1, y1, x2, y2],
                    landmarks_68=landmarks_list,
                    confidence=conf,
                    eye_roi=eye_roi,
                    mouth_roi=mouth_roi
                ))
        return detections
