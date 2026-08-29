import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OfflineBadge from './components/OfflineBadge';
import HomePage from './components/Home/HomePage';
import WeatherAlertBanner from './components/FishermanView/WeatherAlertBanner';
import AdvisoryFeed from './components/FishermanView/AdvisoryFeed';
import LowBandwidthFeed from './components/FishermanView/LowBandwidthFeed';
import InteractiveMap from './components/FishermanView/InteractiveMap';
import CatchEstimator from './components/FishermanView/CatchEstimator';
import EmergencyRescueModal from './components/Emergency/EmergencyRescueModal';
import EmergencyFloatingButton from './components/Emergency/EmergencyFloatingButton';
import AuthModal from './components/Auth/AuthModal';
import AdvisoryPublisher from './components/AdminView/AdvisoryPublisher';
import FleetRadar from './components/AdminView/FleetRadar';
import VesselLiveTracker from './components/VesselTracker/VesselLiveTracker';
import ImdLegalAlertsModal from './components/IMDAlerts/ImdLegalAlertsModal';
import OfflineSmsHub from './components/OfflineSMS/OfflineSmsHub';
import BhasiniChatModal from './components/BhasiniAI/BhasiniChatModal';
import BhasiniFloatingButton from './components/BhasiniAI/BhasiniFloatingButton';
import LiveGpsWeatherSection from './components/LiveGpsWeather/LiveGpsWeatherSection';

import { HARBORS } from './data/mockAdvisories';
import { TRANSLATIONS } from './data/translations';
import { storageService } from './services/storageService';
import { speechService } from './services/speechService';
import { authService } from './services/authService';
import { fetchLiveMarineWeather } from './services/marineWeatherService';
import { pushAdvisoryToSupabase } from './services/supabaseClient';
import { Volume2, VolumeX } from 'lucide-react';

