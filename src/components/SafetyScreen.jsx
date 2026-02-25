import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { Shield, Clock, Users, Phone, AlertTriangle, CheckCircle, MapPin, Bell } from 'lucide-react';

const SafetyScreen = () => {
  const [user] = useAuthState(auth);
  const [safetyTimer, setSafetyTimer] = useState(3600); // 1 hour in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showSOSAlert, setShowSOSAlert] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Emergency Services', number: '911', icon: '🚨' },
    { name: 'Trusted Contact 1', number: '+60 12-345 6789', icon: '👤' },
    { name: 'Trusted Contact 2', number: '+60 98-765 4321', icon: '👤' },
  ]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isTimerActive && safetyTimer > 0) {
      interval = setInterval(() => setSafetyTimer((t) => t - 1), 1000);
    } else if (safetyTimer === 0) {
      triggerSOS();
      setIsTimerActive(false);
      setShowSOSAlert(true);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, safetyTimer]);

  // SOS Trigger
  const triggerSOS = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = encodeURIComponent(`EMERGENCY: I need help. My location: ${mapLink}`);
      window.open(`https://wa.me/60123456789?text=${message}`, '_blank');
    });
  };

  // Timer actions
  const handleStartTimer = () => setIsTimerActive(true);
  const handleStopTimer = () => setIsTimerActive(false);
  const handleCheckIn = () => {
    setIsTimerActive(false);
    setSafetyTimer(3600);
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50">
      <div className="px-5 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Safety Center</h2>
            <p className="text-sm text-gray-500">Your protection hub</p>
          </div>
        </div>

        {/* SOS Panic Button */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-rose-100 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 font-medium mb-2">Emergency SOS</p>
            <button
              type="button"
              onClick={triggerSOS}
              className="w-32 h-32 bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <div className="text-center">
                <AlertTriangle className="w-10 h-10 text-white mx-auto mb-1" />
                <span className="text-white font-bold text-lg">SOS</span>
              </div>
            </button>
            <p className="text-xs text-gray-400 mt-3">Press and hold in emergency</p>
          </div>
        </div>

        {/* Safety Timer */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTimerActive ? 'bg-rose-100' : 'bg-gray-100'}`}>
              <Clock className={`w-5 h-5 ${isTimerActive ? 'text-rose-500' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Safety Timer</h3>
              <p className="text-xs text-gray-500">{isTimerActive ? 'Timer active - Stay safe!' : 'Set a check-in reminder'}</p>
            </div>
            <div className="text-2xl font-bold text-rose-500">
              {formatTime(safetyTimer)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleStartTimer}
              disabled={isTimerActive}
              className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                isTimerActive
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              Start
            </button>
            <button
              type="button"
              onClick={handleStopTimer}
              disabled={!isTimerActive}
              className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                !isTimerActive
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              Stop
            </button>
            <button
              type="button"
              onClick={handleCheckIn}
              className="py-3 rounded-xl font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
            >
              Check-in
            </button>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Emergency Contacts</h3>
            </div>
            <button className="text-sm text-violet-600 font-semibold">Edit</button>
          </div>

          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">{contact.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.number}</p>
                </div>
                <a
                  href={`tel:${contact.number}`}
                  className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 text-emerald-600" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Share Location</p>
            <p className="text-xs text-gray-500 mt-1">Send your location</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Alert History</p>
            <p className="text-xs text-gray-500 mt-1">View past alerts</p>
          </div>
        </div>

        {/* SOS Alert Modal */}
        {showSOSAlert && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Alert Sent!</h3>
              <p className="text-gray-500 mb-6">Your emergency contacts have been notified with your location.</p>
              <button
                type="button"
                onClick={() => setShowSOSAlert(false)}
                className="w-full py-3.5 bg-violet-500 text-white font-semibold rounded-xl hover:bg-violet-600 transition-all"
              >
                I'm Safe Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyScreen;