from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import logging
from pathlib import Path
import json
from yolo_model import analyze_video_file, get_model

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

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        model = get_model()
        return jsonify({
            'status': 'healthy',
            'model': 'YOLOv8 Traffic Analysis',
            'version': '2.0.0',
            'device': model.device,
            'model_loaded': True,
            'supported_formats': list(ALLOWED_EXTENSIONS),
            'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024)
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'error',
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
        
        # Analyze video with YOLO model
        analysis_result = analyze_video_file(filepath)
        
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
        model = get_model()
        return jsonify({
            'model_type': 'YOLOv8',
            'device': model.device,
            'confidence_threshold': model.confidence_threshold,
            'supported_classes': list(model.traffic_classes.keys()),
            'incident_types': ['traffic_jam', 'car_accident', 'blocked_road', 'emergency_vehicle'],
            'model_size': 'nano (fastest)',
            'inference_speed': 'Real-time capable'
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
    import time
    from werkzeug.utils import send_from_directory
    
    logger.info("Starting YOLOv8 Traffic Analysis Server...")
    logger.info("Loading YOLO model...")
    
    # Pre-load model
    try:
        model = get_model()
        logger.info(f"Model loaded successfully on {model.device}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        exit(1)
    
    app.run(host='0.0.0.0', port=5000, debug=False)