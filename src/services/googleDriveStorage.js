/**
 * Google Drive Storage Service
 * Replaces Supabase for all data storage
 * Stores data as JSON files in Google Drive folders
 */

import {
  loadGapiClientForDrive,
  loadDriveApi,
  setDriveAccessToken,
  isDriveReady,
  getOrCreateAppFolder
} from './googleDriveService';

let accessToken = null;
let dataReady = false;

/**
 * Initialize the storage service
 */
export const initializeStorage = async (token) => {
  try {
    accessToken = token;
    await loadGapiClientForDrive();
    setDriveAccessToken(token);
    await loadDriveApi();
    dataReady = true;
    console.log('✅ Google Drive Storage initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
    throw error;
  }
};

/**
 * Ensure storage is ready
 */
const ensureReady = () => {
  if (!dataReady || !isDriveReady()) {
    throw new Error('Storage not ready. Please initialize first.');
  }
};

/**
 * Get or create the data folder for a specific type
 */
const getDataFolder = async (folderName) => {
  ensureReady();

  const appFolderId = await getOrCreateAppFolder();

  try {
    // Search for existing folder
    const searchResponse = await window.gapi.client.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${appFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    const existingFolder = searchResponse.result.files?.find(f => f.name === folderName);

    if (existingFolder) {
      return existingFolder.id;
    }

    // Create new folder
    const createResponse = await window.gapi.client.drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [appFolderId]
      },
      fields: 'id'
    });

    return createResponse.result.id;
  } catch (error) {
    console.error(`❌ Error getting/creating ${folderName} folder:`, error);
    throw error;
  }
};

/**
 * Generate a unique ID for new items
 */
const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Read a JSON file from Google Drive
 */
const readJsonFile = async (fileId) => {
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return JSON.parse(response.body);
  } catch (error) {
    console.error('❌ Error reading JSON file:', error);
    throw error;
  }
};

/**
 * Write a JSON file to Google Drive
 */
const writeJsonFile = async (folderId, fileName, data) => {
  try {
    const fileMetadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId]
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(fileMetadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(data) +
      close_delim;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
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
      throw new Error(errorData.error?.message || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('❌ Error writing JSON file:', error);
    throw error;
  }
};

/**
 * Update an existing JSON file
 */
const updateJsonFile = async (fileId, data) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error updating JSON file:', error);
    throw error;
  }
};

/**
 * Delete a file from Google Drive
 */
const deleteDriveFile = async (fileId) => {
  try {
    await window.gapi.client.drive.files.delete({ fileId: fileId });
    return true;
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};

// ============================================
// VAULT DOCUMENTS API
// ============================================

export const vaultStorage = {
  /**
   * Get all vault documents
   */
  getDocuments: async (category = null) => {
    try {
      const folderId = await getDataFolder('vault_documents');
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id,name,createdTime,modifiedTime)'
      });

      let documents = [];

      for (const file of response.result.files || []) {
        try {
          const data = await readJsonFile(file.id);
          documents.push({
            ...data,
            drive_file_id: file.id,
            created_at: file.createdTime,
            updated_at: file.modifiedTime
          });
        } catch (err) {
          console.error('Error reading document file:', file.name, err);
        }
      }

      // Sort by created date descending
      documents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (category && category !== 'all') {
        documents = documents.filter(doc => doc.category === category);
      }

      return documents;
    } catch (error) {
      console.error('❌ Error getting documents:', error);
      return [];
    }
  },

  /**
   * Create a new vault document
   */
  createDocument: async (document) => {
    try {
      const folderId = await getDataFolder('vault_documents');
      const docData = {
        id: generateId(),
        ...document,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const fileName = `doc_${docData.id}.json`;
      const fileId = await writeJsonFile(folderId, fileName, docData);

      return {
        ...docData,
        drive_file_id: fileId
      };
    } catch (error) {
      console.error('❌ Error creating document:', error);
      throw error;
    }
  },

  /**
   * Update a vault document
   */
  updateDocument: async (id, updates) => {
    try {
      const folderId = await getDataFolder('vault_documents');
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id,name)'
      });

      const targetFile = response.result.files?.find(f => f.name.includes(id));

      if (!targetFile) {
        throw new Error('Document not found');
      }

      const currentData = await readJsonFile(targetFile.id);
      const updatedData = {
        ...currentData,
        ...updates,
        updated_at: new Date().toISOString()
      };

      await updateJsonFile(targetFile.id, updatedData);

      return updatedData;
    } catch (error) {
      console.error('❌ Error updating document:', error);
      throw error;
    }
  },

  /**
   * Delete a vault document
   */
  deleteDocument: async (id) => {
    try {
      const folderId = await getDataFolder('vault_documents');
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id,name)'
      });

      const targetFile = response.result.files?.find(f => f.name.includes(id));

      if (!targetFile) {
        throw new Error('Document not found');
      }

      await deleteDriveFile(targetFile.id);
      return true;
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  }
};

