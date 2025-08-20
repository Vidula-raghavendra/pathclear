import React from 'react';
import { Incident } from '../types';
import { AlertTriangle, Activity, Clock, TrendingUp } from 'lucide-react';

interface IncidentStatsProps {
  incidents: Incident[];
}

const IncidentStats: React.FC<IncidentStatsProps> = ({ incidents }) => {
  const activeIncidents = incidents.filter(i => i.status === 'active');
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  const aiDetections = incidents.filter(i => i.detectedBy === 'ai');
  const recentIncidents = incidents.filter(i => 
    Date.now() - i.timestamp.getTime() < 60 * 60 * 1000 // Last hour
  );

  const stats = [
    {
      title: 'Active Incidents',
      value: activeIncidents.length,
      icon: Activity,
      color: 'text-orange-600 bg-orange-100',
      trend: '+2 from last hour'
    },
    {
      title: 'Critical Alerts',
      value: criticalIncidents.length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
      trend: 'Immediate attention required'
    },
    {
      title: 'AI Detections',
      value: aiDetections.length,
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100',
      trend: `${Math.round((aiDetections.length / incidents.length) * 100)}% accuracy`
    },
    {
      title: 'Recent (1h)',
      value: recentIncidents.length,
      icon: Clock,
      color: 'text-purple-600 bg-purple-100',
      trend: 'Last hour activity'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">{stat.trend}</p>
        </div>
      ))}
    </div>
  );
};

export default IncidentStats;