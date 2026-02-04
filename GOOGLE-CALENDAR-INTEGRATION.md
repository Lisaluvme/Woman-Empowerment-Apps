# Google Calendar Integration Guide

## 🎯 Overview

This WebApp now includes full Google Calendar integration, allowing users to seamlessly sync journal entries to their Google Calendar. The integration provides a complete "personal command center" experience where journal entries automatically become calendar events.

## ✨ Features

- ✅ **OAuth 2.0 Authentication**: Secure Google Calendar access using Google Identity Services
- ✅ **Automatic Event Creation**: Journal entries automatically sync to Google Calendar
- ✅ **Event Management**: View, create, and delete calendar events
- ✅ **Real-time Sync**: Changes are immediately reflected in Google Calendar
- ✅ **Token Management**: Automatic token refresh for persistent access
- ✅ **Modern UI**: Clean, Apple-like design with smooth interactions

## 📁 Architecture

### Component Structure

```
src/
├── services/
│   └── googleCalendarService.js    # Core Google Calendar API logic
├── components/
│   ├── GoogleCalendarIntegration.jsx  # Calendar connection & event display
│   ├── JournalWithCalendar.jsx        # Journal entry form with sync
│   └── MainApp.jsx                    # Updated with calendar tabs
```

### Data Flow

```
User creates journal entry
    ↓
Saved to Firebase Firestore
    ↓
Triggers Google Calendar sync
    ↓
Event created in Google Calendar
    ↓
Google Event ID stored in Firebase
    ↓
User can view/manage in both places
```

## 🔑 Google Credentials

The integration uses your provided Google OAuth credentials:

- **Client ID**: `947408696329-0eprnf9okvvd85fi2fof5juitcg9sh82.apps.googleusercontent.com`
- **API Key**: `AIzaSyBCwjD1rSv2JdKgqBltOHSvkjxiZ0raKuY`
- **Scope**: `https://www.googleapis.com/auth/calendar.events`

## 🚀 Setup Instructions

### 1. Google Cloud Console Setup

If you need to create new credentials or modify existing ones:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Calendar API**
4. Configure OAuth consent screen:
   - Application type: Web application
   - Authorized redirect URIs: Add your app URLs
5. Create OAuth 2.0 credentials
6. Copy Client ID and API Key

### 2. Update Environment Variables (Optional)

If you prefer using environment variables:

```env
# In .env file
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_GOOGLE_API_KEY=your-api-key
```

Then update `src/services/googleCalendarService.js`:

```javascript
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'default-client-id';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'default-api-key';
```

### 3. Install Dependencies

```bash
npm install @react-oauth/google
```

### 4. Firebase Firestore Structure

Ensure your Firestore has the following structure:

```
journals/
  {journalId}
    userId: string
    title: string
    content: string
    createdAt: timestamp
    updatedAt: timestamp
    syncedToCalendar: boolean
    googleEventId?: string  // Optional: Store Google Calendar event ID
    googleEventLink?: string // Optional: Store link to Google Calendar event
```

## 📱 Usage Guide

### For Users

#### 1. Connect Google Calendar

1. Navigate to the **Journal** tab (new calendar icon in bottom nav)
2. Click **"Connect Google Calendar"**
3. Sign in with your Google account
4. Grant calendar permissions
5. Connection successful!

#### 2. Create Journal Entry

1. Go to **Journal** tab
2. Enter title and content
3. Click **"Save Journal Entry"**
4. Entry automatically syncs to Google Calendar as a 1-hour event
5. View the event in Google Calendar or in the app's Calendar tab

#### 3. View Calendar Events

1. Go to **Calendar** tab
2. See all upcoming events from Google Calendar
3. Click on events to view details
4. Open events directly in Google Calendar
5. Delete events if needed

#### 4. Disconnect

1. In Calendar tab, click **"Disconnect"**
2. All local calendar data is cleared
3. Events in Google Calendar remain intact

## 🔐 Security Best Practices

### 1. Token Storage

**Current Implementation**: Tokens stored in `localStorage`

```javascript
localStorage.setItem('google_calendar_token', accessToken);
localStorage.setItem('google_token_expires_at', expiresAt);
```

**Security Considerations**:
- ✅ Convenient for development
- ⚠️ Vulnerable to XSS attacks in production
- ✅ Automatically expires after 1 hour

**Production Recommendation**:
```javascript
// Use HttpOnly cookies via backend
// Or implement secure session management
```

### 2. Token Refresh

The integration automatically handles token refresh:

```javascript
export const refreshAccessToken = async () => {
  const expiresAt = localStorage.getItem('google_token_expires_at');
  
  if (!expiresAt || Date.now() >= parseInt(expiresAt)) {
    console.log('🔄 Token expired, requesting new token');
    await requestGoogleCalendarAccess();
  }
};
```

### 3. Scope Limiting

The app only requests minimal necessary permissions:

```javascript
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
```

This allows:
- ✅ Creating events
- ✅ Reading events
- ✅ Deleting events
- ❌ Cannot access user's personal information
- ❌ Cannot access other Google services

### 4. CORS Configuration

Ensure your Google Cloud Console has correct CORS settings:

```
Authorized JavaScript origins:
- http://localhost:5173  (Development)
- https://yourdomain.com (Production)
```

## 🛠️ Development

### Testing the Integration

1. **Start Development Server**:
```bash
npm run dev
```

2. **Test OAuth Flow**:
   - Click "Connect Google Calendar"
   - Complete Google sign-in
   - Verify token is stored

3. **Test Event Creation**:
   - Create a journal entry
   - Check Google Calendar web interface
   - Verify event appears with correct title/time

