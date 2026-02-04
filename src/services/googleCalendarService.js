/**
 * Google Calendar Service
 * Handles all Google Calendar API interactions including OAuth, event creation, and fetching
 */

const GOOGLE_CLIENT_ID = '947408696329-0eprnf9okvvd85fi2fof5juitcg9sh82.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyBCwjD1rSv2JdKgqBltOHSvkjxiZ0raKuY';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let accessToken = null;

/**
 * Initialize Google API client
 */
export const initializeGoogleApi = () => {
  return new Promise((resolve, reject) => {
    if (gapiInited) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInited = true;
          console.log('✅ Google API initialized');
          resolve();
        } catch (error) {
          console.error('❌ Error initializing Google API:', error);
          reject(error);
        }
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.head.appendChild(script);
  });
};

/**
 * Initialize Google Identity Services (GIS) for OAuth
 */
export const initializeGoogleIdentity = () => {
  return new Promise((resolve, reject) => {
    if (gisInited) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      try {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: CALENDAR_SCOPE,
          callback: (response) => {
            if (response.access_token) {
              accessToken = response.access_token;
              console.log('✅ Access token received');
              // Store token in localStorage for persistence
              localStorage.setItem('google_calendar_token', response.access_token);
              localStorage.setItem('google_token_expires_at', 
                Date.now() + (response.expires_in * 1000));
            }
          },
          error_callback: (error) => {
            console.error('❌ OAuth error:', error);
            reject(error);
          }
        });
        gisInited = true;
        console.log('✅ Google Identity Services initialized');
        resolve();
      } catch (error) {
        console.error('❌ Error initializing Google Identity:', error);
        reject(error);
      }
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity script'));
    document.head.appendChild(script);
  });
};

/**
 * Initialize both Google API and Identity Services
 */
export const initializeGoogleServices = async () => {
  try {
    await initializeGoogleApi();
    await initializeGoogleIdentity();
    
    // Check if we have a stored token
    const storedToken = localStorage.getItem('google_calendar_token');
    const expiresAt = localStorage.getItem('google_token_expires_at');
    
    if (storedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      accessToken = storedToken;
      gapi.client.setToken({ access_token: accessToken });
      console.log('✅ Using stored access token');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Google services:', error);
    throw error;
  }
};

/**
 * Request OAuth access token from user
 */
export const requestGoogleCalendarAccess = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Identity not initialized'));
      return;
    }

    tokenClient.requestAccessToken({
      prompt: 'consent',
      callback: (response) => {
        if (response.access_token) {
          resolve(response);
        } else if (response.error) {
          reject(new Error(response.error_description || response.error));
        }
      }
    });
  });
};

/**
 * Check if user has valid Google Calendar access
 */
export const hasGoogleCalendarAccess = () => {
  return !!accessToken;
};

/**
 * Sign out from Google Calendar
 */
export const signOutGoogleCalendar = () => {
  if (accessToken) {
    const token = gapi.client.getToken();
    if (token) {
      google.accounts.oauth2.revoke(token.access_token);
    }
    accessToken = null;
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_token_expires_at');
    console.log('✅ Signed out from Google Calendar');
  }
};

/**
 * Create a Google Calendar event
 * @param {Object} eventData - Event data
 * @param {string} eventData.title - Event title
 * @param {string} eventData.description - Event description
 * @param {Date} eventData.startTime - Event start time
 * @param {Date} eventData.endTime - Event end time
 * @returns {Promise<Object>} Created event
 */
export const createCalendarEvent = async (eventData) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  try {
    const event = {
      summary: eventData.title || 'Journal Entry',
      description: eventData.description || '',
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'Asia/Kuala_Lumpur'
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: 'Asia/Kuala_Lumpur'
      },
      reminders: {
        useDefault: true
      }
    };

    console.log('Creating calendar event:', event);

    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    console.log('✅ Event created:', response.result);
    return response.result;
  } catch (error) {
    console.error('❌ Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Fetch upcoming events from Google Calendar
 * @param {number} maxResults - Maximum number of events to fetch (default: 10)
 * @returns {Promise<Array>} List of events
 */
export const fetchUpcomingEvents = async (maxResults = 10) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  try {
    const now = new Date();
    const timeMin = now.toISOString();

    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.result.items || [];
    console.log(`✅ Fetched ${events.length} upcoming events`);
    return events;
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    throw error;
  }
};

/**
 * Delete a calendar event
 * @param {string} eventId - Google Calendar event ID
 */
export const deleteCalendarEvent = async (eventId) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  try {
    await gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });
    console.log('✅ Event deleted:', eventId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    throw error;
  }
};

/**
 * Update a calendar event
 * @param {string} eventId - Google Calendar event ID
 * @param {Object} eventData - Updated event data
 */
export const updateCalendarEvent = async (eventId, eventData) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  try {
    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'Asia/Kuala_Lumpur'
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: 'Asia/Kuala_Lumpur'
      }
    };

    const response = await gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event
    });

    console.log('✅ Event updated:', response.result);
    return response.result;
  } catch (error) {
    console.error('❌ Error updating event:', error);
    throw error;
  }
};

/**
 * Refresh access token if expired
 */
export const refreshAccessToken = async () => {
  const expiresAt = localStorage.getItem('google_token_expires_at');
  
  if (!expiresAt || Date.now() >= parseInt(expiresAt)) {
    console.log('🔄 Token expired, requesting new token');
    await requestGoogleCalendarAccess();
  }
};

// Export utility functions
export const getAccessToken = () => accessToken;
export const isInitialized = () => gapiInited && gisInited;