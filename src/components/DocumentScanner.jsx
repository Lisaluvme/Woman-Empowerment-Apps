import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, supabase } from '../firebase-config';
import { Camera, RefreshCw, Check, Trash2, X, AlertCircle, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadBase64Image, uploadFile, deleteFile, initializeDriveServices, isDriveReady, loadDriveApi, setDriveAccessToken } from '../services/googleDriveService';
import { getFileExtension, formatFileSize, isImage, isPdf, getFileIcon } from '../utils/fileTypeUtils';
import { hasGoogleCalendarAccess, requestGoogleCalendarAccess, initializeGoogleServices, initializeGoogleIdentity } from '../services/googleCalendarServiceOAuthOnly';

const DocumentScanner = ({ onSave, onCancel }) => {
  const [user] = useAuthState(auth);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('personal');

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
      setUploadedFile(file);
      // For images, read as data URL for preview
      if (isImage(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-images, set to null and use file icon
        setCapturedImage(null);
      }
      // Set default title from filename
      if (!docTitle) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setDocTitle(nameWithoutExt);
      }
    }
  };

  // 5. Save document (Google Drive + Supabase Database)
  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save documents');
      return;
    }

    if (!docTitle.trim()) {
      setError('Please enter a document title');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Initialize Google services (both gapi and GIS)
      await initializeGoogleServices();
      await initializeDriveServices();

      // Check if we have Google Drive access
      if (!isDriveReady()) {
        // Request access if not ready
        console.log('🔐 Requesting Google Drive access...');
        setError('Connecting to Google Drive...');
        
        await requestGoogleCalendarAccess();

        // After getting access token, set it for Drive and load Drive API
        // The token is stored in localStorage by the OAuth callback
        const storedToken = localStorage.getItem('google_calendar_token');
        if (storedToken) {
          setDriveAccessToken(storedToken);
          console.log('✅ Drive access token set');
        }

        // Load Drive API after token is set
        await loadDriveApi();
        console.log('✅ Drive API loaded');
        setError(''); // Clear the connection message
      }

      let driveResult;
      let fileType;
      let fileSize;

      // Handle camera capture (image) or file upload
      if (capturedImage && !uploadedFile) {
        // Camera capture - upload base64 image
        console.log('📤 Uploading camera capture to Google Drive...');
        setError('Uploading image to Google Drive...');
        
        driveResult = await uploadBase64Image(capturedImage, {
          title: `${docTitle.trim()}.jpg`,
          category: docCategory
        });
        fileType = 'image/jpeg';

        // Calculate file size from base64
        const base64Length = capturedImage.split(',')[1]?.length || 0;
        fileSize = Math.round(base64Length * 0.75);
      } else if (uploadedFile) {
        // File upload - use the file directly
        console.log('📤 Uploading file to Google Drive...');
        console.log('File name:', uploadedFile.name);
        console.log('File type:', uploadedFile.type);
        console.log('File size:', formatFileSize(uploadedFile.size));
        
        setError(`Uploading ${uploadedFile.name} to Google Drive...`);

        // Get file extension
        const extension = getFileExtension(uploadedFile.type);
        const fileName = `${docTitle.trim()}.${extension}`;

        driveResult = await uploadFile(uploadedFile, {
          title: fileName,
          category: docCategory
        });
        fileType = uploadedFile.type || 'application/octet-stream';
        fileSize = uploadedFile.size;
      } else {
        throw new Error('No file to save. Please capture or upload a file.');
      }

      console.log('✅ File uploaded to Drive:', driveResult);
      setError('Saving document to your vault...');

      // Save document metadata to Supabase Database
      const documentData = {
        firebase_uid: user.uid,
        title: docTitle.trim(),
        category: docCategory,
        file_url: driveResult.webViewLink,
        file_type: fileType,
        file_size: fileSize,
        storage_backend: 'google_drive',
        google_drive_file_id: driveResult.fileId,
        google_drive_web_view_link: driveResult.webViewLink,
        google_drive_mimetype: driveResult.mimeType,
        google_drive_size: driveResult.size
      };

      console.log('📝 Saving document metadata to database...');
      console.log('Document data:', documentData);

      const { data: docData, error: dbError } = await supabase
        .from('vault_documents')
        .insert([documentData])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database insert error:', dbError);

        // Try to clean up the uploaded Drive file if database insert fails
        try {
          await deleteFile(driveResult.fileId);
        } catch (cleanupError) {
          console.error('Failed to clean up Drive file:', cleanupError);
        }

        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('✅ Document metadata saved:', docData);

      const savedDoc = {
        id: docData.id,
        ...docData
      };

      console.log('🎉 Document saved successfully!', savedDoc);

      // Call onSave callback with the saved document
      if (onSave) {
        onSave(savedDoc);
      }

      // Success message
      setError('Document saved successfully to Google Drive and your vault!');

    } catch (err) {
      console.error('❌ Error saving document:', err);
      setError(err.message || 'Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-900/80 via-black/80 to-red-900/80 flex items-center justify-center p-4 z-50 overflow-y-auto" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
      {!capturedImage ? (
        <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 my-auto">
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
                  type="button"
                  onClick={startCamera}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera size={20} />
                  Open Camera
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button type="button" className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 pointer-events-none">
                    <FileText size={20} />
                    Upload File
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <button
                  type="button"
                  onClick={takePhoto}
                  className="w-16 h-16 bg-white rounded-full border-4 border-teal-500 shadow-xl flex items-center justify-center cursor-pointer"
                >
                  <div className="w-8 h-8 bg-teal-500 rounded-full"></div>
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all cursor-pointer z-10"
          >
            <X size={24} />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-4 bg-white rounded-2xl p-6 shadow-2xl my-auto">
          <div className="relative">
            {capturedImage ? (
              <img src={capturedImage} alt="Preview" className="rounded-lg shadow-lg border-2 border-gray-200 w-full max-h-48 object-contain bg-gray-100" />
            ) : uploadedFile ? (
              <div className="rounded-lg shadow-lg border-2 border-gray-200 w-full h-48 flex flex-col items-center justify-center bg-gray-100">
                <span className="text-6xl mb-2">{getFileIcon(uploadedFile.type)}</span>
                <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
              </div>
            ) : (
              <div className="rounded-lg shadow-lg border-2 border-gray-200 w-full h-48 flex items-center justify-center bg-gray-100">
                <ImageIcon size={48} className="text-gray-400" />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setCapturedImage(null);
                setUploadedFile(null);
                setError('');
                setDocTitle('');
                setDocCategory('personal');
              }}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Document Details Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="docTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                id="docTitle"
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g., Passport, Certificate, etc."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="docCategory" className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                id="docCategory"
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors bg-white"
              >
                <option value="personal">Personal</option>
                <option value="career">Career</option>
                <option value="family">Family</option>
                <option value="legal">Legal</option>
                <option value="medical">Medical</option>
                <option value="financial">Financial</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !docTitle.trim() || (!capturedImage && !uploadedFile)}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Save Document
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg flex items-center gap-2 shadow-lg z-[60]">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-auto text-white hover:text-gray-200 cursor-pointer"
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