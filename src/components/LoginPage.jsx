import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, AlertTriangle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError('Failed to log in with Google. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!isLogin && (!displayName || !phone || !age)) {
      setError('Please enter all profile setup details (Name, Phone, Age).');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, { displayName, phone, age });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-slate-200">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Language Selector Top Right */}
      <div className="absolute top-6 right-6 z-10 glass-panel rounded-lg p-1 flex items-center border border-slate-800">
        <Globe className="w-4 h-4 text-slate-400 ml-2 mr-2" />
        <div className="flex space-x-1">
          {['en', 'hi', 'mr'].map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-2 py-1 text-xs font-bold rounded ${
                i18n.language === lang ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-12 rounded-3xl w-11/12 max-w-md shadow-2xl border border-slate-800/80 text-center relative z-10 flex flex-col items-center">
        
        {/* Brand Icon */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-500 mb-6 shadow-xl shadow-red-500/10">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
          {t('appName', 'ResQ Live')}
        </h1>
        <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">
          {t('tagline', 'Real-Time Disaster Relief & Crisis Management')}
        </p>

        {error && (
          <div className="w-full bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-start space-x-3 text-left">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleManualAuth} className="w-full space-y-4 mb-6">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-sky-600/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="w-full flex items-center mb-6">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="px-4 text-xs font-semibold text-slate-500">OR</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <div className="mt-8 text-[11px] text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
