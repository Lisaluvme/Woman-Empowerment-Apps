# Journal Feature Setup Guide

This guide explains how to set up and use the Journal feature with Google Calendar integration.

## 🔧 Firebase Console Setup

### Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `woman-empowerment-apps`
3. In the left sidebar, click on **"Firestore Database"**
4. Click **"Create database"** (if not already created)
5. Choose **"Start in Test mode"** for now (we'll update rules later)
6. Select a location (choose closest to your users)

### Step 2: Deploy Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Delete the existing rules
3. Copy and paste the rules from `firestore.rules` file:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Journals collection
    match /journals/{journalId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // Allow create if user is authenticated
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      // Allow update if user owns the journal
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // Allow delete if user owns the journal
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Family tasks collection
    match /family_tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // Documents collection
    match /documents/{documentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Career goals collection
    match /career_goals/{goalId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

4. Click **"Publish"** to deploy the rules

### Step 3: Create Index (Optional, for better performance)

1. In Firestore Console, go to **Indexes** tab
2. Click **"Add Index"**
3. Collection ID: `journals`
4. Fields:
   - `userId` (Ascending)
   - `createdAt` (Descending)
5. Click **"Create Index"**

## 📱 How to Use the Journal Feature

### Creating a Journal Entry

1. **Open the App**
   - Navigate to the Home tab (Command Center)
   - Look for the "Journal" quick action button (book icon)

2. **Create Entry**
   - Click the **"Journal"** button
   - A modal will appear with the journal form

3. **Fill in Details**
   - **Title**: Enter a title for your journal entry
   - **Content**: Write your journal entry in the text area
   - Click **"Save Journal Entry"**

4. **Success**
   - You'll see a success message: ✅ Journal entry saved successfully!
   - The entry is saved to Firebase Firestore
   - The modal will close automatically after 1.5 seconds

### Google Calendar Integration

After creating a journal entry:

1. **View Calendar Sync Section**
   - Below the journal form, you'll see "Google Calendar Integration"
   - This section shows after creating a journal entry

2. **Connect Google Account**
   - Click **"Connect Google Calendar"**
   - You'll be redirected to Google's OAuth consent screen
   - Sign in with your Google account
   - Grant permissions to access your calendar

3. **Sync to Calendar**
   - Once connected, click **"Sync to Calendar"**
   - The journal entry will be created as a 1-hour event in Google Calendar
   - Event title: Your journal title
   - Event description: Your journal content
   - Event time: Starting from when you created the entry

4. **View Event**
   - After syncing, you'll see a "View Event" link
   - Click to view the event in Google Calendar

## 🔒 Security Features

- **User Isolation**: Each user can only see their own journal entries
- **Authentication Required**: Must be logged in to create/view journals
- **Firestore Rules**: Security rules enforce data ownership
- **Encrypted Storage**: All data is encrypted in transit and at rest

## 📊 Data Structure

Each journal entry contains:
```javascript
{
  userId: "user-uid",           // Firebase Auth user ID
  title: "Journal Title",       // Entry title
  content: "Journal content",   // Entry content
  createdAt: Timestamp,         // Server timestamp
  updatedAt: Timestamp,         // Server timestamp
  syncedToCalendar: false       // Calendar sync status
}
```

## 🐛 Troubleshooting

### Issue: "Permission Denied" Error

**Solution:**
1. Make sure Firestore security rules are deployed
2. Check that you're logged in
3. Verify the rules allow authenticated users to create documents

### Issue: Journal Not Saving

**Solution:**
1. Check browser console for errors
2. Verify Firebase configuration in .env file
3. Ensure Firestore is enabled in Firebase Console
4. Check that you have proper network connection

### Issue: Calendar Sync Not Working

**Solution:**
1. Make sure Google Calendar API is enabled in Google Cloud Console
2. Check that OAuth consent screen is configured
3. Verify redirect URI is set correctly
4. Check browser console for OAuth errors

### Issue: Can't See Journal Button

**Solution:**
1. Make sure you're on the Home tab
2. Look for the "Journal" button in Quick Actions section
3. Try refreshing the page
4. Clear browser cache and reload

## 📝 Best Practices

1. **Regular Backups**: Firestore automatically backs up your data
2. **Rich Content**: Write detailed journal entries for better reflection
3. **Calendar Organization**: Use calendar events to track journal themes
4. **Privacy**: Your journal entries are private and secure
5. **Mobile Access**: The journal works great on mobile devices

## 🚀 Next Steps

- Set up Firestore in Firebase Console (5 minutes)
- Deploy security rules (2 minutes)
- Test creating a journal entry
- Connect Google Calendar for sync
- Enjoy journaling!

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Review Firebase Console logs
3. Verify environment variables
4. Check that all services are enabled

---

**Ready to journal? Let's get started!** ✍️