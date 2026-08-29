import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  X, 
  PhoneCall, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Radio, 
  LifeBuoy, 
  MapPin 
} from 'lucide-react';
import { formatGPSCoords } from '../../utils/geoUtils';
import { generateEmergencySOSMessage } from '../../services/smsEncoder';
import { TRANSLATIONS } from '../../data/translations';

export default function EmergencySOSModal({ isOpen, onClose, boatLocation, selectedHarborObj, lang = 'en' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [distressSent, setDistressSent] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const intervalRef = useRef(null);

  const coords = boatLocation || { lat: 17.6868, lon: 83.2185 };
  const gpsFormatted = formatGPSCoords(coords.lat, coords.lon);
  const sosMessage = generateEmergencySOSMessage(coords.lat, coords.lon, 'IND-FLEET-SOS');

  // Web Audio API emergency siren generator
  const startSiren = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      gain.gain.value = 0.3;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      let freq = 600;
      let rising = true;
      intervalRef.current = setInterval(() => {
        if (rising) {
          freq += 60;
          if (freq >= 1200) rising = false;
        } else {
          freq -= 60;
          if (freq <= 500) rising = true;
        }
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
      }, 50);

      oscillatorRef.current = osc;
      setSirenPlaying(true);
    } catch (e) {
      console.warn('AudioContext error', e);
    }
  };

  const stopSiren = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
    }
    oscillatorRef.current = null;
    setSirenPlaying(false);
  };

  const handleToggleSiren = () => {
    if (sirenPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const handleCopySOS = () => {
    navigator.clipboard.writeText(sosMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransmitBroadcast = () => {
    setDistressSent(true);
    if (!sirenPlaying) startSiren();
  };

  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      <div className="bg-slate-950 border-2 border-red-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl shadow-red-950/80 relative text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopSiren();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Flashing Distress Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-4 rounded-full bg-red-600/20 border-2 border-red-500 text-red-500 mb-3 animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-red-500 tracking-wide uppercase">
            {t.emergency_sos}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {t.sos_subtitle}
          </p>
        </div>

        {/* Live Boat GPS Location Box */}
        <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 mb-4 text-center">
          <div className="text-xs text-red-300 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-400 animate-bounce" />
            <span>{t.your_current_location}</span>
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-white">
            {gpsFormatted.combined}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {coords.lat.toFixed(5)}° N, {coords.lon.toFixed(5)}° E
          </div>
        </div>

        {/* Siren Alarm & Broadcast Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          
          {/* Siren Button */}
          <button
            onClick={handleToggleSiren}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
              sirenPlaying
                ? 'bg-amber-500 text-black border-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
            }`}
          >
            {sirenPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
            <span>{sirenPlaying ? 'Mute Siren' : 'Siren Audio'}</span>
          </button>

          {/* Direct Call Coast Guard (1554) */}
          <a
            href="tel:1554"
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all text-center cursor-pointer"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span>CALL 1554 (Coast Guard)</span>
          </a>

        </div>

        {/* Generated SOS SMS Message */}
        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 mb-4 font-mono text-xs">
          <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5">
            <span>OFFLINE SOS SMS STRING</span>
            <button
              onClick={handleCopySOS}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SOS</span>
                </>
              )}
            </button>
          </div>
          <div className="p-2.5 bg-black rounded-xl border border-zinc-800 text-red-300 select-all break-words">
            {sosMessage}
          </div>
        </div>

        {/* Broadcast Distress Trigger Button */}
        <button
          onClick={handleTransmitBroadcast}
          disabled={distressSent}
          className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
            distressSent
              ? 'bg-emerald-700 text-white cursor-default'
              : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white active:scale-95'
          }`}
        >
          <Radio className={`w-5 h-5 ${distressSent ? '' : 'animate-ping'}`} />
          <span>{distressSent ? 'DISTRESS BROADCAST ACTIVE' : t.sos_trigger_btn}</span>
        </button>

        {/* Life-Saving Checklist */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-1">
          <div className="text-white font-bold flex items-center gap-1.5 mb-1">
            <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.safety_rule_title}:</span>
          </div>
          <p>{t.safety_rule_1}</p>
          <p>{t.safety_rule_2}</p>
          <p>{t.safety_rule_3}</p>
        </div>

      </div>

    </div>
  );
}
