import React, { useState } from 'react';
import { 
  Fish, 
  Compass, 
  Navigation, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldCheck, 
  Fuel, 
  Layers, 
  Clock, 
  Check, 
  Share2, 
  MapPin, 
  Waves 
} from 'lucide-react';
import { HARBORS } from '../../data/mockAdvisories';
import { TRANSLATIONS } from '../../data/translations';
import { speechService } from '../../services/speechService';
import { encodeAdvisoryToSMS } from '../../services/smsEncoder';
import { calculateDistanceKm, kmToNauticalMiles, calculateBearing } from '../../utils/geoUtils';
import { buildAdvisorySpeechText } from '../../utils/speechGenerator';

export default function AdvisoryFeed({
  advisories,
  selectedHarbor,
  setSelectedHarbor,
  boatLocation,
  lang = 'en',
  onSelectAdvisoryForMap,
  speakingState,
  isLowBandwidth
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [filterType, setFilterType] = useState('ALL');
  const [expandedSmsId, setExpandedSmsId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filter advisories by selected harbor and type
  const filtered = advisories.filter((adv) => {
    const matchesHarbor = selectedHarbor === 'all' || adv.harborId === selectedHarbor;
    const matchesType = 
      filterType === 'ALL' ? true :
      filterType === 'PFZ' ? adv.type === 'PFZ' :
      filterType === 'WARNING' ? adv.type === 'WARNING' :
      filterType === 'CYCLONE' ? adv.type === 'CYCLONE' : true;
    return matchesHarbor && matchesType;
  });

  const handleSpeak = (advisory, distNm, dir) => {
    if (speakingState?.isSpeaking) {
      speechService.stop();
      return;
    }

    const textToSpeak = buildAdvisorySpeechText(advisory, lang, distNm, dir);
    speechService.speak(textToSpeak, lang);
  };

  const handleCopySMS = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      
      {/* Category Pills Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">{t.category}</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: 'ALL', label: '🌊 ' + t.filter_all },
              { id: 'PFZ', label: '🐟 ' + t.filter_pfz },
              { id: 'WARNING', label: '⚠️ ' + t.filter_warning },
              { id: 'CYCLONE', label: '🚨 ' + t.filter_cyclone },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filtered.length} {t.filter_all}
        </span>

      </div>

      {/* Advisory Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-slate-800 p-6">
            <Fish className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-300 font-bold">{t.no_advisories_found}</p>
            <button
              onClick={() => { setSelectedHarbor('all'); setFilterType('ALL'); }}
              className="mt-3 px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow hover:bg-cyan-500 cursor-pointer"
            >
              {t.show_all_harbor_advisories}
            </button>
          </div>
        ) : (
          filtered.map((adv) => {
            const smsText = adv.smsPayload || encodeAdvisoryToSMS(adv);
            const isPlayingThis = speakingState?.isSpeaking && speakingState?.currentText?.includes(adv.title.slice(0, 15));

            const isDanger = adv.riskLevel === 'DANGER' || adv.type === 'CYCLONE';
            const isCaution = adv.riskLevel === 'CAUTION' || adv.type === 'WARNING';
            const isSafe = adv.riskLevel === 'SAFE';

            // Real-time calculation from user's current GPS location to this advisory
            let distFromUserNm = adv.distanceNm;
            let dirFromUser = adv.bearingDirection;
            let bearingDeg = adv.bearingDeg;
            if (boatLocation && adv.coordinates) {
              const distKm = calculateDistanceKm(boatLocation.lat, boatLocation.lon, adv.coordinates.lat, adv.coordinates.lon);
              distFromUserNm = kmToNauticalMiles(distKm);
              const bearing = calculateBearing(boatLocation.lat, boatLocation.lon, adv.coordinates.lat, adv.coordinates.lon);
              dirFromUser = bearing.direction;
              bearingDeg = bearing.deg;
            }

            // Localized title & species in active language
            const localizedTitle = adv.titles?.[lang] || adv.titles?.hi || adv.title;
            const localizedSpecies = adv.targetSpeciesNames?.[lang] || adv.targetSpeciesNames?.hi || adv.targetSpecies || [];

            return (
              <div
                key={adv.id}
                className={`rounded-3xl transition-all duration-300 border-2 overflow-hidden shadow-xl ${
                  isDanger
                    ? 'bg-gradient-to-br from-red-950/70 via-slate-900 to-slate-950 border-red-500/80 shadow-red-950/50'
                    : isCaution
                    ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-amber-500/70 shadow-amber-950/40'
                    : 'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border-cyan-500/40 hover:border-cyan-400/80 shadow-slate-950/50'
                } p-5 sm:p-6`}
              >
                
                {/* Top Row: Risk Level + Voice Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                        isDanger
                          ? 'bg-red-500 text-white animate-pulse'
                          : isCaution
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      }`}
                    >
                      {isDanger && <AlertOctagon className="w-4 h-4" />}
                      {isCaution && <AlertTriangle className="w-4 h-4" />}
                      {isSafe && <ShieldCheck className="w-4 h-4" />}
                      {isDanger ? t.danger_do_not_sail : isCaution ? t.caution_advised : t.safe_to_sail}
                    </span>

                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{adv.harborName}</span>
                    </span>
                  </div>

                  {/* Big Voice Listen Audio Button (Prominent for Rural Users) */}
                  <button
                    onClick={() => handleSpeak(adv, distFromUserNm, dirFromUser)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95 cursor-pointer ${
                      isPlayingThis
                        ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
                    }`}
                  >
                    {isPlayingThis ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>{t.stop_voice}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        <span>{t.listen_voice}</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Localized Title */}
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug mb-2">
                  {localizedTitle}
                </h3>

                {/* Target Species Visual Chips in Native Language */}
                {localizedSpecies && localizedSpecies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 my-3">
                    <span className="text-xs font-bold text-slate-400">{t.target_catch}</span>
                    {localizedSpecies.map((sp, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 text-xs font-bold bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 px-3 py-1 rounded-xl shadow-sm"
                      >
                        <Fish className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{sp}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Navigation & Telemetry Grid */}
                {adv.type === 'PFZ' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                    
                    {/* Compass Direction & Distance from User */}
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.from_your_position}</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-cyan-300 font-mono mt-0.5">
                        {dirFromUser} ({bearingDeg}°)
                      </div>
                      <div className="text-xs text-slate-300 font-bold">
                        {distFromUserNm} {t.nautical_miles}
                      </div>
                    </div>

                    {/* Depth */}
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-teal-400" />
                        <span>{t.depth}</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5">
                        {adv.depthMeters}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        {adv.chlorophyll}
                      </div>
                    </div>

                    {/* Wave Forecast */}
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Waves className="w-3.5 h-3.5 text-blue-400" />
                        <span>{t.wave_height}</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5">
                        {adv.weather?.waveHeight}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {adv.weather?.windSpeed}
                      </div>
                    </div>

                    {/* Fuel Saved */}
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t.fuel_saved}</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-amber-300 font-mono mt-0.5">
                        ~{adv.fuelSavingLitres} L
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold">
                        {t.save_rupees} ₹{(adv.fuelSavingLitres * 92).toLocaleString('en-IN')}
                      </div>
                    </div>

                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  
                  {/* View on Map Button */}
                  {adv.coordinates && (
                    <button
                      onClick={() => onSelectAdvisoryForMap(adv)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>{t.show_on_map}</span>
                    </button>
                  )}

                  {/* 2G Feature Phone SMS Format */}
                  <button
                    onClick={() => setExpandedSmsId(expandedSmsId === adv.id ? null : adv.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all ml-auto cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>{expandedSmsId === adv.id ? t.hide_sms : t.keypad_sms}</span>
                  </button>

                </div>

                {/* Expandable 2G SMS Payload Box */}
                {expandedSmsId === adv.id && (
                  <div className="mt-3 p-3.5 bg-zinc-950 rounded-2xl border border-zinc-700 font-mono text-xs text-green-400">
                    <div className="flex justify-between items-center mb-1.5 text-[11px] text-zinc-400">
                      <span>GSM SMS String ({smsText.length} chars)</span>
                      <button
                        onClick={() => handleCopySMS(adv.id, smsText)}
                        className="flex items-center gap-1 text-yellow-300 hover:text-yellow-200 cursor-pointer"
                      >
                        {copiedId === adv.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-black p-2.5 rounded-xl border border-zinc-800 text-slate-200 select-all break-words">
                      {smsText}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
