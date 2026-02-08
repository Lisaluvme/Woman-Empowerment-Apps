/**
 * Google Calendar Service - OAuth Only Version
 * This version uses only OAuth tokens and doesn't require API key initialization
 * Use this if you're getting 403 errors with the API key
 */

const GOOGLE_CLIENT_ID = '947408696329-0eprnf9okvvd85fi2fof5juitcg9sh82.apps.googleusercontent.com';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_API_URL = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient = null;
let gisInited = false;
let accessToken = null;
let gapiLoaded = false;
let calendarApiLoaded = false;

/**
 * Load gapi.client with only OAuth (no API key needed)
 */
export const loadGapiClient = () => {
  return new Promise((resolve, reject) => {
    if (gapiLoaded && window.gapi && window.gapi.client) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client', () => {
        // Don't initialize with API key - we'll use OAuth token instead
        gapiLoaded = true;
        console.log('✅ Google API client loaded (OAuth mode)');
        resolve();
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.head.appendChild(script);
  });
};

/**
 * Load the Calendar API discovery document
 */
export const loadCalendarApi = async () => {
  if (calendarApiLoaded && gapi.client.calendar) {
    return;
  }

  try {
    await gapi.client.load(CALENDAR_API_URL);
    calendarApiLoaded = true;
    console.log('✅ Google Calendar API loaded');
  } catch (error) {
    console.error('❌ Failed to load Calendar API:', error);
    throw error;
  }
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
              // Set the token for gapi.client
              gapi.client.setToken({ access_token: response.access_token });
              console.log('✅ Access token received and set');

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
 * Initialize Google Services (OAuth only - no API key needed)
 */
export const initializeGoogleServices = async () => {
  try {
    await loadGapiClient();
    await initializeGoogleIdentity();

    // Check if we have a stored token
    const storedToken = localStorage.getItem('google_calendar_token');
    const expiresAt = localStorage.getItem('google_token_expires_at');

    if (storedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      accessToken = storedToken;
      gapi.client.setToken({ access_token: accessToken });
      console.log('✅ Using stored access token');
      // Load Calendar API when we have a valid token
      await loadCalendarApi();
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
      callback: async (response) => {
        if (response.access_token) {
          console.log('✅ Token received via OAuth flow');
          // Load Calendar API after getting the token
          try {
            await loadCalendarApi();
          } catch (error) {
            console.error('Failed to load Calendar API after OAuth:', error);
          }
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
  return !!accessToken && calendarApiLoaded;
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
    calendarApiLoaded = false;
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_token_expires_at');
    console.log('✅ Signed out from Google Calendar');
  }
};

/**
 * Make a direct API call using OAuth token
 * This bypasses the need for API key initialization
 */
const makeCalendarRequest = async (request) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  if (!calendarApiLoaded) {
    throw new Error('Calendar API not loaded. Please connect Google Calendar first.');
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
    console.error('❌ API request error:', error);

    // If token expired, try to refresh
    if (error.status === 401) {
      console.log('🔄 Token expired, attempting refresh');
      await requestGoogleCalendarAccess();
      // Retry the request
      return await request();
    }

    throw error;
  }
};

/**
 * Create a Google Calendar event
 */
export const createCalendarEvent = async (eventData) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  if (!calendarApiLoaded) {
    throw new Error('Calendar API not loaded. Please connect Google Calendar first.');
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

    console.log('Creating calendar event via OAuth:', event);

    // Direct REST API call using OAuth token
    const response = await makeCalendarRequest(async () => {
      return await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
    });

    console.log('✅ Event created via OAuth:', response.result);
    return response.result;
  } catch (error) {
    console.error('❌ Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Fetch upcoming events from Google Calendar
 */
export const fetchUpcomingEvents = async (maxResults = 10) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  if (!calendarApiLoaded) {
    throw new Error('Calendar API not loaded. Please connect Google Calendar first.');
  }

  try {
    const now = new Date();
    const timeMin = now.toISOString();

    const response = await makeCalendarRequest(async () => {
      return await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });
    });

    const events = response.result.items || [];
    console.log(`✅ Fetched ${events.length} upcoming events via OAuth`);
    return events;
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    throw error;
  }
};

/**
 * Delete a calendar event
 */
export const deleteCalendarEvent = async (eventId) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  if (!calendarApiLoaded) {
    throw new Error('Calendar API not loaded. Please connect Google Calendar first.');
  }

  try {
    await makeCalendarRequest(async () => {
      return await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });
    });
    console.log('✅ Event deleted via OAuth:', eventId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    throw error;
  }
};

/**
 * Update a calendar event
 */
export const updateCalendarEvent = async (eventId, eventData) => {
  if (!accessToken) {
    throw new Error('No access token. Please connect Google Calendar first.');
  }

  if (!calendarApiLoaded) {
    throw new Error('Calendar API not loaded. Please connect Google Calendar first.');
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

    const response = await makeCalendarRequest(async () => {
      return await gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event
      });
    });

    console.log('✅ Event updated via OAuth:', response.result);
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
export const isInitialized = () => gisInited && gapiLoaded;
export const isCalendarApiReady = () => calendarApiLoaded;
