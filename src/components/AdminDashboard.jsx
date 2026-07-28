import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, store } from '../services/store';
import { 
  SlidersHorizontal, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Bell, 
  Send, 
  ShieldAlert,
  Users,
  IndianRupee,
  Activity,
  User
} from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const state = useStore();

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('operations');

  // Auto-hidden or flagged reports queue
  const flaggedReports = state.reports.filter(r => r.flags > 0 || r.autoHidden);

  const handleBroadcastAlert = (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    store.addEmergencyAlert({
      severity: "severe",
      title: broadcastTitle,
      source: "Admin Command Center",
      message: broadcastMessage
    });

    setBroadcastTitle('');
    setBroadcastMessage('');
    alert("Geofenced emergency alert broadcasted across platform!");
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await store.updateUserRole(user.uid, newRole);
      alert(`Role for user ${user.email} updated to ${newRole.toUpperCase()}!`);
    } catch (e) {
      console.error(e);
      alert("Failed to update user role.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-bold mb-1">
            <SlidersHorizontal className="w-6 h-6" />
            <h2 className="text-2xl font-extrabold text-white">{t('admin.title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Lightweight admin oversight, community flagging queue, user role management, and emergency triggers.
          </p>
        </div>

        <div className="flex space-x-2">
          <span className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700">
            Platform Status: Operational
          </span>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Disaster Incidents</span>
          <div className="text-2xl font-extrabold text-white">{state.reports.length}</div>
          <span className="text-[11px] text-red-400">{state.reports.filter(r=>r.severity==='high').length} High Severity</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Registered Volunteers</span>
          <div className="text-2xl font-extrabold text-emerald-400">{state.volunteers.length}</div>
          <span className="text-[11px] text-slate-400">Available across 2 districts</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Relief Raised</span>
          <div className="text-2xl font-extrabold text-sky-400">₹{state.donationLedger.totalRaised.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-400">100% Itemized Ledger</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Registered Platform Users</span>
          <div className="text-2xl font-extrabold text-amber-400">{(state.users || []).length}</div>
          <span className="text-[11px] text-slate-400">{(state.users || []).filter(u => u.role === 'admin').length} Admins • {(state.users || []).filter(u => u.role !== 'admin').length} Users</span>
        </div>
      </div>

      {/* Subtab Selector */}
      <div className="flex border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveSubTab('operations')}
          className={`px-6 py-3 border-b-2 font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'operations'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Incident Operations
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-6 py-3 border-b-2 font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'users'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          User Role Management
        </button>
      </div>

      {activeSubTab === 'operations' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Community Flagged Reports Queue */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Flag className="w-5 h-5 text-amber-400" />
                <span>{t('admin.flaggedQueue')}</span>
              </h3>
              <span className="text-xs text-slate-400">No pre-moderation queue; community flagged</span>
            </div>

            {flaggedReports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No reports currently flagged by the community.
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedReports.map((rep) => (
                  <div key={rep.id} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-400">{rep.id}</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded">
                        {rep.flags} Flags {rep.autoHidden && '• (AUTO-HIDDEN)'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{rep.title}</h4>
                    <p className="text-slate-300 line-clamp-2">{rep.description}</p>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          store.approveReport(rep.id);
                          alert(`Report ${rep.id} verified and approved in the database!`);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('admin.approveReport')}</span>
                      </button>
                      <button
                        onClick={() => {
                          store.dismissReport(rep.id);
                          alert(`Report ${rep.id} dismissed and deleted from database.`);
                        }}
                        className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg font-bold flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t('admin.dismissReport')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Emergency Alert Broadcast Trigger */}
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Bell className="w-5 h-5 text-red-500" />
                <span>{t('admin.broadcastAlert')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Trigger immediate geo-fenced alert banner</p>
            </div>

            <form onSubmit={handleBroadcastAlert} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Alert Headline</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  placeholder="e.g. Evacuation Advisory for Ward 12"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('admin.alertMsg')}</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  placeholder="Details of warning, safe routes, shelter points..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{t('admin.sendAlert')}</span>
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* User Role Management Subtab */
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>Registered User Database</span>
            </h3>
            <span className="text-xs text-slate-400">{(state.users || []).length} Accounts Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role Status</th>
                  <th className="py-3 px-4">Registered On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {(state.users || []).map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">
                          {user.displayName || 'Anonymous User'}
                        </span>
                        {user.city && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            📍 {user.city} {user.phone && `• 📞 ${user.phone}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{user.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleRole(user)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          user.role === 'admin'
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30'
                        }`}
                      >
                        {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
