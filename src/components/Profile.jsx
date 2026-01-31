import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, LogOut, Edit3, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Simulate user data loading
    const mockUser = {
      uid: 'user123',
      displayName: 'Jane Doe',
      email: 'jane.doe@example.com',
      emergencyContact: '+60 123 456 7890',
      joinDate: 'January 2026',
      totalDocuments: 15,
      empowermentPoints: 142
    };
    setUser(mockUser);
    setFormData({
      displayName: mockUser.displayName,
      email: mockUser.email,
      emergencyContact: mockUser.emergencyContact
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(prev => ({
        ...prev,
        displayName: formData.displayName,
        email: formData.email,
        emergencyContact: formData.emergencyContact
      }));
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-teal-50 via-white to-teal-50 min-h-screen safe-area relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-56 h-56 bg-primary-200/20 rounded-full -translate-x-1/3 -translate-y-1/3 animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-0 w-40 h-40 bg-accent-200/15 rounded-full translate-x-1/3 -translate-y-1/3 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-safety-200/10 rounded-full -translate-x-1/4 translate-y-1/4 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{user.displayName}</h1>
              <p className="text-slate-600">{user.email}</p>
              <p className="text-xs text-slate-500">Member since {user.joinDate}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-teal-600">{user.totalDocuments}</div>
          <div className="text-sm text-slate-500">Documents</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">{user.empowermentPoints}</div>
          <div className="text-sm text-slate-500">Empowerment Points</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-purple-600">Active</div>
          <div className="text-sm text-slate-500">Account Status</div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Profile Settings</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditing 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isEditing ? (
              <>
                <X size={18} className="inline mr-2" /> Cancel
              </>
            ) : (
              <>
                <Edit3 size={18} className="inline mr-2" /> Edit Profile
              </>
            )}
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Emergency Contact</label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+60 123 456 7890"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">This contact will be used for emergency alerts</p>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-teal-600" />
          <h3 className="text-lg font-bold text-slate-800">Security</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">Two-Factor Authentication</p>
              <p className="text-sm text-slate-500">Add an extra layer of security</p>
            </div>
            <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
              Enable
            </button>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">Password</p>
              <p className="text-sm text-slate-500">Update your account password</p>
            </div>
            <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
              Change
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">App Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Version:</span>
            <span className="ml-2 font-medium">1.0.0</span>
          </div>
          <div>
            <span className="text-slate-500">Platform:</span>
            <span className="ml-2 font-medium">Progressive Web App</span>
          </div>
          <div>
            <span className="text-slate-500">Storage:</span>
            <span className="ml-2 font-medium">Cloud + Local</span>
          </div>
          <div>
            <span className="text-slate-500">Last Sync:</span>
            <span className="ml-2 font-medium">Just now</span>
          </div>
        </div>
        
        <div className="mt-4 flex gap-3">
          <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
            Terms of Service
          </button>
          <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
            Privacy Policy
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;