import React from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Home, Users, HeartHandshake, Search, SlidersHorizontal, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, onOpenProfileModal }) {
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { id: 'map', label: t('nav.liveMap'), icon: Map },
    { id: 'shelters', label: t('nav.shelters'), icon: Home },
    { id: 'volunteers', label: t('nav.volunteers'), icon: Users },
    { id: 'donations', label: t('nav.donations'), icon: HeartHandshake },
    { id: 'missing', label: t('nav.missingPersons'), icon: Search },
    { id: 'admin', label: t('nav.admin'), icon: SlidersHorizontal }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900/80 border-r border-slate-800 p-4 space-y-2 sticky top-[4rem] h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
        {t('nav.menu', 'Menu')}
      </div>
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          if (item.id === 'admin' && currentUser?.role !== 'admin') return null;
          
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        <div 
          onClick={onOpenProfileModal}
          className="flex items-center space-x-3 px-2 py-1.5 mb-3 hover:bg-slate-800/80 rounded-xl cursor-pointer transition"
          title="Edit Profile Settings"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{currentUser?.displayName || currentUser?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{currentUser?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
