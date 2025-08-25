#!/usr/bin/env python3
"""
Smart server starter - tries full YOLO server first, falls back to simple server
"""

import sys
import subprocess
import os
import importlib.util

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def check_flask_available():
    """Check if Flask is available"""
    try:
        import flask
        import flask_cors
        return True
    except ImportError:
        return False

def install_flask():
    """Install Flask if not available"""
    print("📦 Installing Flask...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors"])
        print("✅ Flask installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Flask: {e}")
        return False

def check_yolo_available():
    """Check if YOLO dependencies are available"""
    try:
        import ultralytics
        import cv2
        import torch
        return True
    except ImportError:
        return False

def start_full_server():
    """Try to start the full YOLO server"""
    try:
        print("🤖 Attempting to start full YOLOv8 server...")
        from flask_server import app
        print("✅ YOLOv8 server starting...")
        app.run(host='0.0.0.0', port=5000, debug=False)
        return True
    except ImportError as e:
        print(f"⚠️  YOLOv8 dependencies not available: {e}")
        return False
    except Exception as e:
        print(f"❌ Failed to start full server: {e}")
        return False

def start_simple_server():
    """Start the simple mock server"""
    try:
        print("🎭 Starting simple demo server...")
        from simple_server import app
        print("✅ Demo server starting...")
        app.run(host='0.0.0.0', port=5000, debug=False)
        return True
    except Exception as e:
        print(f"❌ Failed to start demo server: {e}")
        return False

def main():
    print("🚀 Traffic Analysis Server Starter")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check and install Flask if needed
    if not check_flask_available():
        if not install_flask():
            print("❌ Cannot proceed without Flask")
            sys.exit(1)
    
    # Check if YOLO is available
    yolo_available = check_yolo_available()
    
    if yolo_available:
        print("🤖 YOLOv8 dependencies found - starting full server")
        if start_full_server():
            return
    
    print("🎭 Starting in demo mode with mock analysis")
    print("   (Install ultralytics, opencv-python, torch for real YOLO)")
    
    if not start_simple_server():
        print("❌ Failed to start any server")
        sys.exit(1)

if __name__ == "__main__":
    main()