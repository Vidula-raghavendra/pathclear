import { useState, useEffect } from 'react';
import { Incident } from '../types';

const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'accident',
    location: { lat: 17.4435, lng: 78.3772, address: 'HITEC City, Hyderabad' },
    severity: 'high',
    description: 'Multi-vehicle collision detected by YOLOv8 - blocking two lanes',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'active',
    detectedBy: 'ai',
    cctvId: 'cam-001',
    confidence: 0.94,
    detectionBoxes: [{
      x: 120, y: 80, width: 180, height: 120,
      class: 'car_accident', confidence: 0.94
    }]
  },
  {
    id: '2',
    type: 'flooding',
    location: { lat: 17.4126, lng: 78.4482, address: 'Banjara Hills, Hyderabad' },
    severity: 'critical',
    description: 'Street flooding detected by YOLOv8 - road impassable',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'active',
    detectedBy: 'ai',
    cctvId: 'cam-002',
    confidence: 0.87,
    detectionBoxes: [{
      x: 200, y: 150, width: 300, height: 100,
      class: 'flood', confidence: 0.87
    }]
  },
  {
    id: '3',
    type: 'traffic_jam',
    location: { lat: 17.4239, lng: 78.4738, address: 'Jubilee Hills, Hyderabad' },
    severity: 'medium',
    description: 'Heavy traffic congestion detected by YOLOv8',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'monitoring',
    detectedBy: 'ai',
    cctvId: 'cam-003',
    confidence: 0.76,
    detectionBoxes: [{
      x: 50, y: 100, width: 400, height: 200,
      class: 'heavy_traffic', confidence: 0.76
    }]
  },
  {
    id: '4',
    type: 'heavy_rain',
    location: { lat: 17.4399, lng: 78.3489, address: 'Gachibowli, Hyderabad' },
    severity: 'medium',
    description: 'Heavy rainfall detected by YOLOv8 - reduced visibility',
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    status: 'active',
    detectedBy: 'ai',
    cctvId: 'cam-005',
    confidence: 0.82,
    detectionBoxes: [{
      x: 0, y: 0, width: 640, height: 360,
      class: 'heavy_rain', confidence: 0.82
    }]
  },
  {
    id: '5',
    type: 'road_closure',
    location: { lat: 17.5040, lng: 78.5030, address: 'Secunderabad, Hyderabad' },
    severity: 'high',
    description: 'Road closure due to construction work',
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
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
    const interval = startRealTimeDetections();

    return () => {
      clearInterval(interval);
      setRealTimeDetections(false);
    };
  }, []);

  const startRealTimeDetections = () => {
    setRealTimeDetections(true);
    
    // Simulate YOLOv8 detections every 20-40 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance of new detection
        const newDetection = generateRandomDetection();
        if (newDetection) {
          addIncident(newDetection);
        }
      }
    }, Math.random() * 20000 + 20000); // 20-40 seconds

    return interval;
  };

  const generateRandomDetection = (): Omit<Incident, 'id' | 'timestamp'> | null => {
    const detectionTypes = [
      {
        type: 'accident' as const,
        descriptions: [
          'Multi-vehicle collision detected by YOLOv8',
          'Car crash blocking traffic lanes - AI confirmed',
          'Vehicle accident with debris detected by AI',
          'Rear-end collision identified by YOLOv8'
        ],
        severity: 'critical' as const
      },
      {
        type: 'flooding' as const,
        descriptions: [
          'Street flooding detected by YOLOv8',
          'Water accumulation on roadway - AI analysis',
          'Heavy water logging detected by AI',
          'Road inundation identified by YOLOv8'
        ],
        severity: 'high' as const
      },
      {
        type: 'traffic_jam' as const,
        descriptions: [
          'Heavy traffic congestion detected by YOLOv8',
          'Slow-moving traffic identified by AI',
          'Traffic backup detected by YOLOv8',
          'Vehicle queue formation detected by AI'
        ],
        severity: 'medium' as const
      },
      {
        type: 'heavy_rain' as const,
        descriptions: [
          'Heavy rainfall detected by YOLOv8',
          'Intense precipitation observed by AI',
          'Weather-related visibility issues detected',
          'Rain affecting road conditions - AI analysis'
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
    const confidence = 0.75 + Math.random() * 0.2;

    return {
      type: randomDetection.type,
      location: randomLocation,
      severity: randomDetection.severity,
      description: randomDescription,
      status: 'active',
      detectedBy: 'ai',
      cctvId: `cam-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
      confidence,
      detectionBoxes: [
        {
          x: Math.random() * 200 + 50,
          y: Math.random() * 150 + 50,
          width: Math.random() * 100 + 100,
          height: Math.random() * 80 + 80,
          class: randomDetection.type,
          confidence
        }
      ]
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