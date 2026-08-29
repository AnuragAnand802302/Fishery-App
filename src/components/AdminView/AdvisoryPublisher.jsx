import React, { useState, useEffect } from 'react';
import { Radio, CheckCircle2, Sparkles, AlertOctagon, AlertTriangle, ShieldCheck, MapPin, Fish } from 'lucide-react';
import { HARBORS } from '../../data/mockAdvisories';
import { encodeAdvisoryToSMS } from '../../services/smsEncoder';

export default function AdvisoryPublisher({ onPublishAdvisory }) {
  const [harborId, setHarborId] = useState('mumbai');
  const [type, setType] = useState('PFZ'); // 'PFZ', 'WARNING', 'CYCLONE'
  const [title, setTitle] = useState('High Density Pomfret & Surmai Hotspot');
  const [titleHi, setTitleHi] = useState('पॉम्फ्रेट और सुरमई समृद्ध मत्स्य क्षेत्र');
  const [riskLevel, setRiskLevel] = useState('SAFE');
  const [lat, setLat] = useState('18.7500');
  const [lon, setLon] = useState('72.3800');
  const [distanceKm, setDistanceKm] = useState('48');
  const [depth, setDepth] = useState('30 - 45 m');
  const [speciesStr, setSpeciesStr] = useState('Silver Pomfret, Kingfish (सुरमई), Bombay Duck');
  const [waveHeight, setWaveHeight] = useState('1.1 m');
  const [windSpeed, setWindSpeed] = useState('12 knots');
  const [customVoiceText, setCustomVoiceText] = useState('');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const selectedHarbor = HARBORS.find((h) => h.id === harborId) || HARBORS[0];

  // Whenever harbor changes, automatically update coordinates to match that harbor's offshore sector!
  const handleHarborChange = (newHarborId) => {
    setHarborId(newHarborId);
    const harbor = HARBORS.find((h) => h.id === newHarborId);
    if (harbor?.defaultPfz) {
      setLat(harbor.defaultPfz.lat.toFixed(4));
      setLon(harbor.defaultPfz.lon.toFixed(4));
      setDistanceKm(String(harbor.defaultPfz.distanceKm));
    }
  };

  // Auto-fill template when type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    const harborName = selectedHarbor.name.split(' ')[0];

    if (newType === 'CYCLONE') {
      setRiskLevel('DANGER');
      setTitle(`RED ALERT: Cyclone & Severe Storm Warning for ${harborName}`);
      setTitleHi(`रेड अलर्ट: ${harborName} के लिए भीषण चक्रवाती तूफान`);
      setWaveHeight('>4.5 m (Severe)');
      setWindSpeed('45 knots (83 km/h)');
      setSpeciesStr('NO FISHING PERMITTED');
      setCustomVoiceText(`RED ALERT: Severe Cyclone warning off ${harborName} coast. Total fishing ban in effect. Return to harbor immediately.`);
    } else if (newType === 'WARNING') {
      setRiskLevel('CAUTION');
      setTitle(`High Swell & Rough Sea Alert for ${harborName}`);
      setTitleHi(`ऊंची लहरें और अशांत समुद्र चेतावनी - ${harborName}`);
      setWaveHeight('2.8 - 3.2 m');
      setWindSpeed('24 knots (45 km/h)');
      setSpeciesStr('Limited Nearshore Catch');
      setCustomVoiceText(`Caution advised for ${harborName} waters. High swell waves up to 3 meters. Small boats do not venture to deep sea.`);
    } else {
      setRiskLevel('SAFE');
      setTitle(`Rich Potential Fishing Zone (PFZ) for ${harborName}`);
      setTitleHi(`${harborName} के लिए समृद्ध संभावित मत्स्य क्षेत्र`);
      setWaveHeight('1.2 m');
      setWindSpeed('12 knots');
      setSpeciesStr('Silver Pomfret, Tuna, Indian Mackerel');
      setCustomVoiceText(`Potential Fishing Zone identified off ${harborName} coast. High fish concentration. Sea conditions normal and safe.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const distanceKmNum = parseFloat(distanceKm) || 35;
    const distanceNm = Math.round((distanceKmNum / 1.852) * 10) / 10;
    const harbor = HARBORS.find((h) => h.id === harborId) || HARBORS[0];

    const newAdvisory = {
      id: `ADV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      harborId: harbor.id,
      harborName: `${harbor.name}, ${harbor.state}`,
      type,
      title: title || `${type} Advisory for ${harbor.name}`,
      titleHi: titleHi || title,
      issuedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      validTill: 'Next 24 Hours',
      riskLevel,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      distanceKm: distanceKmNum,
      distanceNm,
      bearingDeg: harbor.defaultPfz?.bearing || 120,
      bearingDirection: harbor.defaultPfz?.dir || 'South-East',
      depthMeters: depth,
      chlorophyll: '0.88 mg/m³',
      sst: '28.6 °C',
      targetSpecies: speciesStr.split(',').map((s) => s.trim()).filter(Boolean),
      fuelSavingLitres: type === 'PFZ' ? 38 : 0,
      weather: {
        waveHeight,
        windSpeed,
        windDirection: 'South-West',
        currentSpeed: '0.7 knots',
      },
      titles: {
        en: title || `${type} Advisory for ${harbor.name}`,
        hi: titleHi || title,
        mr: titleHi || title,
        ta: titleHi || title,
        te: titleHi || title,
        bn: titleHi || title,
        ml: titleHi || title,
        gu: titleHi || title,
        or: titleHi || title,
      },
      voiceText: {
        en: customVoiceText || `${title}. Wave height ${waveHeight}. Sea is safe.`,
        mr: `मत्स्यसेतू सल्ला. ${titleHi || title}. लाटांची उंची ${waveHeight}. समुद्रात जाणे सुरक्षित आहे.`,
        hi: `मत्स्यसेतु सलाह। ${titleHi || title}। लहर की ऊंचाई ${waveHeight}। समुद्र में जाना सुरक्षित है।`,
        ta: `மத்ஸ்யசேது ஆலோசனை. ${title} - அலை உயரம் ${waveHeight}.`,
        te: `మత్స్యసేతు సలహా. ${title} - అలల ఎత్తు ${waveHeight}.`,
        bn: `মৎস্যসেতু পরামর্শ। ${title} - ঢেউয়ের উচ্চতা ${waveHeight}।`,
        ml: `മത്സ്യസേതു അറിയിപ്പ്. ${title} - തിരമാല ഉയരം ${waveHeight}.`,
        gu: `મત્સ્યસેતુ સલાહ. ${title} - મોજાંની ઊંચાઈ ${waveHeight}.`,
        or: `ମତ୍ସ୍ୟସେତୁ ପରାମର୍ଶ। ${title} - ଢେଉ ଉଚ୍ଚତା ${waveHeight}।`,
      },
      smsPayload: encodeAdvisoryToSMS({
        id: `ADV-${new Date().getFullYear()}`,
        harborName: harbor.name,
        type,
        distanceNm,
        bearingDirection: harbor.defaultPfz?.dir || 'SE',
        targetSpecies: speciesStr.split(',').map((s) => s.trim()),
        depthMeters: depth,
        weather: { waveHeight },
        riskLevel
      })
    };

    onPublishAdvisory(newAdvisory);
    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 4000);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-cyan-500/30 shadow-2xl max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-display font-extrabold text-white">
              Marine Advisory Dispatcher & Publisher
            </h2>
            <p className="text-xs text-slate-400">
              Publish INCOIS PFZ Hotspots, Swell Alerts, or Cyclone Warnings to Coastal Fleets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Official Dispatch Terminal</span>
        </div>
      </div>

      {publishedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 text-emerald-300 text-sm font-bold flex items-center gap-3 shadow-lg shadow-emerald-950 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 animate-bounce" />
          <div>
            <div>Advisory Successfully Published for {selectedHarbor.name}!</div>
            <div className="text-xs font-normal text-emerald-200">
              Switching directly to Fisherman View to view coordinates on map & audio player...
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Harbor Selection */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Select Target Coastal Port / Harbor:</span>
          </label>
          <select
            value={harborId}
            onChange={(e) => handleHarborChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
          >
            {HARBORS.map((h) => (
              <option key={h.id} value={h.id}>
                📍 {h.name} ({h.state}) — {h.coast}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-2">
            Selected: <strong className="text-white">{selectedHarbor.name}</strong> • GPS coordinates automatically configured for {selectedHarbor.coast}.
          </p>
        </div>

        {/* Advisory Type Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Advisory Category & Risk Level:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'PFZ', label: '🐟 PFZ Fish Hotspot', sub: 'Safe Sea • High Yield', color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' },
              { id: 'WARNING', label: '⚠️ Swell Warning', sub: 'Caution • High Waves', color: 'border-amber-500/60 bg-amber-950/40 text-amber-300' },
              { id: 'CYCLONE', label: '🚨 Cyclone Red Alert', sub: 'Danger • Do Not Sail', color: 'border-red-500/60 bg-red-950/40 text-red-300' },
            ].map((btn) => (
              <button
                type="button"
                key={btn.id}
                onClick={() => handleTypeChange(btn.id)}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                  type === btn.id
                    ? `${btn.color} ring-2 ring-cyan-400 scale-[1.02] shadow-lg`
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-sm text-white">{btn.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{btn.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Bulletin Title (English):
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Title in Hindi / Regional (मत्स्य सलाह शीर्षक):
            </label>
            <input
              type="text"
              value={titleHi}
              onChange={(e) => setTitleHi(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>
        </div>

        {/* Sector GPS Coordinates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Latitude (°N):
            </label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-cyan-300 text-xs rounded-lg px-2.5 py-2 font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Longitude (°E):
            </label>
            <input
              type="text"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-cyan-300 text-xs rounded-lg px-2.5 py-2 font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Distance (km):
            </label>
            <input
              type="text"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Depth (meters):
            </label>
            <input
              type="text"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono"
            />
          </div>
        </div>

        {/* Target Species & Wave Height */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
              <Fish className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Fish Species:</span>
            </label>
            <input
              type="text"
              value={speciesStr}
              onChange={(e) => setSpeciesStr(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Forecast Wave Height:
            </label>
            <input
              type="text"
              value={waveHeight}
              onChange={(e) => setWaveHeight(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Wind Speed:
            </label>
            <input
              type="text"
              value={windSpeed}
              onChange={(e) => setWindSpeed(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>
        </div>

        {/* Voice Audio Script */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Voice Broadcast Script (spoken aloud in regional languages):
          </label>
          <textarea
            rows="2"
            value={customVoiceText}
            onChange={(e) => setCustomVoiceText(e.target.value)}
            placeholder="Type narration text for rural voice broadcast..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 font-medium resize-none"
          />
        </div>

        {/* Big Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Radio className="w-5 h-5 animate-pulse" />
            <span>Broadcast Advisory to {selectedHarbor.name} Fleet</span>
          </button>
        </div>

      </form>

    </div>
  );
}
