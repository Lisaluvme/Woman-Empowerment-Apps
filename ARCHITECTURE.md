# Women Empowerment Super App Lite - Architecture Documentation

## 📐 System Architecture

This document describes the hybrid Firebase Auth + Supabase architecture for the Women Empowerment Super App Lite.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                       │
│                    Firebase Auth Client                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 1. Get Firebase ID Token
                         │ 2. Send to API with Bearer token
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Node.js)                       │
│                  Firebase Admin SDK                           │
│              (Verifies ID Token)                              │
│                     ↓                                         │
│              Extracts Firebase UID                           │
│                     ↓                                         │
│              Supabase Service Role Client                    │
│          (Passes Firebase UID via headers)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 3. Query with firebase_uid context
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database                                │    │
│  │  - Tables use firebase_uid instead of auth.uid()   │    │
│  │  - RLS policies based on firebase_uid               │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Storage                                             │    │
│  │  - File uploads                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Realtime                                            │    │
│  │  - Live updates                                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Step 1: User Login (Firebase)

1. User enters credentials in React app
2. Firebase Auth client authenticates user
3. User receives Firebase ID token
4. App stores token for API requests

### Step 2: API Request with Token

```javascript
// Frontend (src/services/api.js)
const token = await auth.currentUser.getIdToken(true);

fetch('http://localhost:3001/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Step 3: Backend Token Verification

```javascript
// Backend (api-server/server.js)
const decodedToken = await admin.auth().verifyIdToken(token);
const firebaseUid = decodedToken.uid;
```

### Step 4: Supabase Query with Firebase UID

```javascript
// Backend continues
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('firebase_uid', firebaseUid);
```

### Step 5: RLS Policy Enforcement

```sql
-- Supabase RLS Policy
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (get_request_firebase_uid() = firebase_uid);
```

---

## 🗄️ Database Schema

### Key Design Decisions

1. **Firebase UID as Primary Identifier**
   - All tables use `firebase_uid TEXT` instead of `auth.uid()`
   - Firebase UID is unique and immutable
   - No dependency on Supabase Auth

2. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Policies use `get_request_firebase_uid()` function
   - Backend passes Firebase UID via custom header

3. **Relationships**
   - Foreign keys reference `firebase_uid` instead of UUID
   - Maintains referential integrity
   - Simplifies user-based queries

### Core Tables

```sql
-- Users (mapped from Firebase)
users (
  id UUID PRIMARY KEY,
  firebase_uid TEXT UNIQUE,  -- Firebase Auth UID
  email TEXT,
  display_name TEXT,
  stats JSONB,
  created_at TIMESTAMPTZ
)

-- Vault Documents
vault_documents (
  id UUID PRIMARY KEY,
  firebase_uid TEXT REFERENCES users(firebase_uid),
  title TEXT,
  category TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ
)

-- Journals
journals (
  id UUID PRIMARY KEY,
  firebase_uid TEXT REFERENCES users(firebase_uid),
  title TEXT,
  content TEXT,
  type TEXT,
  mood TEXT,
  created_at TIMESTAMPTZ
)

-- Career Goals
career_goals (
  id UUID PRIMARY KEY,
  firebase_uid TEXT REFERENCES users(firebase_uid),
  goal_name TEXT,
  target_value INTEGER,
  current_value INTEGER,
  status TEXT
)

-- Safety Features
safety_alerts (
  id UUID PRIMARY KEY,
  firebase_uid TEXT REFERENCES users(firebase_uid),
  alert_type TEXT,
  message TEXT,
  status TEXT
)

trusted_contacts (
  id UUID PRIMARY KEY,
  firebase_uid TEXT REFERENCES users(firebase_uid),
  name TEXT,
  phone TEXT,
  is_primary BOOLEAN
)

-- Family Collaboration
family_groups (
  id UUID PRIMARY KEY,
  created_by_firebase_uid TEXT REFERENCES users(firebase_uid),
  name TEXT
)

family_members (
  id UUID PRIMARY KEY,
  family_group_id UUID REFERENCES family_groups(id),
  firebase_uid TEXT REFERENCES users(firebase_uid),
  role TEXT
)
```

---

## 🔒 Security Model

### Authentication vs Authorization

**Authentication (Who you are)**
- Handled by Firebase Auth
- Verified by Firebase Admin SDK on backend
- Firebase ID token proves identity

**Authorization (What you can do)**
- Enforced by Supabase RLS policies
- Based on Firebase UID from verified token
- Granular control per table/operation

### Security Layers

1. **Frontend**: Firebase Auth client
2. **Network**: HTTPS + Bearer token
3. **Backend**: Firebase Admin verification
4. **Database**: Supabase RLS policies
5. **Storage**: Supabase storage policies

### Token Lifecycle

```
Firebase ID Token (1 hour expiry)
        ↓
   Sent with API request
        ↓
   Verified by backend
        ↓
   Extracted Firebase UID
        ↓
   Used for RLS check
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### User Management
```
GET    /user/profile      - Get user profile
PUT    /user/profile      - Update user profile
```

