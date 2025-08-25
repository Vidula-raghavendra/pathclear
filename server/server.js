const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// Mock incident types for realistic simulation
const incidentTypes = [
    { type: 'accident', severity: 'high', description: 'Vehicle collision detected' },
    { type: 'traffic_jam', severity: 'medium', description: 'Heavy traffic congestion' },
    { type: 'flooding', severity: 'high', description: 'Water on roadway detected' },
    { type: 'road_closure', severity: 'medium', description: 'Road obstruction detected' },
    { type: 'emergency', severity: 'high', description: 'Emergency vehicle detected' }
];

// Hyderabad locations for realistic simulation
const hyderabadLocations = [
    { lat: 17.4485, lng: 78.3908, area: 'HITEC City' },
    { lat: 17.4126, lng: 78.4482, area: 'Banjara Hills' },
    { lat: 17.4239, lng: 78.4738, area: 'Jubilee Hills' },
    { lat: 17.4399, lng: 78.4983, area: 'Secunderabad' },
    { lat: 17.4435, lng: 78.3479, area: 'Gachibowli' },
    { lat: 17.4847, lng: 78.4056, area: 'Kukatpally' },
    { lat: 17.4483, lng: 78.3915, area: 'Madhapur' },
    { lat: 17.4569, lng: 78.3677, area: 'Kondapur' }
];

// Generate realistic mock analysis results
function generateMockAnalysis(filename, location) {
    const numIncidents = Math.floor(Math.random() * 3) + 1; // 1-3 incidents
    const incidents = [];
    
    for (let i = 0; i < numIncidents; i++) {
        const incident = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
        const locationData = location || hyderabadLocations[Math.floor(Math.random() * hyderabadLocations.length)];
        
        incidents.push({
            id: `incident_${Date.now()}_${i}`,
            type: incident.type,
            severity: incident.severity,
            description: incident.description,
            confidence: (Math.random() * 0.3 + 0.7).toFixed(2), // 0.70-1.00
            timestamp: new Date().toISOString(),
            location: {
                lat: locationData.lat + (Math.random() - 0.5) * 0.01, // Small random offset
                lng: locationData.lng + (Math.random() - 0.5) * 0.01,
                area: locationData.area
            },
            bounding_box: {
                x: Math.floor(Math.random() * 400),
                y: Math.floor(Math.random() * 300),
                width: Math.floor(Math.random() * 200) + 100,
                height: Math.floor(Math.random() * 150) + 75
            }
        });
    }
    
    return {
        status: 'success',
        video_file: filename,
        analysis_complete: true,
        processing_time: (Math.random() * 5 + 2).toFixed(1) + 's',
        incidents_detected: incidents.length,
        incidents: incidents,
        metadata: {
            video_duration: (Math.random() * 120 + 30).toFixed(1) + 's',
            fps: 30,
            resolution: '1920x1080',
            analyzed_frames: Math.floor(Math.random() * 1000) + 500
        }
    };
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        message: 'YOLOv8 Analysis Server is running',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/analyze', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'No video file uploaded' 
            });
        }

        console.log(`📹 Analyzing video: ${req.file.filename}`);
        console.log(`📍 Location: ${req.body.location || 'Auto-detected'}`);

        // Parse location if provided
        let location = null;
        if (req.body.location) {
            try {
                location = JSON.parse(req.body.location);
            } catch (e) {
                console.log('Could not parse location, using random location');
            }
        }

        // Simulate processing delay
        setTimeout(() => {
            const analysis = generateMockAnalysis(req.file.filename, location);
            console.log(`✅ Analysis complete: ${analysis.incidents_detected} incidents detected`);
        }, 1000);

        // Return immediate response with analysis
        const analysis = generateMockAnalysis(req.file.filename, location);
        res.json(analysis);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Analysis failed',
            error: error.message 
        });
    }
});

// Serve uploaded videos
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Traffic Analysis Server Started');
    console.log('================================');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log('🤖 AI Model: YOLOv8 (Mock Analysis)');
    console.log('🗺️  Location: Hyderabad Traffic Monitoring');
    console.log('📹 Ready to analyze CCTV footage');
    console.log('================================');
});

module.exports = app;