const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/videos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Mock YOLOv8 detection results
const getMockDetections = (filename) => {
  const detectionTypes = [
    { 
      class: 'car_accident', 
      confidence: 0.85 + Math.random() * 0.1, 
      bbox: [120 + Math.random() * 50, 80 + Math.random() * 50, 300 + Math.random() * 50, 200 + Math.random() * 50] 
    },
    { 
      class: 'heavy_traffic', 
      confidence: 0.70 + Math.random() * 0.15, 
      bbox: [50 + Math.random() * 30, 150 + Math.random() * 30, 400 + Math.random() * 40, 300 + Math.random() * 40] 
    },
    { 
      class: 'flood', 
      confidence: 0.80 + Math.random() * 0.15, 
      bbox: [200 + Math.random() * 40, 100 + Math.random() * 40, 500 + Math.random() * 50, 250 + Math.random() * 50] 
    },
    { 
      class: 'blocked_road', 
      confidence: 0.65 + Math.random() * 0.15, 
      bbox: [100 + Math.random() * 50, 200 + Math.random() * 50, 350 + Math.random() * 50, 400 + Math.random() * 50] 
    },
    { 
      class: 'heavy_rain', 
      confidence: 0.75 + Math.random() * 0.2, 
      bbox: [0, 0, 640, 360] 
    },
    { 
      class: 'emergency_vehicle', 
      confidence: 0.90 + Math.random() * 0.08, 
      bbox: [150 + Math.random() * 100, 120 + Math.random() * 80, 250 + Math.random() * 100, 200 + Math.random() * 80] 
    }
  ];

  // Randomly select 1-3 detections
  const numDetections = Math.floor(Math.random() * 2) + 1; // 1-2 detections
  const selectedDetections = [];
  
  for (let i = 0; i < numDetections; i++) {
    const randomIndex = Math.floor(Math.random() * detectionTypes.length);
    const detection = { ...detectionTypes[randomIndex] };
    // Ensure unique detections
    if (!selectedDetections.find(d => d.class === detection.class)) {
      selectedDetections.push(detection);
    }
  }

  return selectedDetections;
};

// Video analysis endpoint
app.post('/api/analyze', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const location = JSON.parse(req.body.location);
    const videoId = Date.now().toString();

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock YOLOv8 analysis results
    const detections = getMockDetections(req.file.filename);

    const response = {
      videoId,
      filename: req.file.filename,
      location,
      detections,
      processedFrames: 100,
      totalFrames: 100,
      status: 'completed',
      analysisTime: (1.5 + Math.random() * 2).toFixed(1) + 's',
      modelVersion: 'YOLOv8n',
      timestamp: new Date().toISOString(),
      processingFps: 30,
      detectionClasses: ['car_accident', 'flood', 'heavy_traffic', 'blocked_road', 'heavy_rain', 'emergency_vehicle']
    };

    res.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze video' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    model: 'YOLOv8n - Traffic & Emergency Detection',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supportedClasses: [
      'car_accident',
      'flood', 
      'heavy_traffic',
      'blocked_road',
      'heavy_rain',
      'emergency_vehicle'
    ],
    processingCapacity: '8 concurrent video streams',
    averageLatency: '150ms'
  });
});

// Serve uploaded videos
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`YOLOv8 Analysis Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});