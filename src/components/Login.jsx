import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase-config';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-rose-50/30 to-purple-50/30">
      {/* Modern abstract background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-rose-400/20 to-purple-400/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/15 to-pink-400/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-gradient-to-br from-pink-300/10 to-rose-300/10 rounded-full blur-[80px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-rose-900/5 border border-white/50 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500" />
          
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-5 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl shadow-lg shadow-rose-500/30 transform hover:scale-105 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-gray-500 text-sm">
                Sign in to continue your empowerment journey
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-down">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              </div>
            )}

            {forgotMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-down">
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {forgotMessage}
                </p>
              </div>
            )}

            {/* Forgot Password Form */}
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      onFocus={() => setFocusedField('forgotEmail')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 rounded-xl transition-all duration-200 outline-none
                        ${focusedField === 'forgotEmail' 
                          ? 'border-rose-500 ring-4 ring-rose-500/10 bg-white' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotMessage('');
                    }}
                    className="flex-1 py-3.5 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            ) : (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 rounded-xl transition-all duration-200 outline-none
                        ${focusedField === 'email' 
                          ? 'border-rose-500 ring-4 ring-rose-500/10 bg-white' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-12 pr-14 py-3.5 bg-gray-50/50 border-2 rounded-xl transition-all duration-200 outline-none
                        ${focusedField === 'password' 
                          ? 'border-rose-500 ring-4 ring-rose-500/10 bg-white' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-rose-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2.5 border-white/30 border-t-white" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur text-gray-500 font-medium">New here?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              to="/register"
              className="w-full py-4 px-6 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50/30 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Create an account</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>

            {/* Trust Badge */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure login powered by industry-leading encryption
              </p>
            </div>
          </div>
        </div>

        {/* Footer Tagline */}
        <p className="text-center text-xs text-gray-500 mt-6 font-medium">
          Empowering women to achieve their full potential ✨
        </p>
      </div>
    </div>
  );
};

export default Login;