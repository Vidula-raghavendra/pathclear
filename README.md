# Hyderabad Traffic Monitor - AI-Powered CCTV Analysis

An advanced traffic monitoring system for Hyderabad that uses YOLOv8 AI model to analyze CCTV footage and detect traffic incidents in real-time.

## Features

### 🤖 AI-Powered Detection
- **YOLOv8 Integration**: Real-time analysis of CCTV footage
- **Multi-Class Detection**: Accidents, flooding, traffic jams, road closures, emergencies
- **Confidence Scoring**: AI confidence levels for each detection
- **Bounding Box Visualization**: Visual overlay of detected objects

### 🗺️ Interactive Maps
- **Google Maps Integration**: Real-time incident mapping for Hyderabad
- **Location-Specific Markers**: Different icons for different incident types
- **Info Windows**: Detailed incident information on map markers
- **Hyderabad-Focused**: Pre-configured locations across the city

### 👥 Role-Based Access
- **Admin Dashboard**: Upload videos, monitor feeds, manage incidents
- **User Dashboard**: View live traffic map and incident alerts
- **Secure Authentication**: Role-based login system

### 📹 Video Management
- **Video Upload**: Support for MP4, AVI, MOV formats up to 500MB
- **Real-time Analysis**: Automatic processing with YOLOv8
- **Video Playback**: Custom player with detection overlays
- **Progress Tracking**: Upload and analysis progress indicators

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Maps**: Google Maps API
- **AI Model**: YOLOv8 (via REST API)
- **Backend**: Express.js server for video processing
- **Authentication**: Custom role-based auth system

## Setup Instructions

### 1. Environment Variables
Create a `.env` file with:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_YOLO_API_ENDPOINT=http://localhost:5000/api/analyze
```

### 2. Install Dependencies
```bash
npm install
cd server && npm install
```

### 3. Start the YOLOv8 Analysis Server
```bash
cd server
npm run dev
```

### 4. Start the Frontend
```bash
npm run dev
```

## Usage

### For Admins
1. Login with admin credentials
2. Upload CCTV footage with location details
3. Monitor real-time AI analysis results
4. View incidents on the interactive map
5. Manage incident status and responses

### For Users
1. Login with user credentials
2. View live traffic map of Hyderabad
3. See real-time incident alerts
4. Check traffic conditions before traveling

## Hyderabad Locations Covered

- HITEC City
- Banjara Hills
- Jubilee Hills
- Secunderabad
- Gachibowli
- Kukatpally
- Madhapur
- Kondapur

## AI Detection Classes

- **Accidents**: Car collisions, crashed vehicles
- **Flooding**: Water on roads, street flooding
- **Traffic Jams**: Heavy congestion, slow-moving traffic
- **Road Closures**: Construction, blocked roads
- **Emergency**: Emergency vehicles, urgent situations

## Demo Credentials

**Admin Access:**
- Roll Number: `ADM001`
- Password: `admin123!`

**User Access:**
- Email: `user@traffic-monitor.com`
- Password: `user123!`

## API Endpoints

- `POST /api/analyze` - Upload and analyze video
- `GET /api/health` - Check server status
- `GET /uploads/:filename` - Serve uploaded videos

## Future Enhancements

- Real YOLOv8 model integration
- Live CCTV stream processing
- Mobile app for field officers
- SMS/Email alert system
- Traffic prediction algorithms
- Integration with city traffic management systems