import React from 'react';
import { Waves, Wind, Thermometer, ShieldCheck, AlertTriangle, AlertOctagon, Volume2, VolumeX, MapPin, Compass } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translations';
import { HARBORS } from '../../data/mockAdvisories';
import { speechService } from '../../services/speechService';

export default function WeatherAlertBanner({ 
  weather, 
  lang = 'en', 
  selectedHarborObj, 
  setSelectedHarbor, 
  isLowBandwidth, 
  speakingState 
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleListenWeather = () => {
    if (speakingState?.isSpeaking) {
      speechService.stop();
      return;
    }

    const harborName = selectedHarborObj?.name || 'तटीय क्षेत्र';
    const wave = weather?.waveHeight || '1.3 मीटर';
    const wind = weather?.windSpeed || '14 नॉट्स';
    const isSafe = weather?.safetyLevel === 'SAFE' || !weather?.safetyLevel;
    const isCaution = weather?.safetyLevel === 'CAUTION';

    let speechText = '';

    if (lang === 'mr') {
      const safety = isSafe 
        ? 'समुद्र शांत आहे आणि समुद्रात जाणे पूर्णपणे सुरक्षित आहे.' 
        : isCaution 
          ? 'सावधगिरी बाळगा. समुद्रात मध्यम लाटा आहेत.' 
          : 'धोका! तीव्र चक्रीवादळाचा इशारा. समुद्रात जाऊ नका.';
      speechText = `${harborName} साठी सागरी हवामान अंदाज: लाटांची उंची ${wave}, वाऱ्याचा वेग ${wind}. ${safety}`;
    } else if (lang === 'hi') {
      const safety = isSafe 
        ? 'समुद्र शांत है। मछली पकड़ने जाना सुरक्षित है।' 
        : isCaution 
          ? 'सावधानी बरतें। ऊंची लहरें हैं।' 
          : 'खतरा! चक्रवाती तूफान की चेतावनी। समुद्र में न जाएं।';
      speechText = `${harborName} के लिए समुद्री मौसम: लहर की ऊंचाई ${wave}, हवा की गति ${wind}। ${safety}`;
    } else if (lang === 'ta') {
      const safety = isSafe 
        ? 'கடல் அமைதியாக உள்ளது, வேட்டைக்குச் செல்ல பாதுகாப்பானது.' 
        : isCaution 
          ? 'எச்சரிக்கையுடன் செல்லவும், மிதமான அலைகள் உள்ளன.' 
          : 'ஆபத்து! புயல் எச்சரிக்கை. கடலுக்குச் செல்ல வேண்டாம்.';
      speechText = `${harborName} கடல் வானிலை: அலை உயரம் ${wave}, காற்றின் வேகம் ${wind}. ${safety}`;
    } else if (lang === 'te') {
      const safety = isSafe 
        ? 'సముద్రం ప్రశాంతంగా ఉంది, వేటకు వెళ్లడం సురక్షితం.' 
        : isCaution 
          ? 'జాగ్రత్త అవసరం. అలలు ఎక్కువగా ఉన్నాయి.' 
          : 'ప్రమాదం! తీవ్ర తుఫాను హెచ్చరిక. సముద్రంలోకి వెళ్లవద్దు.';
      speechText = `${harborName} వాతావరణ సమాచారం: అలల ఎత్తు ${wave}, గాలి వేగం ${wind}. ${safety}`;
    } else if (lang === 'bn') {
      const safety = isSafe 
        ? 'সমুদ্র শান্ত ও মাছ ধরতে যাওয়া নিরাপদ।' 
        : isCaution 
          ? 'সতর্কতা অবলম্বন করুন।' 
          : 'বিপদ! প্রবল ঘূর্ণিঝড়। সমুদ্রে যাবেন না।';
      speechText = `${harborName} সামুদ্রিক পূর্বাভাস: ঢেউয়ের উচ্চতা ${wave}, বাতাসের গতি ${wind}। ${safety}`;
    } else if (lang === 'ml') {
      const safety = isSafe 
        ? 'കടൽ ശാന്തമാണ്. മത്സ്യബന്ധനത്തിന് പോകുന്നത് സുരക്ഷിതം.' 
        : isCaution 
          ? 'ജാഗ്രത പാലിക്കുക.' 
          : 'അപകടം! അതിതീവ്ര ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ്. കടലിൽ പോകരുത്.';
      speechText = `${harborName} കാലാവസ്ഥാ മുന്നറിയിപ്പ്: തിരമാല ഉയരം ${wave}, കാറ്റിന്റെ വേഗത ${wind}. ${safety}`;
    } else if (lang === 'gu') {
      const safety = isSafe 
        ? 'દરિયો શાંત છે અને દરિયામાં જવું સલામત છે.' 
        : isCaution 
          ? 'સાવચેતી રાખવી જરૂરી છે.' 
          : 'ખતરો! વાવાઝોડાની ગંભીર ચેતવણી. દરિયામાં ન જશો.';
      speechText = `${harborName} દરિયાઈ હવામાન: મોજાંની ઊંચાઈ ${wave}, પવનની ઝડપ ${wind}. ${safety}`;
    } else if (lang === 'or') {
      const safety = isSafe 
        ? 'ସମୁଦ୍ର ଶାନ୍ତ ଅଛି ଏବଂ ମାଛ ଧରିବାକୁ ଯିବା ସୁରକ୍ଷିତ।' 
        : isCaution 
          ? 'ସତର୍କତା ଅବଲମ୍ବନ କରନ୍ତୁ।' 
          : 'ବିପଦ! ଭୟଙ୍କର ବାତ୍ୟା ସତର୍କତା। ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ।';
      speechText = `${harborName} ସମୁଦ୍ର ପାଣିପାଗ ସୂଚନା: ଢେଉ ଉଚ୍ଚତା ${wave}, ପବନର ବେଗ ${wind}। ${safety}`;
    } else {
      const safety = isSafe 
        ? 'Sea conditions are normal and safe for sailing.' 
        : isCaution 
          ? 'Caution advised due to high swells.' 
          : 'Danger! Severe cyclonic storm. Do not venture to sea.';
      speechText = `INCOIS Marine forecast for ${harborName}: Wave height ${wave}, wind speed ${wind}. ${safety}`;
    }

    speechService.speak(speechText, lang);
  };

  const isDanger = weather?.safetyLevel === 'DANGER';
  const isCaution = weather?.safetyLevel === 'CAUTION';
  const isSafe = !isDanger && !isCaution;

  if (isLowBandwidth) {
    return (
      <div className="bg-zinc-950 border-2 border-white p-3 rounded-xl text-white font-mono mb-4">
        <div className="flex justify-between items-center border-b border-zinc-700 pb-2 mb-2">
          <span className="font-bold uppercase text-yellow-300">PORT: {selectedHarborObj?.name}</span>
          <button 
            onClick={handleListenWeather}
            className="bg-white text-black px-2 py-0.5 font-bold text-xs cursor-pointer"
          >
            [{t.listen_voice}]
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>{t.wave_height}: <strong>{weather?.waveHeight || '1.3 m'}</strong></div>
          <div>{t.wind_speed}: <strong>{weather?.windSpeed || '14 kts'}</strong></div>
          <div>{t.sea_temp}: <strong>{weather?.seaTemp || '28.5 °C'}</strong></div>
          <div className="text-yellow-300 font-bold">{t.safety_status}: {weather?.safetyLevel || 'SAFE'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      
      {/* Visual Port Switcher Chips for Easy 1-Tap Switching (Low-Literacy Friendly) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.search_harbor}</span>
        </span>
        {HARBORS.map((h) => {
          const isSelected = selectedHarborObj?.id === h.id;
          return (
            <button
              key={h.id}
              onClick={() => setSelectedHarbor(h.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 ring-2 ring-white scale-105'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{h.name.split(' ')[0]}</span>
              <span className={`text-[10px] ${isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-500'}`}>
                ({h.state.slice(0, 2).toUpperCase()})
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Sea Safety & Telemetry Card */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all duration-300 relative overflow-hidden ${
        isDanger
          ? 'bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border-red-500 shadow-xl shadow-red-950/40'
          : isCaution
          ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 border-amber-500 shadow-xl shadow-amber-950/30'
          : 'bg-gradient-to-r from-slate-900/90 via-slate-900 to-cyan-950/40 border-cyan-500/30 shadow-xl'
      }`}>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left: Big Visual Safety Indicator + One-Tap Voice Button */}
          <div className="space-y-3">
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>INCOIS • {t.weather_forecast}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-300 font-semibold">
                📍 {selectedHarborObj?.name}
              </span>
            </div>

            {/* Giant Safety Status Pill */}
            <div className="flex flex-wrap items-center gap-3">
              
              <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-extrabold text-sm sm:text-base border shadow-md ${
                isDanger
                  ? 'bg-red-500 text-white border-red-400 animate-pulse'
                  : isCaution
                  ? 'bg-amber-400 text-slate-950 border-yellow-300'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              }`}>
                {isDanger && <AlertOctagon className="w-6 h-6 animate-bounce" />}
                {isCaution && <AlertTriangle className="w-6 h-6" />}
                {isSafe && <ShieldCheck className="w-6 h-6 text-emerald-400" />}
                
                <span>
                  {isDanger ? '🔴 ' + t.danger_do_not_sail : isCaution ? '🟡 ' + t.caution_advised : '🟢 ' + t.safe_to_sail}
                </span>
              </div>

              {/* Big Voice Audio Button with Female Voice Indicator */}
              <button
                onClick={handleListenWeather}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-xl active:scale-95 transition-all cursor-pointer ${
                  speakingState?.isSpeaking
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30'
                }`}
              >
                {speakingState?.isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span>{t.stop_voice}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span>{t.listen_voice}</span>
                  </>
                )}
              </button>

            </div>

            <p className="text-xs text-slate-400 font-medium">
              {weather?.safetyMessage || (lang === 'mr' ? 'समुद्र सामान्य आहे. सर्व प्रकारच्या मासेमारी नौकांना परवानगी आहे.' : 'Normal ocean conditions. Mechanized and motorized crafts permitted.')}
            </p>

          </div>

          {/* Right: Clean Visual Sea Gauge Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            {/* Wave Height Card with Visual Meter */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>{t.wave_height}</span>
                <Waves className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
                {weather?.waveHeight || '1.3 m'}
              </div>
              <div className="text-[11px] font-bold text-emerald-400 mt-1">
                🌊 {parseFloat(weather?.waveHeight) > 3 ? t.rough_waves : t.calm_waters}
              </div>
            </div>

            {/* Wind Speed Card */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>{t.wind_speed}</span>
                <Wind className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
                {weather?.windSpeed || '14 kts'}
              </div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">
                💨 {t.swell_period}: {weather?.wavePeriod || '7.5s'}
              </div>
            </div>

            {/* Sea Temp Card */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 col-span-2 sm:col-span-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>{t.sea_temp}</span>
                <Thermometer className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
                {weather?.seaTemp || '28.5 °C'}
              </div>
              <div className="text-[11px] font-semibold text-cyan-400 mt-1">
                🌡️ {t.good_plankton}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
