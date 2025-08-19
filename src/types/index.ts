export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
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
  lastDetection?: {
    type: string;
    confidence: number;
    timestamp: Date;
  };
}

export interface RouteAnalysis {
  route: Array<{ lat: number; lng: number }>;
  incidents: Incident[];
  estimatedDelay: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}