4. **Test Event Fetching**:
   - Click "Refresh" in Calendar tab
   - Verify upcoming events display

5. **Test Event Deletion**:
   - Delete an event from the app
   - Verify it's removed from Google Calendar

### Debugging

Enable detailed console logs:

```javascript
// In googleCalendarService.js
console.log('✅ Google API initialized');
console.log('✅ Access token received');
console.log('✅ Event created:', response.result);
```

Check browser console for:
- API initialization status
- OAuth flow errors
- Event creation/response details

## 🚢 Production Deployment

### 1. Domain Configuration

Add your production domain to Google Cloud Console:

```
Authorized JavaScript origins:
- https://your-app.netlify.app
- https://www.your-custom-domain.com
```

### 2. Environment Variables

Set environment variables in your hosting platform:

**Netlify**:
```bash
# Site Settings > Environment Variables
VITE_GOOGLE_CLIENT_ID=your-production-client-id
VITE_GOOGLE_API_KEY=your-production-api-key
```

**Vercel**:
```bash
# Settings > Environment Variables
VITE_GOOGLE_CLIENT_ID=your-production-client-id
VITE_GOOGLE_API_KEY=your-production-api-key
```

### 3. Build & Deploy

```bash
npm run build
# Deploy the dist/ folder
```

### 4. Firebase Security Rules

Update Firestore rules to sync Google Calendar data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // User profile rules
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /journals/{journalId} {
      // Only owner can read/write their journals
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🔄 Sync Logic

### Firebase → Google Calendar

When a journal entry is created:

```javascript
// 1. Save to Firebase
const docRef = await addDoc(collection(db, 'journals'), journalData);

// 2. Create Google Calendar event
const event = await createCalendarEvent({
  title: journalEntry.title,
  description: journalEntry.content,
  startTime: new Date(journalEntry.createdAt),
  endTime: new Date(startTime.getTime() + 60 * 60 * 1000)
});

// 3. Update Firebase with Google event data
await updateDoc(docRef, {
  googleEventId: event.id,
  googleEventLink: event.htmlLink,
  syncedToCalendar: true
});
```

### Avoiding Duplicates

```javascript
// Check if already synced
if (journalEntry.googleEventId) {
  // Update existing event instead of creating new one
  await updateCalendarEvent(journalEntry.googleEventId, eventData);
} else {
  // Create new event
  const event = await createCalendarEvent(eventData);
}
```

## 🎨 UI Design

### Design Principles

- **Minimalistic**: Clean white backgrounds with subtle shadows
- **Modern**: Rounded corners (2xl), gradient accents
- **Responsive**: Works on mobile and desktop
- **Interactive**: Hover effects, smooth transitions
- **Status Indicators**: Visual feedback for connection state

### Color Scheme

```css
/* Primary Gradients */
from-blue-500 to-indigo-600  /* Calendar connection */
from-purple-500 to-pink-600  /* Journal entries */

/* Status Colors */
bg-green-50 text-green-700   /* Success */
bg-blue-50 text-blue-700     /* Info */
bg-red-50 text-red-700       /* Error */
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to initialize Google API"

**Cause**: Scripts not loaded or API key invalid

**Solution**:
```javascript
// Check browser console for specific error
// Verify API key is correct
// Check network tab for failed requests
```

#### 2. OAuth Popup Blocked

**Cause**: Browser popup blocker

**Solution**:
- Allow popups for your development domain
- Click "Allow" when prompted

#### 3. 401 Unauthorized Error

**Cause**: Access token expired

**Solution**:
```javascript
// Token refresh is automatic
// Check localStorage for token_expires_at
// Manually disconnect and reconnect
```

#### 4. Events Not Appearing

**Cause**: Timezone mismatch or future date

**Solution**:
```javascript
// Ensure events are created with current time
const startTime = new Date();
const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
// Check Google Calendar in correct timezone (Asia/Kuala_Lumpur)
```

## 📚 API Reference

### googleCalendarService.js

#### Initialization

```javascript
await initializeGoogleServices();
```

#### Authentication

```javascript
await requestGoogleCalendarAccess();
signOutGoogleCalendar();
hasGoogleCalendarAccess();
```

#### Event Management

```javascript
// Create event
const event = await createCalendarEvent({
  title: "My Event",
  description: "Event details",
  startTime: new Date(),
  endTime: new Date(Date.now() + 3600000)
});

// Fetch events
const events = await fetchUpcomingEvents(10);

// Delete event
await deleteCalendarEvent(eventId);

// Update event
await updateCalendarEvent(eventId, eventData);
```

## 🔮 Future Enhancements

### Planned Features

1. **Two-way Sync**: Edit events in Google Calendar → Update Firebase
2. **Recurring Events**: Support for recurring journal entries
3. **Calendar Views**: Week/month view in the app
4. **Offline Support**: Cache events locally
5. **Multiple Calendars**: Select which calendar to sync to
6. **Event Reminders**: Custom reminder times
7. **Event Categories**: Color-coded journal types
8. **Export Features**: Export to iCal format

### Scalability

For production-scale applications:

```javascript
// Backend service for token management
// Rate limiting for API calls
// Batch operations for multiple events
// Background sync workers
// Analytics for calendar usage
```

## 📞 Support

For issues or questions:

1. Check browser console for error messages
2. Verify Google Cloud Console configuration
3. Review Firebase Firestore rules
4. Check network tab for failed API requests

## 📄 License

This integration is part of the iSync7777CALL Woman Empowerment Apps project.

---

**Version**: 1.0.0  
**Last Updated**: February 4, 2026  
**Timezone**: Asia/Kuala_Lumpur (UTC+8)