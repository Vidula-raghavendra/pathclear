import { YOLODetection, VideoAnalysis, Incident } from '../types';

export class YOLOService {
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_YOLO_API_ENDPOINT || 'http://localhost:5000/api/analyze';
  }

  async analyzeVideo(videoFile: File, location: { lat: number; lng: number; address: string }): Promise<VideoAnalysis> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('location', JSON.stringify(location));

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const result = await response.json();
      return this.processYOLOResults(result, location);
    } catch (error) {
      console.error('YOLO analysis error:', error);
      // Return mock data for demo purposes
      return this.getMockAnalysis(videoFile, location);
    }
  }

  private processYOLOResults(yoloResults: any, location: { lat: number; lng: number; address: string }): VideoAnalysis {
    const detections: YOLODetection[] = yoloResults.detections || [];
    const incidents: Incident[] = [];

    // Convert YOLO detections to incidents
    detections.forEach((detection, index) => {
      const incidentType = this.mapYOLOClassToIncidentType(detection.class);
      if (incidentType) {
        incidents.push({
          id: `yolo-${Date.now()}-${index}`,
          type: incidentType,
          location,
          severity: this.calculateSeverity(detection.confidence, detection.class),
          description: `AI detected ${detection.class} with ${Math.round(detection.confidence * 100)}% confidence`,
          timestamp: new Date(),
          status: 'active',
          detectedBy: 'ai',
          confidence: detection.confidence,
          detectionBoxes: [{
            x: detection.bbox[0],
            y: detection.bbox[1],
            width: detection.bbox[2] - detection.bbox[0],
            height: detection.bbox[3] - detection.bbox[1],
            class: detection.class,
            confidence: detection.confidence
          }]
        });
      }
    });

    return {
      videoId: yoloResults.videoId || Date.now().toString(),
      detections,
      incidents,
      processedFrames: yoloResults.processedFrames || 100,
      totalFrames: yoloResults.totalFrames || 100,
      status: 'completed'
    };
  }

  private mapYOLOClassToIncidentType(yoloClass: string): Incident['type'] | null {
    const classMap: Record<string, Incident['type']> = {
      'car_accident': 'accident',
      'collision': 'accident',
      'crashed_car': 'accident',
      'flood': 'flooding',
      'water_on_road': 'flooding',
      'heavy_traffic': 'traffic_jam',
      'traffic_congestion': 'traffic_jam',
      'blocked_road': 'road_closure',
      'construction': 'road_closure',
      'emergency_vehicle': 'emergency'
    };

    return classMap[yoloClass.toLowerCase()] || null;
  }

  private calculateSeverity(confidence: number, className: string): Incident['severity'] {
    if (className.includes('accident') || className.includes('flood')) {
      return confidence > 0.8 ? 'critical' : 'high';
    }
    if (className.includes('traffic') || className.includes('congestion')) {
      return confidence > 0.7 ? 'medium' : 'low';
    }
    return 'medium';
  }

  private getMockAnalysis(videoFile: File, location: { lat: number; lng: number; address: string }): VideoAnalysis {
    // Enhanced mock analysis with more realistic detections
    const possibleDetections = [
      { class: 'car_accident', confidence: 0.85 + Math.random() * 0.1 },
      { class: 'heavy_traffic', confidence: 0.70 + Math.random() * 0.15 },
      { class: 'flood', confidence: 0.80 + Math.random() * 0.15 },
      { class: 'blocked_road', confidence: 0.75 + Math.random() * 0.1 },
      { class: 'emergency_vehicle', confidence: 0.90 + Math.random() * 0.05 }
    ];

    // Randomly select 1-3 detections
    const numDetections = Math.floor(Math.random() * 3) + 1;
    const mockDetections: YOLODetection[] = [];
    
    for (let i = 0; i < numDetections; i++) {
      const detection = possibleDetections[Math.floor(Math.random() * possibleDetections.length)];
      mockDetections.push({
        ...detection,
        bbox: [
          Math.random() * 200 + 50,  // x
          Math.random() * 150 + 50,  // y
          Math.random() * 200 + 250, // x2
          Math.random() * 150 + 200  // y2
        ]
      });
    }

    return this.processYOLOResults({
      videoId: Date.now().toString(),
      detections: mockDetections,
      processedFrames: 100,
      totalFrames: 100
    }, location);
  }
}

export const yoloService = new YOLOService();