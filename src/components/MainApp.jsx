import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import EmpowermentDashboard from './EmpowermentDashboard';
import VaultGallery from './VaultGallery';
import DocumentScanner from './DocumentScanner';
import Profile from './Profile';
import { Home, Shield, FolderOpen, User, Plus, Bell } from 'lucide-react';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showScanner, setShowScanner] = useState(false);
  const [user] = useAuthState(auth);
  const location = useLocation();

  // Update active tab based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/vault') setActiveTab('vault');
    else if (path === '/profile') setActiveTab('profile');
    else setActiveTab('home');
  }, [location]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': 
        return <EmpowermentDashboard onOpenScanner={() => setShowScanner(true)} />;
      case 'vault': 
        return <VaultGallery onOpenScanner={() => setShowScanner(true)} />;
      case 'profile': 
        return <Profile onLogout={handleLogout} />;
      default: 
        return <EmpowermentDashboard onOpenScanner={() => setShowScanner(true)} />;
    }
  };

  return (
    <div className="app-shell bg-slate-50">
      {/* Header */}
      <header className="app-header safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">EmpowerHer</h1>
              <p className="text-xs text-slate-500">Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <div className="avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {renderScreen()}
      </main>

      {/* Global Document Scanner Overlay */}
      {showScanner && (
        <DocumentScanner 
          onSave={(img) => {
            console.log("Saving image...", img);
            setShowScanner(false);
            setActiveTab('vault');
          }} 
          onCancel={() => setShowScanner(false)} 
        />
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex justify-around items-center px-2 py-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          >
            <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('vault')}
            className={`nav-item ${activeTab === 'vault' ? 'active' : ''}`}
          >
            <FolderOpen size={22} strokeWidth={activeTab === 'vault' ? 2.5 : 2} />
            <span className="text-xs font-medium">Vault</span>
          </button>

          {/* Floating Scanner Button */}
          <button 
            onClick={() => setShowScanner(true)}
            className="relative -mt-8 bg-gradient-to-br from-emerald-500 to-teal-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <Plus size={28} className="text-white" strokeWidth={2.5} />
          </button>

          <button className="nav-item">
            <Shield size={22} strokeWidth={2} />
            <span className="text-xs font-medium">Safety</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
            <span className="text-xs font-medium">Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MainApp;