import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, store } from '../services/store';
import { 
  Search, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Phone, 
  Lock,
  X,
  Camera
} from 'lucide-react';

export default function MissingPersons() {
  const { t } = useTranslation();
  const state = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [lastSeenDate, setLastSeenDate] = useState('');
  const [physicalDesc, setPhysicalDesc] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=400&q=80');

  const filteredPersons = state.missingPersons.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    store.addMissingPerson({
      name,
      age: Number(age),
      gender,
      lastSeenLocation,
      lastSeenDate,
      physicalDescription: physicalDesc,
      contactName,
      contactPhone: `${contactPhone.substring(0, 6)} ***** (Protected)`,
      photoUrl
    });

    setIsModalOpen(false);
    alert("Missing person record uploaded safely to crisis registry.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-bold mb-1">
            <Search className="w-6 h-6" />
            <h2 className="text-2xl font-extrabold text-white">{t('missing.title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {t('missing.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('missing.reportMissing')}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('missing.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              filterStatus === 'all' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => setFilterStatus('searching')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              filterStatus === 'searching' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {t('missing.statusSearching')}
          </button>
          <button
            onClick={() => setFilterStatus('found')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              filterStatus === 'found' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {t('missing.statusFound')}
          </button>
        </div>
      </div>

      {/* Grid of Missing Persons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersons.map((person) => {
          const isSearching = person.status === 'searching';

          return (
            <div 
              key={person.id}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                
                {/* Photo & Status Header */}
                <div className="flex items-start space-x-4">
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-slate-700 shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                        isSearching 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {isSearching ? t('missing.statusSearching') : t('missing.statusFound')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{person.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">{person.name}</h3>
                    <p className="text-xs text-slate-400">
                      {person.gender}, {person.age} years old
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-400 block text-[11px]">Last Seen Location:</strong>
                      <span>{person.lastSeenLocation}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-slate-300">
                    <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-400 block text-[11px]">Last Seen Time:</strong>
                      <span>{person.lastSeenDate}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                    <strong className="text-slate-400 block mb-0.5">Physical Description:</strong>
                    <p>{person.physicalDescription}</p>
                  </div>
                </div>
              </div>

              {/* Footer Privacy Contact Info & Action Toggle */}
              <div className="bg-slate-950/60 p-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Contact: {person.contactName} ({person.contactPhone})</span>
                </div>

                {isSearching ? (
                  <button
                    onClick={() => {
                      store.updateMissingStatus(person.id, 'found');
                      alert(`Status for ${person.name} updated to Safe / Found.`);
                    }}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition"
                  >
                    Mark Safe
                  </button>
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal to Register Missing Person */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{t('missing.reportMissing')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('missing.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('missing.age')}</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('missing.lastSeenLocation')}</label>
                <input
                  type="text"
                  value={lastSeenLocation}
                  onChange={(e) => setLastSeenLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  placeholder="e.g. Near Dadar Station relief camp"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('missing.lastSeenDate')}</label>
                <input
                  type="text"
                  value={lastSeenDate}
                  onChange={(e) => setLastSeenDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  placeholder="e.g. 2026-07-24 10:00 AM"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('missing.physicalDesc')}</label>
                <textarea
                  rows={2}
                  value={physicalDesc}
                  onChange={(e) => setPhysicalDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  placeholder="Clothing, height, distinguishing marks..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Family Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Family Phone (Private)</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow mt-2"
              >
                Upload Record Safely
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
