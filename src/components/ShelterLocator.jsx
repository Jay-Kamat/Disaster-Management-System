import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../services/store';
import { 
  Home, 
  Search, 
  Bed, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Navigation,
  Check
} from 'lucide-react';

export default function ShelterLocator() {
  const { t } = useTranslation();
  const state = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filteredShelters = state.shelters.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    const available = s.totalCapacity - s.occupiedBeds;
    const matchesOpen = onlyOpen ? available > 0 : true;
    return matchesSearch && matchesOpen;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-bold mb-1">
            <Home className="w-6 h-6" />
            <h2 className="text-2xl font-extrabold text-white">{t('shelters.title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time emergency refugee camps, schools, and community hubs with bed availability tracking.
          </p>
        </div>

        {/* Search & Filter Switch */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('shelters.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={() => setOnlyOpen(!onlyOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-2 ${
              onlyOpen 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>{t('shelters.filterOpen')}</span>
          </button>
        </div>
      </div>

      {/* Shelter Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredShelters.map((shelter) => {
          const availableBeds = shelter.totalCapacity - shelter.occupiedBeds;
          const occupancyRate = Math.round((shelter.occupiedBeds / shelter.totalCapacity) * 100);
          const isFull = availableBeds <= 0;

          return (
            <div 
              key={shelter.id}
              className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-sky-500/40 transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg border ${
                    isFull 
                      ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {isFull ? 'FULL CAPACITY' : `${availableBeds} BEDS AVAILABLE`}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{shelter.id}</span>
                </div>

                {/* Shelter Title & Address */}
                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{shelter.name}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="line-clamp-1">{shelter.locationName}</span>
                  </div>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Occupancy Level</span>
                    <span className={occupancyRate > 85 ? 'text-amber-400' : 'text-emerald-400'}>
                      {shelter.occupiedBeds} / {shelter.totalCapacity} ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Amenities Badges */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Available Facilities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {shelter.amenities.map((item, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 bg-slate-800/80 text-slate-300 text-[11px] rounded-md border border-slate-700/60 flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3 text-sky-400" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Navigation Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={`tel:${shelter.phone}`}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Call Officer</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('shelters.getDirections')}</span>
                </a>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
