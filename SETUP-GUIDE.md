# Setup Guide - Women Empowerment Super App Lite

Complete setup instructions for the Firebase Auth + Supabase hybrid architecture.

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication enabled
- Supabase project
- Git (for version control)

---

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd "iSync7777CALL Woman Empowerment Apps"

# Install frontend dependencies
npm install

# Install backend dependencies
cd api-server
npm install
cd ..
```

### 2. Configure Environment Variables

**Create `.env` file in root directory:**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=http://localhost:3001
```

**Create `.env` file in `api-server/` directory:**

```env
PORT=3001
CLIENT_URL=http://localhost:5173

# Firebase Service Account (from Firebase Console)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

# Supabase Configuration
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set Up Supabase Database

```bash
# Using Supabase CLI
supabase link --project-ref your_project_ref
supabase db push

# OR run schema manually in Supabase SQL Editor:
# Copy contents of supabase-schema-refactored.sql and execute
```

### 4. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd api-server
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/health
- Supabase Dashboard: https://app.supabase.com

---

## 🔧 Detailed Configuration

### Step 1: Firebase Setup

#### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow setup wizard

#### 1.2 Enable Authentication

1. Go to Authentication → Sign-in method
2. Enable:
   - Email/Password
   - Google (optional)
   - Phone (optional)

#### 1.3 Get Firebase Config

1. Go to Project Settings → General
2. Scroll to "Your apps"
3. Copy Firebase config object

#### 1.4 Generate Service Account Key

1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Save JSON file securely
4. Copy values to `.env`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=private_key_id_from_json
FIREBASE_PRIVATE_KEY="private_key_from_json_with_newlines"
FIREBASE_CLIENT_EMAIL=client_email_from_json
FIREBASE_CLIENT_ID=client_id_from_json
```

⚠️ **IMPORTANT**: Never commit service account keys to Git!

### Step 2: Supabase Setup

#### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New project"
3. Set password and region
4. Wait for provisioning (2-3 minutes)

#### 2.2 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL
   - service_role key (secret)

Add to `.env`:

```env
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 2.3 Create Database Schema

**Option A - Using Supabase SQL Editor:**

1. Go to SQL Editor in Supabase Dashboard
2. Click "New Query"
3. Copy entire content of `supabase-schema-refactored.sql`
4. Click "Run"

**Option B - Using Supabase CLI:**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_ref

# Push schema
supabase db push
```

#### 2.4 Create Storage Buckets

1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - `vault-documents` (Private)
   - `journal-media` (Private)
   - `profile-photos` (Public)
   - `family-files` (Private)

3. Set bucket policies (Security → Storage):

```sql
-- Vault documents policy
CREATE POLICY "Users can upload to vault-documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vault-documents' AND
    (storage.foldername(name))[1] = auth.uid()
  );

-- Profile photos policy (public read, private write)
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload own profile photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()
  );
```

### Step 3: Backend API Setup

#### 3.1 Install Dependencies

```bash
cd api-server
npm install
```

#### 3.2 Verify Configuration

Check that all required environment variables are set:

```bash
# Create .env file in api-server/
cat > .env << EOF
PORT=3001
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your_Private_Key_Here
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF
```

#### 3.3 Test Backend

```bash
npm run dev
```

Test health endpoint:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T07:30:00.000Z",
  "service": "Women Empowerment Super App Lite API"
}
```

### Step 4: Frontend Setup

#### 4.1 Install Dependencies

```bash
npm install
```

#### 4.2 Configure Environment

Create `.env` in root directory:

```bash
cat > .env << EOF
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=http://localhost:3001
EOF
```

#### 4.3 Test Frontend

```bash
npm run dev
```

Access at: http://localhost:5173

---

## 🧪 Testing the Setup

### Test 1: Backend Health Check

```bash
curl http://localhost:3001/api/health
```

### Test 2: User Registration

1. Open http://localhost:5173
2. Click "Register"
3. Enter email/password
4. Submit form

### Test 3: Create Vault Document

```bash
# Get Firebase ID token from browser console:
# Copy the token from: await auth.currentUser.getIdToken()

