import { useState, useEffect } from 'react';
import { Incident } from '../types';

const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'accident',
    location: { lat: 40.7589, lng: -73.9851, address: 'Times Square, NYC' },
    severity: 'high',
    description: 'Multi-vehicle collision blocking two lanes',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'active',
    detectedBy: 'ai',
    cctvId: 'cam-001'
  },
  {
    id: '2',
    type: 'flooding',
    location: { lat: 40.7505, lng: -73.9934, address: '34th Street, NYC' },
    severity: 'critical',
    description: 'Street flooding due to heavy rain',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'active',
    detectedBy: 'ai',
    cctvId: 'cam-002'
  },
  {
    id: '3',
    type: 'traffic_jam',
    location: { lat: 40.7614, lng: -73.9776, address: 'Broadway & 42nd St' },
    severity: 'medium',
    description: 'Heavy traffic congestion',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'monitoring',
    detectedBy: 'ai',
    cctvId: 'cam-003'
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