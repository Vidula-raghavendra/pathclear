#!/usr/bin/env python3
"""
Quick and simple server that WILL work - no dependencies needed
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import time
import random
from pathlib import Path

PORT = 5000

class QuickHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'healthy',
                'model': 'Quick Demo Server',
                'version': '1.0.0',
                'device': 'cpu (demo)',
                'model_loaded': True,
                'yolo_available': False,
                'supported_formats': ['mp4', 'avi', 'mov'],
                'max_file_size_mb': 500
            }
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Handle other GET requests normally
        super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/analyze':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Mock analysis response
            mock_response = {
                'videoId': str(int(time.time())),
                'filename': 'demo_video.mp4',
                'location': {
                    'lat': 17.3850,
                    'lng': 78.4867,
                    'address': 'Hyderabad, India'
                },
                'incidents': [
                    {
                        'id': f'demo_{int(time.time())}_traffic_jam',
                        'type': 'traffic_jam',
                        'location': {
                            'lat': 17.3850,
                            'lng': 78.4867,
                            'address': 'Hyderabad, India'
                        },
                        'severity': 'medium',
                        'description': 'Heavy traffic detected with 12 vehicles',
                        'timestamp': time.time(),
                        'status': 'active',
                        'detectedBy': 'ai',
                        'confidence': 0.85,
                        'detectionBoxes': [{
                            'x': 100,
                            'y': 50,
                            'width': 200,
                            'height': 150,
                            'class': 'traffic_jam',
                            'confidence': 0.85
                        }]
                    }
                ],
                'detections': [],
                'processedFrames': 100,
                'totalFrames': 100,
                'status': 'completed',
                'analysisTime': '3.2s',
                'modelVersion': 'Quick-Demo-v1.0',
                'timestamp': time.time(),
                'fps': 30,
                'demo_mode': True
            }
            
            self.wfile.write(json.dumps(mock_response).encode())
            return
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

def main():
    print("=" * 60)
    print("🚀 QUICK SERVER STARTING - THIS WILL WORK!")
    print("=" * 60)
    
    # Create uploads directory
    os.makedirs('uploads/videos', exist_ok=True)
    
    with socketserver.TCPServer(("", PORT), QuickHandler) as httpd:
        print(f"✅ Server running at http://localhost:{PORT}")
        print(f"✅ Health check: http://localhost:{PORT}/api/health")
        print(f"✅ Ready for video uploads!")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    main()