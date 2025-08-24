#!/usr/bin/env python3
"""
Script to train a custom YOLOv8 model for traffic incident detection
This is for advanced users who want to train on custom datasets
"""

import os
import yaml
from pathlib import Path
from ultralytics import YOLO
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_dataset_config():
    """Create dataset configuration for training"""
    config = {
        'path': './datasets/traffic_incidents',
        'train': 'images/train',
        'val': 'images/val',
        'test': 'images/test',
        'names': {
            0: 'car_accident',
            1: 'traffic_jam', 
            2: 'blocked_road',
            3: 'emergency_vehicle',
            4: 'flood',
            5: 'construction'
        }
    }
    
    # Save config
    config_path = 'traffic_dataset.yaml'
    with open(config_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    logger.info(f"Dataset config saved to {config_path}")
    return config_path

def train_model(dataset_config: str, epochs: int = 100, img_size: int = 640):
    """Train custom YOLOv8 model"""
    logger.info("Starting model training...")
    
    # Load a pre-trained YOLOv8 model
    model = YOLO('yolov8n.pt')  # Start with nano model for faster training
    
    # Train the model
    results = model.train(
        data=dataset_config,
        epochs=epochs,
        imgsz=img_size,
        batch=16,
        name='traffic_incidents',
        patience=10,
        save=True,
        plots=True,
        device='auto'  # Automatically use GPU if available
    )
    
    logger.info("Training completed!")
    return results

def validate_model(model_path: str, dataset_config: str):
    """Validate trained model"""
    logger.info("Validating model...")
    
    model = YOLO(model_path)
    results = model.val(data=dataset_config)
    
    logger.info(f"Validation mAP50: {results.box.map50}")
    logger.info(f"Validation mAP50-95: {results.box.map}")
    
    return results

def export_model(model_path: str):
    """Export model to different formats"""
    logger.info("Exporting model...")
    
    model = YOLO(model_path)
    
    # Export to ONNX for deployment
    model.export(format='onnx')
    logger.info("Model exported to ONNX format")
    
    # Export to TensorRT if available (for NVIDIA GPUs)
    try:
        model.export(format='engine')
        logger.info("Model exported to TensorRT format")
    except Exception as e:
        logger.warning(f"TensorRT export failed: {e}")

def main():
    """Main training pipeline"""
    print("🚀 YOLOv8 Custom Training for Traffic Incidents")
    print("=" * 50)
    
    # Check if dataset exists
    dataset_path = Path('./datasets/traffic_incidents')
    if not dataset_path.exists():
        print("❌ Dataset not found!")
        print("Please prepare your dataset in the following structure:")
        print("datasets/traffic_incidents/")
        print("├── images/")
        print("│   ├── train/")
        print("│   ├── val/")
        print("│   └── test/")
        print("└── labels/")
        print("    ├── train/")
        print("    ├── val/")
        print("    └── test/")
        print("\nFor dataset preparation, see: https://docs.ultralytics.com/datasets/")
        return
    
    # Create dataset configuration
    config_path = create_dataset_config()
    
    # Train model
    print("Starting training... This may take several hours.")
    results = train_model(config_path, epochs=100)
    
    # Get best model path
    best_model = results.save_dir / 'weights' / 'best.pt'
    
    # Validate model
    validate_model(str(best_model), config_path)
    
    # Export model
    export_model(str(best_model))
    
    print("\n" + "=" * 50)
    print("🎉 Training completed!")
    print(f"Best model saved to: {best_model}")
    print(f"To use the custom model, update yolo_model.py:")
    print(f"  TrafficYOLOModel(model_path='{best_model}')")

if __name__ == "__main__":
    main()