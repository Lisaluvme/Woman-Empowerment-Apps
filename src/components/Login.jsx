import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase-config';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Heart, Sparkles, Shield, ArrowRight, Chrome, Facebook, Smartphone } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const navigate = useNavigate();

  // Floating animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setForgotMessage('');

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotMessage('Password reset email sent! Please check your inbox.');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      setForgotMessage('Error sending password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Placeholder for social login implementation
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background with Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating abstract shapes with enhanced animation */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-200/60 to-pink-200/60 rounded-full blur-3xl transition-all duration-3000 ${isAnimating ? 'scale-110 opacity-70' : 'scale-100 opacity-60'}`} style={{ animationDelay: '0s' }}></div>
        <div className={`absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-orange-200/50 to-rose-200/50 rounded-full blur-3xl transition-all duration-3000 ${isAnimating ? 'scale-110 opacity-60' : 'scale-100 opacity-50'}`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-br from-pink-200/40 to-orange-200/40 rounded-full blur-3xl transition-all duration-3000 ${isAnimating ? 'scale-110 opacity-50' : 'scale-100 opacity-40'}`} style={{ animationDelay: '4s' }}></div>
        
        {/* Enhanced abstract female silhouette */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" className="animate-pulse">
            <path d="M200 80C240.89 80 274 105 274 135C274 165 240.89 190 200 190C159.11 190 126 165 126 135C126 105 159.11 80 200 80Z" fill="currentColor" />
            <path d="M200 190C240.89 190 274 215 274 245C274 275 240.89 300 200 300C159.11 300 126 275 126 245C126 215 159.11 190 200 190Z" fill="currentColor" />
            <path d="M160 200C160 200 175 225 200 225C225 225 240 200 240 200" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            {/* Additional empowering elements */}
            <circle cx="200" cy="135" r="8" fill="white" className="animate-pulse" />
            <path d="M180 150L190 140L200 150L210 140L220 150" stroke="white" strokeWidth="3" strokeLinecap="round" className="animate-bounce" />
          </svg>
        </div>

        {/* New: Floating hearts and sparkles */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-rose-300 rounded-full opacity-60 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '6s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating decorative elements with enhanced animation */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-60 animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-20 right-10 w-20 h-20 bg-gradient-to-br from-orange-200 to-rose-200 rounded-full opacity-50 animate-bounce shadow-lg" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-50 animate-bounce shadow-lg" style={{ animationDelay: '1.5s' }}></div>

      {/* Main Login Card */}
      <div className="bg-white bg-opacity-98 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/30 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
        {/* Header with Enhanced Logo */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
            <User className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2 tracking-tight">
            EmpowerHer
          </h1>
          <p className="text-gray-600 text-sm font-medium">Your journey to confidence begins here</p>
        </div>

        {/* Forgot Password Form */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-500" />
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center group-focus-within:bg-gradient-to-br group-focus-within:from-rose-200 group-focus-within:to-pink-200 transition-colors duration-300">
                  <Mail className="w-3 h-3 text-rose-500" />
                </div>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition-all duration-300 bg-gray-50/50 hover:bg-gray-50 group-focus-within:bg-white group-focus-within:shadow-lg group-focus-within:shadow-rose-100"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {forgotMessage && (
              <div className={`p-4 rounded-xl text-sm border-2 ${
                forgotMessage.includes('Error') 
                  ? 'bg-red-50 text-red-600 border-red-200' 
                  : 'bg-green-50 text-green-600 border-green-200'
              }`}>
                <div className="flex items-center gap-2">
                  {forgotMessage.includes('Error') ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-green-500" />
                  )}
                  <span>{forgotMessage}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotMessage('');
                }}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                ← Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:from-rose-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Email'
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-500" />
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center group-focus-within:bg-gradient-to-br group-focus-within:from-rose-200 group-focus-within:to-pink-200 transition-colors duration-300">
                  <Mail className="w-3 h-3 text-rose-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition-all duration-300 bg-gray-50/50 hover:bg-gray-50 group-focus-within:bg-white group-focus-within:shadow-lg group-focus-within:shadow-rose-100"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center group-focus-within:bg-gradient-to-br group-focus-within:from-rose-200 group-focus-within:to-pink-200 transition-colors duration-300">
                  <Lock className="w-3 h-3 text-rose-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition-all duration-300 bg-gray-50/50 hover:bg-gray-50 group-focus-within:bg-white group-focus-within:shadow-lg group-focus-within:shadow-rose-100"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors duration-300 group-hover:bg-rose-50 group-hover:rounded-full group-hover:p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors duration-300 flex items-center gap-1 group"
              >
                <Sparkles className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                Forgot Password?
              </button>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <div className="text-center text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Or continue with</div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-2 px-3 rounded-xl hover:border-rose-300 hover:text-rose-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <Chrome className="w-4 h-4" />
                  <span className="text-xs">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-2 px-3 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="text-xs">Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-2 px-3 rounded-xl hover:border-gray-400 hover:text-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs">Apple</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white py-4 px-6 rounded-xl font-semibold text-lg tracking-wide hover:from-rose-600 hover:via-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-3 font-medium">Don't have an account?</p>
          <Link 
            to="/register" 
            className="inline-block bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 py-3 px-8 rounded-xl font-semibold hover:from-rose-100 hover:to-orange-100 transition-all duration-300 border border-rose-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            Join Our Community
          </Link>
        </div>

        {/* Enhanced Empowering Message */}
        <div className="mt-8 p-4 bg-gradient-to-r from-rose-50/80 to-orange-50/80 border-2 border-rose-200/60 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
            <Sparkles className="w-4 h-4 text-orange-500" />
            <Shield className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-xs text-rose-700 text-center font-medium mt-2 leading-relaxed">
            ✨ You are strong, capable, and worthy. Every step you take here makes you stronger. Welcome to your empowerment journey.
          </p>
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 rounded-3xl opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="#ff6b6b" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#dots)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Login;