// ============================================
// JOURNALS API
// ============================================

export const journalStorage = {
  /**
   * Get all journal entries
   */
  getJournals: async (type = null) => {
    try {
      const folderId = await getDataFolder('journals');
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id,name,createdTime)'
      });

      let journals = [];

      for (const file of response.result.files || []) {
        try {
          const data = await readJsonFile(file.id);
          journals.push({
            ...data,
            drive_file_id: file.id,
            created_at: file.createdTime
          });
        } catch (err) {
          console.error('Error reading journal file:', file.name, err);
        }
      }

      // Sort by entry date descending
      journals.sort((a, b) => new Date(b.entry_datetime) - new Date(a.entry_datetime));

      if (type && type !== 'all') {
        journals = journals.filter(j => j.type === type);
      }

      return journals;
    } catch (error) {
      console.error('❌ Error getting journals:', error);
      return [];
    }
  },

  /**
   * Create a new journal entry
   */
  createJournal: async (journal) => {
    try {
      const folderId = await getDataFolder('journals');
      const journalData = {
        id: generateId(),
        ...journal,
        created_at: new Date().toISOString()
      };

      const fileName = `journal_${journalData.id}.json`;
      const fileId = await writeJsonFile(folderId, fileName, journalData);

      return {
        ...journalData,
        drive_file_id: fileId
      };
    } catch (error) {
      console.error('❌ Error creating journal:', error);
      throw error;
    }
  },

  /**
   * Delete a journal entry
   */
  deleteJournal: async (id) => {
    try {
      const folderId = await getDataFolder('journals');
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id,name)'
      });

      const targetFile = response.result.files?.find(f => f.name.includes(id));

      if (!targetFile) {
        throw new Error('Journal not found');
      }

      await deleteDriveFile(targetFile.id);
      return true;
    } catch (error) {
      console.error('❌ Error deleting journal:', error);
      throw error;
    }
  }
};

// ============================================
// SAFETY CONTACTS API
// ============================================

export const safetyStorage = {
  /**
   * Get all safety contacts
   */
  getContacts: async () => {
    try {
      const folderId = await getDataFolder('safety');
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id,name)'
      });

      let contacts = [];

      for (const file of response.result.files || []) {
        try {
          const data = await readJsonFile(file.id);
          if (data.type === 'contact') {
            contacts.push(data);
          }
        } catch (err) {
          console.error('Error reading contact file:', err);
        }
      }

      return contacts;
    } catch (error) {
      console.error('❌ Error getting contacts:', error);
      return [];
    }
  },

  /**
   * Add a safety contact
   */
  addContact: async (contact) => {
    try {
      const folderId = await getDataFolder('safety');
      const contactData = {
        id: generateId(),
        type: 'contact',
        ...contact,
        created_at: new Date().toISOString()
      };

      const fileName = `contact_${contactData.id}.json`;
      await writeJsonFile(folderId, fileName, contactData);

      return contactData;
    } catch (error) {
      console.error('❌ Error adding contact:', error);
      throw error;
    }
  }
};

export default {
  initialize: initializeStorage,
  isReady: () => dataReady,
  vault: vaultStorage,
  journal: journalStorage,
  safety: safetyStorage
};
