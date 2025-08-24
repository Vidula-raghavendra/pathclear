import React, { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useAuth } from '../contexts/AuthContext';
import VideoUpload from './VideoUpload';
import VideoPlayer from './VideoPlayer';
import TrafficMap from './TrafficMap';
import { 
  Camera, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Eye, 
  Settings,
  Activity,
  LogOut,
  Upload,
  Users
} from 'lucide-react';
import { Incident, CCTVFeed } from '../types';

const AdminDashboard: React.FC = () => {
  const { incidents, updateIncidentStatus } = useIncidents();
  const { logout } = useAuth();
  const [cctvFeeds, setCctvFeeds] = useState<CCTVFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<CCTVFeed | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'monitor' | 'map'>('upload');

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
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

  const handleAnalysisComplete = (result: { analysis: any; cctvFeed: CCTVFeed }) => {
    setCctvFeeds(prev => [...prev, result.cctvFeed]);
    setSelectedFeed(result.cctvFeed);
    setActiveTab('monitor');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Traffic Monitor - Admin</h1>
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

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 p-6 h-[calc(100vh-80px)] overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle size={20} />
                <span className="font-medium">Critical Incidents</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {criticalIncidents.length}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Activity size={20} />
                <span className="font-medium">Active Incidents</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {activeIncidents.length}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Camera size={20} />
                <span className="font-medium">CCTV Feeds</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {cctvFeeds.length}
              </div>
            </div>
          </div>

          {/* CCTV Feeds */}
          <div className="mb-8">
            <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <Camera size={18} />
              CCTV Feeds
            </h3>
            <div className="space-y-3">
              {cctvFeeds.map(feed => (
                <div
                  key={feed.id}
                  onClick={() => setSelectedFeed(feed)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedFeed?.id === feed.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900 font-medium text-sm">
                      {feed.name}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      feed.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <p className="text-gray-600 text-xs">
                    {feed.location.address}
                  </p>
                  {feed.lastDetection && (
                    <div className="mt-2 text-xs text-orange-600">
                      Last: {getIncidentTypeIcon(feed.lastDetection.type)} 
                      {Math.floor((Date.now() - feed.lastDetection.timestamp.getTime()) / 60000)}m ago
                    </div>
                  )}
                </div>
              ))}
              {cctvFeeds.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No CCTV feeds uploaded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Incidents */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle size={18} />
              Recent Incidents
            </h3>
            <div className="space-y-3">
              {incidents.slice(0, 5).map(incident => (
                <div key={incident.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getIncidentTypeIcon(incident.type)}</span>
                      <span className="text-gray-900 text-sm font-medium capitalize">
                        {incident.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)}`} />
                  </div>
                  <p className="text-gray-600 text-xs mb-2">
                    {incident.location.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {Math.floor((Date.now() - incident.timestamp.getTime()) / 60000)}m ago
                    </span>
                    <select
                      value={incident.status}
                      onChange={(e) => updateIncidentStatus(incident.id, e.target.value as Incident['status'])}
                      className="bg-white border border-gray-300 text-gray-900 text-xs px-2 py-1 rounded"
                    >
                      <option value="active">Active</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Tab Navigation */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'upload' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload size={16} />
              Upload Video
            </button>
            <button
              onClick={() => setActiveTab('monitor')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'monitor' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} />
              Monitor Feeds
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin size={16} />
              Live Map
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <VideoUpload onAnalysisComplete={handleAnalysisComplete} />
            </div>
          )}

          {activeTab === 'monitor' && selectedFeed && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <Eye className="text-blue-600" />
                  {selectedFeed.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  {selectedFeed.location.address}
                </div>
              </div>

              {selectedFeed.videoUrl ? (
                <VideoPlayer
                  videoUrl={selectedFeed.videoUrl}
                  detectionBoxes={selectedFeed.lastDetection?.detectionBoxes}
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No video uploaded</p>
                    <p className="text-gray-500 text-sm">Upload a video to start monitoring</p>
                  </div>
                </div>
              )}

              {/* Detection Info */}
              {selectedFeed.lastDetection && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <h4 className="text-gray-900 font-medium mb-2">Latest Detection</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Type</p>
                      <p className="text-gray-900 capitalize">
                        {getIncidentTypeIcon(selectedFeed.lastDetection.type)} 
                        {selectedFeed.lastDetection.type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Confidence</p>
                      <p className="text-gray-900">
                        {Math.round(selectedFeed.lastDetection.confidence * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Detected</p>
                      <p className="text-gray-900">
                        {Math.floor((Date.now() - selectedFeed.lastDetection.timestamp.getTime()) / 60000)}m ago
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <MapPin className="text-blue-600" />
                Incident Map - Hyderabad
              </h2>
              <TrafficMap 
                incidents={incidents} 
                center={{ lat: 17.3850, lng: 78.4867 }}
                height="600px"
              />
            </div>
          )}

          {!selectedFeed && activeTab === 'monitor' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 text-lg font-medium mb-2">No CCTV Feed Selected</h3>
              <p className="text-gray-600 mb-4">Upload a video first or select a feed from the sidebar</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Upload Video
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;