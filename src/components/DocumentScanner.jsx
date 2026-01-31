import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, Trash2, X, AlertCircle } from 'lucide-react';

const DocumentScanner = ({ onSave, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState('');

  // 1. Start the Camera
  const startCamera = async () => {
    setError('');
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, // Uses the back camera
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera Access Denied:", err);
      setError("Camera access denied. Please enable camera permissions in your browser settings.");
      setIsCameraOpen(false);
    }
  };

  // 2. Capture the Photo
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to 80% quality
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  // 3. Stop the Stream
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    const tracks = stream?.getTracks();
    tracks?.forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  // 4. Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      {!capturedImage ? (
        <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border-2 border-dashed border-gray-600">
          {!isCameraOpen ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
              <div className="bg-gray-800 rounded-full p-4 mb-4">
                <Camera size={48} />
              </div>
              <h3 className="text-lg font-bold mb-2">Document Scanner</h3>
              <p className="text-sm text-gray-300 text-center mb-6">
                Position your document within the frame for best results
              </p>
              
              <div className="space-y-3 w-full">
                <button 
                  onClick={startCamera}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  Open Camera
                </button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                    Upload Photo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <button 
                  onClick={takePhoto}
                  className="w-16 h-16 bg-white rounded-full border-4 border-teal-500 shadow-xl flex items-center justify-center"
                >
                  <div className="w-8 h-8 bg-teal-500 rounded-full"></div>
                </button>
              </div>
            </>
          )}
          
          <button 
            onClick={onCancel} 
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <X size={24} />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="relative">
            <img src={capturedImage} alt="Preview" className="rounded-lg shadow-2xl border-4 border-white w-full" />
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
              ✓ Captured
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setCapturedImage(null);
                setError('');
              }} 
              className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-gray-600 transition-colors"
            >
              <RefreshCw size={20} /> Retake
            </button>
            <button 
              onClick={() => onSave(capturedImage)} 
              className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-teal-700 transition-colors"
            >
              <Check size={20} /> Save to Vault
            </button>
          </div>
          
          <button 
            onClick={() => setCapturedImage(null)} 
            className="text-gray-400 flex items-center justify-center gap-2 mt-2 hover:text-gray-600 transition-colors"
          >
            <Trash2 size={18} /> Discard
          </button>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg flex items-center gap-2 shadow-lg">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-white hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DocumentScanner;