import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase-config';
import { db } from './supabase-config';
import MainApp from './components/MainApp';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [user, loading] = useAuthState(auth);

  // Initialize user profile in Supabase on first login
  useEffect(() => {
    const initializeUserProfile = async () => {
      if (user && !loading) {
        const profile = await db.getUserProfile(user.uid);
        if (!profile) {
          await db.createUserProfile(user);
        }
      }
    };
    initializeUserProfile();
  }, [user, loading]);

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