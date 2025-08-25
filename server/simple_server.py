#!/usr/bin/env python3
"""
Simple Flask server for traffic analysis - works without YOLO dependencies
This server provides mock analysis when YOLO is not available
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import time
import random
import logging

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
    """Mock video analysis for demonstration"""
    logger.info(f"Mock analyzing video: {video_path}")
    
    # Simulate processing time
    time.sleep(2)
    
    # Generate realistic mock incidents based on location
    incident_types = ['traffic_jam', 'car_accident', 'blocked_road', 'emergency_vehicle']
    incidents = []
    
    # Generate 1-3 random incidents
    num_incidents = random.randint(1, 3)
    
    for i in range(num_incidents):
        incident_type = random.choice(incident_types)
        confidence = random.uniform(0.65, 0.95)
        
        # Create realistic descriptions
        descriptions = {
            'traffic_jam': f'Heavy traffic congestion detected with {random.randint(8, 15)} vehicles',
            'car_accident': f'Vehicle collision detected between {random.choice(["car", "truck", "bus"])} and {random.choice(["car", "motorcycle"])}',
            'blocked_road': f'Road blockage detected - {random.choice(["construction", "debris", "stalled vehicle"])}',
            'emergency_vehicle': f'Emergency vehicle detected - {random.choice(["ambulance", "fire truck", "police car"])}'
        }
        
        incidents.append({
            'type': incident_type,
            'confidence': confidence,
            'description': descriptions.get(incident_type, f'Mock {incident_type} detected'),
            'timestamp': time.time() + i * 10,
            'bbox': [
                random.randint(50, 200),   # x
                random.randint(50, 150),   # y
                random.randint(250, 400),  # x2
                random.randint(200, 300)   # y2
            ]
        })
    
    return {
        'incidents': incidents,
        'processed_frames': random.randint(80, 120),
        'total_frames': random.randint(100, 150),
        'fps': 30
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'model': 'Mock Analysis Server (Demo Mode)',
            'version': '2.0.0',
            'device': 'cpu (mock)',
            'model_loaded': True,
            'yolo_available': False,
            'supported_formats': list(ALLOWED_EXTENSIONS),
            'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024),
            'message': 'Server running in demo mode - install YOLOv8 for real analysis'
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
            return jsonify({'error': 'Invalid file format. Supported: ' + ', '.join(ALLOWED_EXTENSIONS)}), 400
        
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
        
        logger.info(f"Analyzing video: {filename} at location: {location.get('address', 'Unknown')}")
        
        # Perform mock analysis
        analysis_result = mock_analyze_video(filepath, location)
        
        # Convert results to expected format
        incidents = []
        for incident in analysis_result['incidents']:
            incidents.append({
                'id': f"demo_{int(incident['timestamp'])}_{incident['type']}",
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
            'modelVersion': 'Demo-Mock-v2.0',
            'timestamp': time.time(),
            'fps': analysis_result['fps'],
            'demo_mode': True
        }
        
        logger.info(f"Mock analysis complete: {len(incidents)} incidents detected")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    return jsonify({
        'model_type': 'Mock Demo Server',
        'device': 'cpu (demo)',
        'confidence_threshold': 0.5,
        'yolo_available': False,
        'supported_classes': ['traffic_jam', 'car_accident', 'blocked_road', 'emergency_vehicle'],
        'incident_types': ['traffic_jam', 'car_accident', 'blocked_road', 'emergency_vehicle'],
        'model_size': 'demo (instant)',
        'inference_speed': 'Mock speed (2s delay)',
        'demo_mode': True
    })

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
    print("=" * 60)
    print("🚀 Starting Traffic Analysis Server (Demo Mode)")
    print("=" * 60)
    print("✅ Server starting on http://localhost:5000")
    print("✅ Health check: http://localhost:5000/api/health")
    print("✅ Upload endpoint: http://localhost:5000/api/analyze")
    print("")
    print("📝 Note: Running in DEMO mode with mock analysis")
    print("   Install YOLOv8 dependencies for real AI analysis")
    print("=" * 60)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("Try running on a different port or check if port 5000 is in use")