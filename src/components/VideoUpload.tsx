import React, { useState, useRef } from 'react';
import { Upload, MapPin, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { VideoUpload as VideoUploadType } from '../types';
import { yoloService } from '../services/yoloService';

interface VideoUploadProps {
  onAnalysisComplete: (analysis: any) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onAnalysisComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [location, setLocation] = useState({
    lat: 17.3850,
    lng: 78.4867,
    address: 'Hyderabad, Telangana, India'
  });
  const [cctvName, setCctvName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hyderabadLocations = [
    { name: 'HITEC City', lat: 17.4435, lng: 78.3772, address: 'HITEC City, Hyderabad' },
    { name: 'Banjara Hills', lat: 17.4126, lng: 78.4482, address: 'Banjara Hills, Hyderabad' },
    { name: 'Jubilee Hills', lat: 17.4239, lng: 78.4738, address: 'Jubilee Hills, Hyderabad' },
    { name: 'Secunderabad', lat: 17.5040, lng: 78.5030, address: 'Secunderabad, Hyderabad' },
    { name: 'Gachibowli', lat: 17.4399, lng: 78.3489, address: 'Gachibowli, Hyderabad' },
    { name: 'Kukatpally', lat: 17.4840, lng: 78.4070, address: 'Kukatpally, Hyderabad' },
    { name: 'Madhapur', lat: 17.4483, lng: 78.3915, address: 'Madhapur, Hyderabad' },
    { name: 'Kondapur', lat: 17.4616, lng: 78.3670, address: 'Kondapur, Hyderabad' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || !cctvName) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Analyze video with YOLO
      const analysis = await yoloService.analyzeVideo(selectedFile, location);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Create CCTV feed entry
      const cctvFeed = {
        id: `cctv-${Date.now()}`,
        name: cctvName,
        location,
        status: 'online' as const,
        videoUrl: URL.createObjectURL(selectedFile),
        isLive: false,
        lastDetection: analysis.incidents.length > 0 ? {
          type: analysis.incidents[0].type,
          confidence: analysis.incidents[0].confidence || 0,
          timestamp: new Date(),
          detectionBoxes: analysis.incidents[0].detectionBoxes
        } : undefined
      };

      setAnalysisResult({ analysis, cctvFeed });
      onAnalysisComplete({ analysis, cctvFeed });
      
      // Show success message with detection summary
      if (analysis.incidents.length > 0) {
        const detectionSummary = analysis.incidents.map(i => 
          `${i.type.replace('_', ' ')} (${Math.round((i.confidence || 0) * 100)}%)`
        ).join(', ');
        console.log(`YOLOv8 Analysis Complete: ${detectionSummary}`);
      }
      
    } catch (error) {
      console.error('Upload and analysis failed:', error);
      alert('Failed to analyze video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
        <Upload className="text-blue-400" />
        Upload CCTV Footage
      </h3>

      <div className="space-y-6">
        {/* Location Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            CCTV Location
          </label>
          <select
            value={`${location.lat},${location.lng}`}
            onChange={(e) => {
              const [lat, lng] = e.target.value.split(',').map(Number);
              const selectedLocation = hyderabadLocations.find(
                loc => loc.lat === lat && loc.lng === lng
              );
              if (selectedLocation) {
                setLocation(selectedLocation);
              }
            }}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            {hyderabadLocations.map(loc => (
              <option key={loc.name} value={`${loc.lat},${loc.lng}`}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* CCTV Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            CCTV Camera Name
          </label>
          <div className="relative">
            <Camera className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={cctvName}
              onChange={(e) => setCctvName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., HITEC City Junction Cam 1"
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Video File
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-slate-400 text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-white mb-2">Click to upload video</p>
                <p className="text-slate-400 text-sm">MP4, AVI, MOV up to 500MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Processing Video</span>
              <span className="text-blue-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">
              {uploadProgress < 90 ? 'Uploading and analyzing with YOLOv8...' : 'Finalizing analysis...'}
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="text-green-400" />
              Analysis Complete
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-slate-400 text-sm">Incidents Detected</p>
                <p className="text-white text-xl font-bold">
                  {analysisResult.analysis.incidents.length}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Confidence</p>
                <p className="text-white text-xl font-bold">
                  {analysisResult.analysis.incidents.length > 0 
                    ? Math.round(analysisResult.analysis.incidents[0].confidence * 100)
                    : 0}%
                </p>
              </div>
            </div>
            {analysisResult.analysis.incidents.map((incident: Incident, index: number) => (
              <div key={index} className="bg-slate-600 rounded p-3 mb-2">
                <p className="text-white font-medium capitalize">
                  {incident.type.replace('_', ' ')}
                </p>
                <p className="text-slate-300 text-sm">{incident.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUploadAndAnalyze}
          disabled={!selectedFile || !cctvName || isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {isUploading ? 'Analyzing Video...' : 'Upload & Analyze'}
        </button>
      </div>
    </div>
  );
};

export default VideoUpload;