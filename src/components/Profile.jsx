import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Lock, 
  HelpCircle, 
  ChevronRight,
  LogOut,
  Settings,
  Moon,
  Globe
} from 'lucide-react';

const Profile = ({ onLogout }) => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await onLogout();
    }
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Personal Information',
          description: 'Update your profile details',
          action: () => console.log('Navigate to personal info')
        },
        {
          icon: Shield,
          label: 'Security',
          description: 'Password and 2FA settings',
          action: () => console.log('Navigate to security')
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: notifications ? 'Enabled' : 'Disabled',
          action: () => setNotifications(!notifications),
          toggle: true,
          toggleValue: notifications
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          description: darkMode ? 'Enabled' : 'Disabled',
          action: () => setDarkMode(!darkMode),
          toggle: true,
          toggleValue: darkMode
        },
        {
          icon: Globe,
          label: 'Language',
          description: 'English (US)',
          action: () => console.log('Navigate to language')
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help and support',
          action: () => console.log('Navigate to help')
        },
        {
          icon: Settings,
          label: 'App Settings',
          description: 'Configure app preferences',
          action: () => console.log('Navigate to settings')
        },
      ]
    }
  ];

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="avatar-lg">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
            <p className="text-sm text-slate-500">{user?.email || 'Loading...'}</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-emerald-600">1,250</div>
          <div className="text-xs text-slate-500 mt-1">Points</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">6</div>
          <div className="text-xs text-slate-500 mt-1">Documents</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">14</div>
          <div className="text-xs text-slate-500 mt-1">Days Active</div>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, idx) => (
        <div key={idx} className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-1">
            {section.title}
          </h3>
          <div className="space-y-2">
            {section.items.map((item, itemIdx) => (
              <button
                key={itemIdx}
                onClick={item.action}
                className="w-full card flex items-center gap-4 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-slate-600" />
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500 truncate">{item.description}</p>
                </div>

                {item.toggle ? (
                  <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    item.toggleValue ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      item.toggleValue ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </div>
                ) : (
                  <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full btn-danger flex items-center justify-center gap-2 mb-6"
      >
        <LogOut size={20} />
        <span>Log Out</span>
      </button>

      {/* App Info */}
      <div className="text-center py-6">
        <p className="text-sm font-medium text-slate-900">EmpowerHer</p>
        <p className="text-xs text-slate-500 mt-1">Version 1.0.0</p>
        <p className="text-xs text-slate-400 mt-3">
          Made with ❤️ for women empowerment
        </p>
      </div>
    </div>
  );
};

export default Profile;