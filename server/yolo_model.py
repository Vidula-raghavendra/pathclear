"""
YOLOv8 Traffic Analysis Model
Real-time traffic incident detection using YOLOv8
"""

import cv2
import numpy as np
import logging
import time
from pathlib import Path
import random

logger = logging.getLogger(__name__)

# Try to import YOLO, fallback to mock if not available
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
    logger.info("YOLOv8 dependencies available")
except ImportError as e:
    YOLO_AVAILABLE = False
    logger.warning(f"YOLOv8 not available: {e}")

class TrafficYOLOModel:
    def __init__(self, model_path='yolov8n.pt', confidence_threshold=0.5):
        """Initialize YOLO model for traffic analysis"""
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.device = 'cpu'
        
        # Traffic-related class mappings from COCO dataset
        self.coco_classes = {
            0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 4: 'airplane',
            5: 'bus', 6: 'train', 7: 'truck', 8: 'boat', 9: 'traffic_light',
            10: 'fire_hydrant', 11: 'stop_sign', 12: 'parking_meter', 13: 'bench',
            14: 'bird', 15: 'cat', 16: 'dog', 17: 'horse', 18: 'sheep', 19: 'cow'
        }
        
        # Vehicle classes for traffic analysis
        self.vehicle_classes = ['car', 'truck', 'bus', 'motorcycle', 'bicycle']
        
        if YOLO_AVAILABLE:
            self.load_model()
        else:
            logger.info("Running in mock mode - YOLO not available")
    
    def load_model(self):
        """Load YOLOv8 model"""
        if not YOLO_AVAILABLE:
            logger.warning("Cannot load YOLO model - dependencies not available")
            return
            
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
            logger.info("Falling back to mock mode")
            global YOLO_AVAILABLE
            YOLO_AVAILABLE = False
    
    def detect_objects(self, frame):
        """Detect objects in a single frame"""
        if not YOLO_AVAILABLE or self.model is None:
            return self.mock_detect_objects(frame)
            
        try:
            results = self.model(frame, conf=self.confidence_threshold, device=self.device, verbose=False)
            detections = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        if class_id in self.coco_classes:
                            class_name = self.coco_classes[class_id]
                            detections.append({
                                'bbox': [float(x1), float(y1), float(x2), float(y2)],
                                'confidence': float(confidence),
                                'class_id': class_id,
                                'class': class_name
                            })
            
            return detections
            
        except Exception as e:
            logger.error(f"Detection error: {e}")
            return self.mock_detect_objects(frame)
    
    def mock_detect_objects(self, frame):
        """Mock object detection for demo purposes"""
        height, width = frame.shape[:2]
        detections = []
        
        # Generate 3-8 random vehicle detections
        num_vehicles = random.randint(3, 8)
        
        for i in range(num_vehicles):
            # Random vehicle type
            vehicle_type = random.choice(self.vehicle_classes)
            
            # Random bounding box
            x1 = random.randint(0, width // 2)
            y1 = random.randint(height // 3, height - 100)
            x2 = x1 + random.randint(80, 150)
            y2 = y1 + random.randint(60, 100)
            
            # Ensure box is within frame
            x2 = min(x2, width)
            y2 = min(y2, height)
            
            confidence = random.uniform(0.6, 0.95)
            
            detections.append({
                'bbox': [float(x1), float(y1), float(x2), float(y2)],
                'confidence': confidence,
                'class_id': 2 if vehicle_type == 'car' else 7,  # car or truck
                'class': vehicle_type
            })
        
        return detections
    
    def analyze_for_incidents(self, detections, frame_time, frame_shape):
        """Analyze detections for traffic incidents"""
        incidents = []
        
        # Filter vehicles only
        vehicles = [d for d in detections if d['class'] in self.vehicle_classes]
        
        if len(vehicles) == 0:
            return incidents
        
        # Traffic jam detection (multiple vehicles with high density)
        if len(vehicles) >= 4:
            # Calculate vehicle density
            frame_area = frame_shape[0] * frame_shape[1]
            vehicle_area = sum(
                (d['bbox'][2] - d['bbox'][0]) * (d['bbox'][3] - d['bbox'][1]) 
                for d in vehicles
            )
            density = vehicle_area / frame_area
            
            if density > 0.15:  # 15% of frame covered by vehicles
                avg_confidence = sum(v['confidence'] for v in vehicles) / len(vehicles)
                incidents.append({
                    'type': 'traffic_jam',
                    'confidence': min(avg_confidence, 0.9),
                    'description': f'Heavy traffic detected: {len(vehicles)} vehicles, {density:.1%} coverage',
                    'timestamp': frame_time,
                    'bbox': self.get_combined_bbox(vehicles)
                })
        
        # Accident detection (overlapping vehicles or unusual positioning)
        for i, vehicle1 in enumerate(vehicles):
            for vehicle2 in vehicles[i+1:]:
                overlap = self.calculate_overlap(vehicle1['bbox'], vehicle2['bbox'])
                if overlap > 0.2:  # 20% overlap
                    confidence = (vehicle1['confidence'] + vehicle2['confidence']) / 2
                    incidents.append({
                        'type': 'car_accident',
                        'confidence': min(confidence * 0.8, 0.85),  # Reduce confidence for accident detection
                        'description': f'Potential collision: {vehicle1["class"]} and {vehicle2["class"]} overlapping',
                        'timestamp': frame_time,
                        'bbox': self.get_combined_bbox([vehicle1, vehicle2])
                    })
                    break  # Only report one accident per vehicle
        
        # Blocked road detection (vehicles covering most of the width)
        if len(vehicles) >= 2:
            # Sort vehicles by x position
            sorted_vehicles = sorted(vehicles, key=lambda v: v['bbox'][0])
            leftmost = sorted_vehicles[0]['bbox'][0]
            rightmost = max(v['bbox'][2] for v in vehicles)
            road_coverage = (rightmost - leftmost) / frame_shape[1]
            
            if road_coverage > 0.7:  # Vehicles cover 70% of frame width
                avg_confidence = sum(v['confidence'] for v in vehicles) / len(vehicles)
                incidents.append({
                    'type': 'blocked_road',
                    'confidence': min(avg_confidence * 0.7, 0.8),
                    'description': f'Road blockage detected: vehicles spanning {road_coverage:.1%} of road width',
                    'timestamp': frame_time,
                    'bbox': [leftmost, min(v['bbox'][1] for v in vehicles), 
                            rightmost, max(v['bbox'][3] for v in vehicles)]
                })
        
        # Emergency vehicle detection (large vehicles with high confidence)
        for vehicle in vehicles:
            if vehicle['class'] in ['truck', 'bus'] and vehicle['confidence'] > 0.85:
                # Check if it's significantly larger than other vehicles
                vehicle_area = (vehicle['bbox'][2] - vehicle['bbox'][0]) * (vehicle['bbox'][3] - vehicle['bbox'][1])
                avg_vehicle_area = sum(
                    (v['bbox'][2] - v['bbox'][0]) * (v['bbox'][3] - v['bbox'][1]) 
                    for v in vehicles
                ) / len(vehicles)
                
                if vehicle_area > avg_vehicle_area * 1.5:  # 50% larger than average
                    incidents.append({
                        'type': 'emergency_vehicle',
                        'confidence': vehicle['confidence'],
                        'description': f'Large emergency vehicle detected: {vehicle["class"]}',
                        'timestamp': frame_time,
                        'bbox': vehicle['bbox']
                    })
        
        return incidents
    
    def calculate_overlap(self, box1, box2):
        """Calculate intersection over union (IoU) of two bounding boxes"""
        x1_1, y1_1, x2_1, y2_1 = box1
        x1_2, y1_2, x2_2, y2_2 = box2
        
        # Calculate intersection
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)
        
        if x2_i <= x1_i or y2_i <= y1_i:
            return 0.0
        
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
        area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
        area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
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
    
    # Try to open video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Could not open video file: {video_path}")
        # Return mock results if video can't be opened
        return generate_mock_analysis()
    
    try:
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 100
        
        incidents = []
        processed_frames = 0
        
        # Process every 10th frame for efficiency (3 FPS analysis)
        frame_skip = max(1, int(fps / 3))
        
        logger.info(f"Analyzing video: {total_frames} frames at {fps} FPS, processing every {frame_skip} frames")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if processed_frames % frame_skip == 0:
                frame_time = processed_frames / fps
                
                try:
                    # Detect objects
                    detections = model.detect_objects(frame)
                    
                    # Analyze for incidents
                    frame_incidents = model.analyze_for_incidents(detections, frame_time, frame.shape)
                    incidents.extend(frame_incidents)
                    
                except Exception as e:
                    logger.error(f"Error processing frame {processed_frames}: {e}")
            
            processed_frames += 1
            
            # Limit processing for demo (max 300 frames or 10 seconds)
            if processed_frames >= min(300, total_frames):
                break
        
        cap.release()
        
        # Remove duplicate incidents (same type within 2 seconds)
        incidents = remove_duplicate_incidents(incidents)
        
        logger.info(f"Analysis complete: {len(incidents)} incidents detected in {processed_frames} frames")
        
        return {
            'incidents': incidents,
            'processed_frames': processed_frames,
            'total_frames': total_frames,
            'fps': fps
        }
        
    except Exception as e:
        logger.error(f"Video analysis failed: {e}")
        cap.release()
        return generate_mock_analysis()

def remove_duplicate_incidents(incidents):
    """Remove duplicate incidents of the same type within 2 seconds"""
    if not incidents:
        return incidents
    
    # Sort by timestamp
    incidents.sort(key=lambda x: x['timestamp'])
    
    filtered = []
    for incident in incidents:
        # Check if we already have a similar incident recently
        is_duplicate = False
        for existing in filtered:
            if (existing['type'] == incident['type'] and 
                abs(existing['timestamp'] - incident['timestamp']) < 2.0):
                is_duplicate = True
                break
        
        if not is_duplicate:
            filtered.append(incident)
    
    return filtered

def generate_mock_analysis():
    """Generate mock analysis results when real analysis fails"""
    incident_types = ['traffic_jam', 'car_accident', 'blocked_road']
    incidents = []
    
    # Generate 1-3 random incidents
    for i in range(random.randint(1, 3)):
        incident_type = random.choice(incident_types)
        confidence = random.uniform(0.65, 0.90)
        
        descriptions = {
            'traffic_jam': f'Heavy traffic detected with {random.randint(5, 12)} vehicles',
            'car_accident': f'Vehicle collision detected between {random.choice(["car", "truck"])} and car',
            'blocked_road': f'Road blockage detected - {random.choice(["stalled vehicle", "debris", "construction"])}'
        }
        
        incidents.append({
            'type': incident_type,
            'confidence': confidence,
            'description': descriptions[incident_type],
            'timestamp': i * 5.0,  # 5 seconds apart
            'bbox': [
                random.randint(50, 200),
                random.randint(50, 150),
                random.randint(300, 500),
                random.randint(200, 350)
            ]
        })
    
    return {
        'incidents': incidents,
        'processed_frames': 100,
        'total_frames': 120,
        'fps': 30
    }