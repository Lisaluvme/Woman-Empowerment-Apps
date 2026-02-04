# Netlify Environment Variables Setup Guide

This guide explains exactly which environment variables need to be configured in Netlify for your Women's Empowerment App to work properly.

## 🔑 Required Environment Variables

You need to add the following environment variables in your Netlify dashboard:

### How to Access Netlify Environment Variables

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site: `womanempowerment`
3. Click **Site settings** → **Build & deploy** → **Environment variables**
4. Click **Add a variable** for each environment variable below

---

## 📋 Complete Environment Variables List

### 1. Firebase Configuration Variables

```
VITE_FIREBASE_API_KEY=AIzaSyC50ruUkZQ5F9oMOG2bjhlvkBvc_IN4Pfg
VITE_FIREBASE_AUTH_DOMAIN=woman-empowerment-apps.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=woman-empowerment-apps
VITE_FIREBASE_STORAGE_BUCKET=woman-empowerment-apps.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=947408696329
VITE_FIREBASE_APP_ID=1:947408696329:web:e14a24dc0e9fac22f474d8
VITE_FIREBASE_MEASUREMENT_ID=G-GVMETRCB5J
```

### 2. Supabase Configuration Variables

```
VITE_SUPABASE_URL=https://ucitkxhxlorhxjaxssxl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaXRreGh4bG9yaHhqYXhzc3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTk0MjAsImV4cCI6MjA4NTQ3NTQyMH0.Afa8hkZMrxsjhLBbSKbLxotP6rmLYybMbWnxH8fgBas
```

### 3. Optional: Emergency Contact

```
VITE_DEFAULT_EMERGENCY_CONTACT=60123456789
```

---

## 📝 Quick Copy-Paste for Netlify

Here's a formatted list you can copy directly into Netlify:

### Firebase Variables (Copy Each Line Separately)

```
VITE_FIREBASE_API_KEY
AIzaSyC50ruUkZQ5F9oMOG2bjhlvkBvc_IN4Pfg

VITE_FIREBASE_AUTH_DOMAIN
woman-empowerment-apps.firebaseapp.com

VITE_FIREBASE_PROJECT_ID
woman-empowerment-apps

VITE_FIREBASE_STORAGE_BUCKET
woman-empowerment-apps.firebasestorage.app

VITE_FIREBASE_MESSAGING_SENDER_ID
947408696329

VITE_FIREBASE_APP_ID
1:947408696329:web:e14a24dc0e9fac22f474d8

VITE_FIREBASE_MEASUREMENT_ID
G-GVMETRCB5J
```

### Supabase Variables (Copy Each Line Separately)

```
VITE_SUPABASE_URL
https://ucitkxhxlorhxjaxssxl.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaXRreGh4bG9yaHhqYXhzc3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTk0MjAsImV4cCI6MjA4NTQ3NTQyMH0.Afa8hkZMrxsjhLBbSKbLxotP6rmLYybMbWnxH8fgBas
```

### Optional Emergency Contact

```
VITE_DEFAULT_EMERGENCY_CONTACT
60123456789
```

---

## 🔧 Step-by-Step Netlify Setup

### Step 1: Access Netlify Dashboard

1. Go to https://app.netlify.com/
2. Log in to your account
3. Find and click on your site: **womanempowerment**

### Step 2: Navigate to Environment Variables

1. Click on **Site configuration** or **Site settings**
2. In the left sidebar, click **Build & deploy**
3. Click on **Environment variables**
4. You'll see the **Environment variables** section

### Step 3: Add Firebase Variables

For each Firebase variable:

1. Click **Add a variable** button
2. In the **Key** field, enter: `VITE_FIREBASE_API_KEY`
3. In the **Value** field, enter: `AIzaSyC50ruUkZQ5F9oMOG2bjhlvkBvc_IN4Pfg`
4. Click **Save**

Repeat for all Firebase variables:
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### Step 4: Add Supabase Variables

1. Click **Add a variable** button
2. Key: `VITE_SUPABASE_URL`
3. Value: `https://ucitkxhxlorhxjaxssxl.supabase.co`
4. Click **Save**

Repeat for:
- `VITE_SUPABASE_ANON_KEY`

### Step 5: Add Optional Emergency Contact

1. Click **Add a variable** button
2. Key: `VITE_DEFAULT_EMERGENCY_CONTACT`
3. Value: `60123456789`
4. Click **Save**

### Step 6: Trigger a New Deployment

After adding all environment variables:

1. Click **Deploy** in the top navigation
2. Click **Trigger deploy** → **Deploy site**
3. Netlify will rebuild your site with the new environment variables
4. Wait for the deployment to complete (usually 2-5 minutes)

---

## ✅ Verification

After deployment, verify the environment variables are working:

1. Visit your site: https://womanempowerment.netlify.app/
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. You should see: `✅ Firebase initialized successfully`
5. Try logging in to verify authentication works
6. Try creating a journal entry to verify Firestore works

---

## 🔒 Security Notes

**IMPORTANT SECURITY REMINDERS:**

1. ✅ These environment variables are safe to use
   - They are meant for client-side use (Vite/Vite)
   - Firebase and Supabase have built-in security rules
   - They only expose what's necessary for the app to function

2. ⚠️ Never commit `.env` file to git
   - The `.env` file is in `.gitignore`
   - Always use `.env.example` for documentation

3. 🔐 Firebase Rules Protect Your Data
   - Only authenticated users can read/write their own data
   - Firestore security rules enforce data ownership
   - Read more in `firestore.rules`

4. 🔑 Supabase Anon Key is Safe
   - It's designed to be used in public client code
   - Row Level Security (RLS) protects your database
   - Users can only access their own data

---

## 🐛 Troubleshooting

### Issue: "Firebase not initialized" error

**Solution:**
- Check that all Firebase environment variables are set in Netlify
- Verify the API key starts with `AIza`
- Trigger a new deployment after adding variables

### Issue: "Permission denied" when saving journal

**Solution:**
- Ensure Firestore is enabled in Firebase Console
- Deploy Firestore security rules
- Check that user is authenticated
- Verify environment variables are correct

### Issue: Environment variables not working

**Solution:**
- Make sure all variables start with `VITE_` prefix
- Double-check for typos in variable names
- Trigger a new deployment after adding variables
- Clear browser cache and reload the site

### Issue: Build fails on Netlify

**Solution:**
- Check build logs in Netlify dashboard
- Verify `npm run build` works locally
- Ensure all dependencies are in package.json
- Check Node.js version is set to 20 in Netlify

---

## 📊 Summary

**Total Variables: 9**
- 7 Firebase variables
- 2 Supabase variables
- 1 optional emergency contact

**Time Required: 5 minutes**
- 2 minutes to add variables
- 3 minutes to deploy and verify

**Impact: Without these variables:**
- ❌ Authentication won't work
- ❌ Journal feature won't save
- ❌ Document vault won't upload
- ❌ Any Firebase/Supabase features will fail

**Impact: With these variables:**
- ✅ Full authentication system
- ✅ Journal with Google Calendar sync
- ✅ Document vault functionality
- ✅ All features working perfectly

---

## 🚀 Quick Reference

**Netlify Dashboard:**
https://app.netlify.com/

**Your Site:**
https://womanempowerment.netlify.app/

**Environment Variables Path:**
Site settings → Build & deploy → Environment variables

**Required Variables:**
9 total (7 Firebase + 2 Supabase + 1 optional)

---

**All set! Your app will work perfectly once these environment variables are configured in Netlify.** 🎉