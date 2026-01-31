import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import EmpowermentDashboard from './EmpowermentDashboard';
import VaultGallery from './VaultGallery';
import DocumentScanner from './DocumentScanner';
import Profile from './Profile';
import { Home, Shield, FolderOpen, User, Plus, Menu, X } from 'lucide-react';

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
    <div className="relative min-h-screen bg-slate-50">
      {/* Sidebar for larger screens */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-lg z-50 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Empowerment</h2>
            <button 
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Command Center</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('home'); setShowSidebar(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'home' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('vault'); setShowSidebar(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'vault' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FolderOpen size={20} />
            <span>Document Vault</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('profile'); setShowSidebar(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'profile' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User size={20} />
            <span>Account</span>
          </button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-600 mb-2">Safety Features</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-rose-500 text-white text-xs py-2 px-3 rounded-lg font-medium hover:bg-rose-600 transition-colors">
                SOS Active
              </button>
              <button className="flex-1 bg-slate-200 text-slate-700 text-xs py-2 px-3 rounded-lg font-medium hover:bg-slate-300 transition-colors">
                Timer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setShowSidebar(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          
          <h1 className="text-lg font-bold text-slate-800">Empowerment</h1>
          
          <div className="w-6 h-6"></div>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 px-6 flex justify-between items-center z-40 shadow-lg">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center ${activeTab === 'home' ? 'text-teal-600' : 'text-slate-400'}`}
        >
          <Home size={24} />
          <span className="text-[10px] mt-1 font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('vault')}
          className={`flex flex-col items-center ${activeTab === 'vault' ? 'text-teal-600' : 'text-slate-400'}`}
        >
          <FolderOpen size={24} />
          <span className="text-[10px] mt-1 font-bold">Vault</span>
        </button>

        {/* Floating Action Button for Scanner */}
        <button 
          onClick={() => setShowScanner(true)}
          className="bg-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center -mt-12 shadow-xl border-4 border-slate-50 active:scale-90 transition-transform"
        >
          <Plus size={32} />
        </button>

        <button className="flex flex-col items-center text-slate-400">
          <Shield size={24} />
          <span className="text-[10px] mt-1 font-bold">Safety</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-teal-600' : 'text-slate-400'}`}
        >
          <User size={24} />
          <span className="text-[10px] mt-1 font-bold">Account</span>
        </button>
      </nav>
    </div>
  );
};

export default MainApp;