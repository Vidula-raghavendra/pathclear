import React, { useState, useEffect } from 'react';
import { Incident } from '../types';
import LiveVideoFeed from './LiveVideoFeed';
import { 
  Activity, 
  AlertTriangle, 
  Camera, 
  Clock, 
  MapPin, 
  Zap,
  Eye,
  TrendingUp,
  Grid3X3
} from 'lucide-react';

interface LiveDetectionFeedProps {
  incidents: Incident[];
  isActive: boolean;
  onNewDetection: (incident: Omit<Incident, 'id' | 'timestamp'>) => void;
}

const LiveDetectionFeed: React.FC<LiveDetectionFeedProps> = ({ incidents, isActive, onNewDetection }) => {
  const [recentDetections, setRecentDetections] = useState<Incident[]>([]);
  const [activeFeeds, setActiveFeeds] = useState(8);
  const [processingStats, setProcessingStats] = useState({
    framesProcessed: 0,
    detectionsToday: 0,
    averageConfidence: 0
  });

  // Hyderabad CCTV locations
  const cctvLocations = [
    { id: 'cctv-001', name: 'HITEC City Junction', lat: 17.4435, lng: 78.3772, address: 'HITEC City, Hyderabad' },
    { id: 'cctv-002', name: 'Banjara Hills Main Road', lat: 17.4126, lng: 78.4482, address: 'Banjara Hills, Hyderabad' },
    { id: 'cctv-003', name: 'Jubilee Hills Circle', lat: 17.4239, lng: 78.4738, address: 'Jubilee Hills, Hyderabad' },
    { id: 'cctv-004', name: 'Secunderabad Station', lat: 17.5040, lng: 78.5030, address: 'Secunderabad, Hyderabad' },
    { id: 'cctv-005', name: 'Gachibowli Flyover', lat: 17.4399, lng: 78.3489, address: 'Gachibowli, Hyderabad' },
    { id: 'cctv-006', name: 'Kukatpally Metro', lat: 17.4840, lng: 78.4070, address: 'Kukatpally, Hyderabad' },
    { id: 'cctv-007', name: 'Madhapur Signal', lat: 17.4483, lng: 78.3915, address: 'Madhapur, Hyderabad' },
    { id: 'cctv-008', name: 'Kondapur Junction', lat: 17.4616, lng: 78.3670, address: 'Kondapur, Hyderabad' }
  ];
  useEffect(() => {
    // Filter recent AI detections (last 2 hours)
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const recent = incidents
      .filter(i => i.detectedBy === 'ai' && i.timestamp.getTime() > twoHoursAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    setRecentDetections(recent);

    // Calculate stats
    const aiDetections = incidents.filter(i => i.detectedBy === 'ai');
    const avgConfidence = aiDetections.length > 0 
      ? aiDetections.reduce((sum, i) => sum + (i.confidence || 0), 0) / aiDetections.length
      : 0;

    setProcessingStats({
      framesProcessed: Math.floor(Math.random() * 10000) + 150000,
      detectionsToday: aiDetections.length,
      averageConfidence: avgConfidence
    });
  }, [incidents]);

  const getIncidentTypeIcon = (type: string) => {
    switch (type) {
      case 'accident': return '🚗';
      case 'flooding': return '🌊';
      case 'heavy_rain': return '🌧️';
      case 'traffic_jam': return '🚦';
      case 'road_closure': return '🚧';
      default: return '⚠️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-green-500 bg-green-50';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* YOLOv8 Status Header */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="text-yellow-400" />
            YOLOv8 Live Detection System - Hyderabad
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-white font-medium">
              {isActive ? `${activeFeeds} Feeds Active` : 'System Inactive'}
            </span>
          </div>
        </div>

        {/* Processing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Eye size={20} />
              <span className="font-medium">Frames Processed</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {processingStats.framesProcessed.toLocaleString()}
            </div>
            <p className="text-slate-400 text-sm">Today</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <TrendingUp size={20} />
              <span className="font-medium">Detections</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {processingStats.detectionsToday}
            </div>
            <p className="text-slate-400 text-sm">AI Incidents Found</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Activity size={20} />
              <span className="font-medium">Avg Confidence</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round(processingStats.averageConfidence * 100)}%
            </div>
            <p className="text-slate-400 text-sm">Model Accuracy</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Camera size={20} />
              <span className="font-medium">Active Feeds</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {activeFeeds}
            </div>
            <p className="text-slate-400 text-sm">CCTV Cameras</p>
          </div>
        </div>
      </div>

      {/* Live Video Feeds Grid */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
          <Grid3X3 className="text-blue-400" />
          Live CCTV Feeds - Real-time YOLOv8 Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cctvLocations.map(feed => (
            <LiveVideoFeed
              key={feed.id}
              feedId={feed.id}
              feedName={feed.name}
              location={feed}
              onDetection={onNewDetection}
              isActive={isActive}
            />
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-slate-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">YOLOv8 Model Status</span>
            </div>
            <div className="text-slate-400 text-sm">
              Processing {activeFeeds} video streams simultaneously
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Detection classes: Accidents, Flooding, Heavy Traffic, Weather Conditions, Emergency Vehicles
          </div>
        </div>
      </div>
      {/* Live Detection Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Detections */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <AlertTriangle className="text-orange-400" />
            Recent AI Detections
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentDetections.map(incident => (
              <div key={incident.id} className={`bg-slate-700 rounded-lg p-4 border-l-4 ${
                incident.severity === 'critical' ? 'border-red-500' :
                incident.severity === 'high' ? 'border-orange-500' :
                incident.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getIncidentTypeIcon(incident.type)}</span>
                    <span className="font-medium text-white capitalize">
                      {incident.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadgeColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      {Math.floor((Date.now() - incident.timestamp.getTime()) / 60000)}m ago
                    </div>
                    {incident.confidence && (
                      <div className="text-xs text-green-400 font-medium">
                        {Math.round(incident.confidence * 100)}% confidence
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-2">{incident.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <MapPin size={12} />
                    {incident.location.address}
                  </p>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <Camera size={12} />
                    {incident.cctvId}
                  </p>
                </div>
                {incident.detectionBoxes && incident.detectionBoxes.length > 0 && (
                  <div className="mt-2 text-xs text-blue-400">
                    Bounding boxes: {incident.detectionBoxes.length} object{incident.detectionBoxes.length > 1 ? 's' : ''} detected
                  </div>
                )}
              </div>
            ))}
            {recentDetections.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-2" />
                <p>No recent AI detections</p>
                <p className="text-sm">System is monitoring for incidents...</p>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Detection Analytics */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <TrendingUp className="text-green-400" />
            Real-time Analytics
          </h3>
          
          <div className="space-y-4">
            {[
              { type: 'accident', name: 'Vehicle Accidents', icon: '🚗', color: 'bg-red-500' },
              { type: 'flooding', name: 'Street Flooding', icon: '🌊', color: 'bg-blue-500' },
              { type: 'traffic_jam', name: 'Traffic Congestion', icon: '🚦', color: 'bg-yellow-500' },
              { type: 'heavy_rain', name: 'Heavy Rainfall', icon: '🌧️', color: 'bg-gray-500' },
              { type: 'road_closure', name: 'Road Closures', icon: '🚧', color: 'bg-purple-500' },
              { type: 'emergency', name: 'Emergency Vehicles', icon: '🚨', color: 'bg-red-600' }
            ].map(category => {
              const count = incidents.filter(i => i.type === category.type && i.detectedBy === 'ai').length;
              const recentCount = recentDetections.filter(i => i.type === category.type).length;
              const avgConfidence = incidents
                .filter(i => i.type === category.type && i.confidence)
                .reduce((sum, i) => sum + (i.confidence || 0), 0) / 
                Math.max(1, incidents.filter(i => i.type === category.type && i.confidence).length);
              
              return (
                <div key={category.type} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{category.name}</h4>
                        <p className="text-slate-400 text-sm">
                          Avg Confidence: {Math.round(avgConfidence * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{count}</div>
                      <div className="text-slate-400 text-xs">Total detected</div>
                    </div>
                  </div>
                  {recentCount > 0 && (
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      {recentCount} recent detection{recentCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LiveDetectionFeed;