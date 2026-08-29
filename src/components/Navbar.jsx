import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { 
  Anchor, 
  Volume2, 
  VolumeX, 
  Zap, 
  ShieldAlert, 
  ChevronDown, 
  Check, 
  User, 
  LogOut, 
  Fish, 
  ShieldCheck, 
  LogIn, 
  Palette, 
  Sparkles, 
  Home, 
  Compass, 
  Radio, 
  FileText, 
  MessageSquare, 
  Bot, 
  Crosshair, 
  Menu, 
  X, 
  PhoneCall,
  Activity,
  Globe
} from 'lucide-react';
import { speechService } from '../services/speechService';

export const THEMES = [
  { id: 'beach', name: 'Coastal Beach', icon: '🏖️', desc: 'Scenic Beach & Waves' },
  { id: 'ocean', name: 'Deep Ocean', icon: '🌊', desc: 'Deep Midnight Coastal' },
  { id: 'light', name: 'Daylight White', icon: '☀️', desc: 'Bright Sun Visibility' },
  { id: 'black', name: 'OLED Black', icon: '🌑', desc: 'Ultra-Dark Night Sea' },
  { id: 'system', name: 'System Auto', icon: '💻', desc: 'Device Theme Match' },
];

export default function Navbar({
  lang,
  setLang,
  isLowBandwidth,
  setIsLowBandwidth,
  theme = 'beach',
  setTheme,
  activeView = 'home',
  setActiveView,
  role,
  setRole,
  isOnline,
  onOpenSOS,
  onOpenImdLegal,
  onOpenBhasini,
  speakingState,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  // Dropdown States
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const langRef = useRef(null);
  const themeRef = useRef(null);
  const userRef = useRef(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const currentThemeObj = THEMES.find((th) => th.id === theme) || THEMES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangMenuOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeMenuOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStopAudio = () => {
    speechService.stop();
  };

  const navItems = [
    { id: 'home', label: lang === 'mr' ? 'मुख्य' : lang === 'hi' ? 'होम' : 'Home', short: 'Home', icon: Home, role: 'fisherman' },
    { id: 'advisories', label: lang === 'mr' ? 'सल्ला व नकाशा' : lang === 'hi' ? 'मौसम व मैप' : 'Advisories & Map', short: 'Map', icon: Compass, role: 'fisherman' },
    { id: 'gps_weather', label: lang === 'mr' ? 'थेट हवामान' : lang === 'hi' ? 'लाइव GPS' : 'GPS Weather', short: 'GPS', icon: Crosshair, role: 'fisherman' },
    { id: 'tracker', label: lang === 'mr' ? 'नौका ट्रॅकिंग' : lang === 'hi' ? 'वेसल ट्रैकर' : 'Radar', short: 'Radar', icon: Radio, role: 'fisherman' },
    { id: 'sms', label: lang === 'mr' ? 'शासकीय SMS' : lang === 'hi' ? 'ऑफलाइन SMS' : 'SMS', short: 'SMS', icon: MessageSquare, role: 'fisherman' },
    { id: 'admin', label: lang === 'mr' ? 'अधिकारी' : lang === 'hi' ? 'अधिकारी' : 'Authority', short: 'Admin', icon: ShieldCheck, role: 'admin' },
  ];

  return (
    <header className={`${isLowBandwidth ? 'bg-black border-b-2 border-white' : 'bg-slate-950/90 backdrop-blur-2xl border-b border-cyan-500/20 shadow-2xl shadow-cyan-950/40'} sticky top-0 z-50 transition-all w-full overflow-visible`}>
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* ---------------- 1. BRAND LOGO & TITLE ---------------- */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => { setActiveView('home'); setRole('fisherman'); setMobileDrawerOpen(false); }}
              className="flex items-center gap-2 text-left cursor-pointer group flex-shrink-0"
            >
              <div className={`p-2 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                isLowBandwidth 
                  ? 'bg-white text-black font-black' 
                  : 'bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 group-hover:shadow-cyan-400/50'
              }`}>
                <Anchor className="w-5 h-5" />
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-base sm:text-lg tracking-tight text-white">
                    MatsyaSetu
                  </span>
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 hidden xs:inline-block">
                    INCOIS
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-400 hidden 2xl:block font-medium">
                  {t.app_tagline}
                </p>
              </div>
            </button>
          </div>

          {/* ---------------- 2. CENTER DESKTOP NAVIGATION TABS ---------------- */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs shadow-inner flex-shrink-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isAdmin = item.id === 'admin';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setRole(item.role);
                  }}
                  className={`flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? isAdmin
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : isAdmin ? 'text-amber-400' : 'text-cyan-400'}`} />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.short}</span>
                </button>
              );
            })}
          </nav>

          {/* ---------------- 3. RIGHT UTILITY CONTROLS & SOS ---------------- */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Bhashini AI Voice Assistant Button */}
            <button
              onClick={onOpenBhasini}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/40 active:scale-95 transition-all cursor-pointer flex-shrink-0"
              title="Bhashini AI Multilingual Voice Assistant"
            >
              <Bot className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span className="hidden md:inline font-display">भाषिणी AI</span>
            </button>

            {/* Audio Voice Playing Pill */}
            {speakingState?.isSpeaking && (
              <button
                onClick={handleStopAudio}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold animate-pulse shadow-md shadow-red-600/40 cursor-pointer flex-shrink-0"
                title="Stop Voice"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Stop</span>
              </button>
            )}

            {/* Theme Selector Dropdown */}
            <div className="relative flex-shrink-0" ref={themeRef}>
              <button
                onClick={() => { setThemeMenuOpen(!themeMenuOpen); setLangMenuOpen(false); setUserMenuOpen(false); }}
                className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-800 shadow-sm transition-all cursor-pointer"
                title="Change Theme (थीम)"
              >
                <span className="text-sm">{currentThemeObj.icon}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Theme</span>
                  </div>
                  <div className="py-1">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          setTheme(th.id);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-cyan-950/60 transition-colors ${
                          theme === th.id ? 'text-cyan-400 font-bold bg-cyan-950/50' : 'text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{th.icon}</span>
                          <span className="font-bold text-white text-xs">{th.name}</span>
                        </div>
                        {theme === th.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative flex-shrink-0" ref={langRef}>
              <button
                onClick={() => { setLangMenuOpen(!langMenuOpen); setThemeMenuOpen(false); setUserMenuOpen(false); }}
                className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLowBandwidth 
                    ? 'bg-zinc-900 border border-white text-white' 
                    : 'bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-800 shadow-sm'
                }`}
                title="Change Language (भाषा)"
              >
                <span className="text-sm">{currentLangObj.flag}</span>
                <span className="hidden sm:inline font-semibold text-[11px]">{currentLangObj.code.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Language (भाषा)</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-cyan-950/60 transition-colors ${
                          lang === l.code ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{l.flag}</span>
                          <span className="font-semibold text-xs">{l.native}</span>
                        </span>
                        {lang === l.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2G Mode Light Switch */}
            <button
              onClick={() => setIsLowBandwidth(!isLowBandwidth)}
              className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                isLowBandwidth
                  ? 'bg-amber-400 text-black border border-white font-black'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Toggle Ultra-Low 2G Mode"
            >
              <Zap className={`w-3.5 h-3.5 ${isLowBandwidth ? 'fill-black' : 'text-amber-400'}`} />
              <span className="text-[10.5px]">{isLowBandwidth ? '2G' : '2G'}</span>
            </button>

            {/* User Profile / KYC Account */}
            <div className="relative flex-shrink-0" ref={userRef}>
              {currentUser ? (
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setThemeMenuOpen(false); setLangMenuOpen(false); }}
                  className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-950/60 border-amber-500/70 text-amber-300'
                      : 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0">
                    {currentUser.role === 'admin' ? '🏢' : '🐟'}
                  </div>
                  <span className="max-w-[65px] truncate hidden sm:inline font-medium text-[11px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* User Account Popover */}
              {userMenuOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3 text-xs text-white animate-in fade-in space-y-2.5">
                  <div className="border-b border-slate-800 pb-2">
                    <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{currentUser.role === 'admin' ? '🏢' : '🐟'}</span>
                      <span>{currentUser.name}</span>
                    </div>
                    <div className="text-[10.5px] text-slate-400 mt-0.5 font-mono">
                      {currentUser.role === 'admin' ? currentUser.designation : `Vessel: ${currentUser.vesselId}`}
                    </div>
                    {currentUser.phone && (
                      <div className="text-[10.5px] text-emerald-400 font-mono mt-0.5">
                        KYC: {currentUser.phone}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setUserMenuOpen(false);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-center text-slate-200 text-xs cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setUserMenuOpen(false);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 font-bold flex items-center justify-center gap-1 cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ----------------- 4. UNCLIPPED DEDICATED EMERGENCY SOS BUTTON ----------------- */}
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-600/40 active:scale-95 transition-all cursor-pointer animate-pulse border border-white/30 flex-shrink-0"
              title="Emergency SOS Distress Signal"
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>SOS</span>
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer flex-shrink-0"
              title="Toggle Menu"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* ---------------- 4. SLIDE-OUT MOBILE NAVIGATION DRAWER ---------------- */}
      {mobileDrawerOpen && (
        <div className="lg:hidden bg-slate-950/98 border-t border-slate-800 px-4 py-4 space-y-3.5 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Navigation Modules
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isAdmin = item.id === 'admin';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setRole(item.role);
                    setMobileDrawerOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                    isActive
                      ? isAdmin
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : isAdmin ? 'text-amber-400' : 'text-cyan-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Utility Row */}
          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => { onOpenImdLegal(); setMobileDrawerOpen(false); }}
              className="flex-1 p-2 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>IMD Rules</span>
            </button>

            <button
              onClick={() => { setIsLowBandwidth(!isLowBandwidth); setMobileDrawerOpen(false); }}
              className={`flex-1 p-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                isLowBandwidth ? 'bg-amber-400 text-black border-white' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isLowBandwidth ? '2G Active' : '2G Mode'}</span>
            </button>
          </div>

        </div>
      )}

    </header>
  );
}
