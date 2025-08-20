import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, MapPin, Camera, Clock } from 'lucide-react';
import { Incident } from '../types';

interface AlertNotificationProps {
  incident: Incident;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const AlertNotification: React.FC<AlertNotificationProps> = ({
  incident,
  onClose,
  autoClose = true,
  duration = 8000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 border-red-600 text-white';
      case 'high':
        return 'bg-orange-500 border-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-500 border-yellow-600 text-white';
      default:
        return 'bg-blue-500 border-blue-600 text-white';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'accident': return '🚗';
      case 'flooding': return '🌊';
      case 'heavy_rain': return '🌧️';
      case 'traffic_jam': return '🚦';
      case 'road_closure': return '🚧';
      case 'emergency': return '🚨';
      default: return '⚠️';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`rounded-lg border-2 p-4 shadow-2xl ${getSeverityStyles(incident.severity)}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm">LIVE AI DETECTION</span>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/80 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getIncidentIcon(incident.type)}</span>
            <span className="font-semibold capitalize">
              {incident.type.replace('_', ' ')}
            </span>
            <span className="bg-white/20 px-2 py-1 rounded text-xs">
              {incident.severity.toUpperCase()}
            </span>
          </div>

          <p className="text-sm opacity-90">{incident.description}</p>

          <div className="space-y-1 text-xs opacity-80">
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{incident.location.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera size={12} />
              <span>{incident.cctvId}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Just detected</span>
            </div>
            {incident.confidence && (
              <div className="flex items-center gap-1">
                <span>🤖</span>
                <span>YOLOv8 Confidence: {Math.round(incident.confidence * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="mt-3 w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-100"
              style={{
                width: `${100 - ((Date.now() - incident.timestamp.getTime()) / duration) * 100}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertNotification;