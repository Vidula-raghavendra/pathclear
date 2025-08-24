# YOLOv8 Traffic Analysis Server

A real-time traffic incident detection system using YOLOv8 deep learning model.

## Features

- **Real YOLOv8 Model**: Uses Ultralytics YOLOv8 for object detection
- **Traffic Incident Detection**: Detects accidents, traffic jams, blocked roads, emergency vehicles
- **GPU Acceleration**: Automatic CUDA support for faster inference
- **Video Analysis**: Process entire video files for incident detection
- **REST API**: Flask-based API for integration with frontend

## Installation

### Prerequisites

- Python 3.8 or higher
- CUDA-capable GPU (optional, for faster inference)

### Quick Setup

1. **Run the setup script:**
   ```bash
   python setup.py
   ```

2. **Or install manually:**
   ```bash
   pip install -r requirements.txt
   ```

### Manual Installation

```bash
# Install PyTorch (choose appropriate version for your system)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Install YOLOv8 and dependencies
pip install ultralytics opencv-python flask flask-cors numpy pillow

# Download YOLOv8 model (happens automatically on first run)
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

## Usage

### Start the Server

```bash
python flask_server.py
```

The server will start on `http://localhost:5000`

### API Endpoints

#### Health Check
```bash
curl http://localhost:5000/api/health
```

#### Analyze Video
```bash
curl -X POST \
  -F "video=@path/to/video.mp4" \
  -F "location={\"lat\":17.3850,\"lng\":78.4867,\"address\":\"Hyderabad\"}" \
  http://localhost:5000/api/analyze
```

#### Model Information
```bash
curl http://localhost:5000/api/model/info
```

## Model Details

### Detection Classes

The model detects the following traffic incidents:

1. **Traffic Jam**: Heavy congestion with multiple vehicles
2. **Car Accident**: Vehicle collisions or unusual positioning
3. **Blocked Road**: Road blockages preventing normal traffic flow
4. **Emergency Vehicle**: Ambulances, fire trucks, police cars

### Performance

- **Model**: YOLOv8n (nano) - optimized for speed
- **Inference Speed**: ~30 FPS on GPU, ~5 FPS on CPU
- **Accuracy**: mAP50 varies by incident type
- **Memory Usage**: ~2GB GPU memory

### Detection Logic

1. **Object Detection**: YOLOv8 detects vehicles, people, traffic signs
2. **Incident Analysis**: Custom algorithms analyze detections for incidents:
   - **Traffic Jam**: Vehicle density > threshold
   - **Accident**: Overlapping vehicles or unusual positioning
   - **Blocked Road**: Vehicles covering >80% of frame width
   - **Emergency**: Large vehicles with high confidence (placeholder)

## Custom Training

To train on your own dataset:

1. **Prepare Dataset**: Follow YOLO format with images and labels
2. **Run Training Script**:
   ```bash
   python train_custom_model.py
   ```

### Dataset Structure
```
datasets/traffic_incidents/
├── images/
│   ├── train/
│   ├── val/
│   └── test/
└── labels/
    ├── train/
    ├── val/
    └── test/
```

## Configuration

### Model Configuration

Edit `yolo_model.py` to adjust:

- **Confidence Threshold**: Minimum detection confidence
- **Incident Thresholds**: Sensitivity for different incident types
- **Model Size**: Switch between YOLOv8n/s/m/l/x for speed vs accuracy

### Server Configuration

Edit `flask_server.py` to adjust:

- **Upload Limits**: Maximum file size
- **Supported Formats**: Video file types
- **Sampling Rate**: Frame analysis frequency

## Performance Optimization

### GPU Acceleration

Ensure CUDA is installed:
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

### Model Optimization

1. **Use Larger Models**: YOLOv8s/m/l/x for better accuracy
2. **TensorRT**: Export to TensorRT for NVIDIA GPUs
3. **ONNX**: Export to ONNX for cross-platform deployment

```python
# Export optimized models
model = YOLO('best.pt')
model.export(format='onnx')      # Cross-platform
model.export(format='engine')    # TensorRT (NVIDIA)
```

## Troubleshooting

### Common Issues

1. **CUDA Out of Memory**: Reduce batch size or use smaller model
2. **Slow Inference**: Check GPU availability, use smaller model
3. **Poor Detection**: Adjust confidence thresholds, train custom model
4. **Video Format Issues**: Convert to MP4 with H.264 codec

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Integration

### Frontend Integration

The server is designed to work with the React frontend. Update the frontend's YOLO service endpoint:

```typescript
// src/services/yoloService.ts
const apiEndpoint = 'http://localhost:5000/api/analyze';
```

### Production Deployment

For production:

1. **Use WSGI Server**: Gunicorn, uWSGI
2. **Add Authentication**: API keys, JWT tokens
3. **Scale Horizontally**: Multiple server instances
4. **Use Load Balancer**: Nginx, HAProxy
5. **Monitor Performance**: Prometheus, Grafana

## License

This project uses:
- **Ultralytics YOLOv8**: AGPL-3.0 License
- **OpenCV**: Apache 2.0 License
- **PyTorch**: BSD License

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review Ultralytics YOLOv8 documentation
- Open GitHub issue with detailed description