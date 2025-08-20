import { useState, useEffect } from 'react';
import { Incident } from '../types';
import { yoloService } from '../services/yoloService';

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
  const [realTimeDetections, setRealTimeDetections] = useState<boolean>(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIncidents(MOCK_INCIDENTS);
      setIsLoading(false);
    }, 1000);

    // Start real-time detection simulation
    startRealTimeDetections();

    return () => {
      setRealTimeDetections(false);
    };
  }, []);

  const startRealTimeDetections = () => {
    setRealTimeDetections(true);
    
    // Simulate AI detections every 30-60 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new detection
        const newDetection = generateRandomDetection();
        if (newDetection) {
          addIncident(newDetection);
        }
      }
    }, Math.random() * 30000 + 30000); // 30-60 seconds

    return interval;
  };

  const generateRandomDetection = (): Omit<Incident, 'id' | 'timestamp'> | null => {
    const detectionTypes = [
      {
        type: 'accident' as const,
        descriptions: [
          'Multi-vehicle collision detected by AI',
          'Car crash blocking traffic lanes',
          'Vehicle accident with debris on road',
          'Rear-end collision detected'
        ],
        severity: 'critical' as const
      },
      {
        type: 'flooding' as const,
        descriptions: [
          'Street flooding detected by AI',
          'Water accumulation on roadway',
          'Heavy water logging detected',
          'Road inundation from rainfall'
        ],
        severity: 'high' as const
      },
      {
        type: 'traffic_jam' as const,
        descriptions: [
          'Heavy traffic congestion detected',
          'Slow-moving traffic identified',
          'Traffic backup detected by AI',
          'Vehicle queue formation detected'
        ],
        severity: 'medium' as const
      },
      {
        type: 'heavy_rain' as const,
        descriptions: [
          'Heavy rainfall detected by AI',
          'Intense precipitation observed',
          'Weather-related visibility issues',
          'Rain affecting road conditions'
        ],
        severity: 'medium' as const
      }
    ];

    const hyderabadLocations = [
      { lat: 17.4435, lng: 78.3772, address: 'HITEC City, Hyderabad' },
      { lat: 17.4126, lng: 78.4482, address: 'Banjara Hills, Hyderabad' },
      { lat: 17.4239, lng: 78.4738, address: 'Jubilee Hills, Hyderabad' },
      { lat: 17.5040, lng: 78.5030, address: 'Secunderabad, Hyderabad' },
      { lat: 17.4399, lng: 78.3489, address: 'Gachibowli, Hyderabad' },
      { lat: 17.4840, lng: 78.4070, address: 'Kukatpally, Hyderabad' },
      { lat: 17.4483, lng: 78.3915, address: 'Madhapur, Hyderabad' },
      { lat: 17.4616, lng: 78.3670, address: 'Kondapur, Hyderabad' }
    ];

    const randomDetection = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
    const randomLocation = hyderabadLocations[Math.floor(Math.random() * hyderabadLocations.length)];
    const randomDescription = randomDetection.descriptions[Math.floor(Math.random() * randomDetection.descriptions.length)];

    return {
      type: randomDetection.type,
      location: randomLocation,
      severity: randomDetection.severity,
      description: randomDescription,
      status: 'active',
      detectedBy: 'ai',
      cctvId: `cam-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
      confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
      detectionBoxes: [{
        x: Math.random() * 200 + 50,
        y: Math.random() * 150 + 50,
        width: Math.random() * 100 + 100,
        height: Math.random() * 80 + 80,
        class: randomDetection.type,
        confidence: 0.75 + Math.random() * 0.2
      }]
    };
  };

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
    updateIncidentStatus,
    realTimeDetections
  };
};