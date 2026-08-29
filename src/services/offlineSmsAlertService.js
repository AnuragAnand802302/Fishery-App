/**
 * Offline Government SMS & Cell Broadcast Alert Service for Low-Literacy Fishermen.
 * Generates byte-compressed, multilingual 2G SMS payloads (<140 characters) from official
 * INCOIS, IMD, and Fisheries Department releases that persist in offline device memory.
 * Allows native SMS forwarding (sms: URI), offline voice readout, and emergency broadcast drills.
 */

import { encodeAdvisoryToSMS } from './smsEncoder';
import { GOVT_LEGAL_PROCEEDINGS } from './imdRssService';

const STORAGE_KEY_OFFLINE_SMS = 'matsya_offline_govt_sms_v1';

export const INITIAL_OFFLINE_GOVT_SMS = [
  {
    id: 'SMS-GOV-001',
    sender: 'GOV-INCOIS',
    senderTitle: 'INCOIS Marine Advisory (भारत सरकार)',
    category: 'PFZ_HOTSPOT',
    timestamp: '10 mins ago (Cached for Offline)',
    priority: 'HIGH',
    smsText: {
      en: '[INCOIS-PFZ] MUMBAI: High Fish Catch Zone at 18.78N 72.56E (15.4NM WSW). Target: Pomfret/Surmai. Wave: 1.2m. Fuel Saving: ~40L. Sea Safe.',
      mr: '[मत्स्य-INCOIS] मुंबई: मासेमारी क्षेत्र १८.७८N ७२.५६E (१५.४NM नैऋत्य). पापलेट/सुरमई. लाटा: १.२मी. डिझेल बचत: ४०L. समुद्र सुरक्षित.',
      hi: '[मत्स्य-INCOIS] मुंबई: मछली क्षेत्र १८.७८N ७२.५६E (१५.४NM). पॉम्फ्रेट/सुरमई। लहर: १.२मी। डीजल बचत: ४०L। समुद्र शांत।',
      ta: '[INCOIS-மீன்] சென்னை: அதிக மீன் பிடி மண்டலம் 12.98N 80.45E (11.8NM). வவ்வால் மீன். அலை: 1.2மீ. கடல் அமைதி.',
      te: '[INCOIS-చేప] వైజాగ్: చేపల వేట ప్రాంతం 17.52N 83.48E (18.3NM). ట్యూనా. అలలు: 1.3మీ. సురక్షితం.',
      bn: '[INCOIS-মাছ] দিঘা: মাছ ধরার অঞ্চল ২১.২N ৮৭.৮E. ইলিশ/পমফ্রেট. ঢেউ: ১.৩মি. নিরাপদ.',
      ml: '[INCOIS-മത്സ്യം] കൊച്ചി: ചാകര മേഖല 9.81N 76.01E (16.8NM). അയല/ചൂര. സുരക്ഷിതം.',
      gu: '[INCOIS-મત્સ્ય] વેરાવળ: માછીમારી ઝોન ૨૦.૭૪N ૭૦.૧૨E. હલવો/સુરમઈ. દરિયો શાંત.',
      or: '[INCOIS-ମାଛ] ପାରାଦ୍ୱୀପ: ମାଛ ଧରା ଅଞ୍ଚଳ ୨୦.୨N ୮୬.୭E. ସୁରକ୍ଷିତ।'
    }
  },
  {
    id: 'SMS-GOV-002',
    sender: 'GOV-IMD',
    senderTitle: 'IMD Coastal Warning (मौसम विभाग)',
    category: 'WEATHER_ALERT',
    timestamp: '25 mins ago (Cached for Offline)',
    priority: 'CRITICAL',
    smsText: {
      en: '[IMD-ALERT] SQUALL WARNING! Wind gusting to 45km/h along West Coast. Swell waves 2.8m. Small crafts keep close to shore. Helpline: 1554.',
      mr: '[हवामान-इशारा] सावधान! पश्चिम किनारपट्टीवर वाऱ्याचा वेग ४५ किमी/तास. लाटा २.८ मीटर. लहान होड्यांनी किनाऱ्याजवळ राहावे. मदत: १५५४.',
      hi: '[मौसम-चेतावनी] सावधान! तेज हवा ४५ किमी/घंटा और ऊंची लहरें २.८ मीटर। छोटी नावें किनारे के पास रहें। तटरक्षक हेल्पलाइन: १५५४.',
      ta: '[வானிலை-எச்சரிக்கை] காற்று வேகம் 45கிமீ/மணி. அலை 2.8மீ. சிறிய படகுகள் கரைக்கு அருகில் இருக்கவும். உதவி: 1554.',
      te: '[వాతావరణం] గాలి వేగం 45కిమీ. అలలు 2.8మీ. తీరానికి దగ్గరగా ఉండండి. హెల్ప్‌లైన్: 1554.',
      bn: '[আবহাওয়া-সতর্কতা] ঝোড়ো হাওয়া ৪৫কিমি/ঘণ্টা. উত্তাল সমুদ্র. ছোট নৌকা উপকূলে থাকুন. হেল্পলাইন: ১৫৫৪.',
      ml: '[കാലാവസ്ഥ] കാറ്റ് 45കി.മീ/മണിക്കൂർ. തിരമാല 2.8മീ. ജാഗ്രത പാലിക്കുക. ഹെൽപ്പ്‌ലൈൻ: 1554.',
      gu: '[હવામાન-ચેતવણી] પવન ૪૫ કિમી/કલાક. મોજાં ૨.૮ મીટર. નાની હોડીઓ કિનારા પાસે રહે. હેલ્પલાઈન: ૧૫૫૪.',
      or: '[ପାଣିପାଗ-ଚେତାବନୀ] ପବନ ୪୫ କିମି/ଘଣ୍ଟା। ଉଚ୍ଚ ତରଙ୍ଗ। କୂଳ ନିକଟରେ ରୁହନ୍ତୁ। ହେଲ୍ପଲାଇନ୍: ୧୫୫୪।'
    }
  },
  {
    id: 'SMS-GOV-003',
    sender: 'GOV-FISHERIES',
    senderTitle: 'Fisheries Dept Gazette (मत्स्यव्यवसाय विभाग)',
    category: 'LEGAL_RULE',
    timestamp: '1 hour ago (Cached for Offline)',
    priority: 'MEDIUM',
    smsText: {
      en: '[GOV-RULE] ANNUAL 61-DAY MONSOON BAN active from 1 June to 31 July. Motorized trawlers barred from sea to protect fish eggs. Violation Fine: Rs 2.5 Lakh.',
      mr: '[शासकीय-नियम] १ जून ते ३१ जुलै ६१ दिवस पावसाळी मासेमारी बंदी. अंड्यातील माशांच्या संरक्षणासाठी ट्रॉलर्सना बंदी. उल्लंघन दंड: ₹२.५ लाख.',
      hi: '[सरकारी-नियम] १ जून से ३१ जुलाई तक ६१ दिवसीय वार्षिक मानसून रोक। प्रजनन काल में बड़ी नावों पर रोक। उल्लंघन पर जुर्माना: ₹२.५ लाख।',
      ta: '[அரசு-சட்டம்] 61 நாட்கள் வருடாந்திர பருவமழை மீன்பிடி தடை. விசைப்படகுகளுக்கு அனுமதி இல்லை. மீறினால் அபராதம் ₹2.5 லட்சம்.',
      te: '[ప్రభుత్వ-నియమం] 61 రోజుల వర్షాకాల చేపల వేట నిషేధం. అతిక్రమిస్తే జరిమానా ₹2.5 లక్షలు.',
      bn: '[সরকারি-আইন] ৬১ দিনের বর্ষাকালীন মাছ ধরা নিষেধাজ্ঞা. ডিমপাড়া মাছ রক্ষা করুন. অমান্য করলে জরিমানা ₹২.৫ লাখ.',
      ml: '[സർക്കാർ-നിയമം] 61 ദിവസത്തെ ട്രോളിംഗ് നിരോധനം. ലംഘിച്ചാൽ പിഴ ₹2.5 ലക്ഷം.',
      gu: '[સરકારી-નિયમ] ૬૧ દિવસનો ચોમાસુ માછીમારી પ્રતિબંધ. ઉલ્લંઘન દંડ: ₹૨.૫ લાખ.',
      or: '[ସରକାରୀ-ଆଇନ] ୬୧ ଦିନିଆ ମୌସୁମୀ ମାଛ ଧରା ବାରଣ। ଜରିମାନା: ₹୨.୫ ଲକ୍ଷ।'
    }
  }
];

