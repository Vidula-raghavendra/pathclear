import React, { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useAuth } from '../contexts/AuthContext';
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
  RefreshCw
} from 'lucide-react';
import { Incident, CCTVFeed } from '../types';

const MOCK_CCTV_FEEDS: CCTVFeed[] = [
  {
    id: 'cam-001',
    name: 'Times Square North',
    location: { lat: 40.7589, lng: -73.9851, address: 'Times Square, NYC' },
    status: 'online',
    lastDetection: {
      type: 'accident',
      confidence: 0.94,
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    }
  },
  {
    id: 'cam-002',
    name: 'Penn Station West',
    location: { lat: 40.7505, lng: -73.9934, address: '34th Street, NYC' },
    status: 'online',
    lastDetection: {
      type: 'flooding',
      confidence: 0.87,
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    }
  },
  {
    id: 'cam-003',
    name: 'Broadway & 42nd',
    location: { lat: 40.7614, lng: -73.9776, address: 'Broadway & 42nd St' },
    status: 'online'
  }
];

const AdminDashboard: React.FC = () => {
  const { incidents, updateIncidentStatus } = useIncidents();
  const { logout } = useAuth();
  const [selectedFeed, setSelectedFeed] = useState<CCTVFeed | null>(MOCK_CCTV_FEEDS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Simulate new detection
      alert('New incident detected: Traffic congestion on Broadway');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Traffic Monitor - Admin</h1>
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
        <aside className="w-80 bg-slate-800 border-r border-slate-700 p-4 h-screen overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
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
          </div>

          {/* CCTV Feeds */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Camera size={18} />
              CCTV Feeds
            </h3>
            <div className="space-y-2">
              {MOCK_CCTV_FEEDS.map(feed => (
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
          {selectedFeed && (
            <div className="bg-slate-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Eye className="text-blue-400" />
                  {selectedFeed.name}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={simulateAnalysis}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                  </button>
                  <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <Settings size={16} />
                    Settings
                  </button>
                </div>
              </div>

              {/* Simulated CCTV Feed */}
              <div className="bg-black rounded-lg p-8 mb-4 aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
                <div className="text-center">
                  <Camera className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">Live CCTV Feed</p>
                  <p className="text-slate-500 text-sm">
                    {selectedFeed.location.address}
                  </p>
                  {isAnalyzing && (
                    <div className="mt-4">
                      <div className="animate-pulse bg-blue-500/20 h-2 rounded-full mb-2"></div>
                      <p className="text-blue-400 text-sm">AI Analysis in progress...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detection Info */}
              {selectedFeed.lastDetection && (
                <div className="bg-slate-700 rounded-lg p-4">
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

          {/* Control Panel */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <Settings className="text-blue-400" />
              Parameter Controls
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Heavy Rain Detection', enabled: true, type: 'weather' },
                { name: 'Flood Monitoring', enabled: true, type: 'flood' },
                { name: 'Accident Detection', enabled: true, type: 'accident' },
                { name: 'Traffic Analysis', enabled: false, type: 'traffic' }
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
                  <p className="text-slate-400 text-xs">
                    Status: {param.enabled ? 'Active' : 'Inactive'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;