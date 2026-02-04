# 🔧 Google Calendar API - 403 Error Fix

## ❌ Current Error

```
Failed to load resource: the server responded with a status of 403
content.googleapis.com/discovery/v1/apis/calendar/v1/rest
```

## 🎯 Root Cause

The API key `AIzaSyBCwjD1rSv2JdKgqBltOHSvkjxiZ0raKuY` is getting a 403 Forbidden error because:

1. **Google Calendar API is not enabled** in your Google Cloud Console project
2. **OR** the API key has restrictions (IP, domain, HTTP referrer)

## ✅ Solution 1: Enable Google Calendar API (Recommended)

### Step 1: Go to Google Cloud Console
1. Visit https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Make sure you're using the same project that has Client ID: `947408696329-0eprnf9okvvd85fi2fof5juitcg9sh82.apps.googleusercontent.com`

### Step 2: Enable Google Calendar API
1. Navigate to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

### Step 3: Configure API Key
1. Go to **APIs & Services** → **Credentials**
2. Find your API key: `AIzaSyBCwjD1rSv2JdKgqBltOHSvkjxiZ0raKuY`
3. Click the pencil icon to edit
4. Under **Application restrictions**, select **None** (for development)
5. Under **API restrictions**, select **Google Calendar API**
6. Click **Save**

### Step 4: Wait and Test
1. Wait 2-5 minutes for changes to propagate
2. Refresh your app
3. Try connecting to Google Calendar again

## ✅ Solution 2: Use OAuth-Only Approach (Alternative)

If the API key issue persists, we can modify the integration to work without the API key (using only OAuth tokens):

```javascript
// In googleCalendarService.js, modify the initialization to not use API key
// This approach uses only OAuth tokens for authentication
```

### Advantages:
- No API key needed
- More secure (uses user's OAuth token)
- Simpler setup

### Disadvantages:
- Slightly different implementation
- Need to modify existing code

## 🔄 Testing After Fix

Once you've enabled the API:

1. **Clear your browser cache**
2. **Refresh the app** (http://localhost:5173)
3. **Open browser console** (F12)
4. **Click Journal tab**
5. **Connect Google Calendar**
6. **Check for success message**: `✅ Google API initialized`

## 📋 Verification Checklist

Before the fix:
- [ ] Google Calendar API enabled
- [ ] API key has correct restrictions
- [ ] Client ID and API key are from same project
- [ ] No IP/domain restrictions on API key

After the fix:
- [ ] API initialization succeeds
- [ ] Can connect to Google Calendar
- [ ] Can create events
- [ ] Can fetch events

## 🎯 Quick Fix Steps (TL;DR)

1. Go to https://console.cloud.google.com/apis/dashboard
2. Click **+ ENABLE APIS AND SERVICES**
3. Search "Google Calendar API"
4. Click **Enable**
5. Wait 2-5 minutes
6. Refresh your app
7. Test again

## 🔍 Additional Resources

- [Enable Google Calendar API](https://console.cloud.google.com/flows/enableapi?apiid=calendar-json.googleapis.com)
- [API Key Best Practices](https://cloud.google.com/apis/docs/api-key-guide#restricting_api_keys)
- [OAuth 2.0 for Client-Side Web Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)

## 💬 Still Having Issues?

If after enabling the API you still get 403 errors:

1. **Check the exact error message** in the console
2. **Verify your API key** is correct
3. **Try creating a new API key** with no restrictions
4. **Check the Google Cloud Console quotas** for your API key
5. **Contact Google Cloud Support** if the issue persists

---

**Common Issue**: The API key works for some APIs but not others → This means the API key has API restrictions and you need to add Google Calendar API to the allowed list.