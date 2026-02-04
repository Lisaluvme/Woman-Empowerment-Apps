# 🚀 Google Calendar Integration - Quick Start Guide

Get started with Google Calendar integration in 5 minutes!

## ⚡ Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
npm install @react-oauth/google
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Test the Integration
1. Open your app (usually http://localhost:5173)
2. Log in with Firebase
3. Click the **Journal** icon in bottom navigation
4. Click **"Connect Google Calendar"**
5. Sign in with your Google account
6. Create a journal entry
7. ✅ It automatically appears in your Google Calendar!

## 📱 How It Works

### User Flow

```
┌─────────────────┐
│  User logs in   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click Journal   │
│     Tab         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Connect Google  │
│    Calendar     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Grant OAuth    │
│   Permission    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Write Journal   │
│    Entry        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auto-Sync to   │
│ Google Calendar │
└─────────────────┘
```

## 🎯 Key Features

### ✅ What You Can Do

- **Create Journal Entries** → Auto-sync to Google Calendar
- **View Upcoming Events** → See all Google Calendar events
- **Manage Events** → Create, view, delete events
- **Persistent Connection** → Stay logged in across sessions

### 🔒 Security

- OAuth 2.0 authentication (industry standard)
- Minimal permissions (calendar.events only)
- Automatic token refresh
- No personal data access

## 📝 Example Usage

### Creating a Journal Entry

```javascript
// User fills out form:
{
  title: "Team Meeting Notes",
  content: "Discussed Q1 goals and roadmap..."
}

// Automatically creates Google Calendar event:
{
  summary: "Team Meeting Notes",
  description: "Discussed Q1 goals and roadmap...",
  start: "2026-02-04T19:46:00+08:00",
  end: "2026-02-04T20:46:00+08:00",
  duration: "1 hour"
}
```

### Viewing Events

```javascript
// Upcoming events fetched from Google Calendar
const events = [
  {
    id: "event123",
    summary: "Journal: Team Meeting Notes",
    start: { dateTime: "2026-02-04T19:46:00+08:00" },
    htmlLink: "https://calendar.google.com/event?eid=event123"
  }
];
```

## 🎨 UI Components

### 1. Journal Tab (New!)
- **Icon**: Calendar 📅
- **Location**: Bottom navigation (last icon)
- **Purpose**: Create journal entries with auto-sync

### 2. Calendar Integration
- **Features**: 
  - Connect/disconnect Google Calendar
  - View upcoming events
  - Refresh events list
  - Delete events
  - Open events in Google Calendar

## 🔧 Configuration

### Default Settings

```javascript
// Timezone
Asia/Kuala_Lumpur (UTC+8)

// Event Duration
1 hour (can be customized)

// Event Title
Journal entry title

// Event Description
Full journal content
```

### Customization Options

Want to change event duration? Edit `src/services/googleCalendarService.js`:

```javascript
// Change from 1 hour to 2 hours
const endTime = new Date(startTime.getTime() + 120 * 60 * 1000);
```

## 🐛 Common Issues & Solutions

### Issue 1: "Popup Blocked"
**Solution**: Allow popups for localhost in your browser settings

### Issue 2: "Token Expired"
**Solution**: Click "Disconnect" then reconnect - it's automatic!

### Issue 3: "Events Not Showing"
**Solution**: 
- Check Google Calendar in correct timezone (UTC+8)
- Ensure you're looking at the right date
- Try clicking "Refresh" button

## 📚 Next Steps

1. **Explore the UI**: Navigate to Journal and Calendar tabs
2. **Create Multiple Entries**: Test creating several journal entries
3. **Check Google Calendar**: Verify events appear correctly
4. **Test on Mobile**: Check responsive design
5. **Read Full Guide**: See `GOOGLE-CALENDAR-INTEGRATION.md` for details

## 🎓 Learning Resources

### Understanding OAuth

```javascript
// 1. User clicks "Connect"
// 2. Google asks for permission
// 3. User grants access
// 4. Google returns access token
// 5. App uses token to make API calls
// 6. Token expires after 1 hour
// 7. App automatically refreshes token
```

### Event Creation Flow

```javascript
// 1. Journal entry saved to Firebase
// 2. onCreate event triggers
// 3. Create Google Calendar event
// 4. Save Google event ID to Firebase
// 5. Display success message
```

## 💡 Pro Tips

### Tip 1: Organize Your Journal
Use descriptive titles for better calendar organization:
- ✅ "Q1 Planning Meeting"
- ❌ "Meeting"

### Tip 2: Use Rich Content
The full journal content becomes the event description:
- Include action items
- Add meeting notes
- Reference important dates

### Tip 3: Leverage Google Calendar
Once events are in Google Calendar:
- Set reminders
- Share with others
- Add attendees
- Create recurring events

## 🔮 What's Coming

Future enhancements planned:
- [ ] Two-way sync (edit in Google Calendar → update Firebase)
- [ ] Custom event durations
- [ ] Event categories/colors
- [ ] Batch event creation
- [ ] Calendar views (week/month)
- [ ] Offline support

## 📞 Need Help?

1. **Check Console**: Open browser DevTools for error messages
2. **Read Docs**: See `GOOGLE-CALENDAR-INTEGRATION.md`
3. **Verify Config**: Check Google Cloud Console settings
4. **Test Token**: Verify access token in localStorage

## ✅ Checklist

Before deploying to production:

- [ ] Test OAuth flow thoroughly
- [ ] Verify events appear in Google Calendar
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Update Google Cloud Console with production domain
- [ ] Set environment variables
- [ ] Update Firebase security rules
- [ ] Test token refresh logic
- [ ] Verify error handling
- [ ] Document custom configurations

---

**Ready to use?** Start the dev server and begin syncing! 🚀

```bash
npm run dev
```

**Questions?** Check the full integration guide or open an issue.