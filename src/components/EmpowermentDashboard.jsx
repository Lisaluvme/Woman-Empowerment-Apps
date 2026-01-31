import React, { useState, useEffect } from 'react';
import { Shield, Target, BookOpen, Camera, Plus, TrendingUp, Clock, Users, CheckCircle2 } from 'lucide-react';

const EmpowermentDashboard = ({ onOpenScanner }) => {
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

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Good evening</h2>
          <p className="text-sm text-slate-500">Here's your overview for today</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span className="text-lg font-bold text-emerald-700">{empowermentPoints}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Empowerment Points</p>
        </div>
      </div>

      {/* SAFETY SECTION - CRITICAL & VISIBLE */}
      <section className="card-elevated border-2 border-rose-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Safety Shield</h3>
        </div>

        {/* SOS Panic Button - ALWAYS VISIBLE & PROMINENT */}
        <button 
          onClick={triggerSOS}
          className="sos-button w-full mb-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Shield size={24} />
            <span className="text-lg">SOS PANIC BUTTON</span>
          </div>
        </button>

        {/* Safety Timer */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Safety Check-in Timer
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTimerActive ? 'Timer active' : 'Timer inactive'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {formatTime(safetyTimer)}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleStartTimer}
              disabled={isTimerActive}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isTimerActive 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
              }`}
            >
              Start
            </button>
            <button 
              onClick={handleStopTimer}
              disabled={!isTimerActive}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isTimerActive 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-700 text-white hover:bg-slate-800 active:scale-95'
              }`}
            >
              Stop
            </button>
            <button 
              onClick={handleCheckIn}
              className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 active:scale-95 transition-all duration-200"
            >
              Check-in
            </button>
          </div>
        </div>
      </section>

      {/* CAREER PROGRESS SECTION */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Career Progress</h3>
        </div>

        <div className="space-y-4">
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-slate-900">Monthly Skill Goal</p>
                <p className="text-sm text-slate-600 mt-1">
                  {careerGoal.current} of {careerGoal.target} skills completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">{progressPercent.toFixed(0)}%</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600">On track</span>
                </div>
              </div>
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setEmpowermentPoints(p => p + 100)}
              className="bg-white border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Progress
            </button>
            <button className="bg-white border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              Update Goal
            </button>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setEmpowermentPoints(p => p + 50)}
          className="card-hover p-5 flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <span className="font-semibold text-slate-900 text-sm block">Journal</span>
            <span className="text-xs text-slate-500">Track your day</span>
          </div>
        </button>

        <button 
          onClick={onOpenScanner}
          className="card-hover p-5 flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <span className="font-semibold text-slate-900 text-sm block">Scanner</span>
            <span className="text-xs text-slate-500">Capture docs</span>
          </div>
        </button>
      </div>

      {/* FAMILY SECTION */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Family Hub</h3>
          </div>
          <button className="text-sm font-medium text-emerald-600">View all</button>
        </div>

        <div className="space-y-3">
          {/* Task Item */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm truncate">Grocery List</p>
              <p className="text-xs text-slate-500">3 items remaining</p>
            </div>
            <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          {/* Task Item */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm truncate">Household Chores</p>
              <p className="text-xs text-slate-500">2 tasks pending</p>
            </div>
            <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SOS Alert Overlay */}
      {showSOSAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Emergency Alert Sent!</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Your location has been shared with your emergency contacts. Stay safe.
            </p>
            <button 
              onClick={() => setShowSOSAlert(false)}
              className="btn-primary w-full"
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