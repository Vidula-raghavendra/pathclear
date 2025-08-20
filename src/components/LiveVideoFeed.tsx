import React, { useState, useRef, useEffect } from 'react';
import { Camera, AlertTriangle, Zap, Eye, Activity } from 'lucide-react';
import { DetectionBox, Incident } from '../types';

interface LiveVideoFeedProps {
  feedId: string;
  feedName: string;
  location: { lat: number; lng: number; address: string };
  onDetection: (incident: Omit<Incident, 'id' | 'timestamp'>) => void;
  isActive: boolean;
}

const LiveVideoFeed: React.FC<LiveVideoFeedProps> = ({
  feedId,
  feedName,
  location,
  onDetection,
  isActive
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<DetectionBox[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);

  // Simulate live video feed with detection
  useEffect(() => {
    if (!isActive) return;

    const analysisInterval = setInterval(() => {
      simulateYOLODetection();
    }, 5000 + Math.random() * 10000); // Every 5-15 seconds

    return () => clearInterval(analysisInterval);
  }, [isActive, location, onDetection]);

  const simulateYOLODetection = () => {
    if (Math.random() > 0.3) return; // 30% chance of detection

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const detectionTypes = [
        {
          class: 'car_accident',
          type: 'accident' as const,
          severity: 'critical' as const,
          descriptions: [
            'Multi-vehicle collision detected',
            'Car crash with debris on road',
            'Vehicle accident blocking traffic',
            'Collision detected at intersection'
          ]
        },
        {
          class: 'flood',
          type: 'flooding' as const,
          severity: 'high' as const,
          descriptions: [
            'Street flooding detected',
            'Water accumulation on roadway',
            'Road inundation from heavy rain',
            'Waterlogging affecting traffic'
          ]
        },
        {
          class: 'heavy_traffic',
          type: 'traffic_jam' as const,
          severity: 'medium' as const,
          descriptions: [
            'Heavy traffic congestion detected',
            'Slow-moving traffic identified',
            'Traffic backup formation',
            'Vehicle queue detected'
          ]
        },
        {
          class: 'heavy_rain',
          type: 'heavy_rain' as const,
          severity: 'medium' as const,
          descriptions: [
            'Heavy rainfall detected',
            'Intense precipitation observed',
            'Weather affecting visibility',
            'Rain impacting road conditions'
          ]
        }
      ];

      const detection = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
      const confidence = 0.75 + Math.random() * 0.2;
      
      const detectionBox: DetectionBox = {
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        width: Math.random() * 150 + 100,
        height: Math.random() * 100 + 80,
        class: detection.class,
        confidence
      };

      setDetections([detectionBox]);
      setLastDetectionTime(new Date());
      setDetectionCount(prev => prev + 1);

      // Create incident
      const incident: Omit<Incident, 'id' | 'timestamp'> = {
        type: detection.type,
        location,
        severity: detection.severity,
        description: detection.descriptions[Math.floor(Math.random() * detection.descriptions.length)],
        status: 'active',
        detectedBy: 'ai',
        cctvId: feedId,
        confidence,
        detectionBoxes: [detectionBox]
      };

      onDetection(incident);
      setIsAnalyzing(false);

      // Clear detection boxes after 10 seconds
      setTimeout(() => {
        setDetections([]);
      }, 10000);
    }, 1000 + Math.random() * 2000); // 1-3 second analysis time
  };

  const drawDetectionBoxes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(box => {
      // Set color based on detection type
      let color = '#F59E0B'; // yellow default
      if (box.class.includes('accident')) color = '#EF4444'; // red
      if (box.class.includes('flood')) color = '#3B82F6'; // blue
      if (box.class.includes('emergency')) color = '#8B5CF6'; // purple

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw label background
      const labelText = `${box.class.replace('_', ' ')} (${Math.round(box.confidence * 100)}%)`;
      const textWidth = ctx.measureText(labelText).width;
      
      ctx.fillStyle = color;
      ctx.fillRect(box.x, box.y - 30, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(labelText, box.x + 5, box.y - 10);
    });
  };

  useEffect(() => {
    drawDetectionBoxes();
  }, [detections]);

  const getStatusColor = () => {
    if (isAnalyzing) return 'bg-yellow-500';
    if (detections.length > 0) return 'bg-red-500';
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isAnalyzing) return 'Analyzing...';
    if (detections.length > 0) return 'Incident Detected';
    return isActive ? 'Monitoring' : 'Offline';
  };

  return (
    <div className="bg-slate-700 rounded-lg overflow-hidden">
      {/* Feed Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-blue-400" />
            <div>
              <h4 className="text-white font-medium">{feedName}</h4>
              <p className="text-slate-400 text-sm">{location.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isActive ? 'animate-pulse' : ''}`} />
            <span className="text-white text-sm">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        {/* Simulated Video Feed */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">Live CCTV Feed</p>
            <p className="text-gray-500 text-sm">{feedName}</p>
          </div>
        </div>

        {/* Detection Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="absolute inset-0 w-full h-full"
        />

        {/* Analysis Indicator */}
        {isAnalyzing && (
          <div className="absolute top-4 left-4 bg-yellow-500/90 text-black px-3 py-2 rounded-lg flex items-center gap-2">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">YOLOv8 Analyzing...</span>
          </div>
        )}

        {/* Detection Alert */}
        {detections.length > 0 && (
          <div className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-2 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {detections.length} Detection{detections.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Live Indicator */}
        {isActive && (
          <div className="absolute bottom-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Feed Stats */}
      <div className="p-4 bg-slate-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-xs">Detections Today</p>
            <p className="text-white font-bold">{detectionCount}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Last Detection</p>
            <p className="text-white font-bold">
              {lastDetectionTime 
                ? `${Math.floor((Date.now() - lastDetectionTime.getTime()) / 60000)}m ago`
                : 'None'
              }
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Status</p>
            <p className="text-white font-bold">
              {isActive ? 'Active' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVideoFeed;