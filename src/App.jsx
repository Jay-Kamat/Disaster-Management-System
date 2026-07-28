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

export default function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('map');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
