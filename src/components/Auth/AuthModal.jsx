import React, { useState } from 'react';
import { 
  X, 
  Fish, 
  ShieldCheck, 
  Phone, 
  Lock, 
  KeyRound, 
  Anchor, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  ShieldAlert, 
  ArrowLeft, 
  RefreshCw, 
  IdCard, 
  UserCheck 
} from 'lucide-react';
import { authService, DEMO_USERS } from '../../services/authService';
import { TRANSLATIONS } from '../../data/translations';
import { speechService } from '../../services/speechService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, lang = 'en' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [tab, setTab] = useState('fisherman'); // 'fisherman' | 'admin'
  
  // Fisherman KYC & Multi-step form state
  const [authStep, setAuthStep] = useState('kyc'); // 'kyc' (Step 1) | 'otp' (Step 2)
  const [fullName, setFullName] = useState('Ramesh Koli (रमेश कोळी)');
  const [phone, setPhone] = useState('9876543210');
  const [vesselId, setVesselId] = useState('IND-MH-MUM-892');
  const [aadhaarLast4, setAadhaarLast4] = useState('8921');
  const [captchaAnswer, setCaptchaAnswer] = useState('12');
  const [otp, setOtp] = useState('1234');
  const [captchaNum1, setCaptchaNum1] = useState(7);
  const [captchaNum2, setCaptchaNum2] = useState(5);

  // Officer form
  const [email, setEmail] = useState('officer@incois.gov.in');
  const [password, setPassword] = useState('officer123');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const generateNewCaptcha = () => {
    const n1 = Math.floor(3 + Math.random() * 7);
    const n2 = Math.floor(2 + Math.random() * 8);
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaAnswer('');
  };

  // STEP 1: Submit Mobile & KYC for Anti-Bot verification
  const handleKycSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter fisherman full name');
      return;
    }

    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!vesselId.trim()) {
      setError('Please enter vessel registration number');
      return;
    }

    // Anti-Bot Captcha Verification
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswer, 10) !== expected) {
      setError(`Anti-Bot Security check failed. What is ${captchaNum1} + ${captchaNum2}?`);
      return;
    }

    // Move to Step 2: Show OTP field only now!
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthStep('otp');
    }, 400);
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.loginWithPhone(phone, otp, vesselId);
      user.name = fullName;
      user.aadhaarVerified = true;
      authService.saveUser(user);

      setLoading(false);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid OTP. Use demo OTP: 1234');
    }
  };

  const handleOfficerSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authService.loginOfficer(email, password);
      setLoading(false);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid officer credentials');
    }
  };

  const handleQuickDemo = (roleType) => {
    const user = authService.loginDemo(roleType);
    onAuthSuccess(user);
    onClose();
  };

  const handleListenHelp = () => {
    const text = lang === 'mr' 
      ? 'मत्स्यसेतू केवायसी व सुरक्षा पडताळणी. कृपया आपले नाव, मोबाईल नंबर व नौका नोंदणी क्रमांक भरा. पडताळणीनंतर एसएमएस ओटीपी १२३४ टाका.'
      : lang === 'hi'
        ? 'मत्स्यसेतु केवाईसी और सुरक्षा सत्यापन। अपना मोबाइल नंबर और नौका पंजीकरण दर्ज करें। इसके बाद ओटीपी १२३४ दर्ज करें।'
        : 'MatsyaSetu KYC and Anti-Bot verification. Enter your mobile number, boat ID and security check to receive your OTP.';
    speechService.speak(text, lang);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      <div className="bg-slate-950 border-2 border-cyan-500/50 rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl shadow-cyan-950/80 relative text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 text-white mb-2.5 shadow-lg shadow-cyan-500/30">
            <Anchor className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
            MatsyaSetu Auth & KYC Portal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified Access for Coastal Fleets & Port Authorities
          </p>

          <button
            onClick={handleListenHelp}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-bold hover:bg-cyan-900 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Instructions (ऑडिओ मदत)</span>
          </button>
        </div>

        {/* Role Sub-Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs mb-4">
          <button
            type="button"
            onClick={() => { setTab('fisherman'); setError(''); setAuthStep('kyc'); }}
            className={`flex-1 py-2 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'fisherman'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fish className="w-4 h-4" />
            <span>Fisherman (मच्छीमार)</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('admin'); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'admin'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Port Authority (अधिकारी)</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ----------------- FISHERMAN MULTI-STEP KYC & OTP LOGIN ----------------- */}
        {tab === 'fisherman' ? (
          <div>
            
            {/* STEP 1: Full Name + Phone + Vessel KYC + Anti-Bot Challenge */}
            {authStep === 'kyc' ? (
              <form onSubmit={handleKycSubmit} className="space-y-3.5">
                
                {/* Step indicator */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Step 1 of 2: KYC & Anti-Bot Check</span>
                  </span>
                  <span className="text-[11px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
                    Mandatory KYC
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Fisherman Full Name (मच्छीमाराचे नाव):
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ramesh Koli"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mobile Number (मोबाईल नंबर):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">+91</span>
                    <input
                      type="tel"
                      maxLength="10"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl pl-11 pr-3 py-2.5 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Vessel ID & Aadhaar KYC Section */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Vessel Registration ID:
                    </label>
                    <input
                      type="text"
                      required
                      value={vesselId}
                      onChange={(e) => setVesselId(e.target.value)}
                      placeholder="IND-MH-892"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2.5 font-mono uppercase focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Aadhaar Last 4 Digits:
                    </label>
                    <input
                      type="text"
                      maxLength="4"
                      required
                      value={aadhaarLast4}
                      onChange={(e) => setAadhaarLast4(e.target.value)}
                      placeholder="8921"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2.5 font-mono text-center focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Anti-Bot Security Math Challenge */}
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-extrabold text-cyan-300 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Anti-Bot Verification Check:</span>
                    </span>
                    <button
                      type="button"
                      onClick={generateNewCaptcha}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-700 font-mono font-black text-sm text-amber-300">
                      {captchaNum1} + {captchaNum2} = ?
                    </div>
                    <input
                      type="number"
                      required
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Answer"
                      className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono font-bold focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying KYC...' : 'Verify KYC & Send OTP (ओटीपी पाठवा)'}</span>
                </button>

                {/* 1-Tap Demo Quick Action */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('fisherman')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>⚡ 1-Tap Demo Fisherman (Ramesh Koli)</span>
                  </button>
                </div>

              </form>
            ) : (
              /* STEP 2: OTP Entry (ONLY SHOWN AFTER KYC IS VALIDATED) */
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
                
                <div className="p-3.5 bg-emerald-950/80 rounded-2xl border border-emerald-500/60 text-emerald-300 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>KYC & Anti-Bot Check Passed!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200 mt-1">
                    4-Digit One-Time Password (OTP) dispatched to <strong>+91 {phone}</strong>
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Enter 4-Digit Security OTP:
                    </label>
                    <span className="text-[11px] text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                      Demo OTP: 1234
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength="4"
                    autoFocus
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-slate-900 border-2 border-cyan-500 text-cyan-300 text-center text-2xl tracking-[0.4em] rounded-2xl py-3 font-mono font-black shadow-lg shadow-cyan-500/20 focus:ring-4 focus:ring-cyan-500/40 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('kyc')}
                    className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Verifying...' : 'Verify OTP & Log In (प्रवेश करा)'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        ) : (
          /* ----------------- COASTAL AUTHORITY LOGIN TAB ----------------- */
          <form onSubmit={handleOfficerSubmit} className="space-y-4">
            
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Official Email (शासकीय ईमेल):
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@incois.gov.in"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Password (पासवर्ड):
                </label>
                <span className="text-[11px] text-amber-400 font-bold">
                  Demo: officer123
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Access Authority Portal (अधिकारी प्रवेश)'}
            </button>

            {/* 1-Tap Demo Quick Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('officer')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>⚡ 1-Tap Demo Officer Login (Capt. Arvind Sharma)</span>
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
}
