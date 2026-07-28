import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, store } from '../services/store';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Heart, 
  CheckSquare, 
  Square, 
  MapPin, 
  AlertCircle, 
  Sparkles, 
  Send,
  Phone,
  ShieldCheck
} from 'lucide-react';

export default function VolunteerPortal() {
  const { t } = useTranslation();
  const { currentUser, updateUserProfile } = useAuth();
  const state = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [radius, setRadius] = useState('15');
  const [selectedSkills, setSelectedSkills] = useState(['First Aid & Medical', 'Food & Water Distribution']);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      setCity(currentUser.city || 'Mumbai');
      if (currentUser.volunteerRadius) setRadius(String(currentUser.volunteerRadius));
      if (currentUser.volunteerSkills && currentUser.volunteerSkills.length > 0) {
        setSelectedSkills(currentUser.volunteerSkills);
      }
      setIsRegistered(currentUser.isVolunteer || false);
    }
  }, [currentUser]);

  const skillsOptions = [
    'First Aid & Medical',
    'Search & Rescue',
    'Logistics & Transport',
    'Food & Water Distribution',
    'Telecom & IT Support',
    'Shelter Management'
  ];

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Please provide full name and contact number.");
      return;
    }

    const volData = {
      name,
      phone,
      city,
      radius: Number(radius),
      skills: selectedSkills,
      status: "available",
      updatedAt: new Date().toISOString()
    };

    await store.registerVolunteer(volData, currentUser?.uid);

    if (currentUser) {
      await updateUserProfile({
        displayName: name,
        phone,
        city,
        isVolunteer: true,
        volunteerSkills: selectedSkills,
        volunteerRadius: Number(radius)
      });
    }

    setIsRegistered(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-bold mb-1">
            <Users className="w-6 h-6" />
            <h2 className="text-2xl font-extrabold text-white">{t('volunteers.title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {t('volunteers.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{state.volunteers.length} Active Verified Volunteers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Volunteer Registration Form */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>{t('volunteers.register')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Opt-in for SMS/WhatsApp emergency alerts</p>
          </div>

          {isRegistered ? (
            <div className="p-5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">Registration Complete!</h4>
              <p className="text-xs text-slate-300">
                Thank you <strong className="text-white">{name}</strong>. You are now enlisted in the active emergency responder registry for <strong className="text-sky-400">{city}</strong> ({radius} km radius).
              </p>
              <button
                onClick={() => setIsRegistered(false)}
                className="text-xs text-sky-400 underline font-semibold hover:text-sky-300"
              >
                Register another volunteer
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-xs sm:text-sm">
              
              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('volunteers.fullName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Rahul Patil"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('volunteers.phone')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-sky-500"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Base City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('volunteers.radius')}</label>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="5">5 km</option>
                    <option value="15">15 km</option>
                    <option value="30">30 km</option>
                    <option value="50">50 km</option>
                  </select>
                </div>
              </div>

              {/* Skills Matrix Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">{t('volunteers.skills')}</label>
                <div className="space-y-1.5">
                  {skillsOptions.map((skill) => {
                    const isChecked = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs border flex items-center justify-between transition ${
                          isChecked 
                            ? 'bg-sky-500/15 border-sky-500/40 text-sky-200 font-bold' 
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <span>{skill}</span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-sky-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition transform active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{t('volunteers.register')}</span>
              </button>

            </form>
          )}

        </div>

        {/* Right Column: Proximity Matcher & Incident Dispatch List */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{t('volunteers.matchedTitle')}</span>
            </h3>
            <span className="text-xs text-slate-400">Proximity AI Dispatcher</span>
          </div>

          {state.reports.filter(r => !r.autoHidden).map((report) => (
            <div 
              key={report.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                      {report.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{report.id}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{report.title}</h4>
                  <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{report.locationName}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Dispatch notification sent to nearby volunteers for incident ${report.id}!`)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>Mobilize Volunteers</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                {report.description}
              </p>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Required Skills: <strong className="text-sky-300">First Aid, Logistics, Food Distribution</strong></span>
                <span className="text-emerald-400 font-semibold">Matched: 8 Volunteers Nearby</span>
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
