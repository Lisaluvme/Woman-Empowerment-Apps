/**
 * Google Calendar Integration Component
 * Provides UI for connecting Google Calendar, viewing events, and syncing with Firebase
 */

import React, { useState, useEffect } from 'react';
import { Calendar, CalendarDays, CalendarCheck, RefreshCw, X, ExternalLink } from 'lucide-react';
import {
  initializeGoogleServices,
  requestGoogleCalendarAccess,
  hasGoogleCalendarAccess,
  signOutGoogleCalendar,
  createCalendarEvent,
  fetchUpcomingEvents,
  deleteCalendarEvent,
  refreshAccessToken
} from '../services/googleCalendarServiceOAuthOnly';

const GoogleCalendarIntegration = ({ user, journalEntry, onSyncSuccess }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [error, setError] = useState('');

  // Initialize Google Services on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeGoogleServices();
        setIsInitialized(true);
        setIsConnected(hasGoogleCalendarAccess());
      } catch (err) {
        console.error('Failed to initialize Google services:', err);
        setError('Failed to initialize Google Calendar. Please try again.');
      }
    };
    init();
  }, []);

  // Auto-sync journal entry to calendar when it changes
  useEffect(() => {
    if (journalEntry && isConnected) {
      syncJournalToCalendar();
    }
  }, [journalEntry, isConnected]);

  /**
   * Connect to Google Calendar
   */
  const handleConnect = async () => {
    if (!isInitialized) {
      setError('Google services not initialized yet. Please wait...');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      await requestGoogleCalendarAccess();
      setIsConnected(true);
      setSyncStatus('✅ Successfully connected to Google Calendar!');
      setTimeout(() => setSyncStatus(''), 3000);
      
      // Fetch events after connection
      await fetchEvents();
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect to Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect from Google Calendar
   */
  const handleDisconnect = () => {
    try {
      signOutGoogleCalendar();
      setIsConnected(false);
      setEvents([]);
      setSyncStatus('✅ Disconnected from Google Calendar');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect from Google Calendar');
    }
  };

  /**
   * Fetch upcoming events from Google Calendar
   */
  const fetchEvents = async () => {
    if (!isConnected) return;

    setIsLoadingEvents(true);
    setError('');

    try {
      await refreshAccessToken();
      const upcomingEvents = await fetchUpcomingEvents(10);
      setEvents(upcomingEvents);
    } catch (err) {
      console.error('Fetch events error:', err);
      setError('Failed to fetch calendar events. Please reconnect.');
      if (err.status === 401) {
        setIsConnected(false);
      }
    } finally {
      setIsLoadingEvents(false);
    }
  };

  /**
   * Sync journal entry to Google Calendar
   */
  const syncJournalToCalendar = async () => {
    if (!isConnected || !journalEntry) return;

    setError('');
    setSyncStatus('Syncing to Google Calendar...');

    try {
      await refreshAccessToken();

      // Create event from journal entry
      const startTime = new Date(journalEntry.createdAt);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

      const event = await createCalendarEvent({
        title: journalEntry.title || 'Journal Entry',
        description: journalEntry.content || '',
        startTime: startTime,
        endTime: endTime
      });

      setSyncStatus('✅ Journal synced to Google Calendar!');
      
      // Store Google event ID in journal entry (for future updates)
      if (onSyncSuccess) {
        onSyncSuccess(event.id, event.htmlLink);
      }

      setTimeout(() => setSyncStatus(''), 3000);

      // Refresh events list
      await fetchEvents();
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync journal to calendar');
      setSyncStatus('❌ Sync failed');
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  /**
   * Delete an event from Google Calendar
   */
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event from Google Calendar?')) return;

    try {
      await refreshAccessToken();
      await deleteCalendarEvent(eventId);
      
      // Remove from local state
      setEvents(events.filter(e => e.id !== eventId));
      setSyncStatus('✅ Event deleted');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete event');
    }
  };

  /**
   * Format event date for display
   */
  const formatEventDate = (event) => {
    const date = new Date(event.start.dateTime || event.start.date);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kuala_Lumpur'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Google Calendar</h2>
            <p className="text-sm text-gray-500">Sync your journal entries</p>
          </div>
        </div>

        {/* Connection Status Badge */}
        {isConnected && (
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <CalendarCheck className="w-4 h-4" />
            <span>Connected</span>
          </div>
        )}
      </div>

      {/* Connection Button */}
      {!isConnected ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Google Calendar
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Sync your journal entries to your Google Calendar automatically
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting || !isInitialized}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                <span>Connect Google Calendar</span>
              </>
            )}
          </button>
          {!isInitialized && (
            <p className="text-xs text-gray-500 mt-2">Initializing...</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Refresh events</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchEvents}
                disabled={isLoadingEvents}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isLoadingEvents ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Sync Status */}
          {syncStatus && (
            <div className={`text-sm ${syncStatus.includes('✅') ? 'text-green-600' : 'text-blue-600'}`}>
              {syncStatus}
            </div>
          )}

          {/* Upcoming Events */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <CalendarDays className="w-4 h-4 mr-2" />
              Upcoming Events
            </h3>
            
            {events.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {event.summary}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatEventDate(event)}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        <a
                          href={event.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View in Google Calendar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete event"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarIntegration;