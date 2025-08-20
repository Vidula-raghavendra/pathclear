export interface User {
  id: string;
  email?: string;
  rollNumber?: string;
  role: 'admin' | 'user';
  name: string;
  department?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  identifier: string; // email for users, roll number for admins
  password: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface Incident {
  id: string;
  type: 'accident' | 'flooding' | 'heavy_rain' | 'traffic_jam' | 'road_closure' | 'emergency';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'monitoring';
  detectedBy: 'ai' | 'manual' | 'user_report';
  cctvId?: string;
  confidence?: number;
  videoUrl?: string;
  detectionBoxes?: DetectionBox[];
}

export interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

export interface YOLODetection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface VideoAnalysis {
  videoId: string;
  detections: YOLODetection[];
  incidents: Incident[];
  processedFrames: number;
  totalFrames: number;
  status: 'processing' | 'completed' | 'error';
}

export interface CCTVFeed {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'online' | 'offline' | 'maintenance';
  videoUrl?: string;
  isLive?: boolean;
  lastDetection?: {
    type: string;
    confidence: number;
    timestamp: Date;
    detectionBoxes?: DetectionBox[];
  };
}

export interface VideoUpload {
  file: File;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  cctvId: string;
  name: string;
}