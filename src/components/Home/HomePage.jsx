import React, { useState } from 'react';
import { 
  Anchor, 
  Fish, 
  MapPin, 
  Compass, 
  Navigation, 
  Waves, 
  Wind, 
  Fuel, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  UserCheck, 
  Volume2, 
  Zap, 
  Calculator, 
  Radio, 
  ArrowRight, 
  ExternalLink, 
  MessageSquare, 
  Bot, 
  Mic, 
  Search, 
  Filter 
} from 'lucide-react';
import { HARBORS } from '../../data/mockAdvisories';
import { TRANSLATIONS } from '../../data/translations';
import { speechService } from '../../services/speechService';
import LiveGpsWeatherSection from '../LiveGpsWeather/LiveGpsWeatherSection';

export default function HomePage({
  currentUser,
  selectedHarbor,
  onSelectHarborAndNavigate,
  onNavigateToView,
  boatLocation,
  setBoatLocation,
  onOpenSOS,
  onOpenAuth,
  onOpenImdLegal,
  onOpenBhasini,
  speakingState,
  lang = 'en'
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSpeakWelcome = () => {
    const name = currentUser?.name || 'मच्छीमार बांधव';
    const text = lang === 'mr'
      ? `नमस्कार ${name}! मत्स्यसेतू सागरी सल्ला पोर्टलवर आपले स्वागत आहे. आपले इच्छित बंदर निवडा आणि थेट मासेमारी क्षेत्र, लाटांची उंची आणि हवामान माहिती मिळवा.`
      : lang === 'hi'
        ? `नमस्ते ${name}! मत्स्यसेतु समुद्री सलाह पोर्टल में आपका स्वागत है। अपना बंदरगाह चुनें और मछली पकड़ने के क्षेत्र और मौसम की जानकारी प्राप्त करें।`
        : `Welcome ${name} to MatsyaSetu Ocean Advisory. Select your target coastal harbor to view real-time fish zones and marine weather.`;
    speechService.speak(text, lang);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ---------------- 1. FISHERMAN PROFILE & VESSEL IDENTITY BANNER ---------------- */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left: Fisherman Identity & Vessel Card */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 flex-shrink-0">
              <Anchor className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                  {currentUser ? currentUser.name : 'Ramesh Koli (रमेश कोळी)'}
                </h2>
                
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>KYC Verified Fisherman</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span className="font-mono text-cyan-300 font-bold">
                  🛥️ Vessel: {currentUser?.vesselId || 'IND-MH-MUM-892'}
                </span>
                <span>•</span>
                <span>
                  📍 Home Port: {currentUser?.homeHarbor ? currentUser.homeHarbor.toUpperCase() : 'Mumbai Sassoon Docks'}
                </span>
                <span>•</span>
                <span>
                  📡 GPS: {boatLocation?.lat?.toFixed(3)}°N, {boatLocation?.lon?.toFixed(3)}°E
                </span>
              </div>
            </div>
          </div>

          {/* Right: Audio Narration & Profile Action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSpeakWelcome}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>{t.listen_voice} Welcome</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              KYC Profile / Switch
            </button>
          </div>

        </div>

        {/* Quick Vessel Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>Seasonal Fuel Saved</span>
            </div>
            <div className="text-base font-extrabold text-amber-300 font-mono mt-0.5">
              ~340 Litres
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">
              Saved ₹31,280
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Coastal Safety Status</span>
            </div>
            <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
              SAFE TO SAIL
            </div>
            <div className="text-[10px] text-slate-400">
              INCOIS Low Risk
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Fish className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active PFZ Zones</span>
            </div>
            <div className="text-base font-extrabold text-cyan-300 font-mono mt-0.5">
              7 Coastal Sectors
            </div>
            <div className="text-[10px] text-cyan-400">
              High Fish Density
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              <span>Satellite GPS</span>
            </div>
            <div className="text-base font-extrabold text-white font-mono mt-0.5">
              Connected
            </div>
            <div className="text-[10px] text-emerald-400">
              NavIC / GPS Live
            </div>
          </div>

        </div>

      </div>

      {/* ---------------- 1.15 REAL-TIME LIVE GPS LOCATION WEATHER RADAR ---------------- */}
      <LiveGpsWeatherSection
        boatLocation={boatLocation}
        setBoatLocation={setBoatLocation}
        lang={lang}
        speakingState={speakingState}
        onNavigateToMap={() => onNavigateToView('map')}
      />

      {/* ---------------- 1.25 BHASHINI AI VOICE & MULTILINGUAL ASSISTANT BANNER ---------------- */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border-2 border-cyan-500/50 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black shadow-lg shadow-cyan-500/30 flex-shrink-0">
            <Bot className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                Bhashini AI Voice Chatbot (भाषिणी AI सहाय्यक)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Digital India NLTM
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1">
              Ask anything in Marathi, Hindi, Tamil, Telugu, Bengali, Gujarati, or English. The AI speaks back and navigates you to the right map, advisory, or tracker automatically!
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBhasini}
          className="relative z-10 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <Mic className="w-4 h-4 animate-bounce" />
          <span>Start Voice Chat (माईक बोला)</span>
        </button>

      </div>

      {/* ---------------- 1.5 OFFICIAL IMD NOWCAST & GOVT LEGAL PROCEEDINGS BANNER ---------------- */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 flex-shrink-0 animate-bounce">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                IMD District Nowcast RSS & Fisheries Laws (शासकीय नियम)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                Live Orders
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              Annual 61-day monsoon breeding ban, Turtle Excluder (TED) rules & minimum fish size laws explained in simple words.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenImdLegal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <span>View IMD Warnings & Legal Rules</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

      {/* ---------------- 2. SELECT HARBOR FOR SPECIFIC INFORMATION ---------------- */}
      <div className="space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-400" />
              <span>All Coastal Ports & Fishing Harbors of India (भारतीय बंदरे)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Select any port from Maharashtra, Gujarat, Goa, Karnataka, Kerala, Tamil Nadu, AP, Odisha, WB or Islands to view live weather & PFZ hotspots
            </p>
          </div>

          <span className="text-xs text-cyan-300 font-mono font-extrabold bg-cyan-950/80 px-3.5 py-1.5 rounded-2xl border border-cyan-700/80 self-start md:self-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{HARBORS.length} Coastal Ports Available</span>
          </span>
        </div>

        {/* Search & State Filter Bar */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-3xl border border-slate-800 space-y-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by port name (e.g. Veraval, Malpe, Sassoon, Paradip, Vizhinjam, Kasimedu)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* State Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'ALL', label: `All India (${HARBORS.length})` },
              { id: 'Maharashtra', label: 'Maharashtra (10)' },
              { id: 'Gujarat', label: 'Gujarat (12)' },
              { id: 'Goa', label: 'Goa (4)' },
              { id: 'Karnataka', label: 'Karnataka (8)' },
              { id: 'Kerala', label: 'Kerala (9)' },
              { id: 'Tamil Nadu', label: 'Tamil Nadu (11)' },
              { id: 'Andhra Pradesh', label: 'Andhra Pradesh (9)' },
              { id: 'Odisha', label: 'Odisha (6)' },
              { id: 'West Bengal', label: 'West Bengal (6)' },
              { id: 'Puducherry', label: 'Puducherry (2)' },
              { id: 'Andaman & Nicobar', label: 'A&N Islands (3)' },
              { id: 'Lakshadweep', label: 'Lakshadweep (2)' },
            ].map((st) => {
              const isSelected = selectedStateFilter === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStateFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-white/50'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* Coastal Harbor Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {HARBORS.filter((h) => {
            const matchesState = selectedStateFilter === 'ALL' || h.state === selectedStateFilter;
            const matchesSearch = !searchQuery || 
              h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              h.state.toLowerCase().includes(searchQuery.toLowerCase()) || 
              h.coast.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesState && matchesSearch;
          }).map((harbor) => {
            const isCurrent = selectedHarbor === harbor.id;
            const isArabian = harbor.coast.includes('Arabian') || harbor.coast.includes('West');

            return (
              <div
                key={harbor.id}
                className={`glass-panel rounded-3xl p-5 border-2 transition-all duration-300 hover:scale-[1.02] shadow-xl flex flex-col justify-between ${
                  isCurrent
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-slate-900/90'
                    : 'border-slate-800/80 hover:border-cyan-500/50 bg-slate-900/60'
                }`}
              >
                <div>
                  
                  {/* Card Header: Port Name & Coast Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                        {harbor.state}
                      </div>
                      <h4 className="text-base font-extrabold text-white">
                        {harbor.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {harbor.type || 'Coastal Fishing Harbor'}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-950 border border-slate-700 text-slate-300 whitespace-nowrap">
                      {isArabian ? '🌊 Arabian Sea' : '🌅 Bay of Bengal'}
                    </span>
                  </div>

                  {/* Sector Telemetry Specs */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">PFZ Hotspot Range:</span>
                      <span className="font-extrabold text-white font-mono">
                        {harbor.defaultPfz?.distanceNm || 25} NM ({harbor.defaultPfz?.dir || 'SW'})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Typical Target:</span>
                      <span className="font-extrabold text-emerald-400">
                        Pomfret, Tuna, Surmai
                      </span>
                    </div>
                  </div>

                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectHarborAndNavigate(harbor.id)}
                  className={`w-full mt-3 py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800 hover:bg-cyan-950 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-500/50'
                  }`}
                >
                  <span>View Advisories & Live Map</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            );
          })}
        </div>

      </div>


      {/* ---------------- 3. QUICK SYSTEM NAVIGATION & TOOLS HUB ---------------- */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        
        <h3 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Quick Access Ocean Modules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <button
            onClick={() => onNavigateToView('sms')}
            className="p-4 rounded-2xl bg-amber-950/40 hover:bg-amber-950/80 border border-amber-500/50 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-lg"
          >
            <MessageSquare className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform animate-pulse" />
            <div className="font-bold text-sm text-white">Offline Govt SMS Hub</div>
            <div className="text-[11px] text-amber-200 mt-0.5">2G GSM text & offline voice reader (under 140 chars)</div>
          </button>

          <button
            onClick={() => onNavigateToView('tracker')}
            className="p-4 rounded-2xl bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all cursor-pointer group shadow-lg"
          >
            <Radio className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-white">VesselAPI Live Tracker</div>
            <div className="text-[11px] text-cyan-200 mt-0.5">Family & Coast Guard rescue satellite radar</div>
          </button>

          <button
            onClick={() => onNavigateToView('map')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group"
          >
            <Compass className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-white">Ocean Radar & Map</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Live GPS & PFZ boundary coordinates</div>
          </button>

          <button
            onClick={() => onNavigateToView('calculator')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
          >
            <Calculator className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-white">Catch & Fuel Optimizer</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Calculate diesel savings & catch value</div>
          </button>

        </div>

      </div>

    </div>
  );
}
