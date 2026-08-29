import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Scale, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  AlertTriangle, 
  AlertOctagon, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  HelpCircle, 
  Info 
} from 'lucide-react';
import { imdRssService, GOVT_LEGAL_PROCEEDINGS } from '../../services/imdRssService';
import { TRANSLATIONS } from '../../data/translations';
import { speechService } from '../../services/speechService';

export default function ImdLegalAlertsModal({ isOpen, onClose, lang = 'en' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState('imd'); // 'imd' | 'legal'
  const [nowcasts, setNowcasts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      imdRssService.fetchLiveImdNowcasts().then((data) => {
        setNowcasts(data || []);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpeakImdWarning = (item) => {
    const speechText = `IMD Weather Nowcast. ${item.title}. ${item.description}`;
    speechService.speak(speechText, lang);
  };

  const handleSpeakLegalRule = (rule) => {
    const title = rule.simplifiedTitle?.[lang] || rule.simplifiedTitle?.en || rule.officialTitle;
    const explanation = rule.plainExplanation?.[lang] || rule.plainExplanation?.en;
    const speechText = `शासकीय मासेमारी नियम. ${title}. ${explanation}. उल्लंघन केल्यास शिक्षा: ${rule.penaltySummary}`;
    speechService.speak(speechText, lang);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      <div className="bg-slate-950 border-2 border-cyan-500/50 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl shadow-cyan-950/80 relative text-white animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-black text-white">
              Official IMD Nowcasts & Govt Maritime Rules
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Meteorological RSS Bulletins & Simplified Coastal Legal Gazette Orders
            </p>
          </div>
        </div>

        {/* Sub-Tabs: IMD Nowcast vs Govt Legal Rules */}
        <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs mb-4">
          <button
            onClick={() => setActiveTab('imd')}
            className={`flex-1 py-2 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'imd'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>IMD District Nowcast RSS (हवामान इशारे)</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`flex-1 py-2 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'legal'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Govt Legal Rules & Bans (शासकीय नियम)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          
          {/* ---------------- 1. IMD DISTRICT NOWCAST RSS FEED ---------------- */}
          {activeTab === 'imd' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Source: India Meteorological Department (mausam.imd.gov.in)</span>
                </span>
                <span>RSS Feed Live</span>
              </div>

              {loading ? (
                <div className="text-center py-10 text-xs text-slate-400 font-bold animate-pulse">
                  Fetching latest IMD district nowcasts...
                </div>
              ) : (
                nowcasts.map((item) => {
                  const isRed = item.severity === 'DANGER_RED';
                  const isOrange = item.severity === 'CAUTION_ORANGE';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isRed
                          ? 'bg-red-950/70 border-red-500/80 shadow-red-950/40'
                          : isOrange
                          ? 'bg-amber-950/60 border-amber-500/70 shadow-amber-950/30'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isRed ? 'bg-red-600 text-white animate-pulse' : isOrange ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-cyan-300'
                            }`}>
                              {isRed ? 'RED ALERT' : isOrange ? 'SQUALL WARNING' : 'ADVISORY'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {item.pubDate}
                            </span>
                          </div>

                          <h4 className="text-sm font-extrabold text-white mt-1.5">
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSpeakImdWarning(item)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer flex-shrink-0"
                          title="Listen Voice"
                        >
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ---------------- 2. SIMPLIFIED GOVT LEGAL PROCEEDINGS & BANS ---------------- */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/80 rounded-2xl border border-cyan-500/40 text-xs text-cyan-200 flex items-start gap-2.5">
                <Info className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
                <p>
                  Official Government Gazette orders explained in <strong>simple, plain language</strong> so every fisherman knows their legal rights, mandatory safety equipment, and seasonal conservation bans.
                </p>
              </div>

              {GOVT_LEGAL_PROCEEDINGS.map((rule) => {
                const localizedTitle = rule.simplifiedTitle?.[lang] || rule.simplifiedTitle?.en || rule.officialTitle;
                const localizedExplanation = rule.plainExplanation?.[lang] || rule.plainExplanation?.en;

                return (
                  <div
                    key={rule.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 font-bold">
                          {rule.authority}
                        </span>
                        <h4 className="text-base font-extrabold text-white mt-1.5">
                          {localizedTitle}
                        </h4>
                        <div className="text-[11px] text-amber-300 font-medium mt-0.5">
                          ⏳ Period: {rule.effectiveDates}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSpeakLegalRule(rule)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                      >
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        <span>{t.listen_voice}</span>
                      </button>
                    </div>

                    {/* Plain Language Explanation */}
                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                      <strong className="text-cyan-300 block mb-1">💡 What Fishermen Need to Know (साध्या भाषेत नियम):</strong>
                      <p>{localizedExplanation}</p>
                    </div>

                    {/* Penalty & Enforcement */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                      <div className="text-red-400 font-bold">
                        ⚠️ Violation Penalty: <span className="font-normal text-slate-300">{rule.penaltySummary}</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-bold">
                        ✓ Active Legal Order
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
