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
    else if (path === '/safety') setActiveTab('safety');
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
      case 'safety':
        return <EmpowermentDashboard onOpenScanner={() => setShowScanner(true)} />;
      case 'profile': 
        return <Profile onLogout={handleLogout} />;
      default: 
        return <EmpowermentDashboard onOpenScanner={() => setShowScanner(true)} />;
    }
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header safe-area-top">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="icon-container icon-container-lavender shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">EmpowerHer</h1>
              <p className="text-xs font-medium text-gray-500">Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center hover:scale-105 transition-all">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="avatar-glass">
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
          onSave={(doc) => {
            console.log("Document saved successfully:", doc);
            setShowScanner(false);
            setActiveTab('vault');
          }} 
          onCancel={() => setShowScanner(false)} 
        />
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex justify-around items-center px-3 py-3">
          <button 
            onClick={() => setActiveTab('home')}
            className={`nav-item-glass ${activeTab === 'home' ? 'active' : ''}`}
          >
            <Home size={23} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('vault')}
            className={`nav-item-glass ${activeTab === 'vault' ? 'active' : ''}`}
          >
            <FolderOpen size={23} strokeWidth={activeTab === 'vault' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Vault</span>
          </button>

          {/* Floating Scanner Button */}
          <button 
            onClick={() => setShowScanner(true)}
            className="fab-glass relative -mt-8 w-16 h-16 rounded-3xl flex items-center justify-center"
          >
            <Plus size={32} className="text-white" strokeWidth={2.5} />
          </button>

          <button 
            onClick={() => setActiveTab('safety')}
            className={`nav-item-glass ${activeTab === 'safety' ? 'active' : ''}`}
          >
            <Shield size={23} strokeWidth={activeTab === 'safety' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Safety</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`nav-item-glass ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={23} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MainApp;