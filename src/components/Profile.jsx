import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase-config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { 
  User, 
  Shield, 
  Bell, 
  HelpCircle, 
  ChevronRight,
  LogOut,
  Settings,
  Moon,
  Globe,
  Heart,
  Sparkles,
  Edit2,
  Check,
  X
} from 'lucide-react';

const Profile = ({ onLogout }) => {
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Load user profile and document count
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        // Load user profile
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile(data);
          setDisplayName(data.displayName || '');
          setEmergencyContact(data.emergencyContact || '');
          setNotifications(data.notifications ?? true);
          setDarkMode(data.darkMode ?? false);
        } else {
          // Create default profile
          const defaultProfile = {
            email: user.email,
            displayName: user.email?.split('@')[0] || 'User',
            emergencyContact: '',
            notifications: true,
            darkMode: false,
            createdAt: new Date(),
            stats: { points: 0 }
          };
          await updateDoc(userDocRef, defaultProfile);
          setUserProfile(defaultProfile);
          setDisplayName(defaultProfile.displayName);
          setEmergencyContact(defaultProfile.emergencyContact);
        }

        // Count documents
        const docsQuery = query(
          collection(db, 'documents'),
          where('userId', '==', user.uid)
        );
        
        const unsubscribe = onSnapshot(docsQuery, (snapshot) => {
          setDocumentCount(snapshot.size);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await onLogout();
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        emergencyContact: emergencyContact,
        notifications: notifications,
        darkMode: darkMode
      });
      
      setUserProfile({
        ...userProfile,
        displayName,
        emergencyContact,
        notifications,
        darkMode
      });
      
      setEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const calculateDaysActive = () => {
    if (!userProfile?.createdAt) return 0;
    const created = new Date(userProfile.createdAt.seconds * 1000);
    const now = new Date();
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Personal Information',
          description: 'Update your profile details',
          color: 'lavender'
        },
        {
          icon: Shield,
          label: 'Security',
          description: 'Password and 2FA settings',
          color: 'sky'
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
          toggle: true,
          toggleValue: notifications,
          action: () => setNotifications(!notifications),
          color: 'champagne'
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          description: darkMode ? 'Enabled' : 'Disabled',
          toggle: true,
          toggleValue: darkMode,
          action: () => setDarkMode(!darkMode),
          color: 'lavender'
        },
        {
          icon: Globe,
          label: 'Language',
          description: 'English (US)',
          color: 'sky'
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
          color: 'champagne'
        },
        {
          icon: Settings,
          label: 'App Settings',
          description: 'Configure app preferences',
          color: 'lavender'
        },
      ]
    }
  ];

  const getIconContainerClass = (color) => {
    const classes = {
      lavender: 'icon-container-lavender',
      champagne: 'icon-container-champagne',
      sky: 'icon-container-sky',
      rose: 'icon-container-rose'
    };
    return classes[color] || 'icon-container-lavender';
  };

  return (
    <div className="px-5 py-6 max-w-lg mx-auto">
      {/* Profile Header - Premium Hero Card */}
      <div className="hero-card p-8 mb-8 animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="avatar-glass-lg shadow-2xl">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-3xl font-bold mb-1">{displayName || 'Your Account'}</h2>
        <p className="text-sm text-slate-600">{user?.email || ''}</p>
      </div>
      <button
        onClick={() => setEditingProfile(!editingProfile)}
        className="p-3 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all"
      >
        <Edit2 size={20} className="text-slate-700" />
      </button>
    </div>

    {/* Edit Profile Form */}
    {editingProfile && (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 mb-6 animate-fade-in">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-colors bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Emergency Contact
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g., 60123456789"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-colors bg-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingProfile(false);
                setDisplayName(userProfile?.displayName || '');
                setEmergencyContact(userProfile?.emergencyContact || '');
              }}
              className="flex-1 bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Check size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Stats Section */}
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="card text-center">
        <div className="text-2xl font-bold text-rose-600">{userProfile?.stats?.points || 0}</div>
        <div className="text-xs text-slate-500 mt-1">Points</div>
      </div>
      <div className="card text-center">
        <div className="text-2xl font-bold text-blue-600">{documentCount}</div>
        <div className="text-xs text-slate-500 mt-1">Documents</div>
      </div>
      <div className="card text-center">
        <div className="text-2xl font-bold text-purple-600">{calculateDaysActive()}</div>
        <div className="text-xs text-slate-500 mt-1">Days Active</div>
      </div>
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