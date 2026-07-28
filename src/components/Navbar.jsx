import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldAlert, 
  Map, 
  Home, 
  Users, 
  HeartHandshake, 
  Search, 
  SlidersHorizontal, 
  Globe, 
  AlertTriangle,
  Menu,
  X,
  PhoneCall,
  User
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenReportModal, onOpenProfileModal }) {
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { id: 'map', label: t('nav.liveMap'), icon: Map },
    { id: 'shelters', label: t('nav.shelters'), icon: Home },
    { id: 'volunteers', label: t('nav.volunteers'), icon: Users },
    { id: 'donations', label: t('nav.donations'), icon: HeartHandshake },
    { id: 'missing', label: t('nav.missingPersons'), icon: Search },
    { id: 'admin', label: t('nav.admin'), icon: SlidersHorizontal }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Live Pulse */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
                  {t('appName')}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                  LIVE CRISIS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xl:block mt-0.5">
                {t('tagline')}
              </p>
            </div>
          </div>



          {/* Action Buttons: Language Switcher & SOS Report */}
          <div className="hidden sm:flex items-center space-x-2">
            
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => changeLanguage('en')}
                className={`px-1.5 py-1 text-[11px] font-semibold rounded ${
                  i18n.language === 'en' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`px-1.5 py-1 text-[11px] font-semibold rounded ${
                  i18n.language === 'hi' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => changeLanguage('mr')}
                className={`px-1.5 py-1 text-[11px] font-semibold rounded ${
                  i18n.language === 'mr' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Quick Emergency Helplines Button */}
            <a
              href="tel:112"
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              title="National Emergency Helpline: 112"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>112 SOS</span>
            </a>

            {/* User Profile Button */}
            <button
              onClick={onOpenProfileModal}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold transition"
            >
              <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center overflow-hidden shrink-0">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-white hidden lg:inline max-w-[80px] truncate">
                {currentUser?.displayName || currentUser?.email?.split('@')[0]}
              </span>
            </button>

          </div>

          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Language</span>
            <div className="flex space-x-1">
              {['en', 'hi', 'mr'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-2.5 py-1 text-xs font-bold rounded ${
                    i18n.language === lang ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              if (item.id === 'admin' && currentUser?.role !== 'admin') return null;

              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-slate-800/70 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
