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
    { class: 'car_accident', confidence: 0.89, bbox: [120, 80, 300, 200] },
    { class: 'heavy_traffic', confidence: 0.76, bbox: [50, 150, 400, 300] },
    { class: 'flood', confidence: 0.92, bbox: [200, 100, 500, 250] },
    { class: 'blocked_road', confidence: 0.68, bbox: [100, 200, 350, 400] }
  ];

  // Randomly select 1-3 detections
  const numDetections = Math.floor(Math.random() * 3) + 1;
  const selectedDetections = [];
  
  for (let i = 0; i < numDetections; i++) {
    const randomIndex = Math.floor(Math.random() * detectionTypes.length);
    selectedDetections.push(detectionTypes[randomIndex]);
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
      analysisTime: '2.3s',
      modelVersion: 'YOLOv8n'
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
    model: 'YOLOv8n',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve uploaded videos
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`YOLOv8 Analysis Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});