/**
 * ============================================
 * API SERVICE LAYER
 * Women Empowerment Super App Lite
 * ============================================
 * 
 * This service handles all API communication with the backend.
 * It automatically includes Firebase ID tokens in requests.
 * 
 * Architecture:
 * 1. Get Firebase ID token from current user
 * 2. Attach token to Authorization header
 * 3. Backend verifies token and extracts Firebase UID
 * 4. Backend uses Firebase UID to query Supabase
 */

import { auth } from '../firebase-config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get current Firebase ID token
 */
const getAuthToken = async () => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user');
  }
  
  try {
    const token = await auth.currentUser.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
};

/**
 * Make authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

export const userAPI = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    return apiRequest('/api/user/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    return apiRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
};

// ============================================
// VAULT DOCUMENTS
// ============================================

export const vaultAPI = {
  /**
   * Get vault documents
   */
  getDocuments: async (category = null) => {
    const query = category ? `?category=${category}` : '';
    return apiRequest(`/api/vault/documents${query}`);
  },

  /**
   * Create vault document
   */
  createDocument: async (document) => {
    return apiRequest('/api/vault/documents', {
      method: 'POST',
      body: JSON.stringify(document)
    });
  },

  /**
   * Update vault document
   */
  updateDocument: async (id, updates) => {
    return apiRequest(`/api/vault/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Delete vault document
   */
  deleteDocument: async (id) => {
    return apiRequest(`/api/vault/documents/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============================================
// JOURNALS
// ============================================

export const journalAPI = {
  /**
   * Get journals
   */
  getJournals: async (type = null) => {
    const query = type ? `?type=${type}` : '';
    return apiRequest(`/api/journals${query}`);
  },

  /**
   * Create journal entry
   */
  createJournal: async (journal) => {
    return apiRequest('/api/journals', {
      method: 'POST',
      body: JSON.stringify(journal)
    });
  },

  /**
   * Delete journal entry
   */
  deleteJournal: async (id) => {
    return apiRequest(`/api/journals/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============================================
// CAREER GOALS
// ============================================

export const careerAPI = {
  /**
   * Get career goals
   */
  getGoals: async (status = null) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/api/career/goals${query}`);
  },

  /**
   * Create career goal
   */
  createGoal: async (goal) => {
    return apiRequest('/api/career/goals', {
      method: 'POST',
      body: JSON.stringify(goal)
    });
  },

  /**
   * Update career goal
   */
  updateGoal: async (id, updates) => {
    return apiRequest(`/api/career/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
};

// ============================================
// SAFETY FEATURES
// ============================================

export const safetyAPI = {
  /**
   * Get trusted contacts
   */
  getContacts: async () => {
    return apiRequest('/api/safety/contacts');
  },

  /**
   * Add trusted contact
   */
  addContact: async (contact) => {
    return apiRequest('/api/safety/contacts', {
      method: 'POST',
      body: JSON.stringify(contact)
    });
  },

  /**
   * Create safety alert
   */
  createAlert: async (alert) => {
    return apiRequest('/api/safety/alerts', {
      method: 'POST',
      body: JSON.stringify(alert)
    });
  }
};

// ============================================
// FAMILY COLLABORATION
// ============================================

export const familyAPI = {
  /**
   * Get family groups
   */
  getGroups: async () => {
    return apiRequest('/api/family/groups');
  },

  /**
   * Create family group
   */
  createGroup: async (group) => {
    return apiRequest('/api/family/groups', {
      method: 'POST',
      body: JSON.stringify(group)
    });
  }
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthAPI = {
  check: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

// Export all APIs
export default {
  user: userAPI,
  vault: vaultAPI,
  journal: journalAPI,
  career: careerAPI,
  safety: safetyAPI,
  family: familyAPI,
  health: healthAPI
};