curl -X POST http://localhost:3001/api/vault/documents \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Document",
    "category": "personal",
    "file_url": "https://example.com/file.pdf"
  }'
```

### Test 4: Query Database

Go to Supabase SQL Editor:

```sql
-- Check if user was created
SELECT * FROM users WHERE email = 'your_test_email@example.com';

-- Check if document was created
SELECT * FROM vault_documents ORDER BY created_at DESC LIMIT 1;
```

---

## 🔒 Security Checklist

### Firebase Security

- [ ] Service account key is NOT in Git repository
- [ ] Service account key is in `.gitignore`
- [ ] Firebase rules are configured
- [ ] Authentication methods are properly enabled

### Supabase Security

- [ ] Service role key is NOT exposed to frontend
- [ ] RLS policies are enabled on all tables
- [ ] Storage buckets have appropriate policies
- [ ] Database access is restricted

### Backend Security

- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Helmet.js is enabled (security headers)
- [ ] Environment variables are set
- [ ] HTTPS is used in production

---

## 🚢 Production Deployment

### Deploy Frontend (Netlify)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

Update environment variables in Netlify dashboard:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_URL=https://your-api-domain.com`

### Deploy Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd api-server
railway init

# Deploy
railway up
```

Set environment variables in Railway dashboard:
- `PORT=3001`
- `CLIENT_URL=https://your-frontend-domain.netlify.app`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Update Production URLs

**Frontend `.env`:**
```env
VITE_API_URL=https://your-backend-domain.railway.app
```

**Backend `.env`:**
```env
CLIENT_URL=https://your-frontend-domain.netlify.app
```

---

## 📱 PWA Configuration

The app is configured as a Progressive Web App (PWA).

### Enable PWA

1. Build the app:
```bash
npm run build
```

2. Test PWA:
   - Open DevTools
   - Go to Application → Service Workers
   - Verify service worker is registered

3. Install PWA:
   - Chrome/Edge: Click install icon in address bar
   - Mobile: Add to home screen

---

## 🐛 Troubleshooting

### Issue: "Firebase: No Firebase App '[DEFAULT]' has been created"

**Solution:** Check that all Firebase environment variables are set correctly in `.env`

### Issue: "Invalid or expired token"

**Solution:** 
- Verify Firebase Admin SDK credentials
- Check that service account key is correct
- Ensure Firebase project ID matches

### Issue: "RLS policy violation"

**Solution:**
- Run schema setup: `supabase-schema-refactored.sql`
- Verify `get_request_firebase_uid()` function exists
- Check that backend is passing `X-Firebase-UID` header

### Issue: "CORS error"

**Solution:**
- Update `CLIENT_URL` in backend `.env`
- Restart backend server
- Clear browser cache

### Issue: "Cannot connect to backend"

**Solution:**
- Ensure backend is running on port 3001
- Check firewall settings
- Verify `VITE_API_URL` in frontend `.env`

---

## 📚 Next Steps

1. **Customize the UI**: Modify components in `src/components/`
2. **Add Features**: Implement new modules (Safety, Career, Family)
3. **Set Up Monitoring**: Add Sentry, LogRocket, etc.
4. **Configure Analytics**: Add Firebase Analytics
5. **Write Tests**: Add unit and integration tests
6. **Set Up CI/CD**: Configure GitHub Actions

---

## 🆘 Getting Help

- **Architecture**: See `ARCHITECTURE.md`
- **API Documentation**: See `api-server/README.md`
- **Firebase Docs**: https://firebase.google.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:3001/api/health
- [ ] User can register and login
- [ ] User profile is created in Supabase
- [ ] Documents can be uploaded to Vault
- [ ] Journals can be created
- [ ] Career goals can be set
- [ ] Safety contacts can be added
- [ ] Family groups can be created

---

**Setup Complete! 🎉**

You now have a fully functional Women Empowerment Super App Lite with Firebase Auth + Supabase architecture.