import React, { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useAuth } from '../contexts/AuthContext';
import TrafficMap from './TrafficMap';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  LogOut,
  Clock,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import { Incident } from '../types';

const UserDashboard: React.FC = () => {
  const { incidents } = useIncidents();
  const { logout } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Update timestamp when incidents change
  useEffect(() => {
    setLastUpdate(new Date());
  }, [incidents]);

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  const aiDetections = incidents.filter(i => i.detectedBy === 'ai');
  const recentAiDetections = incidents.filter(i => 
    i.detectedBy === 'ai' && 
    Date.now() - i.timestamp.getTime() < 30 * 60 * 1000 // Last 30 minutes
  );

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Hyderabad Traffic Monitor</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="text-blue-600" />
            Live Traffic Status - Hyderabad
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Critical Incidents</p>
                  <p className="text-3xl font-bold">{criticalIncidents.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Active Incidents</p>
                  <p className="text-3xl font-bold">{activeIncidents.length}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">AI Detections</p>
                  <p className="text-3xl font-bold">{aiDetections.length}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-200" />
              </div>
              {recentAiDetections.length > 0 && (
                <div className="mt-2 text-xs text-blue-100 flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse" />
                  {recentAiDetections.length} new in last 30min
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Areas Clear</p>
                  <p className="text-3xl font-bold">{8 - activeIncidents.length}</p>
                </div>
                <Shield className="w-8 h-8 text-green-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Traffic Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <MapPin className="text-red-600" />
              Live Traffic Map - Hyderabad
            </h3>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live AI Detection Updates</span>
              </div>
              <div className="text-xs text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            <TrafficMap 
              incidents={incidents} 
              center={{ lat: 17.3850, lng: 78.4867 }}
              height="400px"
            />
          </div>

          {/* Active Incidents */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="text-orange-600" />
              Active Incidents
              {recentAiDetections.length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {recentAiDetections.length} new
                </span>
              )}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeIncidents.map(incident => (
                <div key={incident.id} className={`p-4 border-l-4 rounded-r-lg ${getSeverityColor(incident.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getIncidentTypeIcon(incident.type)}</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {incident.type.replace('_', ' ')}
                      </span>
                      {incident.detectedBy === 'ai' && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Zap size={10} />
                          AI
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.floor((Date.now() - incident.timestamp.getTime()) / 60000)}m ago
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{incident.description}</p>
                  {incident.confidence && (
                    <p className="text-xs text-blue-600 mb-1">
                      AI Confidence: {Math.round(incident.confidence * 100)}%
                    </p>
                  )}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={12} />
                    {incident.location.address}
                  </p>
                </div>
              ))}
              {activeIncidents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No active incidents in your area</p>
                  <p className="text-sm">All clear for safe travel!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Detection Alert Banner */}
        {recentAiDetections.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Recent AI Detections</h3>
                <p className="text-red-100">
                  {recentAiDetections.length} new incident{recentAiDetections.length > 1 ? 's' : ''} detected in the last 30 minutes
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentAiDetections.slice(0, 2).map(incident => (
                <div key={incident.id} className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getIncidentTypeIcon(incident.type)}</span>
                    <span className="font-medium capitalize">
                      {incident.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-red-100 mb-1">{incident.location.address}</p>
                  <p className="text-xs text-red-200">
                    Detected {Math.floor((Date.now() - incident.timestamp.getTime()) / 60000)} minutes ago
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;