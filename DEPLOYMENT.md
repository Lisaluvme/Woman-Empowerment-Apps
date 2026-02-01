# Deployment Guide - Women's Empowerment Command Center

This guide provides step-by-step instructions for deploying the Women's Empowerment Command Center (WECC) PWA to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Supabase Setup](#supabase-setup)
4. [Local Development](#local-development)
5. [Netlify Deployment](#netlify-deployment)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 20+ installed
- ✅ A GitHub account
- ✅ A Firebase account (free tier)
- ✅ A Supabase account (free tier)
- ✅ A Netlify account (free tier)

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `empowerment-command-center`
4. Disable Google Analytics (optional for privacy)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password**
4. Click **Save**

### 3. Configure Web App

1. Click the gear icon → **Project settings**
2. Scroll down to **Your apps** → **Web app** (</> icon)
3. Enter app nickname: `WECC Web App`
4. **DO NOT** enable Firebase Hosting (we use Netlify)
5. Click **Register app**
6. Copy the configuration object - you'll need these values

### 4. Get Firebase Config Values

Your Firebase config should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "empowerment-command-center.firebaseapp.com",
  projectId: "empowerment-command-center",
  storageBucket: "empowerment-command-center.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Enter:
   - **Name**: `empowerment-command-center`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

### 2. Execute Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content of `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify all tables were created successfully

### 3. Create Storage Bucket

1. Go to **Storage** in left sidebar
2. Click **Create a new bucket**
3. Enter name: `documents`
4. Make bucket **Public** (for file access)
5. Click **Create bucket**

### 6. Configure Storage RLS

1. In **Storage** → **documents** bucket
2. Go to **Policies** tab
3. Create these policies:

**SELECT Policy** (users can view own files):
```sql
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**INSERT Policy** (users can upload):
```sql
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**DELETE Policy** (users can delete own files):
```sql
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 7. Get Supabase Credentials

1. In Supabase Dashboard, go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJhb...`)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your credentials:

```env
# Firebase
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=empowerment-command-center.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=empowerment-command-center
VITE_FIREBASE_STORAGE_BUCKET=empowerment-command-center.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...

# Emergency Contact
VITE_DEFAULT_EMERGENCY_CONTACT=60123456789
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Test Locally

- ✅ Register a new account
- ✅ Log in
- ✅ Test SOS button (check console for errors)
- ✅ Test document scanner
- ✅ Check browser console for any errors

## Netlify Deployment

### Method 1: GitHub Integration (Recommended)

#### 1. Push to GitHub

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

#### 2. Connect to Netlify

1. Go to [Netlify](https://netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Click **Connect to GitHub**
4. Authorize Netlify to access your repository
5. Select your repository
6. Click **Import site**

#### 3. Configure Build Settings

```yaml
Build command: npm run build
Publish directory: dist
```

#### 4. Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add all variables from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_DEFAULT_EMERGENCY_CONTACT`

#### 5. Deploy

Click **Deploy site** - Netlify will:
- Install dependencies
- Run `npm run build`
- Deploy to global CDN

Your site will be live at: `https://your-site-name.netlify.app`

### Method 2: CLI Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### Method 3: Drag & Drop

```bash
# Build locally
npm run build

# Deploy dist folder via Netlify dashboard
```

## Post-Deployment Checklist

### 1. Test Authentication

- [ ] Register a new user account
- [ ] Log in with the account
- [ ] Try forgot password flow
- [ ] Log out and log back in

### 2. Test Safety Features

- [ ] Click SOS panic button
- [ ] Verify WhatsApp opens with location
- [ ] Test safety timer countdown
- [ ] Verify auto-SOS triggers on timer end

### 3. Test Document Scanner

- [ ] Open camera scanner
- [ ] Capture a document
- [ ] Save to vault
- [ ] Verify document appears in gallery

### 4. Test PWA Features

- [ ] Add to home screen (mobile)
- [ ] Test offline functionality
- [ ] Verify app works offline
- [ ] Check push notifications (if implemented)

### 5. Verify Security

- [ ] Check that users can only see their own data
- [ ] Verify RLS policies work
- [ ] Test file upload restrictions
- [ ] Confirm HTTPS is enforced

### 6. Performance Check

- [ ] Test on mobile devices
- [ ] Check load time (< 3 seconds)
- [ ] Verify smooth animations
- [ ] Test on slow connections

### 7. Accessibility

- [ ] Test with screen reader
- [ ] Verify color contrast
- [ ] Test keyboard navigation
- [ ] Check touch target sizes

## Troubleshooting

### Build Errors

**Problem**: Build fails on Netlify

**Solution**: 
1. Check Netlify deploy logs
2. Ensure all dependencies are in `package.json`
3. Verify environment variables are set correctly

### Firebase Authentication Issues

**Problem**: Users can't log in

**Solution**:
1. Verify Firebase config in `.env`
2. Check Email/Password is enabled in Firebase Console
3. Verify domain is authorized in Firebase Console

### Supabase Connection Issues

**Problem**: Data not saving to database

**Solution**:
1. Verify Supabase URL and anon key
2. Check RLS policies in Supabase dashboard
3. Test schema in SQL Editor

### SOS Button Not Working

**Problem**: Location not sharing

**Solution**:
1. Check browser location permissions
2. Verify HTTPS is enabled (required for geolocation)
3. Test emergency contact number format

### PWA Not Installing

**Problem**: Can't add to home screen

**Solution**:
1. Verify `manifest.json` is accessible
2. Check service worker is registered
3. Ensure site is served over HTTPS
4. Test on mobile device (not desktop)

### Camera Not Working

**Problem**: Scanner can't access camera

**Solution**:
1. Check HTTPS requirement
2. Verify browser permissions
3. Test on mobile device (desktop cameras may not work)
4. Check `facingMode: "environment"` setting

## Domain Configuration (Optional)

### Custom Domain

1. In Netlify, go to **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `empowerment.yourdomain.com`)
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning

### Firebase Auth Domain Update

If using custom domain, update Firebase config:

```javascript
authDomain: "empowerment.yourdomain.com"
```

Then add domain in Firebase Console:
1. Go to **Authentication** → **Settings**
2. Add authorized domain

## Monitoring

### Netlify Analytics

- Go to Netlify dashboard
- View bandwidth, visitors, and performance metrics

### Firebase Analytics

1. Enable Google Analytics in Firebase project
2. Add analytics SDK to app
3. Monitor user engagement

### Supabase Logs

1. Go to Supabase Dashboard
2. Check **Database logs** for errors
3. Monitor **API logs** for performance

## Maintenance

### Regular Tasks

- **Weekly**: Check error logs
- **Monthly**: Review user feedback
- **Quarterly**: Update dependencies
- **Annually**: Review and update security policies

### Backup Strategy

- **Database**: Supabase automatic backups (7 days free)
- **Storage**: Enable versioning in Supabase Storage
- **Code**: Git repository (GitHub)

### Scaling

If you need to scale:
1. Upgrade Supabase plan (Pro plan starts at $25/month)
2. Add CDN caching for assets
3. Implement rate limiting
4. Add monitoring (Sentry, LogRocket)

## Support

For issues or questions:
1. Check this deployment guide
2. Review [README.md](README.md)
3. Check GitHub Issues
4. Contact support team

---

**Deployment Checklist Completed? 🚀**

Your Women's Empowerment Command Center is now live and ready to help women stay safe, organized, and empowered!