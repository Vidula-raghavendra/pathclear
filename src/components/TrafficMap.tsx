import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '../types';
import { MapPin, AlertTriangle, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TrafficMapProps {
  incidents: Incident[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

const TrafficMap: React.FC<TrafficMapProps> = ({ 
  incidents, 
  center = { lat: 17.3850, lng: 78.4867 }, // Hyderabad center
  zoom = 12,
  height = '500px'
}) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const createCustomIcon = (incident: Incident) => {
    let color = '#10B981'; // green
    let emoji = '⚠️';

    switch (incident.type) {
      case 'accident':
        color = '#EF4444'; // red
        emoji = '🚗';
        break;
      case 'flooding':
        color = '#3B82F6'; // blue
        emoji = '🌊';
        break;
      case 'traffic_jam':
        color = '#F59E0B'; // amber
        emoji = '🚦';
        break;
      case 'road_closure':
        color = '#8B5CF6'; // purple
        emoji = '🚧';
        break;
      case 'emergency':
        color = '#EF4444'; // red
        emoji = '🚨';
        break;
    }

    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-incident-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

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

  return (
    <div className="relative">
      <div style={{ height }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {incidents.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.location.lat, incident.location.lng]}
              icon={createCustomIcon(incident)}
            >
              <Popup>
                <div className="p-3 max-w-sm">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                      <span>{getIncidentTypeIcon(incident.type)}</span>
                      {incident.type.replace('_', ' ')}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadgeColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                    <MapPin size={12} />
                    {incident.location.address}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                    <Clock size={12} />
                    {Math.floor((Date.now() - incident.timestamp.getTime()) / 60000)}m ago
                  </div>
                  {incident.confidence && (
                    <div className="text-xs text-blue-600 font-medium">
                      AI Confidence: {Math.round(incident.confidence * 100)}%
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-600">
                    Status: <span className="capitalize font-medium">{incident.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-[1000]">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="text-blue-600" size={16} />
          Incident Types
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚗</span>
            <span className="text-gray-700">Accidents</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌊</span>
            <span className="text-gray-700">Flooding</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚦</span>
            <span className="text-gray-700">Traffic Jams</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚧</span>
            <span className="text-gray-700">Road Closures</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <span className="text-gray-700">Emergency</span>
          </div>
        </div>
        
        {/* Live Status Indicator */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Live Updates</span>
          </div>
        </div>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 z-[1000]">
        Powered by OpenStreetMap
      </div>
    </div>
  );
};

export default TrafficMap;