export default function App() {
  // App State
  const [lang, setLang] = useState(() => storageService.getLanguage());
  const [theme, setTheme] = useState(() => storageService.getTheme());
  const [isLowBandwidth, setIsLowBandwidth] = useState(() => storageService.getLowBandwidthMode());
  const [currentUser, setCurrentUser] = useState(() => authService.getUser());
  const [role, setRole] = useState(currentUser?.role === 'admin' ? 'admin' : 'fisherman');
  const [activeView, setActiveView] = useState('home'); // 'home' | 'advisories' | 'admin'
  const [selectedHarbor, setSelectedHarbor] = useState(() => storageService.getSelectedHarbor());
  const [advisories, setAdvisories] = useState(() => storageService.getAdvisories());
  const [boatLocation, setBoatLocation] = useState(() => storageService.getUserLocation());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  
  // Weather & Active Selection State
  const [weather, setWeather] = useState(null);
  const [focusedAdvisory, setFocusedAdvisory] = useState(null);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isImdLegalOpen, setIsImdLegalOpen] = useState(false);
  const [isBhasiniOpen, setIsBhasiniOpen] = useState(false);
  const [speakingState, setSpeakingState] = useState({ isSpeaking: false, currentText: '' });
  const [adminTab, setAdminTab] = useState('publisher'); // 'publisher' | 'radar'

  const selectedHarborObj = HARBORS.find((h) => h.id === selectedHarbor) || HARBORS[0];
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Apply theme to body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    storageService.setTheme(newTheme);
  };

  // Persist language change
  const handleSetLang = (newLang) => {
    setLang(newLang);
    storageService.setLanguage(newLang);
  };

  // Persist 2G mode change
  const handleToggleLowBandwidth = (enabled) => {
    setIsLowBandwidth(enabled);
    storageService.setLowBandwidthMode(enabled);
  };

  // Switch selected harbor for filtering bulletins
  const handleSelectHarbor = (harborId) => {
    setSelectedHarbor(harborId);
    storageService.setSelectedHarbor(harborId);
  };

  const handleSelectHarborAndNavigate = (harborId) => {
    handleSelectHarbor(harborId);
    setActiveView('advisories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToView = (viewType) => {
    if (viewType === 'admin') {
      setActiveView('admin');
      setRole('admin');
    } else if (viewType === 'sms') {
      setActiveView('sms');
      setRole('fisherman');
    } else if (viewType === 'gps_weather' || viewType === 'live_weather') {
      setActiveView('gps_weather');
      setRole('fisherman');
    } else if (viewType === 'tracker') {
      setActiveView('tracker');
      setRole('fisherman');
    } else if (viewType === '2g') {
      setIsLowBandwidth(true);
      setActiveView('advisories');
      setRole('fisherman');
    } else {
      setActiveView('advisories');
      setRole('fisherman');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync auth state changes
  useEffect(() => {
    const unsub = authService.onAuthChange((user) => {
      setCurrentUser(user);
      if (user?.role) {
        setRole(user.role);
        if (user.role === 'admin') setActiveView('admin');
      }
    });
    return () => unsub();
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user?.role === 'admin') {
      setRole('admin');
      setActiveView('admin');
    } else {
      setRole('fisherman');
      setActiveView('home');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setRole('fisherman');
    setActiveView('home');
  };

  // Auto-detect or manually locate user device live GPS location
  const handleLocateUserGPS = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsLocatingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            name: 'My Device Live Location',
          };
          setBoatLocation(newLoc);
          storageService.setUserLocation(newLoc);
          setIsLocatingGPS(false);
        },
        (err) => {
          console.warn('Geolocation access denied or unavailable', err);
          setIsLocatingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // When app loads, try to detect real device GPS location
  useEffect(() => {
    handleLocateUserGPS();
  }, []);

  // When Coastal Authority publishes an advisory for a port (e.g. Mumbai):
  const handlePublishAdvisory = async (newAdvisory) => {
    const updated = storageService.addAdvisory(newAdvisory);
    setAdvisories(updated);
    setFocusedAdvisory(newAdvisory);
    setSelectedHarbor(newAdvisory.harborId);
    setActiveView('advisories');
    setRole('fisherman');

    // Push to Supabase if configured
    await pushAdvisoryToSupabase(newAdvisory);
  };

  // Listen to speech service state changes
  useEffect(() => {
    const unsubscribe = speechService.onStateChange((state) => {
      setSpeakingState(state);
    });
    return () => unsubscribe();
  }, []);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Live Marine Weather for the active harbor in real-time
  const loadMarineWeather = async () => {
    if (!selectedHarborObj) return;
    const data = await fetchLiveMarineWeather(selectedHarborObj);
    setWeather(data);
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  useEffect(() => {
    loadMarineWeather();
  }, [selectedHarborObj]);

  return (
    <div className={`min-h-screen ${isLowBandwidth ? 'low-bandwidth-mode bg-black text-white' : ''}`}>
      
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={handleSetLang}
        theme={theme}
        setTheme={handleSetTheme}
        activeView={activeView}
        setActiveView={setActiveView}
        isLowBandwidth={isLowBandwidth}
        setIsLowBandwidth={handleToggleLowBandwidth}
        role={role}
        setRole={setRole}
        isOnline={isOnline}
        onOpenSOS={() => setIsSosOpen(true)}
        onOpenImdLegal={() => setIsImdLegalOpen(true)}
        onOpenBhasini={() => setIsBhasiniOpen(true)}
        speakingState={speakingState}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Offline / PWA Sync Badge Bar */}
      <OfflineBadge
        isOnline={isOnline}
        lang={lang}
        isLowBandwidth={isLowBandwidth}
        lastSyncTime={lastSyncTime}
        onForceSync={loadMarineWeather}
        onOpenOfflineSms={() => { setActiveView('sms'); setRole('fisherman'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden grid grid-cols-6 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-[10px] mb-4 font-bold text-center">
          <button
            onClick={() => { setActiveView('home'); setRole('fisherman'); }}
            className={`py-2 rounded-xl transition-all ${
              activeView === 'home' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            🏠 Home
          </button>
          <button
            onClick={() => { setActiveView('gps_weather'); setRole('fisherman'); }}
            className={`py-2 rounded-xl transition-all ${
              activeView === 'gps_weather' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            📍 GPS
          </button>
          <button
            onClick={() => { setActiveView('advisories'); setRole('fisherman'); }}
            className={`py-2 rounded-xl transition-all ${
              activeView === 'advisories' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            🌊 Map
          </button>
          <button
            onClick={() => { setActiveView('tracker'); setRole('fisherman'); }}
            className={`py-2 rounded-xl transition-all ${
              activeView === 'tracker' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            🛰️ Track
          </button>
          <button
            onClick={() => { setActiveView('sms'); setRole('fisherman'); }}
            className={`py-2 rounded-xl transition-all ${
              activeView === 'sms' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            📱 SMS
          </button>
          <button
            onClick={() => { setActiveView('admin'); setRole('admin'); }}
            className={`py-2 rounded-xl transition-all ${
              activeView === 'admin' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            🏢 Auth
          </button>
        </div>

        {/* ----------------- 1. HOME VIEW ----------------- */}
        {activeView === 'home' && (
          <HomePage
            currentUser={currentUser}
            selectedHarbor={selectedHarbor}
            onSelectHarborAndNavigate={handleSelectHarborAndNavigate}
            onNavigateToView={handleNavigateToView}
            boatLocation={boatLocation}
            setBoatLocation={setBoatLocation}
            onOpenSOS={() => setIsSosOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenImdLegal={() => setIsImdLegalOpen(true)}
            onOpenBhasini={() => setIsBhasiniOpen(true)}
            speakingState={speakingState}
            lang={lang}
          />
        )}

        {/* ----------------- 2. PORT ADVISORIES & OCEAN MAP VIEW ----------------- */}
        {activeView === 'advisories' && (
          <div>
            
            {/* Live Weather Forecast & Sea Safety Banner */}
            <WeatherAlertBanner
              weather={weather}
              lang={lang}
              selectedHarborObj={selectedHarborObj}
              setSelectedHarbor={handleSelectHarbor}
              isLowBandwidth={isLowBandwidth}
              speakingState={speakingState}
            />

            {/* 2G Low Bandwidth Plain-Text View OR Rich Interactive View */}
            {isLowBandwidth ? (
              <LowBandwidthFeed
                advisories={advisories}
                selectedHarbor={selectedHarbor}
                setSelectedHarbor={handleSelectHarbor}
                lang={lang}
                speakingState={speakingState}
                onOpenSOS={() => setIsSosOpen(true)}
              />
            ) : (
              <div className="space-y-6">
                
                {/* Interactive Ocean Map with Live User GPS Pin */}
                <InteractiveMap
                  advisories={advisories}
                  selectedHarborObj={selectedHarborObj}
                  onSelectHarbor={handleSelectHarbor}
                  boatLocation={boatLocation}
                  setBoatLocation={setBoatLocation}
                  focusedAdvisory={focusedAdvisory}
                  onLocateUserGPS={handleLocateUserGPS}
                  isLocatingGPS={isLocatingGPS}
                  lang={lang}
                />

                {/* 2-Column Grid: Advisory Cards Feed + Fuel/Catch Calculator */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Advisories Feed (2/3 width) */}
                  <div className="lg:col-span-2">
                    <AdvisoryFeed
                      advisories={advisories}
                      selectedHarbor={selectedHarbor}
                      setSelectedHarbor={handleSelectHarbor}
                      boatLocation={boatLocation}
                      lang={lang}
                      onSelectAdvisoryForMap={(adv) => {
                        setFocusedAdvisory(adv);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      speakingState={speakingState}
                      isLowBandwidth={isLowBandwidth}
                    />
                  </div>

                  {/* Right Column: Catch & Fuel Optimizer (1/3 width) */}
                  <div className="lg:col-span-1 space-y-6">
                    <CatchEstimator
                      lang={lang}
                      isLowBandwidth={isLowBandwidth}
                    />

                    {/* Quick Safety Guideline Card */}
                    <div className="glass-panel rounded-3xl p-5 border border-slate-800 text-xs text-slate-400 space-y-2.5">
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <span>🛡️ {t.safety_rule_title || 'Marine Safety Essentials'}</span>
                      </h4>
                      <p>• {t.safety_rule_1 || 'Always check lifejackets and VHF marine radio before leaving harbor.'}</p>
                      <p>• {t.safety_rule_2 || 'Keep satellite NavIC transponder ON when sailing beyond 12 NM.'}</p>
                      <p>• {t.safety_rule_3 || 'Return to base port immediately if a red cyclone alert is sounded.'}</p>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ----------------- 3. COASTAL AUTHORITY ADMIN VIEW ----------------- */}
        {activeView === 'admin' && (
          <div className="space-y-6">
            
            {/* Admin Sub-Tabs */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <button
                onClick={() => setAdminTab('publisher')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  adminTab === 'publisher'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                📝 Issue Marine Advisory
              </button>
              <button
                onClick={() => setAdminTab('radar')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  adminTab === 'radar'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                🚢 Coastal Fleet Radar & SMS Dispatcher
              </button>
            </div>

            {adminTab === 'publisher' ? (
              <AdvisoryPublisher onPublishAdvisory={handlePublishAdvisory} />
            ) : (
              <FleetRadar advisories={advisories} />
            )}

          </div>
        )}

        {/* ----------------- 4. VESSEL API & RELATIVE TRACKING VIEW ----------------- */}
        {activeView === 'tracker' && (
          <VesselLiveTracker
            lang={lang}
            currentUser={currentUser}
          />
        )}

        {/* ----------------- 5. OFFLINE GOVERNMENT SMS ALERT HUB ----------------- */}
        {activeView === 'sms' && (
          <OfflineSmsHub
            lang={lang}
            isOnline={isOnline}
            boatLocation={boatLocation}
            currentUser={currentUser}
            advisories={advisories}
          />
        )}

        {/* ----------------- 6. LIVE GPS REAL-TIME LOCATION WEATHER RADAR ----------------- */}
        {activeView === 'gps_weather' && (
          <LiveGpsWeatherSection
            boatLocation={boatLocation}
            setBoatLocation={setBoatLocation}
            lang={lang}
            speakingState={speakingState}
            onNavigateToMap={() => {
              setActiveView('advisories');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* Floating Active Voice Bar */}
      {speakingState?.isSpeaking && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-50 bg-slate-950/95 backdrop-blur-2xl border-2 border-cyan-400 rounded-3xl p-4 shadow-2xl shadow-cyan-500/40 animate-in slide-in-from-bottom flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500 text-slate-950 animate-pulse">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>{t.playing_voice}</span>
              </div>
              <div className="text-xs text-slate-200 line-clamp-1 max-w-md mt-0.5">
                {speakingState.currentText}
              </div>
            </div>
          </div>

          <button
            onClick={() => speechService.stop()}
            className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <VolumeX className="w-4 h-4" />
            <span>{t.stop_voice}</span>
          </button>
        </div>
      )}

      {/* Maritime Accident & Emergency Rescue Signal Beacon Modal */}
      <EmergencyRescueModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        boatLocation={boatLocation}
        currentUser={currentUser}
        selectedHarborObj={selectedHarborObj}
        lang={lang}
      />

      {/* Floating 1-Click Emergency Accident & Rescue Signal Beacon Button (Bottom-Left) */}
      <EmergencyFloatingButton
        onClick={() => setIsSosOpen(true)}
        lang={lang}
      />

      {/* Authentication & Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
      />

      {/* Official IMD Weather Nowcasts & Govt Maritime Legal Proceedings Modal */}
      <ImdLegalAlertsModal
        isOpen={isImdLegalOpen}
        onClose={() => setIsImdLegalOpen(false)}
        lang={lang}
      />

      {/* Digital India Bhashini AI Multilingual Chatbot Modal */}
      <BhasiniChatModal
        isOpen={isBhasiniOpen}
        onClose={() => setIsBhasiniOpen(false)}
        lang={lang}
        selectedHarborObj={selectedHarborObj}
        onNavigateToView={handleNavigateToView}
        onOpenSOS={() => setIsSosOpen(true)}
        onOpenImdLegal={() => setIsImdLegalOpen(true)}
      />

      {/* Floating 1-Click Bhashini AI Assistant Launcher Button */}
      <BhasiniFloatingButton
        onClick={() => setIsBhasiniOpen(true)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>{t.app_title} • {t.app_tagline}</p>
        <p className="mt-1 text-[11px] text-slate-600">
          {t.bhashini_engine} • INCOIS & Open-Meteo
        </p>
      </footer>

    </div>
  );
}
