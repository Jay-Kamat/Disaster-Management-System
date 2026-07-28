import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../services/store';
import { useAuth } from '../contexts/AuthContext';
import { fetchLiveWeather } from '../services/weatherService';
import { AlertTriangle, CloudRain, Wind, X, Bell } from 'lucide-react';

export default function EmergencyAlertsBar() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const state = useStore();
  const [weatherData, setWeatherData] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchLiveWeather(latitude, longitude).then((data) => {
            setWeatherData(data);
          });
        },
        (error) => {
          console.warn("Geolocation access denied or failed, using Mumbai default:", error);
          fetchLiveWeather(19.0760, 72.8777).then((data) => {
            setWeatherData(data);
          });
        }
      );
    } else {
      fetchLiveWeather(19.0760, 72.8777).then((data) => {
        setWeatherData(data);
      });
    }
  }, []);

  if (dismissed) return null;

  const currentAlert = state.emergencyAlerts[0];

  // Logic to determine if we should render the alert bar, and what to show:
  let alertToShow = null;
  let severity = "normal"; // normal, warning, severe, info

  if (currentAlert) {
    // Priority 1: Admin broadcast alerts
    alertToShow = {
      title: t('emergencyBanner.title', 'Emergency Alert Broadcast'),
      message: currentAlert.message,
    };
    severity = currentAlert.severity || "severe";
  } else if (weatherData && weatherData.alertLevel !== "normal") {
    // Priority 2: Severe weather alerts from Open-Meteo
    alertToShow = {
      title: weatherData.alertLevel === "severe" ? "Severe Weather Warning" : "Weather Advisory",
      message: weatherData.alertMessage,
    };
    severity = weatherData.alertLevel;
  } else if (weatherData) {
    // Priority 3: Informative realtime weather forecast under stable conditions
    const forecastStr = (weatherData.hourlyForecast || [])
      .map(f => `${f.time}: ${f.temp}°C (${f.precip}mm rain)`)
      .join(" → ");

    const locationLabel = currentUser?.city 
      ? `Forecast: ${currentUser.city}`
      : `Forecast: ${weatherData.placeName}`;

    alertToShow = {
      title: locationLabel,
      message: `Current: ${weatherData.temperature}°C • Wind: ${weatherData.windspeed} km/h | Next 3 Hours: ${forecastStr}`,
    };
    severity = "info";
  }

  // If no active emergency alerts AND weatherData failed to load, hide the bar completely
  if (!alertToShow) return null;

  // Visual styling based on severity level
  let bgStyle = "from-red-950 via-red-900 to-slate-900 border-red-500/40";
  let badgeStyle = "bg-red-500/20 text-red-400 border-red-500/30";
  let iconStyle = "bg-red-600/30 text-red-400 border border-red-500/40";
  let iconComponent = <AlertTriangle className="w-5 h-5 animate-pulse" />;

  if (severity === "warning") {
    bgStyle = "from-amber-950 via-amber-900 to-slate-900 border-amber-500/40";
    badgeStyle = "bg-amber-500/20 text-amber-400 border-amber-500/30";
    iconStyle = "bg-amber-600/30 text-amber-400 border border-amber-500/40";
    iconComponent = <AlertTriangle className="w-5 h-5 animate-pulse" />;
  } else if (severity === "info") {
    bgStyle = "from-slate-950 via-slate-900 to-indigo-950 border-indigo-500/20";
    badgeStyle = "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
    iconStyle = "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30";
    iconComponent = <CloudRain className="w-5 h-5 text-indigo-400" />;
  }

  return (
    <div className={`bg-gradient-to-r ${bgStyle} border-b px-4 py-2.5 text-white text-xs sm:text-sm shadow-xl`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className={`p-1.5 rounded-lg shrink-0 ${iconStyle}`}>
            {iconComponent}
          </div>

          <div className="truncate">
            <div className="flex items-center space-x-2">
              <span className={`font-extrabold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded border ${badgeStyle}`}>
                {alertToShow.title}
              </span>
              {weatherData && (
                <span className="text-[11px] text-slate-300 hidden md:inline-flex items-center space-x-1">
                  <Wind className="w-3.5 h-3.5 text-sky-400 inline ml-1 mr-0.5" /> Wind: {weatherData.windspeed} km/h • Temp: {weatherData.temperature}°C
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
              {alertToShow.message}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
          title={t('emergencyBanner.dismiss')}
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
