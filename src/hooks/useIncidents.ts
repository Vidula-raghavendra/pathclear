import { useState, useEffect } from 'react';
import { Incident } from '../types';

const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'accident',
    location: { lat: 17.4435, lng: 78.3772, address: 'HITEC City, Hyderabad' },
    severity: 'high',
    description: 'Multi-vehicle collision detected by AI - blocking two lanes',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'active',
    detectedBy: 'ai',
    cctvId: 'cam-001',
    confidence: 0.94
  },
  {
    id: '2',
    type: 'flooding',
    location: { lat: 17.4126, lng: 78.4482, address: 'Banjara Hills, Hyderabad' },
    severity: 'critical',
    description: 'Street flooding detected - road impassable',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'active',
    detectedBy: 'ai',
    cctvId: 'cam-002',
    confidence: 0.87
  },
  {
    id: '3',
    type: 'traffic_jam',
    location: { lat: 17.4239, lng: 78.4738, address: 'Jubilee Hills, Hyderabad' },
    severity: 'medium',
    description: 'Heavy traffic congestion detected by AI',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'monitoring',
    detectedBy: 'ai',
    cctvId: 'cam-003',
    confidence: 0.76
  },
  {
    id: '4',
    type: 'road_closure',
    location: { lat: 17.5040, lng: 78.5030, address: 'Secunderabad, Hyderabad' },
    severity: 'high',
    description: 'Road closure due to construction work',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: 'active',
    detectedBy: 'manual',
    cctvId: 'cam-004'
  }
];

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIncidents(MOCK_INCIDENTS);
      setIsLoading(false);
    }, 1000);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setIncidents(prev => {
        const updated = [...prev];
        // Randomly update an incident
        const randomIndex = Math.floor(Math.random() * updated.length);
        if (updated[randomIndex]) {
          updated[randomIndex] = {
            ...updated[randomIndex],
            timestamp: new Date()
          };
        }
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addIncident = (incident: Omit<Incident, 'id' | 'timestamp'>) => {
    const newIncident: Incident = {
      ...incident,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setIncidents(prev => [newIncident, ...prev]);
  };

  const updateIncidentStatus = (id: string, status: Incident['status']) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === id ? { ...incident, status } : incident
      )
    );
  };

  return {
    incidents,
    isLoading,
    addIncident,
    updateIncidentStatus
  };
};