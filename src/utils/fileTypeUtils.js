/**
 * File Type Utilities
 * Helper functions for handling different file types in the Document Vault
 */

/**
 * Check if a file is an image based on MIME type
 * @param {string} mimeType - The MIME type to check
 * @returns {boolean} - True if the file is an image
 */
export const isImage = (mimeType) => {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
};

/**
 * Check if a file is a PDF
 * @param {string} mimeType - The MIME type to check
 * @returns {boolean} - True if the file is a PDF
 */
export const isPdf = (mimeType) => {
  return mimeType === 'application/pdf';
};

/**
 * Check if a file is a document (Word, Excel, PowerPoint, etc.)
 * @param {string} mimeType - The MIME type to check
 * @returns {boolean} - True if the file is a document
 */
export const isDocument = (mimeType) => {
  if (!mimeType) return false;
  const documentTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ];
  return documentTypes.includes(mimeType);
};

/**
 * Check if a file is a video
 * @param {string} mimeType - The MIME type to check
 * @returns {boolean} - True if the file is a video
 */
export const isVideo = (mimeType) => {
  if (!mimeType) return false;
  return mimeType.startsWith('video/');
};

/**
 * Get file icon based on MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} - Emoji icon for the file type
 */
export const getFileIcon = (mimeType) => {
  if (!mimeType) return '📄';

  if (isImage(mimeType)) return '🖼️';
  if (isPdf(mimeType)) return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (isVideo(mimeType)) return '🎥';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return '📦';

  return '📄';
};

/**
 * Get file extension from MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} - File extension (without dot)
 */
export const getFileExtension = (mimeType) => {
  if (!mimeType) return 'jpg';

  const extensions = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',

    'application/pdf': 'pdf',

    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.oasis.opendocument.text': 'odt',

    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',

    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.oasis.opendocument.presentation': 'odp',

    'text/plain': 'txt',
    'text/csv': 'csv',
    'text/html': 'html',

    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/quicktime': 'mov',
    'video/webm': 'webm',

    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
  };

  return extensions[mimeType] || 'bin';
};

/**
 * Get MIME type from file extension
 * @param {string} extension - File extension (with or without dot)
 * @returns {string} - MIME type
 */
export const getMimeTypeFromExtension = (extension) => {
  const ext = extension.toLowerCase().replace('.', '');

  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',

    'pdf': 'application/pdf',

    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    'txt': 'text/plain',
    'csv': 'text/csv',

    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'webm': 'video/webm',

    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
  };

  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get thumbnail for a file type
 * @param {string} fileUrl - URL of the file
 * @param {string} mimeType - MIME type of the file
 * @param {string} driveFileId - Google Drive file ID (optional)
 * @returns {string} - Thumbnail URL or placeholder
 */
export const getThumbnail = (fileUrl, mimeType, driveFileId = null) => {
  if (isImage(mimeType)) {
    return fileUrl;
  }

  if (driveFileId) {
    // Use Drive thumbnail service
    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=220`;
  }

  // Return SVG placeholder based on file type
  const icon = getFileIcon(mimeType);
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af" font-size="60">${icon}</text></svg>`)}`;
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
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  } else if (url.includes('docs.google.com')) {
    if (url.includes('/edit')) {
      return url.replace('/edit', '/preview');
    }
  }

  return url;
};

/**
 * Check if a URL is a Google Drive URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a Drive URL
 */
export const isDriveUrl = (url) => {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
};

/**
 * Extract file ID from Google Drive URL
 * @param {string} url - Drive URL
 * @returns {string|null} - File ID or null
 */
export const extractDriveFileId = (url) => {
  if (!url) return null;

  // Try various Drive URL patterns
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

/**
 * Get a display-friendly file type name
 * @param {string} mimeType - MIME type
 * @returns {string} - Display name
 */
export const getFileTypeName = (mimeType) => {
  if (!mimeType) return 'File';

  if (isImage(mimeType)) return 'Image';
  if (isPdf(mimeType)) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Spreadsheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Presentation';
  if (isVideo(mimeType)) return 'Video';
  if (mimeType.includes('audio')) return 'Audio';

  return 'File';
};
