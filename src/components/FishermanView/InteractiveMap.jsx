import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  Navigation, 
  Fish, 
  AlertOctagon, 
  AlertTriangle, 
  Anchor, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  MapPin, 
  Crosshair, 
  Layers, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Volume2,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { calculateDistanceKm, kmToNauticalMiles, calculateBearing, formatGPSCoords } from '../../utils/geoUtils';
import { TRANSLATIONS } from '../../data/translations';
import { oceanZoneService } from '../../services/oceanZoneService';
import { HARBORS } from '../../data/mockAdvisories';
import { speechService } from '../../services/speechService';

export default function InteractiveMap({
  advisories = [],
  selectedHarborObj,
  onSelectHarbor,
  boatLocation,
  setBoatLocation,
  focusedAdvisory,
  onLocateUserGPS,
  isLocatingGPS,
  lang = 'en'
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const polygonsLayerRef = useRef(null);

  // Real-Time Active Government Zones State
  const [activeZones, setActiveZones] = useState(() => oceanZoneService.getAllZones());
  const [isSyncingGovt, setIsSyncingGovt] = useState(false);
  const [lastGovtSyncTime, setLastGovtSyncTime] = useState(new Date().toLocaleTimeString());

  // Map Filter Layers State
  const [showPFZ, setShowPFZ] = useState(true);
  const [showCaution, setShowCaution] = useState(true);
  const [showDanger, setShowDanger] = useState(true);
  const [showHarbors, setShowHarbors] = useState(true);

  // Subscribe to real-time government zone updates
  useEffect(() => {
    const unsub = oceanZoneService.onUpdate((zones) => {
      setActiveZones(zones);
      setLastGovtSyncTime(new Date().toLocaleTimeString());
    });
    return () => unsub();
  }, []);

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

    const initialLat = boatLocation?.lat || selectedHarborObj?.lat || 18.9186;
    const initialLon = boatLocation?.lon || selectedHarborObj?.lon || 72.8277;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    // High-resolution OpenStreetMap Marine Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    polygonsLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Recenter map when target harbor changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHarborObj) return;
    mapInstanceRef.current.flyTo([selectedHarborObj.lat, selectedHarborObj.lon], 8, {
      duration: 1.2,
    });
  }, [selectedHarborObj]);

  // Recenter on focused advisory
  useEffect(() => {
    if (!mapInstanceRef.current || !focusedAdvisory?.coordinates) return;
    const { lat, lon } = focusedAdvisory.coordinates;
    mapInstanceRef.current.flyTo([lat, lon], 9, { duration: 1.2 });
  }, [focusedAdvisory]);

  // Recenter map on user's current GPS location
  const handleRecenterOnUser = () => {
    if (!mapInstanceRef.current || !boatLocation) return;
    mapInstanceRef.current.flyTo([boatLocation.lat, boatLocation.lon], 9, { duration: 1.2 });
  };

  // Manual Trigger: Sync Live Government Data (IMD Nowcasts + INCOIS Bulletins)
  const handleManualGovtSync = async () => {
    setIsSyncingGovt(true);
    try {
      const res = await oceanZoneService.syncLiveGovtData();
      if (res) {
        setLastGovtSyncTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn('Govt sync error', e);
    } finally {
      setIsSyncingGovt(false);
    }
  };

  // Render all active Markers, Danger Polygons, and PFZ Resource Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !polygonsLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    polygonsLayerRef.current.clearLayers();

    // ---------------- 1. RENDER REAL-TIME GOVERNMENT OCEAN ZONES (POLYGONS) ----------------
    activeZones.forEach((zone) => {
      if (zone.type === 'RESOURCE' && !showPFZ) return;
      if (zone.type === 'CAUTION' && !showCaution) return;
      if (zone.type === 'DANGER' && !showDanger) return;

      const isDanger = zone.type === 'DANGER';
      const isCaution = zone.type === 'CAUTION';
      const isResource = zone.type === 'RESOURCE';

      const polygon = L.polygon(zone.polygon, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: isDanger ? 0.35 : isCaution ? 0.28 : 0.22,
        weight: isDanger ? 2.5 : 2,
        dashArray: isDanger ? '6, 6' : isCaution ? '4, 4' : '',
      });

      polygon.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 250px; color: #0f172a; line-height: 1.35;">
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-weight: 900; font-size: 11px; color: ${zone.color}; text-transform: uppercase; letter-spacing: 0.5px;">
              ${isDanger ? '🛑 RED ZONE (STRICT BAN)' : isCaution ? '⚠️ ORANGE ZONE (MILD DANGER)' : '🟢 GREEN PFZ (RESOURCE)'}
            </span>
            ${zone.isLive ? `<span style="background: #ef4444; color: white; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px;">LIVE IMD</span>` : ''}
          </div>

          <strong style="display: block; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            ${zone.name}
          </strong>

          ${zone.authority ? `
            <div style="font-size: 9.5px; color: #64748b; margin-bottom: 4px; font-weight: 600;">
              🏛️ Authority: ${zone.authority}
            </div>
          ` : ''}

          <p style="font-size: 11px; margin: 4px 0; color: #334155;">
            ${zone.description}
          </p>

          ${zone.penalty ? `
            <div style="font-size: 10px; font-weight: bold; color: #dc2626; background: #fee2e2; padding: 3px 6px; border-radius: 6px; margin-top: 5px;">
              ⚠️ Legal Penalty: ${zone.penalty}
            </div>
          ` : ''}

          ${zone.targetSpecies ? `
            <div style="font-size: 10.5px; font-weight: bold; color: #059669; background: #d1fae5; padding: 3px 6px; border-radius: 6px; margin-top: 5px;">
              🐟 Target Fish: ${zone.targetSpecies.join(', ')}
            </div>
          ` : ''}

          ${zone.fuelSavingEst ? `
            <div style="font-size: 10px; font-weight: bold; color: #0284c7; margin-top: 3px;">
              ⛽ Fuel Savings: ${zone.fuelSavingEst}
            </div>
          ` : ''}

          ${zone.safetyAdvice ? `
            <div style="font-size: 10px; color: #0369a1; margin-top: 4px;">
              🛡️ <strong>Safety Advice:</strong> ${zone.safetyAdvice}
            </div>
          ` : ''}

          <div style="font-size: 9px; color: #94a3b8; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 3px;">
            Updated: ${zone.updatedAt || 'Real-Time'}
          </div>

        </div>
      `);

      polygonsLayerRef.current.addLayer(polygon);
    });

    // ---------------- 2. ALL 75+ INDIAN COASTAL PORTS & HARBORS ----------------
    if (showHarbors) {
      window.__selectHarborFromMap = (harborId) => {
        if (onSelectHarbor) {
          onSelectHarbor(harborId);
        }
      };

      HARBORS.forEach((harbor) => {
        const isSelected = selectedHarborObj?.id === harbor.id;

        const harborIcon = L.divIcon({
          className: isSelected ? 'active-harbor-icon' : 'custom-harbor-icon',
          html: isSelected
            ? `<div style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; border-radius: 9999px; border: 2.5px solid #38bdf8; box-shadow: 0 0 16px rgba(56,189,248,0.8); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; font-size: 16px; font-weight: bold;" class="animate-pulse">⚓</div>`
            : `<div style="background: #0f172a; color: #38bdf8; border-radius: 9999px; border: 1.5px solid #0284c7; box-shadow: 0 2px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; font-size: 13px; font-weight: bold; cursor: pointer;">⚓</div>`,
          iconSize: isSelected ? [34, 34] : [26, 26],
          iconAnchor: isSelected ? [17, 17] : [13, 13],
        });

        const marker = L.marker([harbor.lat, harbor.lon], { icon: harborIcon });

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; max-width: 220px; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <strong style="color: #0369a1; font-size: 13px;">⚓ ${harbor.name}</strong>
            </div>
            <div style="font-size: 11px; color: #475569; margin: 2px 0;">
              <strong>State:</strong> ${harbor.state} (${harbor.coast})
            </div>
            <div style="font-size: 10px; color: #0284c7; font-weight: bold; background: #e0f2fe; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-top: 2px;">
              ${harbor.type || 'Coastal Port'}
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">
              📍 ${harbor.lat.toFixed(4)}° N, ${harbor.lon.toFixed(4)}° E
            </div>
            ${!isSelected ? `
              <button onclick="window.__selectHarborFromMap && window.__selectHarborFromMap('${harbor.id}')" style="margin-top: 8px; width: 100%; background: #0284c7; color: white; border: none; padding: 6px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span>📍 Set as Base Port & Live Weather</span>
              </button>
            ` : `
              <div style="margin-top: 6px; font-size: 11px; font-weight: bold; color: #059669; background: #d1fae5; padding: 3px 6px; border-radius: 6px; text-align: center;">
                ✓ Active Selected Port
              </div>
            `}
          </div>
        `);

        marker.addTo(markersLayerRef.current);
      });
    }

    // ---------------- 3. ADVISORIES (PFZ and Hazard Markers) ----------------
    advisories.forEach((adv) => {
      if (!adv.coordinates) return;

      const isDanger = adv.riskLevel === 'DANGER' || adv.type === 'CYCLONE';
      const isCaution = adv.riskLevel === 'CAUTION';

      if (isDanger && !showDanger) return;
      if (isCaution && !showCaution) return;
      if (!isDanger && !isCaution && !showPFZ) return;

      // Real distance from user's current GPS location
      let distFromUserNm = adv.distanceNm;
      let dirFromUser = adv.bearingDirection;
      if (boatLocation) {
        const distKm = calculateDistanceKm(boatLocation.lat, boatLocation.lon, adv.coordinates.lat, adv.coordinates.lon);
        distFromUserNm = kmToNauticalMiles(distKm);
        dirFromUser = calculateBearing(boatLocation.lat, boatLocation.lon, adv.coordinates.lat, adv.coordinates.lon).direction;
      }

      const locTitle = adv.titles?.[lang] || adv.title;

      if (isDanger) {
        L.circle([adv.coordinates.lat, adv.coordinates.lon], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.25,
          radius: 18000,
          dashArray: '8, 8'
        }).addTo(markersLayerRef.current);

        const hazardIcon = L.divIcon({
          className: 'custom-hazard-icon',
          html: `<div style="background: #ef4444; color: white; padding: 6px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 0 18px rgba(239,68,68,0.8); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; font-size: 16px;" class="animate-bounce">🚨</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        L.marker([adv.coordinates.lat, adv.coordinates.lon], { icon: hazardIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 2px; color: #0f172a;">
              <strong style="color: #dc2626; font-size: 13px;">🚨 ${locTitle}</strong><br/>
              <span style="font-size: 11px; color: #b91c1c; font-weight: bold;">DANGER ZONE • DO NOT SAIL</span><br/>
              <span style="font-size: 11px; color: #475569;">From You: <strong>${distFromUserNm} NM ${dirFromUser}</strong></span>
            </div>
          `)
          .addTo(markersLayerRef.current);
      } else {
        // Green PFZ Zone Circle
        L.circle([adv.coordinates.lat, adv.coordinates.lon], {
          color: isCaution ? '#f59e0b' : '#10b981',
          fillColor: isCaution ? '#f59e0b' : '#10b981',
          fillOpacity: 0.18,
          radius: 15000,
        }).addTo(markersLayerRef.current);

        const pfzIcon = L.divIcon({
          className: 'custom-pfz-icon',
          html: `<div style="background: ${isCaution ? '#f59e0b' : '#10b981'}; color: white; padding: 6px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; font-size: 16px;">🐟</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([adv.coordinates.lat, adv.coordinates.lon], { icon: pfzIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 2px; color: #0f172a;">
              <strong style="color: #059669; font-size: 13px;">🐟 ${locTitle}</strong><br/>
              <span style="font-size: 11px; color: #475569;">From You: <strong>${distFromUserNm} NM ${dirFromUser}</strong></span><br/>
              <span style="font-size: 11px; color: #475569;">Depth: <strong>${adv.depthMeters}</strong> | SST: <strong>${adv.sst}</strong></span>
            </div>
          `)
          .addTo(markersLayerRef.current);
      }
    });

    // ---------------- 4. REAL-TIME USER GPS BOAT LOCATION PIN ----------------
    if (boatLocation) {
      const userBoatIcon = L.divIcon({
        className: 'user-boat-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background: rgba(6, 182, 212, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: #06b6d4; border: 2.5px solid #ffffff; box-shadow: 0 0 15px rgba(6, 182, 212, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
              🚤
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const userGpsStr = formatGPSCoords(boatLocation.lat, boatLocation.lon).combined;

      L.marker([boatLocation.lat, boatLocation.lon], { icon: userBoatIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 3px; color: #0f172a;">
            <strong style="color: #0891b2; font-size: 13px;">📍 ${t.your_live_boat_position || 'Your Live Vessel Position'}</strong><br/>
            <span style="font-size: 11px; font-weight: bold; color: #1e293b;">${userGpsStr}</span><br/>
            <span style="font-size: 10px; color: #64748b;">(Real-time NavIC Satellite Telemetry)</span>
          </div>
        `)
        .addTo(markersLayerRef.current);
    }
  }, [advisories, activeZones, showPFZ, showCaution, showDanger, showHarbors, boatLocation, selectedHarborObj, lang]);

  const dangerCount = activeZones.filter((z) => z.type === 'DANGER').length;
  const cautionCount = activeZones.filter((z) => z.type === 'CAUTION').length;
  const resourceCount = activeZones.filter((z) => z.type === 'RESOURCE').length;

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-cyan-500/30 shadow-2xl relative">
      
      {/* ---------------- TOP HEADER: TITLE & GPS ACTIONS ---------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-display font-extrabold text-white">
                {t.map_title || 'Ocean Fish Radar & Maritime Zone Map'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>INCOIS Satellite Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live government data: Green PFZ fish hotspots, Red strict legal bans, and Orange mild caution zones
            </p>
          </div>
        </div>

        {/* Live GPS Coordinates & Recenter Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {boatLocation && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>GPS: {formatGPSCoords(boatLocation.lat, boatLocation.lon).combined}</span>
            </div>
          )}

          <button
            onClick={onLocateUserGPS}
            disabled={isLocatingGPS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
            title="Refresh GPS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocatingGPS ? 'animate-spin' : ''}`} />
            <span>{isLocatingGPS ? 'Locating...' : (t.locate_me_gps || 'Locate Me')}</span>
          </button>

          <button
            onClick={handleRecenterOnUser}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-pink-400" />
            <span>{t.my_pin || 'My Pin'}</span>
          </button>

          <button
            onClick={handleManualGovtSync}
            disabled={isSyncingGovt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
            title="Sync Live Government IMD & INCOIS Zones"
          >
            <Radio className={`w-3.5 h-3.5 ${isSyncingGovt ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isSyncingGovt ? 'Syncing Govt...' : '🔄 Sync Live Govt Zones'}</span>
          </button>
        </div>

      </div>

      {/* ---------------- LAYER FILTER TOGGLE PILLS ---------------- */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map Layers:</span>
          </span>

          {/* 1. Green PFZ Resource Zones */}
          <button
            onClick={() => setShowPFZ(!showPFZ)}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showPFZ
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-sm'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span>🟢 🐟 Fishing Zones ({resourceCount})</span>
            {showPFZ && <Check className="w-3 h-3 text-emerald-400" />}
          </button>

          {/* 2. Orange Mild Caution Zones */}
          <button
            onClick={() => setShowCaution(!showCaution)}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showCaution
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-sm'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span>🟠 ⚠️ Mild Danger ({cautionCount})</span>
            {showCaution && <Check className="w-3 h-3 text-amber-400" />}
          </button>

          {/* 3. Red Strict Danger & Bans */}
          <button
            onClick={() => setShowDanger(!showDanger)}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showDanger
                ? 'bg-red-950/90 text-red-300 border-red-500/70 shadow-sm'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span>🔴 🛑 Red Danger & Bans ({dangerCount})</span>
            {showDanger && <Check className="w-3 h-3 text-red-400" />}
          </button>

          {/* 4. Base Ports */}
          <button
            onClick={() => setShowHarbors(!showHarbors)}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showHarbors
                ? 'bg-blue-950/90 text-cyan-300 border-cyan-500/60 shadow-sm'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span>🔵 ⚓ 75+ Indian Ports</span>
            {showHarbors && <Check className="w-3 h-3 text-cyan-400" />}
          </button>
        </div>

        {/* Real-time Gov Sync Live status */}
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Synced: {lastGovtSyncTime} (Auto 90s)</span>
        </div>

      </div>

      {/* ---------------- MAP CONTAINER ---------------- */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner z-0 relative"
      />

      {/* ---------------- MAP CONTROLS & COLOR LEGEND BAR ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
        
        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Green: PFZ Tuna & Pomfret</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Orange: IMBL Border & Swell</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-300 font-semibold">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Red: Sanctuaries & Squalls</span>
          </div>
        </div>

        {/* Custom Zoom Buttons & Info */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
