import cv2
import numpy as np
from ultralytics import YOLO
import torch
from pathlib import Path
import json
import logging
from typing import List, Dict, Tuple, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TrafficYOLOModel:
    def __init__(self, model_path: str = None):
        """
        Initialize the YOLO model for traffic incident detection
        """
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        logger.info(f"Using device: {self.device}")
        
        # Load pre-trained YOLOv8 model or custom trained model
        if model_path and Path(model_path).exists():
            self.model = YOLO(model_path)
            logger.info(f"Loaded custom model from {model_path}")
        else:
            # Use YOLOv8n (nano) for faster inference, can upgrade to YOLOv8s/m/l/x
            self.model = YOLO('yolov8n.pt')
            logger.info("Loaded pre-trained YOLOv8n model")
        
        # Traffic incident class mappings
        self.traffic_classes = {
            'car': 'vehicle',
            'truck': 'vehicle', 
            'bus': 'vehicle',
            'motorcycle': 'vehicle',
            'bicycle': 'vehicle',
            'person': 'pedestrian',
            'traffic light': 'traffic_signal',
            'stop sign': 'traffic_sign'
        }
        
        # Incident detection thresholds
        self.confidence_threshold = 0.5
        self.accident_threshold = 0.7
        self.congestion_threshold = 5  # vehicles per frame
        
    def detect_incidents(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Detect traffic incidents in a single frame
        """
        results = self.model(frame, conf=self.confidence_threshold)
        detections = []
        incidents = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Extract detection data
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = self.model.names[class_id]
                    
                    detection = {
                        'bbox': [float(x1), float(y1), float(x2), float(y2)],
                        'confidence': float(confidence),
                        'class': class_name,
                        'class_id': class_id
                    }
                    detections.append(detection)
        
        # Analyze detections for incidents
        incidents = self._analyze_for_incidents(detections, frame.shape)
        
        return {
            'detections': detections,
            'incidents': incidents,
            'frame_shape': frame.shape
        }
    
    def _analyze_for_incidents(self, detections: List[Dict], frame_shape: Tuple) -> List[Dict]:
        """
        Analyze detections to identify traffic incidents
        """
        incidents = []
        vehicles = [d for d in detections if d['class'] in ['car', 'truck', 'bus', 'motorcycle']]
        
        # 1. Traffic Congestion Detection
        if len(vehicles) >= self.congestion_threshold:
            # Calculate vehicle density
            frame_area = frame_shape[0] * frame_shape[1]
            vehicle_area = sum([
                (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) 
                for bbox in [v['bbox'] for v in vehicles]
            ])
            density = vehicle_area / frame_area
            
            if density > 0.3:  # 30% of frame covered by vehicles
                incidents.append({
                    'type': 'traffic_jam',
                    'confidence': min(0.9, density * 2),
                    'bbox': self._get_bounding_area(vehicles),
                    'description': f'Heavy traffic detected - {len(vehicles)} vehicles'
                })
        
        # 2. Accident Detection (based on unusual vehicle positions/orientations)
        accident_score = self._detect_accidents(vehicles, frame_shape)
        if accident_score > self.accident_threshold:
            incidents.append({
                'type': 'car_accident',
                'confidence': accident_score,
                'bbox': self._get_accident_bbox(vehicles),
                'description': 'Potential vehicle accident detected'
            })
        
        # 3. Blocked Road Detection
        if self._detect_blocked_road(vehicles, detections, frame_shape):
            incidents.append({
                'type': 'blocked_road',
                'confidence': 0.8,
                'bbox': [0, frame_shape[0]//2, frame_shape[1], frame_shape[0]],
                'description': 'Road blockage detected'
            })
        
        # 4. Emergency Vehicle Detection
        emergency_vehicles = self._detect_emergency_vehicles(detections)
        if emergency_vehicles:
            incidents.append({
                'type': 'emergency_vehicle',
                'confidence': 0.95,
                'bbox': emergency_vehicles[0]['bbox'],
                'description': 'Emergency vehicle detected'
            })
        
        return incidents
    
    def _detect_accidents(self, vehicles: List[Dict], frame_shape: Tuple) -> float:
        """
        Detect potential accidents based on vehicle clustering and positions
        """
        if len(vehicles) < 2:
            return 0.0
        
        accident_score = 0.0
        
        # Check for overlapping or very close vehicles
        for i, v1 in enumerate(vehicles):
            for j, v2 in enumerate(vehicles[i+1:], i+1):
                bbox1 = v1['bbox']
                bbox2 = v2['bbox']
                
                # Calculate intersection over union (IoU)
                iou = self._calculate_iou(bbox1, bbox2)
                if iou > 0.1:  # Vehicles are overlapping/very close
                    accident_score += iou * 0.5
                
                # Check for unusual positioning (vehicles at odd angles)
                if self._unusual_positioning(bbox1, bbox2):
                    accident_score += 0.3
        
        return min(accident_score, 1.0)
    
    def _detect_blocked_road(self, vehicles: List[Dict], all_detections: List[Dict], frame_shape: Tuple) -> bool:
        """
        Detect if the road is blocked
        """
        # Simple heuristic: if vehicles are stationary across the width of the frame
        frame_width = frame_shape[1]
        road_coverage = 0
        
        for vehicle in vehicles:
            bbox = vehicle['bbox']
            vehicle_width = bbox[2] - bbox[0]
            road_coverage += vehicle_width
        
        # If vehicles cover more than 80% of frame width, consider road blocked
        return (road_coverage / frame_width) > 0.8
    
    def _detect_emergency_vehicles(self, detections: List[Dict]) -> List[Dict]:
        """
        Detect emergency vehicles (simplified - in practice would need custom training)
        """
        # This is a placeholder - real implementation would need:
        # 1. Custom trained model for emergency vehicles
        # 2. Color detection (red/blue lights)
        # 3. Shape analysis for ambulance/fire truck/police car
        emergency_vehicles = []
        
        for detection in detections:
            if detection['class'] in ['truck', 'bus'] and detection['confidence'] > 0.8:
                # Simple heuristic - large vehicles with high confidence might be emergency
                if detection['bbox'][3] - detection['bbox'][1] > 100:  # Height > 100px
                    emergency_vehicles.append(detection)
        
        return emergency_vehicles
    
    def _calculate_iou(self, bbox1: List[float], bbox2: List[float]) -> float:
        """
        Calculate Intersection over Union of two bounding boxes
        """
        x1 = max(bbox1[0], bbox2[0])
        y1 = max(bbox1[1], bbox2[1])
        x2 = min(bbox1[2], bbox2[2])
        y2 = min(bbox1[3], bbox2[3])
        
        if x2 <= x1 or y2 <= y1:
            return 0.0
        
        intersection = (x2 - x1) * (y2 - y1)
        area1 = (bbox1[2] - bbox1[0]) * (bbox1[3] - bbox1[1])
        area2 = (bbox2[2] - bbox2[0]) * (bbox2[3] - bbox2[1])
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def _unusual_positioning(self, bbox1: List[float], bbox2: List[float]) -> bool:
        """
        Check if vehicles are in unusual positions (potential accident indicator)
        """
        # Check if vehicles are perpendicular to normal traffic flow
        center1 = [(bbox1[0] + bbox1[2])/2, (bbox1[1] + bbox1[3])/2]
        center2 = [(bbox2[0] + bbox2[2])/2, (bbox2[1] + bbox2[3])/2]
        
        # Simple heuristic for unusual positioning
        distance = np.sqrt((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)
        return distance < 50  # Very close vehicles might indicate accident
    
    def _get_bounding_area(self, vehicles: List[Dict]) -> List[float]:
        """
        Get bounding area covering all vehicles
        """
        if not vehicles:
            return [0, 0, 0, 0]
        
        min_x = min(v['bbox'][0] for v in vehicles)
        min_y = min(v['bbox'][1] for v in vehicles)
        max_x = max(v['bbox'][2] for v in vehicles)
        max_y = max(v['bbox'][3] for v in vehicles)
        
        return [min_x, min_y, max_x, max_y]
    
    def _get_accident_bbox(self, vehicles: List[Dict]) -> List[float]:
        """
        Get bounding box for accident area
        """
        return self._get_bounding_area(vehicles)
    
    def analyze_video(self, video_path: str, sample_rate: int = 30) -> Dict[str, Any]:
        """
        Analyze entire video for traffic incidents
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        all_incidents = []
        frame_count = 0
        processed_frames = 0
        
        logger.info(f"Analyzing video: {total_frames} frames at {fps} FPS")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Sample frames (analyze every Nth frame for efficiency)
            if frame_count % sample_rate == 0:
                try:
                    result = self.detect_incidents(frame)
                    
                    # Add timestamp to incidents
                    timestamp = frame_count / fps
                    for incident in result['incidents']:
                        incident['timestamp'] = timestamp
                        incident['frame_number'] = frame_count
                    
                    all_incidents.extend(result['incidents'])
                    processed_frames += 1
                    
                    if processed_frames % 10 == 0:
                        logger.info(f"Processed {processed_frames} frames...")
                        
                except Exception as e:
                    logger.error(f"Error processing frame {frame_count}: {e}")
            
            frame_count += 1
        
        cap.release()
        
        # Aggregate and filter incidents
        aggregated_incidents = self._aggregate_incidents(all_incidents)
        
        return {
            'video_path': video_path,
            'total_frames': total_frames,
            'processed_frames': processed_frames,
            'fps': fps,
            'incidents': aggregated_incidents,
            'analysis_complete': True
        }
    
    def _aggregate_incidents(self, incidents: List[Dict]) -> List[Dict]:
        """
        Aggregate similar incidents across frames to reduce noise
        """
        if not incidents:
            return []
        
        # Group incidents by type and time proximity
        grouped = {}
        for incident in incidents:
            incident_type = incident['type']
            timestamp = incident['timestamp']
            
            # Find existing group within 5 seconds
            group_key = None
            for key in grouped.keys():
                if key.startswith(incident_type):
                    existing_time = float(key.split('_')[-1])
                    if abs(timestamp - existing_time) < 5.0:  # 5 second window
                        group_key = key
                        break
            
            if group_key is None:
                group_key = f"{incident_type}_{timestamp}"
                grouped[group_key] = []
            
            grouped[group_key].append(incident)
        
        # Create final incident list with highest confidence from each group
        final_incidents = []
        for group in grouped.values():
            if len(group) >= 2:  # Only keep incidents that appear in multiple frames
                best_incident = max(group, key=lambda x: x['confidence'])
                best_incident['duration'] = len(group) * 1.0  # Approximate duration
                final_incidents.append(best_incident)
        
        return final_incidents

# Global model instance
traffic_model = None

def get_model():
    """Get or create the global model instance"""
    global traffic_model
    if traffic_model is None:
        traffic_model = TrafficYOLOModel()
    return traffic_model

def analyze_video_file(video_path: str) -> Dict[str, Any]:
    """
    Analyze a video file for traffic incidents
    """
    model = get_model()
    return model.analyze_video(video_path)