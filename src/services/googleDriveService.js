/**
 * Google Drive Service - OAuth Only Version
 * Provides file storage operations using Google Drive API
 * Uses the same OAuth infrastructure as Google Calendar
 */

const GOOGLE_CLIENT_ID = '947408696329-q16v2l7ci2j8r804516pmbit208j8rm6.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_API_URL = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let gapiLoaded = false;
let driveApiLoaded = false;
let accessToken = null;

/**
 * Load gapi.client for Drive API
 */
export const loadGapiClientForDrive = () => {
  return new Promise((resolve, reject) => {
    if (gapiLoaded && window.gapi && window.gapi.client) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client', () => {
        gapiLoaded = true;
        console.log('✅ Google API client loaded for Drive');
        resolve();
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.head.appendChild(script);
  });
};

/**
 * Load the Drive API discovery document
 */
export const loadDriveApi = async () => {
  if (driveApiLoaded && gapi.client.drive) {
    return;
  }

  try {
    await gapi.client.load(DRIVE_API_URL);
    driveApiLoaded = true;
    console.log('✅ Google Drive API loaded');
  } catch (error) {
    console.error('❌ Failed to load Drive API:', error);
    throw error;
  }
};

/**
 * Set access token for Drive operations
 * Reuses the token from Calendar OAuth
 */
export const setDriveAccessToken = (token) => {
  accessToken = token;
  if (gapi.client && token) {
    gapi.client.setToken({ access_token: token });
  }
};

/**
 * Check if Drive is ready
 */
export const isDriveReady = () => {
  return driveApiLoaded && !!accessToken;
};

/**
 * Make a direct API call using OAuth token
 */
const makeDriveRequest = async (request) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Drive first.');
  }

  if (!driveApiLoaded) {
    throw new Error('Drive API not loaded. Please connect Google Drive first.');
  }

  try {
    // Ensure token is set
    const token = gapi.client.getToken();
    if (!token || !token.access_token) {
      gapi.client.setToken({ access_token: accessToken });
    }

    const response = await request();
    return response;
  } catch (error) {
    console.error('❌ Drive API request error:', error);

    // If token expired, throw error to trigger re-auth
    if (error.status === 401) {
      console.log('🔄 Drive token expired');
      throw new Error('Token expired. Please reconnect Google Drive.');
    }

    throw error;
  }
};

/**
 * Find or create the "Womens App" folder in Google Drive
 * @returns {string} - The folder ID
 */
export const getOrCreateAppFolder = async () => {
  if (!isDriveReady()) {
    throw new Error('Google Drive not ready. Please connect first.');
  }

  const folderName = 'Womens App';

  try {
    // First, try to find existing folder
    console.log('🔍 Looking for "Womens App" folder...');

    const searchResponse = await makeDriveRequest(async () => {
      return await gapi.client.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });
    });

    const existingFolder = searchResponse.result.files?.find(f => f.name === folderName);

    if (existingFolder) {
      console.log('✅ Found existing "Womens App" folder:', existingFolder.id);
      return existingFolder.id;
    }

    // Folder doesn't exist, create it
    console.log('📁 Creating "Womens App" folder...');

    const createResponse = await makeDriveRequest(async () => {
      return await gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });
    });

    const folderId = createResponse.result.id;
    console.log('✅ Created "Womens App" folder:', folderId);
    return folderId;

  } catch (error) {
    console.error('❌ Error getting/creating folder:', error);
    throw error;
  }
};

/**
 * Upload a file to Google Drive
 * @param {File|Blob} file - The file to upload
 * @param {Object} metadata - File metadata (title, category, etc.)
 * @returns {Object} - { fileId, webViewLink, webContentLink }
 */
