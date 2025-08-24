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
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      return this.processYOLOResults(result, location);
    } catch (error) {
      console.error('YOLO analysis error:', error);
      throw new Error(`Real YOLO analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the Python Flask server is running on port 5000.`);
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
}

export const yoloService = new YOLOService();