import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps-api';
import { Incident } from '../types';
import { MapPin, AlertTriangle, Clock } from 'lucide-react';

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

  const mapContainerStyle = {
    width: '100%',
    height
  };

  const getMarkerIcon = (incident: Incident) => {
    const baseUrl = 'data:image/svg+xml;base64,';
    let color = '#10B981'; // green
    let symbol = '⚠️';

    switch (incident.type) {
      case 'accident':
        color = '#EF4444'; // red
        symbol = '🚗';
        break;
      case 'flooding':
        color = '#3B82F6'; // blue
        symbol = '🌊';
        break;
      case 'traffic_jam':
        color = '#F59E0B'; // amber
        symbol = '🚦';
        break;
      case 'road_closure':
        color = '#8B5CF6'; // purple
        symbol = '🚧';
        break;
      case 'emergency':
        color = '#EF4444'; // red
        symbol = '🚨';
        break;
    }

    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="20" y="26" text-anchor="middle" font-size="16" fill="white">${symbol}</text>
      </svg>
    `;

    return {
      url: baseUrl + btoa(svg),
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    };
  };

  const onMarkerClick = useCallback((incident: Incident) => {
    setSelectedIncident(incident);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedIncident(null);
  }, []);

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="relative">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true
          }}
        >
          {incidents.map((incident) => (
            <Marker
              key={incident.id}
              position={{ lat: incident.location.lat, lng: incident.location.lng }}
              icon={getMarkerIcon(incident)}
              onClick={() => onMarkerClick(incident)}
            />
          ))}

          {selectedIncident && (
            <InfoWindow
              position={{
                lat: selectedIncident.location.lat,
                lng: selectedIncident.location.lng
              }}
              onCloseClick={onInfoWindowClose}
            >
              <div className="p-3 max-w-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {selectedIncident.type.replace('_', ' ')}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadgeColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-2">
                  {selectedIncident.description}
                </p>
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                  <MapPin size={12} />
                  {selectedIncident.location.address}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                  <Clock size={12} />
                  {Math.floor((Date.now() - selectedIncident.timestamp.getTime()) / 60000)}m ago
                </div>
                {selectedIncident.confidence && (
                  <div className="text-xs text-blue-600">
                    AI Confidence: {Math.round(selectedIncident.confidence * 100)}%
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h4 className="font-semibold text-gray-900 mb-3">Incident Types</h4>
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
      </div>
    </div>
  );
};

export default TrafficMap;