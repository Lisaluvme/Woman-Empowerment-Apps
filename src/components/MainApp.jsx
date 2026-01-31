import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import EmpowermentDashboard from './EmpowermentDashboard';
import VaultGallery from './VaultGallery';
import DocumentScanner from './DocumentScanner';
import Profile from './Profile';
import { Home, Shield, FolderOpen, User, Plus, Menu, X, Sparkles } from 'lucide-react';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showScanner, setShowScanner] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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
        return <VaultGallery />;
      case 'profile': 
        return <Profile onLogout={handleLogout} />;
      default: 
        return <EmpowermentDashboard onOpenScanner={() => setShowScanner(true)} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Sidebar for larger screens */}
      <div className={`fixed left-0 top-0 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-2xl z-50 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold gradient-text">EmpowerHer</h2>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <Sparkles size={12} className="text-rose-500" />
                Command Center
              </p>
            </div>
            <button 
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-2 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-rose-600" />
            </button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('home'); setShowSidebar(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'home' 
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 hover:text-rose-700'
            }`}
          >
            <Home size={20} className={activeTab === 'home' ? 'text-white' : 'text-rose-500'} />
            <span className="font-semibold">Home</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('vault'); setShowSidebar(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'vault' 
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 hover:text-rose-700'
            }`}
          >
            <FolderOpen size={20} className={activeTab === 'vault' ? 'text-white' : 'text-rose-500'} />
            <span className="font-semibold">Document Vault</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('profile'); setShowSidebar(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 hover:text-rose-700'
            }`}
          >
            <User size={20} className={activeTab === 'profile' ? 'text-white' : 'text-rose-500'} />
            <span className="font-semibold">Account</span>
          </button>
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-4 border border-rose-200 shadow-lg">
            <p className="text-xs text-gray-700 mb-3 font-semibold flex items-center gap-2">
              <Shield size={14} className="text-rose-500" />
              Safety Features
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs py-2.5 px-3 rounded-xl font-semibold hover:from-rose-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
                SOS
              </button>
              <button className="flex-1 bg-white text-rose-700 border-2 border-rose-200 text-xs py-2.5 px-3 rounded-xl font-semibold hover:bg-rose-50 transition-all transform hover:scale-105 active:scale-95">
                Timer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setShowSidebar(true)}
            className="p-2.5 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6 text-rose-600" />
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold gradient-text">EmpowerHer</h1>
          </div>
          
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <User size={20} className="text-white" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:ml-64 pb-24 lg:pb-0">
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

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 h-24 px-4 flex justify-between items-center z-40 shadow-2xl">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
            activeTab === 'home' 
              ? 'bg-gradient-to-t from-rose-100 to-orange-100 text-rose-600 scale-110' 
              : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <Home size={24} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('vault')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
            activeTab === 'vault' 
              ? 'bg-gradient-to-t from-rose-100 to-orange-100 text-rose-600 scale-110' 
              : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <FolderOpen size={24} />
          <span className="text-[10px] font-bold">Vault</span>
        </button>

        {/* Floating Action Button for Scanner */}
        <button 
          onClick={() => setShowScanner(true)}
          className="bg-gradient-to-r from-rose-500 to-orange-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center -mt-10 shadow-2xl border-4 border-white hover:shadow-xl active:scale-90 transition-all duration-300 transform hover:scale-110"
        >
          <Plus size={32} />
        </button>

        <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300">
          <Shield size={24} />
          <span className="text-[10px] font-bold">Safety</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
            activeTab === 'profile' 
              ? 'bg-gradient-to-t from-rose-100 to-orange-100 text-rose-600 scale-110' 
              : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold">Account</span>
        </button>
      </nav>
    </div>
  );
};

export default MainApp;