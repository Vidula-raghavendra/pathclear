import React, { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useAuth } from '../contexts/AuthContext';
import VideoUpload from './VideoUpload';
import VideoPlayer from './VideoPlayer';
import TrafficMap from './TrafficMap';
import LiveDetectionFeed from './LiveDetectionFeed';
import { 
  Camera, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Eye, 
  Settings,
  TrendingUp,
  Activity,
  LogOut,
  RefreshCw,
  Upload
} from 'lucide-react';
import { Incident, CCTVFeed } from '../types';

const AdminDashboard: React.FC = () => {
  const { incidents, updateIncidentStatus, realTimeDetections } = useIncidents();
  const { logout } = useAuth();
  const [cctvFeeds, setCctvFeeds] = useState<CCTVFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<CCTVFeed | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'monitor' | 'map' | 'live'>('live');

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  const aiDetections = incidents.filter(i => i.detectedBy === 'ai');

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
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Hyderabad Traffic Monitor - Admin</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-slate-800 border-r border-slate-700 p-4 h-[calc(100vh-80px)] overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle size={20} />
                <span className="font-medium">Critical</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {criticalIncidents.length}
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Activity size={20} />
                <span className="font-medium">Active</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {activeIncidents.length}
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Camera size={20} />
                <span className="font-medium">AI Detections</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {aiDetections.length}
              </div>
            </div>
          </div>

          {/* CCTV Feeds */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Camera size={18} />
              CCTV Feeds
            </h3>
            <div className="space-y-2">
              {cctvFeeds.map(feed => (
                <div
                  key={feed.id}
                  onClick={() => setSelectedFeed(feed)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFeed?.id === feed.id 
                      ? 'bg-blue-600/20 border border-blue-500' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">
                      {feed.name}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      feed.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                  </div>
                  <p className="text-slate-400 text-xs">
                    {feed.location.address}
                  </p>
                  {feed.lastDetection && (
                    <div className="mt-2 text-xs text-yellow-400">
                      Last: {getIncidentTypeIcon(feed.lastDetection.type)} 
                      {Math.floor((Date.now() - feed.lastDetection.timestamp.getTime()) / 60000)}m ago
                    </div>
                  )}
                </div>
              ))}
              {cctvFeeds.length === 0 && (
                <div className="text-center py-4 text-slate-400">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No CCTV feeds uploaded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Incidents */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={18} />
              Recent Incidents
            </h3>
            <div className="space-y-2">
              {incidents.slice(0, 5).map(incident => (
                <div key={incident.id} className="bg-slate-700 p-3 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getIncidentTypeIcon(incident.type)}</span>
                      <span className="text-white text-sm font-medium capitalize">
                        {incident.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)}`} />
                  </div>
                  <p className="text-slate-400 text-xs mb-2">
                    {incident.location.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {Math.floor((Date.now() - incident.timestamp.getTime()) / 60000)}m ago
                    </span>
                    <select
                      value={incident.status}
                      onChange={(e) => updateIncidentStatus(incident.id, e.target.value as Incident['status'])}
                      className="bg-slate-600 text-white text-xs px-2 py-1 rounded"
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
          <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'live' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Activity size={16} />
              Live Detection
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'upload' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white'
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
                  : 'text-slate-300 hover:text-white'
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
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapPin size={16} />
              Live Map
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'live' && (
            <LiveDetectionFeed 
              incidents={incidents}
              isActive={realTimeDetections}
            />
          )}

          {activeTab === 'upload' && (
            <VideoUpload onAnalysisComplete={handleAnalysisComplete} />
          )}

          {activeTab === 'monitor' && selectedFeed && (
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Eye className="text-blue-400" />
                  {selectedFeed.name}
                </h2>
                <div className="flex items-center gap-2 text-slate-300">
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
                <div className="bg-black rounded-lg p-8 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">No video uploaded</p>
                    <p className="text-slate-500 text-sm">Upload a video to start monitoring</p>
                  </div>
                </div>
              )}

              {/* Detection Info */}
              {selectedFeed.lastDetection && (
                <div className="bg-slate-700 rounded-lg p-4 mt-4">
                  <h4 className="text-white font-medium mb-2">Latest AI Detection</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Type</p>
                      <p className="text-white capitalize">
                        {getIncidentTypeIcon(selectedFeed.lastDetection.type)} 
                        {selectedFeed.lastDetection.type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Confidence</p>
                      <p className="text-white">
                        {Math.round(selectedFeed.lastDetection.confidence * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Detected</p>
                      <p className="text-white">
                        {Math.floor((Date.now() - selectedFeed.lastDetection.timestamp.getTime()) / 60000)}m ago
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <MapPin className="text-blue-400" />
                Live Incident Map - Hyderabad
              </h2>
              <TrafficMap 
                incidents={incidents} 
                center={{ lat: 17.3850, lng: 78.4867 }}
                height="600px"
              />
            </div>
          )}

          {!selectedFeed && activeTab === 'monitor' && (
            <div className="bg-slate-800 rounded-xl p-6 text-center">
              <Camera className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">No CCTV Feed Selected</h3>
              <p className="text-slate-400 mb-4">Upload a video first or select a feed from the sidebar</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Upload Video
              </button>
            </div>
          )}

          {/* AI Model Status */}
          <div className="bg-slate-800 rounded-xl p-6 mt-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <Settings className="text-blue-400" />
              YOLOv8 Model Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Accident Detection', enabled: true, type: 'accident', count: incidents.filter(i => i.type === 'accident').length },
                { name: 'Flood Monitoring', enabled: true, type: 'flood', count: incidents.filter(i => i.type === 'flooding').length },
                { name: 'Traffic Analysis', enabled: true, type: 'traffic', count: incidents.filter(i => i.type === 'traffic_jam').length },
                { name: 'Emergency Detection', enabled: true, type: 'emergency', count: incidents.filter(i => i.type === 'emergency').length }
              ].map(param => (
                <div key={param.name} className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{param.name}</span>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      param.enabled ? 'bg-blue-600' : 'bg-slate-600'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        param.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs mb-1">
                    Status: {param.enabled ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-blue-400 text-sm font-medium">
                    {param.count} detected today
                  </p>
                </div>
              ))}
            </div>
            
            {/* Real-time Detection Status */}
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${realTimeDetections ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-white font-medium">Real-time Detection</span>
                </div>
                <span className="text-slate-400 text-sm">
                  {realTimeDetections ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-2">
                YOLOv8 model continuously analyzing CCTV feeds
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;