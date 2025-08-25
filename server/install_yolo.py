#!/usr/bin/env python3
"""
Install YOLOv8 and dependencies for traffic analysis
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a single package"""
    try:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def check_gpu():
    """Check if CUDA is available"""
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ CUDA available: {torch.cuda.get_device_name(0)}")
            return True
        else:
            print("ℹ️  CUDA not available, will use CPU")
            return False
    except ImportError:
        print("ℹ️  PyTorch not installed yet")
        return False

def main():
    print("🚀 Installing YOLOv8 for Traffic Analysis")
    print("=" * 50)
    
    # Essential packages in order
    packages = [
        "torch",
        "torchvision", 
        "opencv-python",
        "ultralytics",
        "numpy",
        "Pillow",
        "PyYAML"
    ]
    
    success_count = 0
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print("=" * 50)
    
    if success_count == len(packages):
        print("🎉 All YOLOv8 dependencies installed successfully!")
        
        # Check GPU availability
        check_gpu()
        
        # Download YOLOv8 model
        try:
            print("\n📥 Downloading YOLOv8 model...")
            from ultralytics import YOLO
            model = YOLO('yolov8n.pt')  # This will download the model
            print("✅ YOLOv8 nano model downloaded")
            
            # Test the model
            print("\n🧪 Testing model...")
            import numpy as np
            test_image = np.zeros((640, 640, 3), dtype=np.uint8)
            results = model(test_image, verbose=False)
            print("✅ Model test successful")
            
        except Exception as e:
            print(f"⚠️  Model download/test failed: {e}")
            print("You can download it manually when first running the server")
        
        print("\n🎯 Setup complete! You can now run:")
        print("   python flask_server.py")
        
    else:
        print(f"⚠️  {success_count}/{len(packages)} packages installed")
        print("Some packages failed to install")
        print("\nTry installing manually:")
        for package in packages:
            print(f"   pip install {package}")

if __name__ == "__main__":
    main()