### Vault Documents
```
GET    /vault/documents   - Get documents
POST   /vault/documents   - Create document
PUT    /vault/documents/:id  - Update document
DELETE /vault/documents/:id  - Delete document
```

### Journals
```
GET    /journals          - Get journals
POST   /journals          - Create journal
DELETE /journals/:id      - Delete journal
```

### Career Goals
```
GET    /career/goals      - Get goals
POST   /career/goals      - Create goal
PUT    /career/goals/:id  - Update goal
```

### Safety Features
```
GET    /safety/contacts   - Get trusted contacts
POST   /safety/contacts   - Add contact
POST   /safety/alerts     - Create alert
```

### Family Collaboration
```
GET    /family/groups     - Get family groups
POST   /family/groups     - Create group
```

---

## 🔄 Data Flow Examples

### Example 1: Creating a Vault Document

```javascript
// 1. Frontend - User uploads document
const document = {
  title: 'My Resume',
  category: 'career',
  file_url: 'https://supabase.storage/...'
};

// 2. API Service - Adds Firebase token
const token = await auth.currentUser.getIdToken();
fetch('/api/vault/documents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(document)
});

// 3. Backend - Verifies token and creates record
const decodedToken = await admin.auth().verifyIdToken(token);
const firebaseUid = decodedToken.uid;

await supabase
  .from('vault_documents')
  .insert([{
    firebase_uid: firebaseUid,
    title: 'My Resume',
    category: 'career',
    file_url: 'https://supabase.storage/...'
  }]);

// 4. Supabase - RLS ensures ownership
-- Policy: Users can only insert their own documents
CHECK (get_request_firebase_uid() = firebase_uid)
```

### Example 2: Querying Journals

```javascript
// 1. Frontend - Request journals
const journals = await api.journal.getJournals('personal');

// 2. Backend - Query with Firebase UID
const { data } = await supabase
  .from('journals')
  .select('*')
  .eq('firebase_uid', firebaseUid)
  .eq('type', 'personal');

// 3. Supabase - RLS filters results
-- Policy: Users can only view own journals
USING (get_request_firebase_uid() = firebase_uid)
```

---

## 🚀 Deployment Architecture

### Development Environment

```
Frontend: Vite dev server (localhost:5173)
Backend:  Node.js server (localhost:3001)
Firebase: Firebase Emulator or staging project
Supabase: Local Supabase or dev instance
```

### Production Environment

```
Frontend: Netlify/Vercel (Static files)
Backend:  Railway/Render/Fly.io (Node.js API)
Firebase: Production Firebase project
Supabase: Production Supabase project
```

### Environment Variables

**Frontend (.env)**
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_API_URL=https://api.example.com
```

**Backend (.env)**
```env
PORT=3001
CLIENT_URL=https://app.example.com
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📊 Monitoring & Observability

### Key Metrics to Track

1. **Authentication**
   - Failed token verifications
   - Token refresh rate
   - Login success rate

2. **API Performance**
   - Response times per endpoint
   - Error rates
   - Request throughput

3. **Database**
   - Query performance
   - RLS policy efficiency
   - Connection pool usage

### Logging Strategy

```javascript
// Structured logging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  firebaseUid: decodedToken.uid,
  endpoint: '/api/vault/documents',
  method: 'POST',
  status: 'success',
  duration: 123
}));
```

---

## 🔧 Troubleshooting

### Common Issues

**1. "Invalid or expired token"**
- Check Firebase Admin credentials
- Verify token hasn't expired (1 hour)
- Ensure Firebase project is correct

**2. "RLS policy violation"**
- Verify Firebase UID is being passed
- Check `get_request_firebase_uid()` function
- Review RLS policy logic

**3. "CORS error"**
- Check CORS configuration in backend
- Verify API URL in frontend
- Ensure origins are whitelisted

**4. "User profile not found"**
- Profile auto-creation should happen on first login
- Check profile creation logic in backend
- Verify Firebase UID mapping

---

## 📚 Additional Resources

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Supabase Client Library](https://supabase.com/docs/reference/javascript)

---

## 🎯 Best Practices

1. **Always verify tokens on the backend**
   - Never trust client-side claims
   - Use Firebase Admin SDK for verification

2. **Use firebase_uid consistently**
   - Primary identifier in all tables
   - Foreign key references
   - RLS policy basis

3. **Implement proper error handling**
   - Graceful token refresh
   - User-friendly error messages
   - Detailed server logs

4. **Monitor and alert**
   - Set up error tracking (Sentry, etc.)
   - Monitor API performance
   - Track authentication failures

5. **Keep tokens secure**
   - Never log full tokens
   - Use HTTPS only
   - Implement proper CORS

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Maintainer**: Women Empowerment Super App Lite Team