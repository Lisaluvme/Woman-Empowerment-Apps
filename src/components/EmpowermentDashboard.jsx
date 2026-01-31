import React, { useState, useEffect } from 'react';
import { ShieldAlert, BookOpen, Target, Users, Camera, PlusCircle, LogOut } from 'lucide-react';

const EmpowermentDashboard = ({ onOpenScanner }) => {
  // 1. State for Counter & Timer
  const [empowermentPoints, setEmpowermentPoints] = useState(12); // "Nos of clicks" tracker
  const [timer, setTimer] = useState(3600); // 1 hour safety timer in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showPanicAlert, setShowPanicAlert] = useState(false);

  // 2. Career Progress Data
  const careerGoal = { current: 7, target: 10 };
  const progressPercent = (careerGoal.current / careerGoal.target) * 100;

  // 3. SOS Logic
  const triggerSOS = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = encodeURIComponent(`EMERGENCY: I need help. My location: ${mapLink}`);
      window.open(`https://wa.me/60123456789?text=${message}`, '_blank');
    });
  };

  // 4. Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      triggerSOS();
      setIsTimerActive(false);
      setShowPanicAlert(true);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handlePanicButton = () => {
    setShowPanicAlert(true);
    triggerSOS();
  };

  const handleCheckIn = () => {
    setIsTimerActive(false);
    setTimer(3600);
  };

  const handleStartTimer = () => {
    setIsTimerActive(true);
  };

  const handleStopTimer = () => {
    setIsTimerActive(false);
  };

  const handleAddPoint = () => {
    setEmpowermentPoints(prev => prev + 1);
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-primary-50 via-white to-primary-50 min-h-screen p-4 pb-20 font-sans safe-area relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200/30 rounded-full -translate-x-1/3 -translate-y-1/3 animate-pulse-slow"></div>
        <div className="absolute top-20 right-0 w-48 h-48 bg-accent-200/20 rounded-full translate-x-1/3 -translate-y-1/3 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-safety-200/20 rounded-full -translate-x-1/4 translate-y-1/4 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10">
      {/* Header with Empowerment Counter */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-teal-800">Command Center</h1>
        <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold flex items-center gap-2">
          <PlusCircle size={18} /> {empowermentPoints} Points
        </div>
      </header>

      {/* SAFETY SECTION (SOS & Timer) */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="text-rose-600" />
          <h2 className="font-bold text-lg">Safety Shield</h2>
        </div>
        
        <button 
          onClick={handlePanicButton}
          className="w-full bg-rose-600 text-white py-4 rounded-xl font-black text-xl shadow-lg active:scale-95 transition-transform mb-4 hover:bg-rose-700"
        >
          🚨 SOS PANIC BUTTON
        </button>

        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Safety Timer</span>
            <span className="text-xs text-gray-500">{Math.floor(timer / 60)}m {timer % 60}s remaining</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleStartTimer}
              disabled={isTimerActive}
              className={`px-3 py-1 rounded-md text-sm ${isTimerActive ? 'bg-gray-300 text-gray-500' : 'bg-teal-600 text-white'}`}
            >
              Start
            </button>
            <button 
              onClick={handleStopTimer}
              disabled={!isTimerActive}
              className={`px-3 py-1 rounded-md text-sm ${!isTimerActive ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white'}`}
            >
              Stop
            </button>
            <button 
              onClick={handleCheckIn}
              className="px-3 py-1 rounded-md text-sm bg-green-600 text-white"
            >
              Check-in
            </button>
          </div>
        </div>
      </section>

      {/* CAREER SECTION (Progress Tracker) */}
      <section className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-teal-600" />
          <h2 className="font-bold text-lg">Career Growth</h2>
        </div>
        <p className="text-sm text-gray-500 mb-2">Monthly Skill Goal: {careerGoal.current}/{careerGoal.target}</p>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-teal-500 h-4 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs mt-2 italic text-gray-500">Progress: {progressPercent.toFixed(0)}%</p>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={handleAddPoint}
            className="flex-1 bg-teal-100 text-teal-700 py-2 px-3 rounded-lg font-medium hover:bg-teal-200 transition-colors"
          >
            +1 Point
          </button>
          <button 
            className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg font-medium hover:bg-blue-200 transition-colors"
          >
            Update Goal
          </button>
        </div>
      </section>

      {/* QUICK ACTIONS (Journal & Camera) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={handleAddPoint}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
        >
          <BookOpen className="text-blue-500" size={32} />
          <span className="font-bold text-sm">Journal</span>
          <span className="text-xs text-gray-500">Track progress</span>
        </button>
        
        <button 
          onClick={onOpenScanner}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
        >
          <Camera className="text-purple-500" size={32} />
          <span className="font-bold text-sm">Scanner</span>
          <span className="text-xs text-gray-500">Capture docs</span>
        </button>
      </div>

      {/* FAMILY SECTION */}
      <section className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-purple-600" />
          <h2 className="font-bold text-lg">Family Hub</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <div>
              <p className="font-medium text-purple-700">Grocery List</p>
              <p className="text-xs text-purple-500">3 items remaining</p>
            </div>
            <button className="text-purple-600 hover:text-purple-800">
              View
            </button>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-blue-700">Chores</p>
              <p className="text-xs text-blue-500">2 pending</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800">
              Manage
            </button>
          </div>
        </div>
        
        <button className="w-full mt-4 bg-purple-100 text-purple-700 py-2 px-3 rounded-lg font-medium hover:bg-purple-200 transition-colors">
          + Add Family Task
        </button>
      </section>

      {/* Bottom Nav Bar (Family & Home) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center">
        <button className="text-gray-400 hover:text-teal-600">
          <Users className="w-6 h-6" />
        </button>
        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white -mt-10 border-4 border-slate-50 shadow-lg">
          <PlusCircle />
        </div>
        <button className="text-teal-600">
          <Users className="w-6 h-6" />
        </button>
      </nav>

      {/* Panic Alert Overlay */}
      {showPanicAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 m-4 max-w-sm text-center">
            <ShieldAlert className="w-16 h-16 text-rose-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency Alert Sent!</h3>
            <p className="text-gray-600 mb-4">Your location has been shared with your emergency contact.</p>
            <button 
              onClick={() => setShowPanicAlert(false)}
              className="w-full bg-rose-600 text-white py-3 rounded-lg font-bold hover:bg-rose-700 transition-colors"
            >
              I'm Safe
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default EmpowermentDashboard;