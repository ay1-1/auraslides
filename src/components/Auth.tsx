import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Cpu, ChevronRight, AlertCircle, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';

interface AuthProps {
  onAuthSuccess: (user: User, token: string) => void;
  onBackToHome?: () => void;
}

export default function Auth({ onAuthSuccess, onBackToHome }: AuthProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (authMode === 'forgot') {
      // Simulate password reset request
      setTimeout(() => {
        setSuccessMsg(`A temporary password reset link has been dispatched to ${email}. Please examine your inbox.`);
        setLoading(false);
      }, 1000);
      return;
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode === 'login' ? { email, password } : { email, password, name };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // Save to localStorage for persistent session
      localStorage.setItem('auraslides_token', data.token);
      localStorage.setItem('auraslides_user', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Simulate standard Google OAuth dynamic popup
    setTimeout(async () => {
      try {
        const testUser = {
          email: 'museridwan045@gmail.com', // User email from runtime metadata
          name: 'AI Workspace Developer',
          googleId: 'google_123456789'
        };

        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Google Authentication failed.');
        }

        localStorage.setItem('auraslides_token', data.token);
        localStorage.setItem('auraslides_user', JSON.stringify(data.user));

        onAuthSuccess(data.user, data.token);
      } catch (err: any) {
        setError(err.message || 'Google Sign-in failed.');
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden" id="auth-page">
      {/* Visual background gradient accents to match landing */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-900/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-rose-900/10 rounded-full blur-3xl -z-10" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 -z-20 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 shadow-2xl rounded-2xl p-8 relative" id="auth-card">
        
        {/* Back to Home Button */}
        {onBackToHome && (
          <button 
            onClick={onBackToHome}
            className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        )}

        {/* App Branding */}
        <div className="flex flex-col items-center mb-8 pt-4" id="auth-branding">
          <Logo className="h-10 sm:h-12 mb-1" onClick={onBackToHome} />
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/40 border border-rose-900/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs" id="auth-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notice */}
        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-900/30 rounded-xl flex items-start gap-3 text-emerald-300 text-xs" id="auth-success">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-xs outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-xs outline-none transition-all"
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                {authMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('forgot')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-xs outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400/50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer transition-all mt-6"
            id="auth-submit-btn"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator - Hide in Forgot password mode to keep simple */}
        {authMode !== 'forgot' && (
          <>
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute w-full border-t border-slate-800" />
              <span className="relative px-3 bg-slate-900 text-[10px] uppercase font-bold text-slate-500">or continue with</span>
            </div>

            {/* Google OAuth Login with custom premium branded buttons */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:border-slate-700"
              id="google-oauth-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.99 1 12 1 7.35 1 3.39 3.67 1.45 7.56l3.82 2.96C6.18 7.39 8.87 5.04 12 5.04z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.98 3.41-4.91 3.41-8.6z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.79c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.45 7.23C.53 9.07 0 11.12 0 13.29s.53 4.22 1.45 6.06l3.82-2.96z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.11-3.9 1.11-3.13 0-5.82-2.35-6.73-5.48L1.45 15.8C3.39 19.69 7.35 23 12 23z"
                    />
                  </svg>
                  <span>Google SSO Sign In</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Footer Toggle */}
        <div className="text-center mt-8 border-t border-slate-800/60 pt-6" id="auth-footer-toggle">
          {authMode === 'forgot' ? (
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { 
                setAuthMode(authMode === 'login' ? 'register' : 'login'); 
                setError(''); 
                setSuccessMsg(''); 
              }}
              className="text-xs text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span className="font-bold text-indigo-400 hover:underline">
                {authMode === 'login' ? "Sign Up" : "Log In"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
