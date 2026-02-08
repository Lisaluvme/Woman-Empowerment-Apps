import React, { useState, useEffect } from 'react';
import { Shield, Target, BookOpen, Camera, Plus, TrendingUp, Clock, Users, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import JournalWithCalendar from './JournalWithCalendar';
import GoogleCalendarIntegration from './GoogleCalendarIntegration';

const EmpowermentDashboard = ({ onOpenScanner }) => {
  const [user] = useAuthState(auth);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [currentJournalEntry, setCurrentJournalEntry] = useState(null);
  // State
  const [empowermentPoints, setEmpowermentPoints] = useState(1250);
  const [safetyTimer, setSafetyTimer] = useState(3600); // 1 hour in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showSOSAlert, setShowSOSAlert] = useState(false);
  
  // Career progress
  const careerGoal = { current: 7, target: 10 };
  const progressPercent = (careerGoal.current / careerGoal.target) * 100;

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

  // Journal handlers
  const handleOpenJournal = () => {
    setShowJournalModal(true);
  };
  const handleCloseJournal = () => {
    setShowJournalModal(false);
  };
  const handleJournalCreated = (journalEntry) => {
    setCurrentJournalEntry(journalEntry);
    // Keep modal open to allow user to see success message and connect to Google Calendar
    // User can manually close with X button
  };
  const handleCalendarSyncSuccess = (eventId, eventLink) => {
    console.log('Calendar sync successful:', eventId, eventLink);
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-5 py-6 max-w-lg mx-auto space-y-5">
      {/* Welcome Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold mb-1">Good evening</h2>
          <p className="text-sm text-gray-500 font-medium">Here's your overview for today</p>
        </div>
        <div className="text-right">
          <div className="glass-badge bg-gradient-to-r from-violet-100 to-purple-100 border-2 border-violet-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-lg font-bold text-violet-700">{empowermentPoints}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">Empowerment Points</p>
        </div>
      </div>

      {/* HERO COMMAND CENTER CARD */}
      <div className="hero-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-container-lavender shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Command Center</h3>
            <p className="text-xs text-gray-600 font-medium">Your safety & progress hub</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-violet-600 mb-1">{careerGoal.current}</div>
            <div className="text-xs text-gray-600 font-medium">Skills</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">{empowermentPoints}</div>
            <div className="text-xs text-gray-600 font-medium">Points</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">3</div>
            <div className="text-xs text-gray-600 font-medium">Tasks</div>
          </div>
        </div>

        {/* SOS Panic Button - Hero */}
        <button
          type="button"
          onClick={triggerSOS}
          className="sos-button-premium w-full cursor-pointer"
        >
          <div className="flex items-center justify-center gap-3">
            <Shield size={26} />
            <span className="text-lg">Emergency SOS</span>
          </div>
        </button>
      </div>

      {/* SAFETY TIMER SECTION */}
      <div className="glass-card-rose p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="icon-container icon-container-rose">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Safety Timer</h3>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {isTimerActive ? 'Timer active' : 'Timer inactive'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-rose-600">
              {formatTime(safetyTimer)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleStartTimer}
            disabled={isTimerActive}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
              isTimerActive
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'btn-primary-glass hover:shadow-lg cursor-pointer'
            }`}
          >
            Start
          </button>
          <button
            type="button"
            onClick={handleStopTimer}
            disabled={!isTimerActive}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
              !isTimerActive
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-900 active:scale-95 cursor-pointer'
            }`}
          >
            Stop
          </button>
          <button
            type="button"
            onClick={handleCheckIn}
            className="flex-1 py-3 px-4 rounded-2xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all duration-200 shadow-lg cursor-pointer"
          >
            Check-in
          </button>
        </div>
      </div>

      {/* CAREER PROGRESS SECTION */}
      <div className="glass-card-lavender p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-container icon-container-lavender">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-bold">Career Progress</h3>
        </div>

        {/* Progress Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-bold text-base mb-1">Monthly Skill Goal</p>
              <p className="text-sm text-gray-600 font-medium">
                {careerGoal.current} of {careerGoal.target} skills completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gradient-lavender">{progressPercent.toFixed(0)}%</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-violet-600" />
                <span className="text-xs text-violet-600 font-semibold">On track</span>
              </div>
            </div>
          </div>

          <div className="progress-bar-glass">
            <div 
              className="progress-fill-glass"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setEmpowermentPoints(p => p + 100)}
            className="btn-secondary-glass hover:shadow-md active:scale-95 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Progress</span>
            </div>
          </button>
          <button
            type="button"
            className="btn-secondary-glass hover:shadow-md active:scale-95 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              <span>Update Goal</span>
            </div>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <button
          type="button"
          onClick={handleOpenJournal}
          className="glass-card p-5 hover:shadow-xl active:scale-95 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="icon-container icon-container-sky shadow-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <span className="font-bold text-sm block">Journal</span>
              <span className="text-xs text-gray-500 font-medium">Track your day</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenScanner}
          className="glass-card p-5 hover:shadow-xl active:scale-95 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="icon-container icon-container-champagne shadow-md">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <span className="font-bold text-sm block">Scanner</span>
              <span className="text-xs text-gray-500 font-medium">Capture docs</span>
            </div>
          </div>
        </button>
      </div>

      {/* FAMILY SECTION */}
      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="icon-container icon-container-lavender">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold">Family Hub</h3>
          </div>
          <button type="button" className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer">
            View all
          </button>
        </div>

        <div className="space-y-3">
          {/* Task Item */}
          <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 hover:shadow-md transition-all">
            <div className="icon-container icon-container-sky">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">Grocery List</p>
              <p className="text-xs text-gray-600 font-medium mt-0.5">3 items remaining</p>
            </div>
            <button
              type="button"
              className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

          {/* Task Item */}
          <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 hover:shadow-md transition-all">
            <div className="icon-container icon-container-champagne">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">Household Chores</p>
              <p className="text-xs text-gray-600 font-medium mt-0.5">2 tasks pending</p>
            </div>
            <button
              type="button"
              className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Journal Modal Overlay */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="glass-card p-6 max-w-lg w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Journal Entry</h3>
                <p className="text-sm text-gray-600 mt-1">Write and sync to Google Calendar</p>
              </div>
              <button
                type="button"
                onClick={handleCloseJournal}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <JournalWithCalendar 
              user={user}
              onJournalCreated={handleJournalCreated}
            />
            
            {/* Calendar Integration Preview */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <GoogleCalendarIntegration 
                user={user}
                journalEntry={currentJournalEntry}
                onSyncSuccess={handleCalendarSyncSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* SOS Alert Overlay */}
      {showSOSAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="glass-card-rose p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
              <Shield size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Emergency Alert Sent!</h3>
            <p className="text-gray-700 mb-7 text-sm font-medium leading-relaxed">
              Your location has been shared with your emergency contacts. Stay safe.
            </p>
            <button
              type="button"
              onClick={() => setShowSOSAlert(false)}
              className="btn-primary-glass w-full shadow-lg cursor-pointer"
            >
              I'm Safe Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpowermentDashboard;