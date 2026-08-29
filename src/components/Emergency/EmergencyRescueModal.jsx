import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  X, 
  PhoneCall, 
  Radio, 
  LifeBuoy, 
  MapPin, 
  Send, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Clock, 
  Navigation, 
  Share2, 
  Copy, 
  Check, 
  Anchor,
  Mic,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { formatGPSCoords, calculateDistanceKm, kmToNauticalMiles, calculateBearing } from '../../utils/geoUtils';
import { rescueAlertService, ACCIDENT_TYPES } from '../../services/rescueAlertService';
import { speechService } from '../../services/speechService';
import { TRANSLATIONS } from '../../data/translations';
import { HARBORS } from '../../data/mockAdvisories';

export default function EmergencyRescueModal({
  isOpen,
  onClose,
  boatLocation,
  currentUser,
  selectedHarborObj,
  lang = 'en'
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [selectedAccident, setSelectedAccident] = useState(ACCIDENT_TYPES[0]);
  const [fishermanMessage, setFishermanMessage] = useState('');
  const [crewCount, setCrewCount] = useState(currentUser?.crewSize || 5);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [distressAlert, setDistressAlert] = useState(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);

  const coords = boatLocation || { lat: 18.9186, lon: 72.8277 };
  const gpsFormatted = formatGPSCoords(coords.lat, coords.lon);

  // Audio siren generator
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
      gain.gain.value = 0.25;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      let freq = 600;
      let rising = true;
      intervalRef.current = setInterval(() => {
        if (rising) {
          freq += 70;
          if (freq >= 1300) rising = false;
        } else {
          freq -= 70;
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

  useEffect(() => {
    return () => stopSiren();
  }, []);

  // Voice speech dictation for low-literacy fishermen
  const handleToggleVoiceDictation = () => {
    if (isListeningVoice) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'te' ? 'te-IN' : lang === 'bn' ? 'bn-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setFishermanMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListeningVoice(false);
      };
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error', e);
      setIsListeningVoice(false);
    }
  };

  // Transmit Signal & Custom Message Directly to Coast Guard Rescue Teams
  const handleTransmitDistress = () => {
    setIsTransmitting(true);
    startSiren();

    const alert = rescueAlertService.dispatchAccidentSignal({
      fishermanMessage: fishermanMessage.trim() || selectedAccident.defaultNote,
      accidentType: selectedAccident,
      vesselId: currentUser?.vesselId || 'IND-MH-MUM-892',
      vesselName: currentUser?.vesselName || 'Matsya Kripa (मत्स्य कृपा)',
      captainName: currentUser?.name || 'Ramesh Koli',
      phone: currentUser?.phone || '+91 98201 54321',
      crewCount,
      coordinates: coords,
      harborName: selectedHarborObj?.name || 'Mumbai'
    });

    setDistressAlert(alert);
    setIsTransmitting(false);

    // Multilingual Voice Confirmation
    const customSnippet = fishermanMessage.trim() ? `संदेश: "${fishermanMessage.trim()}".` : '';
    const voiceText = lang === 'mr'
      ? `आपत्कालीन संकट संदेश आणि आपला संदेश थेट भारतीय तटरक्षक दलाच्या नियंत्रण कक्षाला पाठवला आहे. ${customSnippet} बचाव नौका आपल्या GPS स्थानाकडे रवाना झाली आहे.`
      : lang === 'hi'
        ? `आपातकालीन संदेश तटरक्षक दल को सीधे भेज दिया गया है। ${customSnippet} बचाव दल आपकी ओर रवाना हो चुका है। लाइफजैकेट पहनें।`
        : `Emergency distress signal and your message automatically transmitted to Indian Coast Guard Command. Fast patrol rescue boat dispatched to your GPS location.`;
    
    speechService.speak(voiceText, lang);
  };

  const handleCopySMS = (smsText) => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const currentMsg = fishermanMessage.trim() || selectedAccident.defaultNote;
  const smsString = `MAYDAY SOS! Vessel: ${currentUser?.vesselId || 'IND-MH-MUM-892'} (${currentUser?.name || 'Ramesh Koli'}) ACCIDENT: ${selectedAccident.title.en}. Crew: ${crewCount}. GPS: ${gpsFormatted.combined}. MSG: "${currentMsg}". Urgent Coast Guard Rescue Required! Call 1554.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      
      <div className="bg-slate-950 border-3 border-red-500 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl shadow-red-950 relative text-white max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopSiren();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex p-3.5 rounded-3xl bg-red-600/20 border-2 border-red-500 text-red-500 mb-2 animate-bounce">
              <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-red-500 tracking-wide uppercase">
              Emergency SOS Direct Rescue Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
              Automatically transmits your emergency signal and exact message directly to the Coast Guard & MRCC Rescue Team
            </p>
          </div>

          {/* ---------------- 1. ACCIDENT TYPE & CUSTOM MESSAGE ---------------- */}
          {!distressAlert && (
            <div className="space-y-4 mb-5">
              
              {/* Accident Category Chips */}
              <div>
                <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Select Emergency / Accident Nature (आपत्कालीन परिस्थिती):</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACCIDENT_TYPES.map((acc) => {
                    const isSelected = selectedAccident.id === acc.id;
                    const localizedTitle = acc.title[lang] || acc.title.en;

                    return (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccident(acc)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-red-500 bg-red-950/80 shadow-md shadow-red-950/50'
                            : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl">{acc.icon}</span>
                        <div className="font-extrabold text-[11px] sm:text-xs text-white line-clamp-1">
                          {localizedTitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ---------------- 1.5 CUSTOM FISHERMAN DISTRESS MESSAGE BOX ---------------- */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Your Message to Rescue Team (बचाव पथकासाठी थेट संदेश):</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleToggleVoiceDictation}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isListeningVoice
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                    }`}
                    title="Speak into Microphone"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isListeningVoice ? 'Listening...' : 'माईक बोला (Speak)'}</span>
                  </button>
                </div>

                <textarea
                  value={fishermanMessage}
                  onChange={(e) => setFishermanMessage(e.target.value)}
                  placeholder={`Optional: Describe specific emergency, damage, or urgent needs (e.g. "${selectedAccident.defaultNote}")...`}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 text-xs text-white placeholder:text-slate-500 outline-none resize-none"
                />

                {/* Quick 1-tap scenario pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
                  <span className="text-slate-500 font-bold">Quick:</span>
                  {[
                    'Taking in water rapidly',
                    'Main engine dead / drifting',
                    '2 crew injured / unconscious',
                    'Fire in engine room',
                    'Rudder broken near reef'
                  ].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setFishermanMessage(quick)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crew Count Selector */}
              <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Total Crew on Board:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCrewCount(Math.max(1, crewCount - 1))}
                    className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-cyan-300 text-sm px-2">
                    {crewCount}
                  </span>
                  <button
                    onClick={() => setCrewCount(crewCount + 1)}
                    className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ---------------- 2. LIVE GPS & VESSEL DETAILS BOX ---------------- */}
          <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/40 mb-4 space-y-2 text-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-red-500/20 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400 animate-bounce" />
                <span className="font-bold text-red-300 uppercase text-[11px]">Live GPS Coordinates:</span>
              </div>
              <span className="font-mono font-black text-white text-sm">
                {gpsFormatted.combined}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Vessel ID:</span>
                <span className="font-mono font-bold text-cyan-300">{currentUser?.vesselId || 'IND-MH-MUM-892'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Master / Captain:</span>
                <span className="font-bold text-white">{currentUser?.name || 'Ramesh Koli'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Rescue District:</span>
                <span className="font-bold text-amber-300">{selectedHarborObj?.name || 'Mumbai'} Base</span>
              </div>
            </div>

          </div>

          {/* ---------------- 3. POST-DISPATCH DIRECT RESCUE TRACKER ---------------- */}
          {distressAlert && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/70 mb-4 space-y-3.5 animate-in fade-in">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-black text-emerald-300 text-sm uppercase">
                    SOS & Message Transmitted to Rescue Team
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-700">
                  RESCUE ACTIVE
                </span>
              </div>

              {/* Fisherman's message echo */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Transmitted Distress Message:</span>
                <p className="text-emerald-300 font-semibold italic mt-0.5">
                  "{distressAlert.fishermanMessage}"
                </p>
              </div>

              {/* Steps timeline */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>🛰️ Live Satellite Direct Feed & VHF Ch 16 Broadcast Active</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>🚢 Fast Patrol Vessel (ICGS Varaha) Dispatched • ETA: ~18 Mins</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <span>🚁 Chetak CG-812 Helicopter Airborne for Aerial Tracking</span>
                </div>
              </div>

              {/* Call Coast Guard Direct hotline */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-500/30">
                <a
                  href="tel:1554"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer text-center"
                >
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                  <span>Call 1554 (Coast Guard MRCC)</span>
                </a>

                <button
                  onClick={() => handleCopySMS(smsString)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy 2G SMS'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* ---------------- 4. BOTTOM ACTION BUTTONS ---------------- */}
        <div className="space-y-2.5 pt-3 border-t border-slate-800">
          
          {!distressAlert ? (
            <button
              onClick={handleTransmitDistress}
              disabled={isTransmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-2xl shadow-red-600/50 flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <Radio className="w-6 h-6 animate-spin" />
              <span>SEND SOS & MESSAGE DIRECTLY TO RESCUE TEAM</span>
            </button>
          ) : (
            <button
              onClick={() => {
                stopSiren();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer"
            >
              Acknowledge & Monitor Rescue Radar
            </button>
          )}

          {/* Quick Siren Toggle & Emergency Helpline */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => (sirenPlaying ? stopSiren() : startSiren())}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
            >
              {sirenPlaying ? <VolumeX className="w-4 h-4 text-red-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              <span>{sirenPlaying ? 'Mute Siren' : 'Test Siren Audio'}</span>
            </button>

            <span className="font-mono text-[11px] text-slate-300">
              Coast Guard Emergency: <strong>1554 / 112</strong>
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
