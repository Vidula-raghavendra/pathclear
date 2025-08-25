#!/usr/bin/env python3
"""
GUARANTEED WORKING SERVER - This WILL work
Simple Flask server that starts without any complex dependencies
"""

try:
    from flask import Flask, request, jsonify, send_from_directory
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    print("❌ Flask not installed. Installing now...")
    import subprocess
    import sys
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors"])
        from flask import Flask, request, jsonify, send_from_directory
        from flask_cors import CORS
        FLASK_AVAILABLE = True
        print("✅ Flask installed successfully")
    except Exception as e:
        print(f"❌ Failed to install Flask: {e}")
        FLASK_AVAILABLE = False

import os
import json
import time
import random
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if not FLASK_AVAILABLE:
    print("❌ Cannot start server without Flask")
    exit(1)

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

def generate_realistic_incidents(location):
    """Generate realistic mock incidents for demo"""
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
            'car_accident': f'Vehicle collision detected - {random.choice(["2 cars", "car and truck", "multiple vehicles"])}',
            'blocked_road': f'Road blockage detected - {random.choice(["construction", "debris", "stalled vehicle"])}',
            'emergency_vehicle': f'Emergency vehicle detected - {random.choice(["ambulance", "fire truck", "police car"])}'
        }
        
        incidents.append({
            'type': incident_type,
            'confidence': confidence,
            'description': descriptions.get(incident_type, f'Detected {incident_type}'),
            'timestamp': time.time() + i * 10,
            'bbox': [
                random.randint(50, 200),   # x
                random.randint(50, 150),   # y
                random.randint(250, 400),  # x2
                random.randint(200, 300)   # y2
            ]
        })
    
    return incidents

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'Working Demo Server',
        'version': '1.0.0',
        'device': 'cpu (demo)',
        'model_loaded': True,
        'yolo_available': False,
        'supported_formats': list(ALLOWED_EXTENSIONS),
        'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024),
        'message': 'Server is running and ready!',
        'timestamp': time.time()
    })

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
            return jsonify({'error': f'Invalid file format. Supported: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
        
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
        
        logger.info(f"Processing video: {filename} at location: {location.get('address', 'Unknown')}")
        
        # Simulate processing time
        time.sleep(2)
        
        # Generate mock analysis results
        mock_incidents = generate_realistic_incidents(location)
        
        # Convert results to expected format
        incidents = []
        for incident in mock_incidents:
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
            'detections': mock_incidents,
            'processedFrames': random.randint(80, 120),
            'totalFrames': random.randint(100, 150),
            'status': 'completed',
            'analysisTime': f"{random.uniform(2.0, 4.0):.1f}s",
            'modelVersion': 'Demo-Working-v1.0',
            'timestamp': time.time(),
            'fps': 30,
            'demo_mode': True
        }
        
        logger.info(f"Analysis complete: {len(incidents)} incidents detected")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    return jsonify({
        'model_type': 'Working Demo Server',
        'device': 'cpu (demo)',
        'confidence_threshold': 0.5,
        'yolo_available': False,
        'supported_classes': ['traffic_jam', 'car_accident', 'blocked_road', 'emergency_vehicle'],
        'incident_types': ['traffic_jam', 'car_accident', 'blocked_road', 'emergency_vehicle'],
        'model_size': 'demo (instant)',
        'inference_speed': 'Mock speed (2s delay)',
        'demo_mode': True,
        'status': 'ready'
    })

@app.route('/uploads/<filename>')
def serve_video(filename):
    """Serve uploaded video files"""
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        return jsonify({'error': f'File not found: {str(e)}'}), 404

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
    print("🚀 GUARANTEED WORKING SERVER STARTING")
    print("=" * 60)
    print("✅ Server starting on http://localhost:5000")
    print("✅ Health check: http://localhost:5000/api/health")
    print("✅ Upload endpoint: http://localhost:5000/api/analyze")
    print("")
    print("📝 Note: Running in DEMO mode with realistic mock analysis")
    print("=" * 60)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("Trying alternative port...")
        try:
            app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
        except Exception as e2:
            print(f"❌ Failed on port 5001 too: {e2}")