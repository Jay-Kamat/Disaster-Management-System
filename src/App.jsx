import React, { useState } from 'react';
import './i18n/i18n'; // Initialize i18n
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmergencyAlertsBar from './components/EmergencyAlertsBar';
import LiveMap from './components/LiveMap';
import ShelterLocator from './components/ShelterLocator';
import VolunteerPortal from './components/VolunteerPortal';
import DonationLedger from './components/DonationLedger';
import MissingPersons from './components/MissingPersons';
import AdminDashboard from './components/AdminDashboard';
import ReportDisasterModal from './components/ReportDisasterModal';
import UserProfileModal from './components/UserProfileModal';
import { firebaseInitError } from './services/firebase';

export default function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('map');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (firebaseInitError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-red-500/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-red-500/10 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center text-red-500 mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4 font-sans">Firebase Configuration Error</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {firebaseInitError}
          </p>
          
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-left text-xs text-slate-400 space-y-2 mb-6">
            <div className="font-semibold text-slate-300">How to resolve on Vercel:</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your project dashboard on Vercel.</li>
              <li>Go to <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
              <li>Add the Firebase configuration parameters (e.g. <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_PROJECT_ID</code>, etc.) matching your <code>.env</code> file.</li>
              <li>Redeploy your project for the new values to take effect.</li>
            </ol>
          </div>
          
          <p className="text-[11px] text-slate-500">
            If you are running the project locally, verify that a valid <code>.env</code> file exists in the root directory.
          </p>
        </div>
      </div>
    );
  }

  const handleStartLocationPick = () => {
    setIsReportModalOpen(false);
    setActiveTab('map');
    setIsPickingLocation(true);
  };

  const handleLocationPicked = (lat, lng) => {
    setPendingLocation({ lat, lng });
    setIsPickingLocation(false);
    setIsReportModalOpen(true);
  };

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Live Emergency Weather Alert Bar */}
      <EmergencyAlertsBar />

      {/* Main Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenReportModal={() => setIsReportModalOpen(true)} 
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      <div className="flex flex-1 max-w-full">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 w-full min-w-0">
        {activeTab === 'map' && (
          <LiveMap 
            onOpenReportModal={() => setIsReportModalOpen(true)} 
            isPickingLocation={isPickingLocation}
            onLocationPicked={handleLocationPicked}
          />
        )}

        {activeTab === 'shelters' && <ShelterLocator />}

        {activeTab === 'volunteers' && <VolunteerPortal />}

        {activeTab === 'donations' && <DonationLedger />}

        {activeTab === 'missing' && <MissingPersons />}

        {activeTab === 'admin' && <AdminDashboard />}
        </main>
      </div>

      {/* Report Disaster Modal */}
      <ReportDisasterModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        pendingLocation={pendingLocation}
        onStartLocationPick={handleStartLocationPick}
      />

      {/* User Profile Edit Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </div>
  );
}
