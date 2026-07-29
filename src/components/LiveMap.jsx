import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { useStore, store } from '../services/store';
import { 
  Filter, 
  MapPin, 
  Home, 
  ShieldAlert, 
  Activity, 
  Flag, 
  AlertOctagon, 
  CheckCircle2, 
  Users,
  Maximize2
} from 'lucide-react';

export default function LiveMap({ onSelectReport, onOpenReportModal, isPickingLocation, onLocationPicked }) {
  const { t } = useTranslation();
  const state = useStore();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [userCoords, setUserCoords] = useState(null);
  const [userPlace, setUserPlace] = useState("Your Location");

  const isPickingLocationRef = useRef(isPickingLocation);
  const onLocationPickedRef = useRef(onLocationPicked);

  useEffect(() => {
    isPickingLocationRef.current = isPickingLocation;
    onLocationPickedRef.current = onLocationPicked;
  }, [isPickingLocation, onLocationPicked]);

  // Filter Toggles State
  const [showReports, setShowReports] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRescue, setShowRescue] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default centered around Mumbai / Western India disaster zone
      const map = L.map(mapContainerRef.current, {
        center: [19.0760, 72.8777],
        zoom: 11,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap free tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Request browser location immediately to pan the map
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserCoords({ lat, lng });
            map.setView([lat, lng], 11);

            // Fetch human-readable name for user location
            const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;
            fetch(geoUrl, { headers: { 'User-Agent': 'Rakshak-Disaster-Response-Portal' } })
              .then(res => res.json())
              .then(data => {
                const addr = data.address || {};
                const name = addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood || addr.state || "Your Location";
                setUserPlace(name);
              })
              .catch(err => console.warn("LiveMap place geocoding failed", err));
          },
          (err) => {
            console.warn("LiveMap geolocation permission denied:", err);
          }
        );
      }

      map.on('click', (e) => {
        if (isPickingLocationRef.current && onLocationPickedRef.current) {
          const newLat = Number(e.latlng.lat.toFixed(4));
          const newLng = Number(e.latlng.lng.toFixed(4));
          onLocationPickedRef.current(newLat, newLng);
        }
      });
    }

    return () => {
      // Cleanup map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Pins dynamically whenever state or filters update
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Custom Icon SVG generator function
    const createCustomIcon = (bgColor, borderColor, svgIconHtml) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            border: 2px solid ${borderColor};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            color: white;
          ">
            ${svgIconHtml}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });
    };

    // Render Disaster Incident Reports Pins
    if (showReports) {
      state.reports.forEach((rep) => {
        if (rep.autoHidden) return; // Skip auto-hidden reports (Section 3.4)
        if (categoryFilter !== 'all' && rep.category !== categoryFilter) return;

        const isHighSeverity = rep.severity === 'high';
        const pinBg = isHighSeverity ? '#dc2626' : '#d97706';
        const iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        
        const markerIcon = createCustomIcon(pinBg, isHighSeverity ? '#f87171' : '#fbbf24', iconSvg);

        const popupContent = document.createElement('div');
        popupContent.className = "p-2 font-sans space-y-2 min-w-[240px]";
        popupContent.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${isHighSeverity ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-amber-500/30 text-amber-300'}">
              ${rep.category.toUpperCase()} • ${rep.severity.toUpperCase()}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">${rep.id}</span>
          </div>
          <h4 class="text-sm font-bold text-white line-clamp-1">${rep.title}</h4>
          <p class="text-xs text-slate-300 line-clamp-2">${rep.description}</p>
          
          ${rep.aiAnalysis ? `
            <div class="bg-slate-900/80 p-2 rounded border border-slate-700 text-[11px] space-y-0.5">
              <div class="flex justify-between text-sky-400 font-bold">
                <span>🤖 AI Estimate:</span>
                <span>${rep.aiAnalysis.confidence}% Confident</span>
              </div>
              <div class="text-slate-300">${rep.aiAnalysis.damageType} (${rep.aiAnalysis.severity})</div>
            </div>
          ` : ''}

          <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-700/80">
            <span class="text-rose-400 font-semibold">🚨 ${rep.trappedCount} Trapped</span>
            <button id="flag-btn-${rep.id}" class="text-[11px] text-slate-400 hover:text-amber-400 flex items-center space-x-1">
              🚩 Flag (${rep.flags})
            </button>
          </div>
        `;

        // Bind popup and flag button click handler
        const marker = L.marker([rep.lat, rep.lng], { icon: markerIcon }).addTo(markersGroup);
        marker.bindPopup(popupContent);
        
        marker.on('popupopen', () => {
          const btn = document.getElementById(`flag-btn-${rep.id}`);
          if (btn) {
            btn.onclick = () => {
              store.flagReport(rep.id);
              alert(`Report ${rep.id} flagged. Community flags help trigger automatic safety hiding.`);
            };
          }
        });
      });
    }

    // Render Shelters Pins
    if (showShelters) {
      state.shelters.forEach((shelter) => {
        const availableBeds = shelter.totalCapacity - shelter.occupiedBeds;
        const iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
        const markerIcon = createCustomIcon('#0284c7', '#38bdf8', iconSvg);

        const marker = L.marker([shelter.lat, shelter.lng], { icon: markerIcon }).addTo(markersGroup);
        marker.bindPopup(`
          <div class="p-2 space-y-2 min-w-[240px]">
            <div class="flex items-center justify-between border-b border-slate-700 pb-1">
              <span class="text-[10px] font-bold uppercase bg-sky-500/30 text-sky-300 px-2 py-0.5 rounded">Emergency Shelter</span>
              <span class="text-[10px] text-emerald-400 font-bold">${availableBeds} Beds Free</span>
            </div>
            <h4 class="text-sm font-bold text-white">${shelter.name}</h4>
            <p class="text-xs text-slate-300">${shelter.locationName}</p>
            <div class="text-[11px] text-slate-400">📞 ${shelter.phone}</div>
          </div>
        `);
      });
    }

    // Render Rescue Units Pins
    if (showRescue) {
      state.rescueUnits.forEach((unit) => {
        const iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        const markerIcon = createCustomIcon('#16a34a', '#4ade80', iconSvg);

        const marker = L.marker([unit.lat, unit.lng], { icon: markerIcon }).addTo(markersGroup);
        marker.bindPopup(`
          <div class="p-2 space-y-1 min-w-[220px]">
            <span class="text-[10px] font-bold uppercase bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">${unit.type}</span>
            <h4 class="text-sm font-bold text-white">${unit.name}</h4>
            <p class="text-xs text-emerald-400 font-semibold">${unit.status}</p>
            <div class="text-[11px] text-slate-300">Personnel: ${unit.personnel} • Call: ${unit.contact}</div>
          </div>
        `);
      });
    }

    // Render User Location Pin
    if (userCoords) {
      const userIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="animate-pulse"><circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.3" stroke="#2563eb"></circle><circle cx="12" cy="12" r="3" fill="#ffffff"></circle></svg>`;
      const userMarkerIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="display:flex; align-items:center; justify-content:center;">${userIconSvg}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([userCoords.lat, userCoords.lng], { icon: userMarkerIcon }).addTo(markersGroup);
      marker.bindPopup(`
        <div class="p-2 space-y-1 text-center min-w-[140px]">
          <span class="text-[10px] font-bold uppercase bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded">Your Location</span>
          <h4 class="text-xs font-bold text-white mt-1.5">${userPlace}</h4>
          <p class="text-[9px] text-slate-400 font-mono">${userCoords.lat.toFixed(4)}°N, ${userCoords.lng.toFixed(4)}°E</p>
        </div>
      `);
    }

  }, [state.reports, state.shelters, state.rescueUnits, showReports, showShelters, showRescue, categoryFilter, userCoords, userPlace]);

  return (
    <div className={`relative w-full h-[calc(100vh-4rem)] overflow-hidden ${isPickingLocation ? 'picking-location-mode' : ''}`}>
      
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Control Panel Header */}
      <div className="absolute top-4 left-4 z-10 glass-panel p-3.5 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide">Live Rescue Operations</h3>
          </div>
          <button 
            onClick={onOpenReportModal}
            className="px-2.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow"
          >
            + Report SOS
          </button>
        </div>

        {/* Map Layer Filter Switches */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
              showReports ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800/80 text-slate-400'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Incidents ({state.reports.filter(r=>!r.autoHidden).length})</span>
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
              showShelters ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800/80 text-slate-400'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Shelters ({state.shelters.length})</span>
          </button>

          <button
            onClick={() => setShowRescue(!showRescue)}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
              showRescue ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800/80 text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rescue ({state.rescueUnits.length})</span>
          </button>
        </div>

        {/* Category Dropdown Filter */}
        <div className="mt-2.5 flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-medium">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2 py-1 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Disasters</option>
            <option value="flood">Flood / Waterlogging</option>
            <option value="landslide">Landslide</option>
            <option value="fire">Fire / Explosion</option>
            <option value="cyclone">Cyclone / Storm</option>
          </select>
        </div>
      </div>

      {/* Floating Map Legend Bottom Left */}
      <div className="absolute bottom-6 left-4 z-10 glass-panel p-3 rounded-xl hidden sm:block shadow-xl border border-slate-800 text-xs space-y-1.5">
        <div className="font-bold text-slate-300 mb-1">Map Key</div>
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-red-600 border border-red-400"></span>
          <span>High Severity Incident</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300"></span>
          <span>Moderate Severity Incident</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-sky-600 border border-sky-400"></span>
          <span>Active Relief Shelter</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400"></span>
          <span>NDRF / SDRF Rescue Squad</span>
        </div>
      </div>

    </div>
  );
}
