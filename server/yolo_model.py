"""
YOLOv8 Traffic Analysis Model
Real-time traffic incident detection using YOLOv8
"""

import cv2
import numpy as np
from ultralytics import YOLO
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class TrafficYOLOModel:
    def __init__(self, model_path='yolov8n.pt', confidence_threshold=0.5):
        """Initialize YOLO model for traffic analysis"""
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.device = 'cpu'  # Default to CPU
        
        # Traffic-related class mappings
        self.traffic_classes = {
            0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 4: 'airplane',
            5: 'bus', 6: 'train', 7: 'truck', 8: 'boat', 9: 'traffic_light',
            10: 'fire_hydrant', 11: 'stop_sign', 12: 'parking_meter', 13: 'bench',
            14: 'bird', 15: 'cat', 16: 'dog', 17: 'horse', 18: 'sheep', 19: 'cow'
        }
        
        self.incident_keywords = {
            'car_accident': ['car', 'truck', 'bus', 'motorcycle'],
            'traffic_jam': ['car', 'truck', 'bus'],
            'blocked_road': ['truck', 'bus'],
            'emergency_vehicle': ['truck', 'bus']  # Emergency vehicles often detected as trucks
        }
        
        self.load_model()
    
    def load_model(self):
        """Load YOLOv8 model"""
        try:
            logger.info(f"Loading YOLO model: {self.model_path}")
            self.model = YOLO(self.model_path)
            
            # Try to use GPU if available
            try:
                import torch
                if torch.cuda.is_available():
                    self.device = 'cuda'
                    logger.info("Using GPU for inference")
                else:
                    self.device = 'cpu'
                    logger.info("Using CPU for inference")
            except ImportError:
                self.device = 'cpu'
                logger.info("PyTorch not available, using CPU")
                
            logger.info("YOLO model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise
    
    def detect_objects(self, frame):
        """Detect objects in a single frame"""
        try:
            results = self.model(frame, conf=self.confidence_threshold, device=self.device)
            detections = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        if class_id in self.traffic_classes:
                            detections.append({
                                'bbox': [float(x1), float(y1), float(x2), float(y2)],
                                'confidence': float(confidence),
                                'class_id': class_id,
                                'class': self.traffic_classes[class_id]
                            })
            
            return detections
            
        except Exception as e:
            logger.error(f"Detection error: {e}")
            return []
    
    def analyze_for_incidents(self, detections, frame_time):
        """Analyze detections for traffic incidents"""
        incidents = []
        
        # Count vehicles
        vehicles = [d for d in detections if d['class'] in ['car', 'truck', 'bus', 'motorcycle']]
        
        # Traffic jam detection (multiple vehicles with high confidence)
        if len(vehicles) >= 3:
            avg_confidence = sum(v['confidence'] for v in vehicles) / len(vehicles)
            if avg_confidence > 0.6:
                incidents.append({
                    'type': 'traffic_jam',
                    'confidence': avg_confidence,
                    'description': f'Heavy traffic detected: {len(vehicles)} vehicles',
                    'timestamp': frame_time,
                    'bbox': self.get_combined_bbox(vehicles)
                })
        
        # Potential accident detection (overlapping vehicles or unusual positioning)
        for i, vehicle1 in enumerate(vehicles):
            for vehicle2 in vehicles[i+1:]:
                if self.boxes_overlap(vehicle1['bbox'], vehicle2['bbox']):
                    confidence = (vehicle1['confidence'] + vehicle2['confidence']) / 2
                    incidents.append({
                        'type': 'car_accident',
                        'confidence': confidence,
                        'description': f'Potential collision between {vehicle1["class"]} and {vehicle2["class"]}',
                        'timestamp': frame_time,
                        'bbox': self.get_combined_bbox([vehicle1, vehicle2])
                    })
                    break
        
        # Emergency vehicle detection (large trucks/buses with high confidence)
        emergency_vehicles = [v for v in vehicles if v['class'] in ['truck', 'bus'] and v['confidence'] > 0.8]
        for vehicle in emergency_vehicles:
            incidents.append({
                'type': 'emergency_vehicle',
                'confidence': vehicle['confidence'],
                'description': f'Emergency vehicle detected: {vehicle["class"]}',
                'timestamp': frame_time,
                'bbox': vehicle['bbox']
            })
        
        return incidents
    
    def boxes_overlap(self, box1, box2, threshold=0.3):
        """Check if two bounding boxes overlap significantly"""
        x1_1, y1_1, x2_1, y2_1 = box1
        x1_2, y1_2, x2_2, y2_2 = box2
        
        # Calculate intersection
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)
        
        if x2_i <= x1_i or y2_i <= y1_i:
            return False
        
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
        area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
        area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
        union = area1 + area2 - intersection
        
        iou = intersection / union if union > 0 else 0
        return iou > threshold
    
    def get_combined_bbox(self, detections):
        """Get combined bounding box for multiple detections"""
        if not detections:
            return [0, 0, 0, 0]
        
        x1 = min(d['bbox'][0] for d in detections)
        y1 = min(d['bbox'][1] for d in detections)
        x2 = max(d['bbox'][2] for d in detections)
        y2 = max(d['bbox'][3] for d in detections)
        
        return [x1, y1, x2, y2]

# Global model instance
_model_instance = None

def get_model():
    """Get or create global model instance"""
    global _model_instance
    if _model_instance is None:
        _model_instance = TrafficYOLOModel()
    return _model_instance

def analyze_video_file(video_path):
    """Analyze video file for traffic incidents"""
    model = get_model()
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    incidents = []
    processed_frames = 0
    
    # Process every 5th frame for efficiency
    frame_skip = 5
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        if processed_frames % frame_skip == 0:
            frame_time = processed_frames / fps
            
            # Detect objects
            detections = model.detect_objects(frame)
            
            # Analyze for incidents
            frame_incidents = model.analyze_for_incidents(detections, frame_time)
            incidents.extend(frame_incidents)
        
        processed_frames += 1
        
        # Limit processing for demo (max 100 frames)
        if processed_frames >= 100:
            break
    
    cap.release()
    
    return {
        'incidents': incidents,
        'processed_frames': processed_frames,
        'total_frames': total_frames,
        'fps': fps
    }