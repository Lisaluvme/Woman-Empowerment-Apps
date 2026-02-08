/**
 * Journal Entry Component with Google Calendar Sync
 * Allows users to create journal entries and automatically sync them to Google Calendar
 */

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Check, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';

const JournalWithCalendar = ({ user, onJournalCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Submit journal entry to Firebase
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setMessage('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Create journal entry in Firebase
      const journalData = {
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        syncedToCalendar: false
      };

      const docRef = await addDoc(collection(db, 'journals'), journalData);
      
      setMessage({
        type: 'success',
        text: '✅ Journal entry saved successfully!'
      });

      // Reset form
      setTitle('');
      setContent('');

      // Notify parent component
      if (onJournalCreated) {
        onJournalCreated({
          id: docRef.id,
          ...journalData,
          createdAt: new Date() // Use current time for calendar sync
        });
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving journal:', error);
      setMessage({
        type: 'error',
        text: '❌ Failed to save journal entry. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Journal Entry</h2>
          <p className="text-sm text-gray-500">Write and sync to your calendar</p>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className={`rounded-xl p-4 flex items-start space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Journal Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter journal title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={isSubmitting}
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your journal entry here..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
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
      </form>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 Tip:</span> After saving, connect to Google Calendar
          below to auto-sync this entry. Each entry becomes a 1-hour event on your calendar.
        </p>
      </div>
    </div>
  );
};

export default JournalWithCalendar;