export const uploadFile = async (file, metadata = {}) => {
  if (!isDriveReady()) {
    throw new Error('Google Drive not ready. Please connect first.');
  }

  try {
    console.log('📤 Uploading file to Google Drive:', metadata.title);

    // Get or create the "Womens App" folder
    const folderId = await getOrCreateAppFolder();

    // Create file metadata
    const fileMetadata = {
      name: metadata.title || file.name || `Document_${Date.now()}`,
      description: JSON.stringify({
        category: metadata.category || 'personal',
        uploadedAt: new Date().toISOString(),
        source: 'DocumentScanner'
      }),
      parents: [folderId] // Upload to Womens App folder
    };

    // Use multipart upload for files with content
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    // Get file content as base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => {
        const content = reader.result.split(',')[1];
        resolve(content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const base64Data = await base64Promise;
    const contentType = file.type || 'application/octet-stream';

    // Construct multipart body
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(fileMetadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Data +
      close_delim;

    // Upload using REST API directly for multipart
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink,thumbnailLink,mimeType,size',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ File uploaded to Drive:', result);

    // If webViewLink is not returned, construct it
    if (!result.webViewLink && result.id) {
      result.webViewLink = `https://drive.google.com/file/d/${result.id}/view`;
    }

    return {
      fileId: result.id,
      webViewLink: result.webViewLink,
      webContentLink: result.webContentLink,
      thumbnailLink: result.thumbnailLink,
      mimeType: result.mimeType,
      size: result.size
    };
  } catch (error) {
    console.error('❌ Error uploading file to Drive:', error);
    throw error;
  }
};

/**
 * Upload a base64 image to Google Drive
 * @param {string} base64Data - Base64 image data (with or without data URL prefix)
 * @param {Object} metadata - File metadata
 * @returns {Object} - { fileId, webViewLink, webContentLink }
 */
export const uploadBase64Image = async (base64Data, metadata = {}) => {
  if (!isDriveReady()) {
    throw new Error('Google Drive not ready. Please connect first.');
  }

  try {
    // Strip data URL prefix if present
    const base64Content = base64Data.includes(',')
      ? base64Data.split(',')[1]
      : base64Data;

    const fileName = metadata.title || `Image_${Date.now()}.jpg`;

    // Convert base64 to blob
    const byteCharacters = atob(base64Content);
    const byteArrays = [];
    const sliceSize = 512;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'image/jpeg' });

    return await uploadFile(blob, metadata);
  } catch (error) {
    console.error('❌ Error uploading base64 image:', error);
    throw error;
  }
};

/**
 * Delete a file from Google Drive
 * @param {string} fileId - The Drive file ID to delete
 */
export const deleteFile = async (fileId) => {
  if (!isDriveReady()) {
    throw new Error('Google Drive not ready. Please connect first.');
  }

  try {
    await makeDriveRequest(async () => {
      return await gapi.client.drive.files.delete({
        fileId: fileId
      });
    });
    console.log('✅ File deleted from Drive:', fileId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting file from Drive:', error);
    throw error;
  }
};

/**
 * Get download URL for a Drive file
 * @param {string} fileId - The Drive file ID
 * @returns {string} - The download URL
 */
export const getDownloadUrl = async (fileId) => {
  if (!isDriveReady()) {
    throw new Error('Google Drive not ready. Please connect first.');
  }

  try {
    const response = await makeDriveRequest(async () => {
      return await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'webContentLink'
      });
    });

    return response.result.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`;
  } catch (error) {
    console.error('❌ Error getting download URL:', error);
    // Fallback to direct export link
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
};

/**
 * Get thumbnail for a Drive file (for images)
 * @param {string} fileId - The Drive file ID
 * @param {number} size - Thumbnail size (default: 220)
 * @returns {string} - The thumbnail URL
 */
export const getThumbnail = async (fileId, size = 220) => {
  // For images, we can use the direct thumbnail link
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
};

/**
 * Get file metadata from Drive
 * @param {string} fileId - The Drive file ID
 * @returns {Object} - File metadata
 */
export const getFileMetadata = async (fileId) => {
  if (!isDriveReady()) {
    throw new Error('Google Drive not ready. Please connect first.');
  }

  try {
    const response = await makeDriveRequest(async () => {
      return await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id,name,webViewLink,webContentLink,thumbnailLink,mimeType,size,createdTime,description'
      });
    });

    return response.result;
  } catch (error) {
    console.error('❌ Error getting file metadata:', error);
    throw error;
  }
};

/**
 * Initialize Drive services
 * Call this after the user has authenticated with Google Calendar
 */
export const initializeDriveServices = async () => {
  try {
    await loadGapiClientForDrive();

    // Check if we have a stored token from Calendar auth
    const storedToken = localStorage.getItem('google_calendar_token');
    const expiresAt = localStorage.getItem('google_token_expires_at');

    if (storedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      setDriveAccessToken(storedToken);
      console.log('✅ Using existing Google token for Drive');
      await loadDriveApi();
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Drive services:', error);
    throw error;
  }
};

/**
 * Convert Google Drive URL to embeddable/viewable URL
 * @param {string} url - Original Drive URL
 * @returns {string} - Converted URL for viewing/embedding
 */
export const convertDriveUrl = (url) => {
  if (!url) return url;

  // Handle various Drive URL formats
  if (url.includes('drive.google.com/file/d/')) {
    // Extract file ID and convert to preview/export URL
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const fileId = match[1];
      // Try to use web content link for direct access
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  } else if (url.includes('docs.google.com')) {
    // Google Docs/Sheets/etc - return as is for iframe embedding
    if (url.includes('/edit')) {
      return url.replace('/edit', '/preview');
    }
  }

  return url;
};

// Export utility functions
export const getDriveAccessToken = () => accessToken;
export const isDriveApiReady = () => driveApiLoaded;
