import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Anchor, 
  Search, 
  Navigation, 
  MapPin, 
  Phone, 
  Battery, 
  Fuel, 
  ShieldCheck, 
  AlertOctagon, 
  Radio, 
  Volume2, 
  Heart, 
  UserCheck, 
  Share2, 
  CheckCircle2, 
  Activity, 
  Compass, 
  Clock, 
  Send, 
  ShieldAlert 
} from 'lucide-react';
import { vesselApiService, INITIAL_REGISTERED_VESSELS } from '../../services/vesselApiService';
import { TRANSLATIONS } from '../../data/translations';
import { speechService } from '../../services/speechService';

// Custom Map Markers
const createBoatIcon = (status) => {
  const isSOS = status === 'SOS_DISTRESS';
  const color = isSOS ? '#ef4444' : '#06b6d4';
  const svg = `
    <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 14px; font-weight: bold;">
      ${isSOS ? '🚨' : '⛵'}
    </div>
  `;
  return L.divIcon({
    html: svg,
    className: isSOS ? 'animate-bounce' : '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export default function VesselLiveTracker({ lang = 'en', currentUser }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [vessels, setVessels] = useState(() => vesselApiService.getAllVessels());
  const [searchQuery, setSearchQuery] = useState(currentUser?.vesselId || 'IND-MH-MUM-892');
  const [selectedVessel, setSelectedVessel] = useState(() => {
    return vesselApiService.getVesselByIdOrPhone(currentUser?.vesselId || 'IND-MH-MUM-892') || INITIAL_REGISTERED_VESSELS[0];
  });
  const [activeTrackerTab, setActiveTrackerTab] = useState('relative'); // 'relative' | 'rescue'
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const initialLat = selectedVessel?.coordinates?.lat || 18.7840;
    const initialLon = selectedVessel?.coordinates?.lon || 72.5620;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 8,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | NavIC Fleet Radar',
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersLayerRef.current = null;
    };
  }, []);

  // Update Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (activeTrackerTab === 'relative' && selectedVessel) {
      const marker = L.marker(
        [selectedVessel.coordinates.lat, selectedVessel.coordinates.lon],
        { icon: createBoatIcon(selectedVessel.status) }
      ).bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 2px;">
          <strong style="font-size: 13px; display: block;">${selectedVessel.name}</strong>
          <div>ID: ${selectedVessel.id}</div>
          <div>Master: ${selectedVessel.masterName}</div>
          <div>Speed: ${selectedVessel.speedKnots} knots</div>
          <div>Distance: ${selectedVessel.distanceFromShoreNm} NM offshore</div>
          <div style="margin-top: 4px; font-weight: bold; color: ${selectedVessel.status === 'SOS_DISTRESS' ? '#dc2626' : '#059669'};">
            ${selectedVessel.status === 'SOS_DISTRESS' ? '🚨 DISTRESS BEACON ACTIVE' : '🟢 SAFE & FISHING'}
          </div>
        </div>
      `);

      markersLayerRef.current.addLayer(marker);

      mapInstanceRef.current.flyTo(
        [selectedVessel.coordinates.lat, selectedVessel.coordinates.lon],
        8,
        { duration: 1.2 }
      );
    } else if (activeTrackerTab === 'rescue') {
      vessels.forEach((v) => {
        const marker = L.marker(
          [v.coordinates.lat, v.coordinates.lon],
          { icon: createBoatIcon(v.status) }
        ).bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
            <strong>${v.name}</strong> (${v.id})<br/>
            Master: ${v.masterName} (${v.phone})<br/>
            Speed: ${v.speedKnots} kts | Battery: ${v.batteryPct}%<br/>
            Status: ${v.status === 'SOS_DISTRESS' ? '🚨 SOS ACTIVE' : 'Normal'}
          </div>
        `);
        markersLayerRef.current.addLayer(marker);
      });
    }
  }, [activeTrackerTab, selectedVessel, vessels]);

  useEffect(() => {
    const unsub = vesselApiService.onUpdate((list) => {
      setVessels(list);
      if (selectedVessel) {
        const updated = list.find((v) => v.id === selectedVessel.id);
        if (updated) setSelectedVessel(updated);
      }
    });
    return () => unsub();
  }, [selectedVessel]);

  const handleSearch = (e) => {
    e.preventDefault();
    const result = vesselApiService.getVesselByIdOrPhone(searchQuery);
    if (result) {
      setSelectedVessel(result);
    }
  };

  const handleDispatchRescue = (vesselId) => {
    vesselApiService.dispatchRescueTeam(vesselId);
    setDispatchSuccess(true);
    setTimeout(() => setDispatchSuccess(false), 5000);
  };

  const handleSpeakVesselStatus = (vessel) => {
    if (!vessel) return;
    const isSOS = vessel.status === 'SOS_DISTRESS';
    
    let speechText = '';
    if (lang === 'mr') {
      speechText = isSOS
        ? `सावधान! नौका ${vessel.name}, क्रमांक ${vessel.id} संकटग्रस्त आहे. स्थान: ${vessel.harborName} पासून ${vessel.distanceFromShoreNm} नॉटिकल मैल. तटरक्षक दलास बचाव संदेश पाठवला आहे.`
        : `नौका ट्रॅकिंग माहिती. ${vessel.name}, मास्टर ${vessel.masterName}. नौका सध्या ${vessel.harborName} पासून ${vessel.distanceFromShoreNm} नॉटिकल मैल अंतरावर सुरक्षित स्थितीत आहे. बॅटरी ${vessel.batteryPct} टक्के.`;
    } else if (lang === 'hi') {
      speechText = isSOS
        ? `सावधान! नौका ${vessel.name}, क्रमांक ${vessel.id} संकट में है। तटरक्षक दल को बचाव संदेश भेजा गया है।`
        : `नौका ट्रैकिंग: ${vessel.name}, मास्टर ${vessel.masterName}। नाव ${vessel.harborName} से ${vessel.distanceFromShoreNm} नॉटिकल मील पर सुरक्षित है।`;
    } else {
      speechText = isSOS
        ? `Emergency Alert! Vessel ${vessel.name}, ID ${vessel.id} has activated an SOS beacon. Coast Guard search and rescue dispatched.`
        : `Live Tracking for Vessel ${vessel.name}. Master ${vessel.masterName}. Currently ${vessel.distanceFromShoreNm} nautical miles offshore from ${vessel.harborName}. Vessel status safe.`;
    }

    speechService.speak(speechText, lang);
  };

  const sosCount = vessels.filter((v) => v.status === 'SOS_DISTRESS').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Tracker Header */}
      <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                  VesselAPI • Live AIS & Satellite Fleet Tracker
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  NavIC Satellite Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-Time Coastal Fleet Monitoring for Fishermen Families & Coast Guard Rescue Command
              </p>
            </div>
          </div>

          {/* Sub-Tabs: Family Mode vs Govt Rescue Command */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTrackerTab('relative')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTrackerTab === 'relative'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>Family & Relatives (कुटुंब ट्रॅकिंग)</span>
            </button>

            <button
              onClick={() => setActiveTrackerTab('rescue')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTrackerTab === 'rescue'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Govt Rescue Operations ({sosCount} SOS)</span>
            </button>
          </div>

        </div>

      </div>

      {dispatchSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950 border-2 border-emerald-500 text-emerald-300 text-sm font-bold flex items-center gap-3 shadow-xl animate-in zoom-in-95">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 animate-bounce" />
          <div>
            <div>Coast Guard Fast Interceptor Patrol Dispatched!</div>
            <div className="text-xs text-emerald-200 font-normal">
              ICGS Patrol Vessel en route to emergency coordinates. Estimated arrival: 24 minutes.
            </div>
          </div>
        </div>
      )}

      {/* ----------------- 1. FAMILY & RELATIVE SEARCH VIEW ----------------- */}
      {activeTrackerTab === 'relative' && (
        <div className="space-y-6">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Vessel ID (e.g. IND-MH-MUM-892) or Mobile Number..."
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-3 font-mono font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Track My Family Vessel</span>
            </button>
          </form>

          {/* Quick Select Preset Family Vessels */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
              Registered Fleet:
            </span>
            {vessels.map((v) => (
              <button
                key={v.id}
                onClick={() => { setSelectedVessel(v); setSearchQuery(v.id); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedVessel?.id === v.id
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                    : v.status === 'SOS_DISTRESS'
                    ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{v.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-70 ml-1 font-mono">({v.id.slice(-3)})</span>
              </button>
            ))}
          </div>

          {/* Selected Vessel Detailed Family Dashboard */}
          {selectedVessel && (
            <div className={`glass-panel rounded-3xl p-6 border-2 transition-all shadow-2xl ${
              selectedVessel.status === 'SOS_DISTRESS'
                ? 'border-red-500/80 bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-950'
                : 'border-cyan-500/40 bg-slate-900/80'
            }`}>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5">
                
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-700/60">
                    <Anchor className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-white">
                        {selectedVessel.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-slate-950 text-cyan-300 border border-slate-800">
                        {selectedVessel.id}
                      </span>
                      {selectedVessel.status === 'SOS_DISTRESS' ? (
                        <span className="px-3 py-0.5 rounded-full text-xs font-black bg-red-600 text-white animate-pulse">
                          🚨 DISTRESS ACTIVE
                        </span>
                      ) : (
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                          🟢 NORMAL & SAFE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Master / Captain: <strong className="text-white">{selectedVessel.masterName}</strong> • Crew: <strong>{selectedVessel.crewCount} fishermen on board</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleSpeakVesselStatus(selectedVessel)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/60 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>{t.listen_voice} Status</span>
                  </button>

                  <a
                    href={`tel:${selectedVessel.phone}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Master</span>
                  </a>
                </div>

              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Distance from Shore</span>
                  </div>
                  <div className="text-base font-extrabold text-white font-mono mt-0.5">
                    {selectedVessel.distanceFromShoreNm} NM
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ~{selectedVessel.distanceFromShoreKm} km from {selectedVessel.harborName.split(' ')[0]}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span>Speed & Heading</span>
                  </div>
                  <div className="text-base font-extrabold text-cyan-300 font-mono mt-0.5">
                    {selectedVessel.speedKnots} kts ({selectedVessel.headingDirection})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Depth: {selectedVessel.depthMeters} meters
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vessel Battery Health</span>
                  </div>
                  <div className={`text-base font-extrabold font-mono mt-0.5 ${
                    selectedVessel.batteryPct < 30 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {selectedVessel.batteryPct}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Transponder: {selectedVessel.satelliteSignal}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    <span>Diesel Fuel Remaining</span>
                  </div>
                  <div className="text-base font-extrabold text-amber-300 font-mono mt-0.5">
                    {selectedVessel.fuelLitres} / {selectedVessel.fuelCapacityLitres} L
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Last Ping: {selectedVessel.lastPing}
                  </div>
                </div>

              </div>

              {/* Live Interactive Map for this Vessel */}
              <div className="rounded-2xl overflow-hidden border border-slate-700 h-80 relative shadow-inner">
                <div ref={mapContainerRef} className="w-full h-full" />

                <div className="absolute top-3 right-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-cyan-300 font-mono">
                  GPS: {selectedVessel.coordinates.lat.toFixed(4)}°N, {selectedVessel.coordinates.lon.toFixed(4)}°E
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ----------------- 2. GOVT RESCUE COMMAND FLEET VIEW ----------------- */}
      {activeTrackerTab === 'rescue' && (
        <div className="space-y-6">
          
          {/* Active Fleet Tactical Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400">Total Registered Vessels</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                {vessels.length} Crafts
              </div>
              <div className="text-xs text-cyan-400 mt-1">100% AIS Satellite Telemetry Active</div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-3xl border border-red-500/50">
              <div className="text-xs font-bold text-red-400">Active SOS Distress Beacons</div>
              <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono mt-1">
                {sosCount} Emergency
              </div>
              <div className="text-xs text-slate-400 mt-1">Real-Time Coast Guard Alert Channel</div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400">Average Fleet Offshore Range</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1">
                24.2 NM
              </div>
              <div className="text-xs text-emerald-400 mt-1">All in NavIC Satellite Coverage</div>
            </div>

          </div>

          {/* Rescue Operations List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Fleet Incident & Emergency Queue
            </h4>

            {vessels.map((v) => {
              const isSOS = v.status === 'SOS_DISTRESS';

              return (
                <div
                  key={v.id}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isSOS
                      ? 'bg-red-950/80 border-red-500 text-white'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-xl ${isSOS ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-cyan-400'}`}>
                      <Anchor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-white">{v.name}</span>
                        <span className="font-mono text-xs text-cyan-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          {v.id}
                        </span>
                        {isSOS && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white">
                            SOS ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Master: <strong>{v.masterName}</strong> • Harbor: {v.harborName} • Distance: {v.distanceFromShoreNm} NM offshore
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {isSOS && (
                      <button
                        onClick={() => handleDispatchRescue(v.id)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-4 h-4 animate-bounce" />
                        <span>Dispatch Coast Guard Patrol</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleSpeakVesselStatus(v)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                      title="Audio broadcast"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
