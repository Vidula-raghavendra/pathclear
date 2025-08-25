#!/usr/bin/env python3
"""
Test YOLOv8 installation and model functionality
"""

import sys
import numpy as np

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing imports...")
    
    try:
        import cv2
        print("✅ OpenCV imported")
    except ImportError as e:
        print(f"❌ OpenCV failed: {e}")
        return False
    
    try:
        import torch
        print(f"✅ PyTorch imported (CUDA: {torch.cuda.is_available()})")
    except ImportError as e:
        print(f"❌ PyTorch failed: {e}")
        return False
    
    try:
        from ultralytics import YOLO
        print("✅ Ultralytics YOLO imported")
    except ImportError as e:
        print(f"❌ Ultralytics failed: {e}")
        return False
    
    return True

def test_model():
    """Test YOLOv8 model loading and inference"""
    print("\nTesting YOLOv8 model...")
    
    try:
        from ultralytics import YOLO
        
        # Load model (will download if not present)
        print("Loading YOLOv8 nano model...")
        model = YOLO('yolov8n.pt')
        print("✅ Model loaded successfully")
        
        # Test inference on dummy image
        print("Testing inference...")
        dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
        results = model(dummy_image, verbose=False)
        print("✅ Inference successful")
        
        # Check results
        if results and len(results) > 0:
            result = results[0]
            if hasattr(result, 'boxes') and result.boxes is not None:
                print(f"✅ Detection format correct (found {len(result.boxes)} detections)")
            else:
                print("✅ No detections (expected for blank image)")
        
        return True
        
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def test_traffic_model():
    """Test our traffic analysis model"""
    print("\nTesting traffic analysis model...")
    
    try:
        from yolo_model import TrafficYOLOModel, analyze_video_file
        
        # Test model creation
        print("Creating traffic model...")
        model = TrafficYOLOModel()
        print("✅ Traffic model created")
        
        # Test object detection
        print("Testing object detection...")
        dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        detections = model.detect_objects(dummy_frame)
        print(f"✅ Object detection works (found {len(detections)} detections)")
        
        # Test incident analysis
        print("Testing incident analysis...")
        incidents = model.analyze_for_incidents(detections, 0.0, dummy_frame.shape)
        print(f"✅ Incident analysis works (found {len(incidents)} incidents)")
        
        return True
        
    except Exception as e:
        print(f"❌ Traffic model test failed: {e}")
        return False

def main():
    print("🧪 YOLOv8 Traffic Analysis Test Suite")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import test failed - install dependencies first")
        print("Run: python install_yolo.py")
        return
    
    # Test model
    if not test_model():
        print("\n❌ Model test failed")
        return
    
    # Test traffic model
    if not test_traffic_model():
        print("\n❌ Traffic model test failed")
        return
    
    print("\n" + "=" * 50)
    print("🎉 All tests passed! YOLOv8 is ready for traffic analysis")
    print("You can now start the server with: python flask_server.py")

if __name__ == "__main__":
    main()