import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase-config';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Beautiful Background Illustration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating abstract shapes */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-60 blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-orange-200 to-rose-200 rounded-full opacity-50 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-40 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Abstract female silhouette */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
            <path d="M150 50C183.137 50 210 76.8629 210 110C210 143.137 183.137 170 150 170C116.863 170 90 143.137 90 110C90 76.8629 116.863 50 150 50Z" fill="currentColor" />
            <path d="M150 170C190.89 170 224 195 224 225C224 255 190.89 280 150 280C109.11 280 76 255 76 225C76 195 109.11 170 150 170Z" fill="currentColor" />
            <path d="M120 180C120 180 130 200 150 200C170 200 180 180 180 180" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-rose-100 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-20 right-10 w-16 h-16 bg-orange-100 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-100 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '1.5s' }}></div>

      <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-xl p-8 w-full max-w-md relative z-10 border border-white/20">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
            EmpowerHer
          </h1>
          <p className="text-gray-600 text-sm">Your journey to confidence begins here</p>
        </div>

        {/* Forgot Password Form */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 w-5 h-5" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {forgotMessage && (
              <div className={`p-4 rounded-xl text-sm ${
                forgotMessage.includes('Error') 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}>
                {forgotMessage}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotMessage('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-300"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:from-rose-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                    Sending...
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors duration-300"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white py-4 px-6 rounded-xl font-semibold text-lg tracking-wide hover:from-rose-600 hover:via-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-2">Don't have an account?</p>
          <Link 
            to="/register" 
            className="inline-block bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 py-2 px-6 rounded-full font-medium hover:from-rose-200 hover:to-orange-200 transition-all duration-300 border border-rose-200"
          >
            Join Our Community
          </Link>
        </div>

        {/* Empowering Message */}
        <div className="mt-8 p-4 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl">
          <p className="text-xs text-rose-700 text-center font-medium">
            ✨ You are strong, capable, and worthy. Welcome to your empowerment journey.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
