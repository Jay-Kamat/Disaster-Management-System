import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStore, store } from '../services/store';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  HeartHandshake, 
  Heart,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUserProfile, resetPassword } = useAuth();
  const state = useStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [age, setAge] = useState('');

  // Volunteer fields
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [volunteerSkills, setVolunteerSkills] = useState([]);
  const [volunteerRadius, setVolunteerRadius] = useState(5);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Password reset states
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    setIsResettingPassword(true);
    setResetError('');
    setResetSuccess('');
    try {
      await resetPassword(currentUser.email);
      setResetSuccess('Reset link sent! Please check your email inbox.');
      setTimeout(() => setResetSuccess(''), 6000);
    } catch (err) {
      console.error(err);
      setResetError(err.message || 'Failed to send password reset link.');
      setTimeout(() => setResetError(''), 6000);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const availableSkills = [
    "First Aid & Medical",
    "Search & Rescue",
    "Logistics & Transport",
    "Food & Water Distribution",
    "Telecom & IT Support",
    "Shelter Management"
  ];

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      setCity(currentUser.city || '');
      setPhotoURL(currentUser.photoURL || '');
      setAge(currentUser.age || '');
      setIsVolunteer(currentUser.isVolunteer || false);
      setVolunteerSkills(currentUser.volunteerSkills || []);
      setVolunteerRadius(currentUser.volunteerRadius || 5);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Filter donations for this user
  const userDonations = (state.donationLedger?.items || []).filter(
    item => item.userId === currentUser?.uid || item.userEmail === currentUser?.email
  );
  const totalDonated = userDonations.reduce((sum, item) => sum + item.cost, 0);

  const handleSkillToggle = (skill) => {
    if (volunteerSkills.includes(skill)) {
      setVolunteerSkills(prev => prev.filter(s => s !== skill));
    } else {
      setVolunteerSkills(prev => [...prev, skill]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedData = {
        displayName,
        phone,
        city,
        photoURL,
        age: Number(age) || '',
        isVolunteer,
        volunteerSkills,
        volunteerRadius: Number(volunteerRadius)
      };

      // 1. Update user profile document in Firestore
      await updateUserProfile(updatedData);

      // 2. Synchronize to the volunteers registry using user uid as document id
      if (isVolunteer) {
        await store.registerVolunteer({
          name: displayName,
          phone,
          city,
          radius: Number(volunteerRadius),
          skills: volunteerSkills,
          status: "available",
          updatedAt: new Date().toISOString()
        }, currentUser.uid);
      } else {
        // Enlist as inactive if toggled off
        await store.registerVolunteer({
          name: displayName,
          phone,
          city,
          radius: Number(volunteerRadius),
          skills: volunteerSkills,
          status: "inactive",
          updatedAt: new Date().toISOString()
        }, currentUser.uid);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl my-8 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5 text-sky-400 font-bold">
            <User className="w-5 h-5" />
            <h3 className="text-lg font-extrabold text-white">Profile Settings & Roles</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-slate-800 pb-px">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('volunteer')}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'volunteer'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Volunteer Role
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'donations'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Donations ({userDonations.length})
          </button>
        </div>

        {showSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Profile Saved Successfully!</h4>
            <p className="text-xs text-slate-400">Your profile preferences have been updated in real-time.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            
            {/* TAB 1: PROFILE INFO */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {/* Avatar Preview */}
                <div className="flex flex-col items-center space-y-2 pb-2">
                  <div className="relative w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden group">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-500" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition pointer-events-none">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Role Status: <span className="text-sky-400 font-bold">{currentUser?.role || 'user'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 text-xs">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1 text-xs">Age</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                        placeholder="e.g. 25"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1 text-xs">Contact Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                        placeholder="e.g. +91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1 text-xs">Base City / Region</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                        placeholder="e.g. Mumbai"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-xs">Avatar Image URL</label>
                  <div className="relative">
                    <Camera className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="url"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500 font-mono text-[10px]"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                </div>

                {/* Password Reset Section */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <label className="block text-slate-300 font-bold text-xs">Security Settings</label>
                  <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-800/80">
                    <div className="space-y-0.5 pr-2">
                      <h4 className="text-xs font-bold text-white">Reset Account Password</h4>
                      <p className="text-[10px] text-slate-400">Sends a secure password reset link to your email ({currentUser?.email})</p>
                    </div>
                    <button
                      type="button"
                      disabled={isResettingPassword}
                      onClick={handleResetPassword}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl text-[10px] font-bold transition flex items-center shrink-0"
                    >
                      {isResettingPassword ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Reset Password</span>
                      )}
                    </button>
                  </div>
                  {resetError && (
                    <div className="text-[10px] text-red-400 font-semibold">{resetError}</div>
                  )}
                  {resetSuccess && (
                    <div className="text-[10px] text-emerald-400 font-semibold">{resetSuccess}</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: VOLUNTEER ROLE SETUP */}
            {activeTab === 'volunteer' && (
              <div className="space-y-4">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Volunteer Emergency Responder</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">Enlist in the active community response network</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isVolunteer} 
                      onChange={(e) => setIsVolunteer(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:height-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {isVolunteer && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-bold text-xs">Select Specialized Skills</label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableSkills.map(skill => {
                          const hasSkill = volunteerSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillToggle(skill)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition ${
                                hasSkill 
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/50' 
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                              }`}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <label className="text-slate-300 font-bold">Mobilization Radius</label>
                        <span className="text-sky-400 font-bold">{volunteerRadius} km</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={volunteerRadius}
                        onChange={(e) => setVolunteerRadius(e.target.value)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Maximum radius around {city || 'your base city'} you can travel for emergencies.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CROWD FUNDING DONATIONS */}
            {activeTab === 'donations' && (
              <div className="space-y-4">
                <div className="bg-sky-950/20 p-4 rounded-2xl border border-sky-500/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Crowd-Funding Support</h4>
                      <div className="text-xl font-black text-white">₹{totalDonated.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{userDonations.length} Contributions</span>
                </div>

                <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1">
                  {userDonations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No contributions logged yet. Donate via Donation Ledger to support community projects.
                    </div>
                  ) : (
                    userDonations.map((don) => (
                      <div key={don.id} className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-white">{don.incidentTitle}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Receipt ID: {don.invoiceRef} • {don.date}</div>
                        </div>
                        <div className="text-sm font-extrabold text-sky-400">₹{don.cost.toLocaleString('en-IN')}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Actions (Only show for editable tabs) */}
            {activeTab !== 'donations' && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Preferences...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            )}

          </form>
        )}
      </div>
    </div>
  );
}
