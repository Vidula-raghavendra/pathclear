import React, { useState, useEffect } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useAuth } from '../contexts/AuthContext';
import TrafficMap from './TrafficMap';
import AlertNotification from './AlertNotification';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  LogOut,
  Clock,
  Shield,
  Zap,
  Activity,
  Bell,
  RefreshCw,
  Camera,      // Added missing import
  TrendingUp   // Added missing import
} from 'lucide-react';
import { Incident } from '../types';

const UserDashboard: React.FC = () => {
  const { incidents } = useIncidents();
  const { logout } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [newDetectionAlert, setNewDetectionAlert] = useState<Incident | null>(null);
  const [alertQueue, setAlertQueue] = useState<Incident[]>([]);

  // Update timestamp when incidents change
  useEffect(() => {
    setLastUpdate(new Date());

    // Check for new AI detections in the last minute
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const veryRecentDetections = incidents.filter(i =>
      i.detectedBy === 'ai' &&
      i.timestamp.getTime() > oneMinuteAgo
    );

    // Add new detections to alert queue
    veryRecentDetections.forEach(detection => {
      if (!alertQueue.find(alert => alert.id === detection.id)) {
        setAlertQueue(prev => [...prev, detection]);
      }
    });
  }, [incidents, alertQueue]);

  // Show alerts from queue
  useEffect(() => {
    if (alertQueue.length > 0 && !newDetectionAlert) {
      setNewDetectionAlert(alertQueue[0]);
      setAlertQueue(prev => prev.slice(1));
    }
  }, [alertQueue, newDetectionAlert]);

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
            Live AI Traffic Monitoring - Hyderabad
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">YOLOv8 Active</span>
            </div>
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
                <Zap className="w-4 h-4 text-blue-600" />
                <span>YOLOv8 Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </span>
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
            {/* THIS IS THE CORRECTED SECTION */}
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="text-orange-600" />
              Active Incidents
              {recentAiDetections.length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full ml-2">
                  <Bell className="w-3 h-3 inline mr-1" />
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
                      YOLOv8 Confidence: {Math.round(incident.confidence * 100)}%
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

        {/* Live AI Detection Alert Banner */}
        {newDetectionAlert && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white mt-8 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <AlertTriangle className="w-8 h-8" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
              </div>
              <div>
                <h3 className="text-xl font-bold">🚨 LIVE YOLOv8 DETECTION ALERT</h3>
                <p className="text-red-100">
                  New {newDetectionAlert.type.replace('_', ' ')} detected just now!
                </p>
              </div>
              <button
                onClick={() => setNewDetectionAlert(null)}
                className="ml-auto text-red-200 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getIncidentTypeIcon(newDetectionAlert.type)}</span>
                <div>
                  <span className="font-bold text-lg capitalize">
                    {newDetectionAlert.type.replace('_', ' ')}
                  </span>
                  {newDetectionAlert.confidence && (
                    <span className="ml-2 bg-white/30 px-2 py-1 rounded text-sm">
                      {Math.round(newDetectionAlert.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>
              <p className="text-red-100 mb-2">{newDetectionAlert.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-100 flex items-center gap-1">
                  <MapPin size={14} />
                  {newDetectionAlert.location.address}
                </p>
                <p className="text-xs text-red-200 flex items-center gap-1">
                  <Camera size={12} />
                  {newDetectionAlert.cctvId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* YOLOv8 System Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Zap className="text-yellow-500" />
            YOLOv8 Detection System Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Cameras</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Camera className="w-6 h-6 text-green-200" />
              </div>
              <p className="text-xs text-green-100 mt-2">Monitoring Hyderabad</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Processing Rate</p>
                  <p className="text-2xl font-bold">30 FPS</p>
                </div>
                <Activity className="w-6 h-6 text-blue-200" />
              </div>
              <p className="text-xs text-blue-100 mt-2">Real-time analysis</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Model Accuracy</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <TrendingUp className="w-6 h-6 text-purple-200" />
              </div>
              <p className="text-xs text-purple-100 mt-2">YOLOv8 performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {newDetectionAlert && (
        <AlertNotification
          incident={newDetectionAlert}
          onClose={() => setNewDetectionAlert(null)}
          autoClose={true}
          duration={8000}
        />
      )}
    </div>
  );
};

export default UserDashboard;