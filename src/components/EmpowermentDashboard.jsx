import React, { useState, useEffect } from 'react';
import { ShieldAlert, BookOpen, Target, Users, Camera, PlusCircle, Sparkles, Heart, Award, TrendingUp, Flame } from 'lucide-react';

const EmpowermentDashboard = ({ onOpenScanner }) => {
  // 1. State for Counter & Timer
  const [empowermentPoints, setEmpowermentPoints] = useState(12);
  const [timer, setTimer] = useState(3600);
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
    <div className="max-w-md mx-auto min-h-screen p-4 pb-24 font-sans safe-area relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full -translate-x-1/3 -translate-y-1/3 animate-pulse-slow"></div>
        <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-br from-orange-200/20 to-rose-200/20 rounded-full translate-x-1/3 -translate-y-1/3 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-orange-200/20 rounded-full -translate-x-1/4 translate-y-1/4 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 fade-in-up">
      {/* Header with Empowerment Counter */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Command Center</h1>
          <p className="text-sm text-gray-600 mt-1">Your empowerment journey</p>
        </div>
        <div className="bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Sparkles size={18} className="animate-pulse" />
          <span>{empowermentPoints} Points</span>
        </div>
      </header>

      {/* SAFETY SECTION (SOS & Timer) */}
      <section className="card-glass mb-6 border-2 border-rose-100 stagger-1 fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldAlert className="text-white" size={20} />
          </div>
          <h2 className="font-bold text-xl text-gray-800">Safety Shield</h2>
        </div>
        
        <button 
          onClick={handlePanicButton}
          className="w-full bg-gradient-to-r from-rose-600 to-orange-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all duration-300 mb-4 hover:shadow-2xl hover:-translate-y-1 animate-pulse-glow"
        >
          <div className="flex items-center justify-center gap-3">
            <Flame size={28} className="animate-pulse" />
            <span>SOS PANIC BUTTON</span>
          </div>
        </button>

        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-500" />
                Safety Timer
              </span>
              <span className="text-xs text-gray-500 mt-1">{Math.floor(timer / 60)}m {timer % 60}s remaining</span>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold gradient-text">
                {Math.floor(timer / 60)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleStartTimer}
              disabled={isTimerActive}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${isTimerActive ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl'}`}
            >
              Start
            </button>
            <button 
              onClick={handleStopTimer}
              disabled={!isTimerActive}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${!isTimerActive ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl'}`}
            >
              Stop
            </button>
            <button 
              onClick={handleCheckIn}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Check-in
            </button>
          </div>
        </div>
      </section>

      {/* CAREER SECTION (Progress Tracker) */}
      <section className="card-glass mb-6 stagger-2 fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-800">Career Growth</h2>
            <p className="text-xs text-gray-500">Track your progress</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-xl border border-teal-100 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Monthly Skill Goal</p>
              <p className="text-xs text-gray-500 mt-1">{careerGoal.current} of {careerGoal.target} completed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold gradient-text-secondary">{progressPercent.toFixed(0)}%</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                <TrendingUp size={12} className="text-teal-500" />
                On track
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-700 shadow-lg" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleAddPoint}
            className="bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 py-3 px-4 rounded-xl font-semibold hover:from-teal-200 hover:to-cyan-200 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} />
            Add Point
          </button>
          <button 
            className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 py-3 px-4 rounded-xl font-semibold hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Target size={18} />
            Update Goal
          </button>
        </div>
      </section>

      {/* QUICK ACTIONS (Journal & Camera) */}
      <div className="grid grid-cols-2 gap-4 mb-6 stagger-3 fade-in-up">
        <button 
          onClick={handleAddPoint}
          className="card-glass p-6 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <BookOpen className="text-white" size={28} />
          </div>
          <div className="text-center">
            <span className="font-bold text-sm text-gray-800 block">Journal</span>
            <span className="text-xs text-gray-500">Track progress</span>
          </div>
        </button>
        
        <button 
          onClick={onOpenScanner}
          className="card-glass p-6 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <Camera className="text-white" size={28} />
          </div>
          <div className="text-center">
            <span className="font-bold text-sm text-gray-800 block">Scanner</span>
            <span className="text-xs text-gray-500">Capture docs</span>
          </div>
        </button>
      </div>

      {/* FAMILY SECTION */}
      <section className="card-glass mb-6 stagger-4 fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-800">Family Hub</h2>
            <p className="text-xs text-gray-500">Manage together</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-700">Grocery List</p>
                <p className="text-xs text-purple-500">3 items remaining</p>
              </div>
            </div>
            <button className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors">
              →
            </button>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Target size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-700">Chores</p>
                <p className="text-xs text-blue-500">2 pending</p>
              </div>
            </div>
            <button className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors">
              →
            </button>
          </div>
        </div>
        
        <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
          <PlusCircle size={18} />
          Add Family Task
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 m-4 max-w-sm text-center shadow-2xl transform scale-in animate-pulse-glow">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
              <ShieldAlert size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold gradient-text mb-2">Emergency Alert Sent!</h3>
            <p className="text-gray-600 mb-6 text-sm">Your location has been shared with your emergency contact.</p>
            <button 
              onClick={() => setShowPanicAlert(false)}
              className="w-full bg-gradient-to-r from-rose-600 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-rose-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl"
            >
              <div className="flex items-center justify-center gap-2">
                <Heart size={20} className="animate-pulse" />
                I'm Safe
              </div>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default EmpowermentDashboard;