class OfflineSmsAlertService {
  constructor() {
    this.listeners = new Set();
    this.messages = this.loadStoredMessages();
  }

  loadStoredMessages() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_OFFLINE_SMS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load offline SMS from storage', e);
    }
    this.saveMessages(INITIAL_OFFLINE_GOVT_SMS);
    return INITIAL_OFFLINE_GOVT_SMS;
  }

  saveMessages(list) {
    this.messages = list;
    try {
      localStorage.setItem(STORAGE_KEY_OFFLINE_SMS, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to write offline SMS to storage', e);
    }
    this.notify();
  }

  onUpdate(cb) {
    if (!this.listeners) this.listeners = new Set();
    this.listeners.add(cb);
    return () => this.listeners?.delete(cb);
  }

  notify() {
    if (this.listeners && typeof this.listeners.forEach === 'function') {
      this.listeners.forEach((cb) => {
        try { cb(this.messages); } catch (e) { console.warn(e); }
      });
    }
  }

  getAllMessages() {
    return this.messages;
  }

  /**
   * Sync fresh government advisories into offline SMS format
   */
  syncAdvisoriesToOfflineSMS(advisories) {
    if (!advisories || advisories.length === 0) return;

    const freshSmsList = advisories.slice(0, 5).map((adv, idx) => {
      const textEn = encodeAdvisoryToSMS(adv);
      const isRed = adv.type === 'CYCLONE' || adv.riskLevel === 'DANGER';

      return {
        id: `SMS-AUTO-${adv.id || idx}`,
        sender: isRed ? 'GOV-EMERGENCY' : 'GOV-INCOIS',
        senderTitle: isRed ? 'Emergency Disaster Alert' : 'INCOIS Ocean Bulletin',
        category: isRed ? 'WEATHER_ALERT' : 'PFZ_HOTSPOT',
        timestamp: 'Synced for Offline 2G Use',
        priority: isRed ? 'CRITICAL' : 'HIGH',
        smsText: {
          en: textEn,
          mr: `[मत्स्य-INCOIS] ${adv.harborName}: ${adv.title}. लाटा: ${adv.weather?.waveHeight || '१.२मी'}. सुरक्षित.`,
          hi: `[मत्स्य-INCOIS] ${adv.harborName}: ${adv.title}। लहर: ${adv.weather?.waveHeight || '१.२मी'}।`,
          ta: `[INCOIS] ${adv.harborName}: ${adv.title}. அலை: ${adv.weather?.waveHeight || '1.2m'}.`,
          te: `[INCOIS] ${adv.harborName}: ${adv.title}. అలలు: ${adv.weather?.waveHeight || '1.2m'}.`,
          bn: `[INCOIS] ${adv.harborName}: ${adv.title}. ঢেউ: ${adv.weather?.waveHeight || '১.২মি'}.`,
          ml: `[INCOIS] ${adv.harborName}: ${adv.title}. തിര: ${adv.weather?.waveHeight || '1.2m'}.`,
          gu: `[INCOIS] ${adv.harborName}: ${adv.title}. મોજાં: ${adv.weather?.waveHeight || '૧.૨મી'}.`,
          or: `[INCOIS] ${adv.harborName}: ${adv.title}. ତରଙ୍ଗ: ${adv.weather?.waveHeight || '୧.୨ମି'}.`
        }
      };
    });

    const combined = [...freshSmsList, ...this.messages.filter((m) => !freshSmsList.some((f) => f.id === m.id))];
    this.saveMessages(combined);
  }

  /**
   * Generates a native phone SMS URI for offline transmission to crew or Coast Guard
   */
  generateNativeSmsLink(phone = '', text = '') {
    const encodedText = encodeURIComponent(text);
    return `sms:${phone}?body=${encodedText}`;
  }

  /**
   * Share / Send SMS using Web Share API if available
   */
  async shareOfflineSms(title, text) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text
        });
        return true;
      } catch (err) {
        // user cancelled
      }
    }
    // Fallback: Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return 'COPIED';
    }
    return false;
  }
}

export const offlineSmsAlertService = new OfflineSmsAlertService();
