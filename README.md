# Women's Empowerment Command Center (WECC)

A production-ready Progressive Web App (PWA) designed for women's safety, document management, and personal growth tracking. Built with React 18, Vite, TailwindCSS, Firebase Authentication, and Supabase.

## 🚀 Features

### Safety First
- **SOS Panic Button** - One-tap emergency alert with GPS location sharing
- **Safety Timer** - Automatic check-in system with countdown
- **Emergency Contact** - WhatsApp integration for immediate help
- **Browser Notifications** - Safety alerts even when app is in background

### Document Management
- **Document Scanner** - Camera-based document capture
- **Secure Vault** - Encrypted storage with category filters (Personal/Career/Family)
- **File Upload** - Support for images and documents
- **Real-time Updates** - Instant sync across devices

### Personal Growth
- **Empowerment Points** - Track daily achievements
- **Career Progress** - Visual goal tracking with progress bars
- **Journal System** - Personal, career, and family journaling
- **Family Hub** - Shared task management

### PWA Capabilities
- **Installable** - Add to home screen on any device
- **Offline Support** - Works without internet connection
- **Push Notifications** - Safety alerts and reminders
- **Mobile-First** - Optimized for touch interactions

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Authentication**: Firebase Auth (Email/Password)
- **Backend**: Supabase (PostgreSQL + Storage)
- **Icons**: lucide-react
- **PWA**: Service Worker + Web App Manifest
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 20 or higher
- Firebase Project
- Supabase Project
- Git

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Lisaluvme/Woman-Empowerment-Apps.git
cd Woman-Empowerment-Apps
```

### 2. Install Dependencies

```bash
npm install
npm install @supabase/supabase-js
```

### 3. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication (Email/Password)
4. Create a Web App in Project Settings
5. Copy your Firebase config values

### 4. Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to SQL Editor and execute the schema from `supabase-schema.sql`
4. Create a storage bucket named `documents` with public access
5. Copy your Supabase URL and Anon Key

### 5. Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your credentials:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_DEFAULT_EMERGENCY_CONTACT=60123456789
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Netlify Deployment

1. Push code to GitHub repository
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20`
6. Add environment variables in Netlify dashboard
7. Deploy!

### Manual Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📱 PWA Installation

### Android (Chrome)
1. Open app in Chrome
2. Tap menu (three dots)
3. Select "Install app" or "Add to Home Screen"

### iOS (Safari)
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Desktop (Chrome/Edge)
1. Open app in Chrome/Edge
2. Click install icon in address bar
3. Confirm installation

## 🗄️ Database Schema

The app uses Supabase PostgreSQL with the following tables:

- **users** - User profiles and stats
- **documents** - Stored documents with metadata
- **journals** - Personal journal entries
- **family_groups** - Family group management
- **family_members** - Family membership
- **family_tasks** - Shared family tasks
- **career_goals** - Personal career tracking

All tables implement Row Level Security (RLS) for data isolation.

## 🔒 Security Features

- **Row Level Security** - Users can only access their own data
- **Firebase Auth** - Secure authentication with JWT tokens
- **Encrypted Storage** - Files stored securely in Supabase Storage
- **HTTPS Only** - All communications encrypted
- **XSS Protection** - Input sanitization and CSP headers
- **Privacy by Default** - No third-party analytics or tracking

## 📂 Project Structure

```
src/
├── components/
│   ├── MainApp.jsx          # Main app layout with navigation
│   ├── EmpowermentDashboard.jsx  # Home dashboard
│   ├── VaultGallery.jsx     # Document vault
│   ├── DocumentScanner.jsx  # Camera scanner
│   ├── Login.jsx            # Authentication
│   ├── Register.jsx         # Registration
│   └── Profile.jsx          # User settings
├── firebase-config.js       # Firebase configuration
├── supabase-config.js       # Supabase client & helpers
├── App.jsx                  # Root component with routing
├── main.jsx                 # App entry point
└── index.css                # Global styles

public/
├── manifest.json            # PWA manifest
└── service-worker.js        # Service worker for offline support
```

## 🎨 Design Principles

- **Mobile-First** - Designed for touch interactions
- **Low Cognitive Load** - Clean, intuitive interface
- **Safety Always Visible** - SOS button on every screen
- **Accessibility** - WCAG AA compliant colors and contrast
- **Performance** - Optimized for fast loading and smooth interactions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with ❤️ for women empowerment
- Inspired by Grab's mobile-first design
- Icons by [lucide-react](https://lucide.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- Authentication by [Firebase](https://firebase.google.com/)

---

**Made with love and dedication to empowering women everywhere.** 💪✨