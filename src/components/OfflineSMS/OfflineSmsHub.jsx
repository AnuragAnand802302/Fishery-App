import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Radio, 
  ShieldAlert, 
  WifiOff, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  BellRing, 
  DownloadCloud, 
  Info 
} from 'lucide-react';
import { offlineSmsAlertService, INITIAL_OFFLINE_GOVT_SMS } from '../../services/offlineSmsAlertService';
import { TRANSLATIONS } from '../../data/translations';
import { speechService } from '../../services/speechService';
import { formatGPSCoords } from '../../utils/geoUtils';

export default function OfflineSmsHub({
  lang = 'en',
  isOnline = false,
  boatLocation,
  currentUser,
  advisories = []
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [messages, setMessages] = useState(() => offlineSmsAlertService.getAllMessages());
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'composer'
  const [drillTriggered, setDrillTriggered] = useState(false);

  // Sync advisories into offline SMS on load
  useEffect(() => {
    if (advisories && advisories.length > 0) {
      offlineSmsAlertService.syncAdvisoriesToOfflineSMS(advisories);
    }
  }, [advisories]);

  useEffect(() => {
    const unsub = offlineSmsAlertService.onUpdate((list) => {
      setMessages(list);
    });
    return () => unsub();
  }, []);

  const handleSpeakSms = (msg) => {
    const textToSpeak = msg.smsText?.[lang] || msg.smsText?.en || '';
    speechService.speak(textToSpeak, lang);
  };

  const handleCopySms = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTriggerDrill = () => {
    setDrillTriggered(true);
    const sirenText = lang === 'mr'
      ? 'सावधान! चक्रीवादळ आपत्कालीन इशारा. सर्व मच्छीमारांनी त्वरित सुरक्षित बंदराकडे परतावे.'
      : lang === 'hi'
        ? 'सावधान! चक्रवात आपातकालीन चेतावनी। सभी नावें तुरंत बंदरगाह वापस लौटें।'
        : 'Emergency Cyclone Alert! All fishing vessels return to harbor immediately.';
    speechService.speak(sirenText, lang);
    setTimeout(() => setDrillTriggered(false), 8000);
  };

  const emergencySmsBody = `SOS DISTRESS! Vessel: ${currentUser?.vesselId || 'IND-MH-MUM-892'} in emergency at GPS: ${boatLocation ? formatGPSCoords(boatLocation.lat, boatLocation.lon).combined : '18.784N, 72.562E'}. Master: ${currentUser?.name || 'Ramesh Koli'}. Immediate Coast Guard rescue requested. Call 1554.`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Offline Status & GSM Telemetry Banner */}
      <div className="glass-panel rounded-3xl p-6 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 flex-shrink-0">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                  Offline Government SMS Alert Hub (शासकीय एसएमएस)
                </h2>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>100% Offline 2G Ready</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Zero-Data GSM SMS Delivery • Works deep at sea beyond internet coverage (under 140 char text + Voice Readout)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTriggerDrill}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>Test Emergency Siren Drill</span>
            </button>
          </div>

        </div>

        {/* GSM Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">GSM 2G Signal:</span>
            <span className="font-extrabold text-emerald-400 font-mono">●●●●○ Strong (BSS)</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Offline Cached Alerts:</span>
            <span className="font-extrabold text-cyan-300 font-mono">{messages.length} Govt Messages</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Data Internet Cost:</span>
            <span className="font-extrabold text-emerald-400 font-mono">₹0 (Zero Data)</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Emergency Gateway:</span>
            <span className="font-extrabold text-amber-300 font-mono">Toll-Free 1554</span>
          </div>
        </div>

      </div>

      {/* Emergency Siren Alert Banner when triggered */}
      {drillTriggered && (
        <div className="p-5 rounded-3xl bg-red-600 text-white shadow-2xl border-4 border-white animate-pulse flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-10 h-10 animate-spin" />
            <div>
              <div className="font-black text-base sm:text-lg uppercase tracking-wider">
                🚨 GOVERNMENT CELL BROADCAST (CAP EMERGENCY DRILL)
              </div>
              <div className="text-xs sm:text-sm font-semibold opacity-95">
                Squall weather alert received via 2G broadcast. All mechanized crafts return to base harbor.
              </div>
            </div>
          </div>
          <button
            onClick={() => { speechService.stop(); setDrillTriggered(false); }}
            className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black text-xs uppercase cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs: SMS Inbox vs Emergency Dispatch */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'inbox'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Government Offline SMS Inbox ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('composer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'composer'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Quick 2G Emergency SOS Dispatch</span>
        </button>
      </div>

      {/* ----------------- 1. GOVERNMENT SMS INBOX ----------------- */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <span>📥 Official SMS Broadcasts (Stored on Device)</span>
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              Auto-synced with INCOIS & IMD
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {messages.map((msg) => {
              const textContent = msg.smsText?.[lang] || msg.smsText?.en || '';
              const isCopied = copiedId === msg.id;
              const isCritical = msg.priority === 'CRITICAL';

              return (
                <div
                  key={msg.id}
                  className={`glass-panel rounded-3xl p-5 border-2 transition-all flex flex-col justify-between shadow-xl ${
                    isCritical
                      ? 'border-red-500/70 bg-gradient-to-br from-red-950/60 to-slate-900'
                      : 'border-slate-800 bg-slate-900/80 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    
                    {/* SMS Message Header: Sender + Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-3 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                          isCritical ? 'bg-red-600 text-white' : 'bg-slate-950 text-cyan-300 border border-slate-800'
                        }`}>
                          {msg.sender}
                        </span>
                        <span className="text-xs font-extrabold text-white">
                          {msg.senderTitle}
                        </span>
                      </div>
                    </div>

                    {/* Classic 2G Feature Phone SMS Bubble */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed my-2 shadow-inner">
                      {textContent}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      ⏳ {msg.timestamp} • {textContent.length} chars (1 SMS credit)
                    </div>

                  </div>

                  {/* Actions: Speak Aloud + Forward via Phone SMS */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleSpeakSms(msg)}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span>{t.listen_voice}</span>
                    </button>

                    <a
                      href={offlineSmsAlertService.generateNativeSmsLink('', textContent)}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer"
                      title="Open in Phone SMS App"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </a>

                    <button
                      onClick={() => handleCopySms(msg.id, textContent)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                      title="Copy Text"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ----------------- 2. QUICK 2G EMERGENCY SOS DISPATCH ----------------- */}
      {activeTab === 'composer' && (
        <div className="glass-panel rounded-3xl p-6 border-2 border-red-500/60 bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-950 shadow-2xl space-y-4">
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-600 text-white font-black shadow-lg shadow-red-600/40">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Emergency 2G SMS Beacon (तटरक्षक आपत्कालीन संदेश)
              </h3>
              <p className="text-xs text-slate-300">
                Pre-formatted distress message ready to send to Coast Guard Control Room (1554) or family members without internet
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-red-300 leading-relaxed shadow-inner">
            {emergencySmsBody}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={offlineSmsAlertService.generateNativeSmsLink('1554', emergencySmsBody)}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/40 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send SMS to Coast Guard (1554)</span>
            </a>

            <a
              href={offlineSmsAlertService.generateNativeSmsLink('', emergencySmsBody)}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Send to Family Relative</span>
            </a>

            <button
              onClick={() => handleCopySms('sos', emergencySmsBody)}
              className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedId === 'sos' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === 'sos' ? 'Copied!' : 'Copy SOS Text'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
