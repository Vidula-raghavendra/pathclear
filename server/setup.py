#!/usr/bin/env python3
"""
Setup script for YOLOv8 Traffic Analysis Server
"""

import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """Install Python requirements"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Python dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    return True

def download_yolo_model():
    """Download YOLOv8 model weights"""
    print("Downloading YOLOv8 model weights...")
    try:
        from ultralytics import YOLO
        # This will automatically download the model if not present
        model = YOLO('yolov8n.pt')
        print("✅ YOLOv8 model downloaded successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to download YOLO model: {e}")
        return False

def setup_directories():
    """Create necessary directories"""
    directories = ['uploads/videos', 'models', 'logs']
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def check_system_requirements():
    """Check system requirements"""
    print("Checking system requirements...")
    
    # Check Python version
    if sys.version_info < (3.8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Check for CUDA (optional)
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ CUDA available: {torch.cuda.get_device_name(0)}")
        else:
            print("⚠️  CUDA not available, using CPU (slower inference)")
    except ImportError:
        print("⚠️  PyTorch not installed yet")
    
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up YOLOv8 Traffic Analysis Server...")
    print("=" * 50)
    
    if not check_system_requirements():
        sys.exit(1)
    
    setup_directories()
    
    if not install_requirements():
        sys.exit(1)
    
    if not download_yolo_model():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\nTo start the server:")
    print("  python flask_server.py")
    print("\nTo test the server:")
    print("  curl http://localhost:5000/api/health")

if __name__ == "__main__":
    main()