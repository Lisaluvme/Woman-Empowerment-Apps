import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase-config';
import { db } from './supabase-config';
import MainApp from './components/MainApp';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [user, loading, error] = useAuthState(auth);
  const [firebaseError, setFirebaseError] = useState(null);

  // Check for Firebase initialization errors
  useEffect(() => {
    // Check if auth object exists
    if (!auth) {
      setFirebaseError('Firebase authentication failed to initialize. Please check your API key configuration.');
    }
  }, []);

  // Initialize user profile in Supabase on first login
  useEffect(() => {
    const initializeUserProfile = async () => {
      if (user && !loading) {
        try {
          const profile = await db.getUserProfile(user.uid);
          if (!profile) {
            await db.createUserProfile(user);
          }
        } catch (err) {
          console.error('Failed to initialize user profile:', err);
        }
      }
    };
    initializeUserProfile();
  }, [user, loading]);

  // Handle Firebase auth errors
  useEffect(() => {
    if (error) {
      console.error('Firebase auth error:', error);
      setFirebaseError(`Firebase authentication error: ${error.message}`);
    }
  }, [error]);

  // Show error state
  if (firebaseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-rose-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Configuration Error</h2>
            <p className="text-slate-600 mb-6">{firebaseError}</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-slate-700 mb-2">To fix this issue:</h3>
              <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                <li>Open your <code className="bg-slate-200 px-1 rounded">.env</code> file</li>
                <li>Verify <code className="bg-slate-200 px-1 rounded">VITE_FIREBASE_API_KEY</code> is correct</li>
                <li>Ensure the API key starts with <code className="bg-slate-200 px-1 rounded">AIza</code></li>
                <li>Restart the dev server: <code className="bg-slate-200 px-1 rounded">npm run dev</code></li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Register />} 
          />
          <Route 
            path="/*" 
            element={user ? <MainApp /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
