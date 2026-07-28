import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { store } from '../services/store';
import { analyzeDisasterImage } from '../services/aiClassifier';
import { 
  X, 
  MapPin, 
  Upload, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Navigation
} from 'lucide-react';

export default function ReportDisasterModal({ isOpen, onClose, pendingLocation, onStartLocationPick }) {
  const { t } = useTranslation();

  const [category, setCategory] = useState('flood');
  const [severity, setSeverity] = useState('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Kurla East, Mumbai');
  const [lat, setLat] = useState(19.0650);
  const [lng, setLng] = useState(72.8790);
  const [trappedCount, setTrappedCount] = useState(2);

  // GPS Auto Detection State
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Sync with main map selected location
  useEffect(() => {
    if (pendingLocation) {
      setLat(pendingLocation.lat);
      setLng(pendingLocation.lng);
      setLocationName(`Map Pin (${pendingLocation.lat}, ${pendingLocation.lng})`);
    }
  }, [pendingLocation]);

  // Image & AI Analysis State
  const [selectedPhoto, setSelectedPhoto] = useState("https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80");
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiResult, setAiResult] = useState({
    damageType: "Flood / Waterlogging",
    severity: "Severe",
    confidence: 93,
    details: "In-browser TensorFlow.js model detected high floodwater inundation surrounding residential structures."
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto detect GPS coordinates
  const handleAutoDetectGPS = () => {
    setIsDetectingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(Number(position.coords.latitude.toFixed(4)));
          setLng(Number(position.coords.longitude.toFixed(4)));
          setLocationName(`GPS Position (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
          setIsDetectingGps(false);
        },
        (error) => {
          console.warn("Geolocation fallback:", error);
          setIsDetectingGps(false);
          alert("Could not access GPS directly. Utilizing default incident area coordinates.");
        }
      );
    } else {
      setIsDetectingGps(false);
    }
  };

  // Image Upload & TensorFlow.js In-Browser Inference
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result;
        setSelectedPhoto(imageUrl);
        
        // Trigger TensorFlow.js AI Inference
        setIsAnalyzingAI(true);
        const result = await analyzeDisasterImage(imageUrl);
        setAiResult(result);
        setIsAnalyzingAI(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      store.addReport({
        category,
        title: title || `${category.toUpperCase()} Incident Report`,
        description,
        locationName,
        lat,
        lng,
        severity,
        trappedCount: Number(trappedCount),
        photoUrl: selectedPhoto,
        aiAnalysis: aiResult
      });

      setIsSubmitting(false);
      alert("SOS Disaster Report broadcasted to live rescue map!");
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-red-950/40 to-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">{t('reportModal.title')}</h3>
              <p className="text-xs text-slate-400">{t('reportModal.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          {/* Category Selection Grid */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">{t('reportModal.category')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'flood', label: t('reportModal.flood'), icon: '🌊' },
                { id: 'landslide', label: t('reportModal.landslide'), icon: '⛰️' },
                { id: 'fire', label: t('reportModal.fire'), icon: '🔥' },
                { id: 'cyclone', label: t('reportModal.cyclone'), icon: '🌪️' },
                { id: 'earthquake', label: t('reportModal.earthquake'), icon: '🌋' },
                { id: 'medical', label: t('reportModal.medical'), icon: '🚑' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`p-2.5 rounded-xl text-left border flex items-center space-x-2 transition ${
                    category === item.id 
                      ? 'bg-red-600/20 border-red-500 text-white font-bold shadow-md shadow-red-600/10' 
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity & Trapped Persons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">{t('reportModal.severity')}</label>
              <div className="flex space-x-1.5">
                {[
                  { id: 'low', label: t('reportModal.low'), color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                  { id: 'medium', label: t('reportModal.medium'), color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                  { id: 'high', label: t('reportModal.high'), color: 'bg-red-500/20 text-red-300 border-red-500/40' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id)}
                    className={`flex-1 py-2 px-1 text-center rounded-lg border font-bold text-xs uppercase transition ${
                      severity === s.id ? `${s.color} ring-2 ring-slate-500` : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Trapped / Affected Victims</label>
              <input
                type="number"
                min="0"
                value={trappedCount}
                onChange={(e) => setTrappedCount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                placeholder="Number of stranded people"
              />
            </div>
          </div>

          {/* Location & GPS Auto Detect */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-bold">{t('reportModal.location')}</label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onStartLocationPick}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center space-x-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pick on Map</span>
                </button>
                <button
                  type="button"
                  onClick={handleAutoDetectGPS}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                >
                  {isDetectingGps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                  <span>{t('reportModal.autoDetect')}</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                placeholder="Landmark / Area Name (e.g. Near Kurla Station, Mumbai)"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">{t('reportModal.description')}</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
              placeholder={t('reportModal.descPlaceholder')}
            />
          </div>

          {/* TensorFlow.js AI Damage Analysis Section */}
          <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs">
                <Cpu className="w-4 h-4" />
                <span>Client-Side TensorFlow.js AI Damage Estimator</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                In-Browser Inference (Free)
              </span>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <label className="cursor-pointer px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Disaster Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              
              <span className="text-[11px] text-slate-400">
                {t('reportModal.photoHint')}
              </span>
            </div>

            {/* AI Result Card */}
            {isAnalyzingAI ? (
              <div className="flex items-center space-x-2 text-sky-400 text-xs py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('reportModal.analyzingAI')}</span>
              </div>
            ) : aiResult ? (
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-700 text-xs space-y-1 mt-2">
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiResult.damageType}</span>
                  </span>
                  <span className="text-amber-400">{aiResult.confidence}% AI Confidence</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">{aiResult.details}</p>
              </div>
            ) : null}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 transition transform active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('reportModal.submitting')}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t('reportModal.submit')}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
