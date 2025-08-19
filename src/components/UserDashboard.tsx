import React, { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  LogOut,
  Search,
  Route,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { Incident, RouteAnalysis } from '../types';

const UserDashboard: React.FC = () => {
  const { incidents } = useIncidents();
  const { logout } = useAuth();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routeAnalysis, setRouteAnalysis] = useState<RouteAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activeIncidents = incidents.filter(i => i.status === 'active');

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

  const analyzeRoute = async () => {
    if (!fromLocation || !toLocation) return;
    
    setIsAnalyzing(true);
    
    // Simulate route analysis
    setTimeout(() => {
      const mockAnalysis: RouteAnalysis = {
        route: [
          { lat: 40.7589, lng: -73.9851 },
          { lat: 40.7505, lng: -73.9934 }
        ],
        incidents: activeIncidents.slice(0, 2),
        estimatedDelay: 12,
        riskLevel: 'medium',
        recommendations: [
          'Avoid Times Square area due to ongoing accident',
          'Consider alternative route via 8th Avenue',
          'Allow extra 15 minutes for heavy traffic'
        ]
      };
      setRouteAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Traffic Monitor</h1>
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
        {/* Route Planner */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Route className="text-blue-600" />
            Smart Route Planning
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter starting location"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter destination"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={analyzeRoute}
                disabled={isAnalyzing || !fromLocation || !toLocation}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Search size={18} />
                {isAnalyzing ? 'Analyzing Route...' : 'Analyze Route'}
              </button>
            </div>

            {/* Key Features */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">What makes us different?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span className="text-gray-700">Real-time AI analysis of CCTV feeds</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Live hazard detection and alerts</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span className="text-gray-700">Proactive incident reporting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Analysis Results */}
          {routeAnalysis && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Route Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{routeAnalysis.estimatedDelay}min</p>
                  <p className="text-sm text-gray-600">Extra Delay</p>
                </div>
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{routeAnalysis.incidents.length}</p>
                  <p className="text-sm text-gray-600">Incidents on Route</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskColor(routeAnalysis.riskLevel)}`}>
                    {routeAnalysis.riskLevel} Risk
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {routeAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Live Incidents Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <MapPin className="text-red-600" />
              Live Incident Map
            </h3>
            <div className="bg-gray-100 rounded-lg p-8 aspect-square flex items-center justify-center mb-4">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive Map</p>
                <p className="text-sm text-gray-500 mt-2">
                  Real-time incident visualization
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between py-2">
                <span>🚗 Accidents</span>
                <span className="font-medium">{incidents.filter(i => i.type === 'accident').length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>🌊 Flooding</span>
                <span className="font-medium">{incidents.filter(i => i.type === 'flooding').length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>🚦 Traffic Jams</span>
                <span className="font-medium">{incidents.filter(i => i.type === 'traffic_jam').length}</span>
              </div>
            </div>
          </div>

          {/* Active Incidents */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="text-orange-600" />
              Active Incidents
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
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.floor((Date.now() - incident.timestamp.getTime()) / 60000)}m ago
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{incident.description}</p>
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
      </div>
    </div>
  );
};

export default UserDashboard;