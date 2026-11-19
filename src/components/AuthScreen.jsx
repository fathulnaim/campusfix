import React, { useState } from 'react';
import { Wrench, Shield, GraduationCap, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { loginUser, signUpUser } from '../services/authService';
import { ADMIN_EMAIL } from '../firebase';

export default function AuthScreen({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Tab Change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    if (tab === 'admin') {
      setEmail(ADMIN_EMAIL);
      setIsSignUp(false); // Admin is sign in
    } else {
      if (email === ADMIN_EMAIL) {
        setEmail('');
      }
    }
  };

  // Quick fill helper
  const fillDemo = (role) => {
    setErrorMessage('');
    if (role === 'admin') {
      setActiveTab('admin');
      setIsSignUp(false);
      setEmail(ADMIN_EMAIL);
      setPassword('admin123');
    } else {
      setActiveTab('student');
      setEmail('student@campus.edu');
      setPassword('student123');
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (activeTab === 'admin' && email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setErrorMessage(`Only ${ADMIN_EMAIL} has Maintenance Admin privileges.`);
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUpUser(email, password);
      } else {
        try {
          await loginUser(email, password);
        } catch (loginErr) {
          // If demo account hasn't been created yet in the Firebase project, try auto-signup
          if (
            loginErr.code === 'auth/user-not-found' || 
            loginErr.code === 'auth/invalid-credential'
          ) {
            try {
              await signUpUser(email, password);
            } catch {
              throw loginErr;
            }
          } else {
            throw loginErr;
          }
        }
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200/80 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-100">
            <Wrench className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            CampusFix<span className="text-indigo-600">.cloud</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Campus Facility Maintenance & Reporting System
          </p>
        </div>

        {/* Role Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5 text-xs font-bold border border-slate-200/60">
          <button
            type="button"
            onClick={() => handleTabChange('student')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Staff / Admin</span>
          </button>
        </div>

        {/* Tab Description */}
        <div className="mb-4">
          {activeTab === 'student' ? (
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <span>🧑‍🎓 Submit facility complaints & track repair status</span>
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="text-[11px] font-bold text-indigo-600 hover:underline shrink-0"
              >
                Auto-fill
              </button>
            </div>
          ) : (
            <div className="text-xs text-indigo-900 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
              <span>🔑 Admin email: <b>admin@campus.edu</b></span>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="text-[11px] font-bold text-indigo-700 hover:underline shrink-0 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Quick fill
              </button>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'admin' ? ADMIN_EMAIL : 'student@campus.edu'}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium text-slate-800 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">
                Password
              </label>
              <span className="text-[10px] text-slate-400">Min 6 chars</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium text-slate-800 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            } ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-98'}`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Firebase...</span>
              </span>
            ) : (
              <>
                <span>
                  {isSignUp
                    ? 'Create Student Account'
                    : activeTab === 'admin'
                    ? 'Enter Maintenance Admin Portal'
                    : 'Sign In to Student Portal'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up (Students) */}
        {activeTab === 'student' && (
          <div className="mt-5 text-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage('');
              }}
              className="text-xs text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer transition-colors"
            >
              {isSignUp ? (
                <span>Already have an account? <b>Sign In</b></span>
              ) : (
                <span>First time reporting a problem? <b>Sign Up (Register)</b></span>
              )}
            </button>
          </div>
        )}

        {/* Helpful instructions footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Per system rules: <b>admin@campus.edu</b> has Maintenance Admin privileges. All other email addresses are treated as Students.
          </p>
        </div>
      </div>
    </div>
  );
}
