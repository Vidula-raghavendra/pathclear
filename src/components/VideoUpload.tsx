import React, { useState, useRef } from 'react';
import { Upload, MapPin, Camera, CheckCircle, AlertTriangle, Server } from 'lucide-react';
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
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [error, setError] = useState<string | null>(null);
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

  // Check server status on component mount
  React.useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    setServerStatus('checking');
    const isHealthy = await yoloService.checkServerHealth();
    setServerStatus(isHealthy ? 'online' : 'offline');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || !cctvName) return;

    setError(null);
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
      
    } catch (error) {
      console.error('Upload and analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <Upload className="text-blue-600" />
        Upload CCTV Footage
      </h3>

      {/* Server Status */}
      <div className={`p-4 rounded-lg border ${
        serverStatus === 'online' ? 'bg-green-50 border-green-200' :
        serverStatus === 'offline' ? 'bg-red-50 border-red-200' :
        'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          <Server className={`w-5 h-5 ${
            serverStatus === 'online' ? 'text-green-600' :
            serverStatus === 'offline' ? 'text-red-600' :
            'text-yellow-600'
          }`} />
          <div>
            <p className={`font-medium ${
              serverStatus === 'online' ? 'text-green-800' :
              serverStatus === 'offline' ? 'text-red-800' :
              'text-yellow-800'
            }`}>
              YOLOv8 Analysis Server: {
                serverStatus === 'online' ? 'Online' :
                serverStatus === 'offline' ? 'Offline' :
                'Checking...'
              }
            </p>
            {serverStatus === 'offline' && (
              <p className="text-red-600 text-sm mt-1">
                Server not running. Start with: <code className="bg-red-100 px-1 rounded">python flask_server.py</code>
              </p>
            )}
          </div>
          <button
            onClick={checkServerStatus}
            className="ml-auto px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-800 font-medium mb-2">Analysis Failed</h4>
              <pre className="text-red-700 text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Location Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CCTV Camera Name
        </label>
        <div className="relative">
          <Camera className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={cctvName}
            onChange={(e) => setCctvName(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., HITEC City Junction Cam 1"
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video File
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
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
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-gray-900 font-medium">{selectedFile.name}</p>
                <p className="text-gray-600 text-sm">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 mb-2">Click to upload video</p>
              <p className="text-gray-600 text-sm">MP4, AVI, MOV up to 500MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-900 font-medium">Processing Video</span>
            <span className="text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-gray-600 text-sm mt-2">
            {uploadProgress < 90 ? 'Uploading and analyzing...' : 'Finalizing analysis...'}
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-gray-900 font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="text-green-600" />
            Analysis Complete
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600 text-sm">Incidents Detected</p>
              <p className="text-gray-900 text-xl font-bold">
                {analysisResult.analysis.incidents.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Confidence</p>
              <p className="text-gray-900 text-xl font-bold">
                {analysisResult.analysis.incidents.length > 0 
                  ? Math.round(analysisResult.analysis.incidents[0].confidence * 100)
                  : 0}%
              </p>
            </div>
          </div>
          {analysisResult.analysis.incidents.map((incident: any, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded p-3 mb-2">
              <p className="text-gray-900 font-medium capitalize">
                {incident.type.replace('_', ' ')}
              </p>
              <p className="text-gray-600 text-sm">{incident.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUploadAndAnalyze}
        disabled={!selectedFile || !cctvName || isUploading || serverStatus !== 'online'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Upload size={18} />
        {isUploading ? 'Analyzing Video...' : 
         serverStatus !== 'online' ? 'Server Offline' : 
         'Upload & Analyze'}
      </button>
    </div>
  );
};

export default VideoUpload;