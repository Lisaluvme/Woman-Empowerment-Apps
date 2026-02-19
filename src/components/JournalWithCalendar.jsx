/**
 * Journal Entry Component with Google Calendar Sync
 * Allows users to create journal entries and automatically sync them to Google Calendar
 */

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Check, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../firebase-config';

const JournalWithCalendar = ({ user, onJournalCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Get the current date and time in local format for inputs
   */
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().slice(0, 5); // HH:MM
    return { date, time };
  };

  // Initialize date and time with current values
  React.useEffect(() => {
    const { date, time } = getCurrentDateTime();
    setEntryDate(date);
    setEntryTime(time);
  }, []);

  /**
   * Combine date and time into a Date object
   */
  const getEntryDateTime = () => {
    if (!entryDate) return new Date();

    const dateTimeString = entryTime
      ? `${entryDate}T${entryTime}:00`
      : `${entryDate}T00:00:00`;

    return new Date(dateTimeString);
  };

  /**
   * Submit journal entry to Supabase
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage({
        type: 'error',
        text: 'Please fill in both title and content'
      });
      return;
    }

    if (!entryDate) {
      setMessage({
        type: 'error',
        text: 'Please select a date for this entry'
      });
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const entryDateTime = getEntryDateTime();

      // Create journal entry in Supabase
      const journalData = {
        firebase_uid: user.uid,
        title: title.trim(),
        content: content.trim(),
        type: 'personal',
        mood: null,
        entry_date: entryDate,
        entry_time: entryTime || '00:00',
        entry_datetime: entryDateTime.toISOString(),
        media_urls: [],
        tags: []
      };

      const { data, error } = await supabase
        .from('journals')
        .insert([journalData])
        .select()
        .single();

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Journal entry saved successfully!'
      });

      // Reset form
      setTitle('');
      setContent('');
      const { date, time } = getCurrentDateTime();
      setEntryDate(date);
      setEntryTime(time);

      // Notify parent component
      if (onJournalCreated) {
        onJournalCreated({
          id: data.id,
          ...journalData,
          createdAt: entryDateTime // Use selected date/time for calendar sync
        });
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving journal:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save journal entry. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg animate-glow">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Journal Entry</h2>
          <p className="text-sm text-gray-500">Write and sync to your calendar</p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-2xl p-4 flex items-start space-x-3 animate-bounce-in ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Journal Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date and Time Pickers */}
        <div className="grid grid-cols-2 gap-3 animate-slide-in-up" style={{ animationDelay: '0.05s' }}>
          <div>
            <label htmlFor="entryDate" className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Date
              </span>
            </label>
            <input
              type="date"
              id="entryDate"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              max="2100-12-31"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <label htmlFor="entryTime" className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Time
              </span>
            </label>
            <input
              type="time"
              id="entryTime"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Title Input */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter journal title..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            disabled={isSubmitting}
          />
        </div>

        {/* Content Textarea */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your journal entry here..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim() || !entryDate}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Save Journal Entry</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 Tip:</span> Select the date and time for your journal entry.
          After saving, connect to Google Calendar to auto-sync. The event will be created at your chosen date/time.
        </p>
      </div>
    </div>
  );
};

export default JournalWithCalendar;