from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import logging
from pathlib import Path
import json
import time

# Try to import YOLO model, fallback to mock if not available
try:
    from yolo_model import analyze_video_file, get_model
    YOLO_AVAILABLE = True
except ImportError as e:
    print(f"Warning: YOLO model not available: {e}")
    print("Running in mock mode for demonstration")
    YOLO_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads/videos'
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def mock_analyze_video(video_path, location):
    """Mock video analysis when YOLO is not available"""
    import random
    
    # Simulate processing time
    time.sleep(2)
    
    # Generate mock incidents
    incident_types = ['traffic_jam', 'car_accident', 'blocked_road']
    incidents = []
    
    for i in range(random.randint(1, 3)):
        incident_type = random.choice(incident_types)
        confidence = random.uniform(0.6, 0.95)
        
        incidents.append({
            'type': incident_type,
            'confidence': confidence,
            'description': f'Mock {incident_type.replace("_", " ")} detected with {confidence:.0%} confidence',
            'timestamp': time.time() + i,
            'bbox': [
                random.randint(50, 200),
                random.randint(50, 150), 
                random.randint(250, 400),
                random.randint(200, 300)
            ]
        })
    
    return {
        'incidents': incidents,
        'processed_frames': 100,
        'total_frames': 100,
        'fps': 30
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        if YOLO_AVAILABLE:
            model = get_model()
            device = model.device
            model_loaded = True
        else:
            device = 'cpu (mock)'
            model_loaded = False
            
        return jsonify({
            'status': 'healthy',
            'model': 'YOLOv8 Traffic Analysis' if YOLO_AVAILABLE else 'Mock Analysis Server',
            'version': '2.0.0',
            'device': device,
            'model_loaded': model_loaded,
            'yolo_available': YOLO_AVAILABLE,
            'supported_formats': list(ALLOWED_EXTENSIONS),
            'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024)
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'error',
            'yolo_available': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_video():
    """Analyze uploaded video for traffic incidents"""
    try:
        # Check if video file is present
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format'}), 400
        
        # Get location data
        location_data = request.form.get('location')
        if not location_data:
            return jsonify({'error': 'Location data required'}), 400
        
        try:
            location = json.loads(location_data)
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid location data format'}), 400
        
        # Save uploaded file
        filename = f"{int(time.time())}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        logger.info(f"Analyzing video: {filename}")
        
        # Analyze video with YOLO model or mock
        if YOLO_AVAILABLE:
            analysis_result = analyze_video_file(filepath)
        else:
            analysis_result = mock_analyze_video(filepath, location)
        
        # Convert YOLO results to expected format
        incidents = []
        for incident in analysis_result['incidents']:
            incidents.append({
                'id': f"yolo_{int(incident['timestamp'])}_{incident['type']}",
                'type': incident['type'],
                'location': location,
                'severity': get_severity(incident['confidence'], incident['type']),
                'description': incident['description'],
                'timestamp': incident['timestamp'],
                'status': 'active',
                'detectedBy': 'ai',
                'confidence': incident['confidence'],
                'detectionBoxes': [{
                    'x': incident['bbox'][0],
                    'y': incident['bbox'][1], 
                    'width': incident['bbox'][2] - incident['bbox'][0],
                    'height': incident['bbox'][3] - incident['bbox'][1],
                    'class': incident['type'],
                    'confidence': incident['confidence']
                }] if 'bbox' in incident else []
            })
        
        response = {
            'videoId': str(int(time.time())),
            'filename': filename,
            'location': location,
            'incidents': incidents,
            'detections': analysis_result.get('incidents', []),
            'processedFrames': analysis_result['processed_frames'],
            'totalFrames': analysis_result['total_frames'],
            'status': 'completed',
            'analysisTime': f"{analysis_result['processed_frames'] / analysis_result['fps']:.1f}s",
            'modelVersion': 'YOLOv8n-Traffic',
            'timestamp': time.time(),
            'fps': analysis_result['fps']
        }
        
        logger.info(f"Analysis complete: {len(incidents)} incidents detected")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    try:
        if YOLO_AVAILABLE:
            model = get_model()
            device = model.device
            confidence_threshold = model.confidence_threshold
        else:
            device = 'cpu (mock)'
            confidence_threshold = 0.5
            
        return jsonify({
            'model_type': 'YOLOv8' if YOLO_AVAILABLE else 'Mock',
            'device': device,
            'confidence_threshold': confidence_threshold,
            'yolo_available': YOLO_AVAILABLE,
            'supported_classes': list(range(20)) if YOLO_AVAILABLE else ['mock_classes'],
            'incident_types': ['traffic_jam', 'car_accident', 'blocked_road', 'emergency_vehicle'],
            'model_size': 'nano (fastest)' if YOLO_AVAILABLE else 'mock',
            'inference_speed': 'Real-time capable' if YOLO_AVAILABLE else 'Mock speed'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def serve_video(filename):
    """Serve uploaded video files"""
    return send_from_directory(UPLOAD_FOLDER, filename)

def get_severity(confidence, incident_type):
    """Determine incident severity based on confidence and type"""
    if incident_type in ['car_accident', 'emergency_vehicle']:
        return 'critical' if confidence > 0.8 else 'high'
    elif incident_type == 'blocked_road':
        return 'high' if confidence > 0.7 else 'medium'
    elif incident_type == 'traffic_jam':
        return 'medium' if confidence > 0.6 else 'low'
    else:
        return 'medium'

if __name__ == '__main__':
    from werkzeug.utils import send_from_directory
    
    logger.info("Starting YOLOv8 Traffic Analysis Server...")
    
    if YOLO_AVAILABLE:
        logger.info("Loading YOLO model...")
        try:
            model = get_model()
            logger.info(f"YOLO model loaded successfully on {model.device}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            logger.info("Continuing in mock mode...")
            YOLO_AVAILABLE = False
    else:
        logger.info("Running in mock mode - YOLO dependencies not available")
    
    logger.info("Server starting on http://localhost:5000")
    logger.info("Health check available at: http://localhost:5000/api/health")
    