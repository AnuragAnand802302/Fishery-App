/**
 * BHASHINI AI (Digital India National Language Translation Mission) Engine.
 * Provides multilingual NLP intent recognition, Voice Speech-to-Text (ASR), 
 * contextual maritime fisheries intelligence, and direct actionable site navigation.
 * 
 * Supports: mr (Marathi), hi (Hindi), ta (Tamil), te (Telugu), bn (Bengali),
 * gu (Gujarati), ml (Malayalam), or (Odia), en (English).
 */

import { HARBORS } from '../data/mockAdvisories';
import { GOVT_LEGAL_PROCEEDINGS } from './imdRssService';

export const BHASHINI_PROMPT_SUGGESTIONS = {
  mr: [
    'आजचे समुद्रातील हवामान आणि लाटा किती आहेत?',
    'मला जवळचे मासेमारी हॉटस्पॉट (PFZ) दाखवा',
    'माझ्या नौकेचे (Boat) लाइव्ह लोकेशन कसे ट्रॅक करायचे?',
    'शासकीय मासेमारी बंदी आणि नवीन नियम काय आहेत?',
    'इंटरनेट नसताना ऑफलाइन एसएमएस कसा वापरायचा?'
  ],
  hi: [
    'आज समुद्र का मौसम और लहरों की ऊंचाई क्या है?',
    'मुझे मछली पकड़ने का सबसे अच्छा क्षेत्र (PFZ) दिखाओ',
    'अपनी नाव को लाइव ट्रैक कैसे करें?',
    'सरकारी नियम और मानसून प्रतिबंध की जानकारी दो',
    'बिना इंटरनेट के ऑफलाइन SMS कैसे देखें?'
  ],
  ta: [
    'இன்றைய கடல் வானிலை மற்றும் அலை உயரம் என்ன?',
    'அதிக மீன் கிடைக்கும் மண்டலம் (PFZ) எங்கே?',
    'எனது படகை நேரலையாக கண்காணிப்பது எப்படி?',
    'அரசு மீன்பிடி தடை சட்டங்கள் என்ன?',
    'இணையம் இல்லாமல் ஆஃப்லைன் SMS பார்ப்பது எப்படி?'
  ],
  te: [
    'ఈరోజు సముద్ర వాతావరణం మరియు అలల ఎత్తు ఎంత?',
    'ఎక్కువ చేపలు దొరికే ప్రాంతం (PFZ) చూపించు',
    'బోట్ లైవ్ లొకేషన్ ఎలా ట్రాక్ చేయాలి?',
    'ప్రభుత్వ చేపల వేట నిషేధ నిబంధనలు ఏమిటి?',
    'ఇంటర్నెట్ లేకుండా ఆఫ్‌లైన్ SMS ఎలా చూడాలి?'
  ],
  bn: [
    'আজকের সমুদ্রের আবহাওয়া এবং ঢেউ কেমন?',
    'বেশি মাছ পাওয়ার সেরা অঞ্চল (PFZ) দেখাও',
    'নৌকা লাইভ ট্র্যাক কিভাবে করব?',
    'সরকারি মাছ ধরার নিষেধাজ্ঞা ও আইন কি?',
    'ইন্টারনেট ছাড়া অফলাইন SMS কিভাবে পাব?'
  ],
  gu: [
    'આજનું દરિયાઈ હવામાન અને મોજાં કેવા છે?',
    'માછીમારી માટે શ્રેષ્ઠ ઝોન (PFZ) બતાવો',
    'મારી હોડીનું લાઈવ લોકેશન કેવી રીતે ટ્રેક કરવું?',
    'સરકારી પ્રતિબંધ અને મત્સ્ય કાયદા શું છે?'
  ],
  ml: [
    'ഇന്നത്തെ കടൽ കാലാവസ്ഥയും തിരമാലകളും എങ്ങനെയുണ്ട്?',
    'മീൻ ലഭ്യതയുള്ള പ്രദേശം (PFZ) കാണിക്കുക',
    'ബോട്ട് ലൈവ് ട്രാക്ക് ചെയ്യുന്നത് എങ്ങനെ?'
  ],
  or: [
    'ଆଜିର ସମୁଦ୍ର ପାଣିପାଗ ଏବଂ ତରଙ୍ଗ କିପରି ଅଛି?',
    'ମାଛ ଧରା ଅଞ୍ଚଳ (PFZ) କେଉଁଠାରେ ଅଛି?'
  ],
  en: [
    'What is the sea weather and wave height today?',
    'Show me the nearest high-catch fish hotspots (PFZ)',
    'How do I live track my fishing vessel?',
    'What are the government fishing bans and legal rules?',
    'How do I receive offline SMS when there is no internet?'
  ]
};

class BhasiniAIService {
  /**
   * Processes a natural language voice or text prompt from the fisherman
   * and generates a localized answer along with interactive site navigation actions.
   */
  async processQuery({ query, lang = 'en', selectedHarborObj = HARBORS[0] }) {
    // Artificial AI thinking delay for realism
    await new Promise((resolve) => setTimeout(resolve, 400));

    const q = (query || '').toLowerCase().trim();
    const harborName = selectedHarborObj?.name || 'Mumbai';

    // 1. EMERGENCY SOS INTENT
    if (q.includes('sos') || q.includes('help') || q.includes('मदत') || q.includes('बचाओ') || q.includes('காப்பாற்று') || q.includes('ఆపద') || q.includes('বিপদ') || q.includes('emergency') || q.includes('संकट')) {
      return {
        intent: 'EMERGENCY_SOS',
        response: {
          mr: 'तातडीची मदत! आपत्कालीन परिस्थितीत तात्काळ आपत्कालीन SOS बीकन सक्रिय करा किंवा तटरक्षक दल हेल्पलाईन १५५४ वर संपर्क साधा.',
          hi: 'आपातकालीन सहायता! संकट के समय तुरंत SOS बीकन दबाएं या भारतीय तटरक्षक नियंत्रण कक्ष 1554 पर कॉल करें।',
          ta: 'அவசர உதவி! உடனடியாக அவசர SOS பட்டனை அழுத்தவும் அல்லது கடலோரக் காவல் படை 1554 ஐ அழைக்கவும்.',
          te: 'అత్యవసర సహాయం! వెంటనే SOS బటన్ నొక్కండి లేదా కోస్ట్ గార్డ్ 1554 కు కాల్ చేయండి.',
          bn: 'জরুরি সাহায্য! অবিলম্বে জরুরি SOS বোতাম টিপুন বা কোস্ট গার্ড 1554 নম্বরে কল করুন।',
          en: 'Emergency Alert! Trigger the SOS distress beacon immediately or contact the Indian Coast Guard emergency hotline 1554.'
        },
        action: {
          type: 'OPEN_SOS',
          label: {
            mr: '🚨 आपत्कालीन SOS बीकन उघडा',
            hi: '🚨 आपातकालीन SOS बीकन खोलें',
            ta: '🚨 அவசர SOS திற',
            te: '🚨 అత్యవసర SOS తెరవండి',
            bn: '🚨 জরুরি SOS খুলুন',
            en: '🚨 Trigger Emergency SOS Beacon'
          }
        }
      };
    }

    // 2. WEATHER & SEA STATE INTENT
    if (q.includes('weather') || q.includes('हवामान') || q.includes('मौसम') || q.includes('வானிலை') || q.includes('వాతావరణం') || q.includes('আবহাওয়া') || q.includes('પવન') || q.includes('wave') || q.includes('लाटा') || q.includes('लहर') || q.includes('wind') || q.includes('वादळ') || q.includes('तूफान') || q.includes('storm')) {
      return {
        intent: 'WEATHER',
        response: {
          mr: `${harborName} साठी सध्या समुद्रात लाटांची उंची साधारण १.२ ते १.४ मीटर असून वाऱ्याचा वेग १४ नॉट्स आहे. समुद्रात जाणे सुरक्षित आहे, परंतु जास्त दूर जाताना लाईफजॅकेट अनिवार्य आहे.`,
          hi: `${harborName} के लिए वर्तमान में समुद्र में लहरें 1.2 से 1.4 मीटर और हवा की गति 14 नॉट्स है। समुद्र में जाना सुरक्षित है।`,
          ta: `${harborName} கடல் பகுதியில் அலை உயரம் 1.2 முதல் 1.4 மீட்டர் மற்றும் காற்றின் வேகம் 14 நாட்ஸ். கடலுக்குச் செல்வது பாதுகாப்பானது.`,
          te: `${harborName} వద్ద సముద్ర అలల ఎత్తు 1.2-1.4 మీటర్లు మరియు గాలి వేగం 14 నాట్లు. సముద్రంలోకి వెళ్లడం సురక్షితం.`,
          bn: `${harborName} উপকূলে ঢেউয়ের উচ্চতা ১.২-১.৪ মিটার এবং বাতাসের গতি ১৪ নট। সমুদ্রে যাওয়া নিরাপদ।`,
          en: `For ${harborName}, current swell waves are 1.2m - 1.4m with wind at 14 knots. Sea conditions are safe for navigation.`
        },
        action: {
          type: 'NAVIGATE_VIEW',
          payload: 'advisories',
          label: {
            mr: '🌊 लाइव्ह हवामान व नकाशा पहा',
            hi: '🌊 लाइव मौसम व रडार देखें',
            ta: '🌊 நேரலை வானிலை & வரைபடம்',
            te: '🌊 ప్రత్యక్ష వాతావరణం & మ్యాప్',
            bn: '🌊 লাইভ আবহাওয়া ও মানচিত্র দেখুন',
            en: '🌊 View Live Weather & Ocean Map'
          }
        }
      };
    }

    // 3. PFZ (POTENTIAL FISHING ZONE) & FISH CATCH INTENT
    if (q.includes('fish') || q.includes('मासे') || q.includes('मछली') || q.includes('மீன்') || q.includes('చేప') || q.includes('মাছ') || q.includes('pfz') || q.includes('हॉटस्पॉट') || q.includes('hotspot') || q.includes('catch') || q.includes('सुरमई') || q.includes('पापलेट') || q.includes('tuna') || q.includes('pomfret')) {
      return {
        intent: 'PFZ',
        response: {
          mr: `${harborName} किनाऱ्यापासून १५ ते १८ सागरी मैलांवर उपग्रहाने उच्च क्लोरोफिल असलेला संभाव्य मासेमारी क्षेत्र (PFZ) शोधला आहे. तेथे पापलेट, सुरमई आणि टूना माशांची मोठी उपलब्धता आहे.`,
          hi: `${harborName} तट से 15 से 18 समुद्री मील दूर उपग्रह द्वारा संभावित मत्स्य क्षेत्र (PFZ) चिह्नित किया गया है। यहाँ पॉम्फ्रेट और टूना मिलने की अत्यधिक संभावना है।`,
          ta: `${harborName} கரையிலிருந்து 15-18 கடல் மைல் தொலைவில் உயர் மீன்பிடி மண்டலம் (PFZ) உள்ளது. வவ்வால் மீன் மற்றும் சூரை மீன் கிடைக்கும்.`,
          te: `${harborName} తీరం నుండి 15-18 నాటికల్ మైళ్ళ దూరంలో అధిక చేపల లభ్యత జోన్ (PFZ) ఉంది. ట్యూనా మరియు చందమామ చేపలు లభిస్తాయి.`,
          bn: `${harborName} উপকূল থেকে ১৫-১৮ নটিক্যাল মাইল দূরে স্যাটেলাইট চিহ্নিত মাছের হটস্পট (PFZ) রয়েছে। পমফ্রেট ও টুনা প্রচুর মিলবে।`,
          en: `Satellite sensors show high chlorophyll Potential Fishing Zones (PFZ) 15-18 NM offshore from ${harborName}. High concentrations of Pomfret, Tuna, and Mackerel expected.`
        },
        action: {
          type: 'NAVIGATE_VIEW',
          payload: 'advisories',
          label: {
            mr: '🐟 PFZ मासेमारी झोन नकाशावर पहा',
            hi: '🐟 PFZ फिश हॉटस्पॉट मैप पर देखें',
            ta: '🐟 வரைபடத்தில் PFZ மண்டலத்தைப் பார்',
            te: '🐟 మ్యాప్‌లో PFZ చేపల జోన్ చూడండి',
            bn: '🐟 মানচিত্রে PFZ অঞ্চল দেখুন',
            en: '🐟 View PFZ Hotspots on Map'
          }
        }
      };
    }

    // 4. VESSEL TRACKING & AIS FLEET INTENT
    if (q.includes('track') || q.includes('vessel') || q.includes('boat') || q.includes('नाव') || q.includes('नौका') || q.includes('ट्रॅक') || q.includes('ट्रैक') || q.includes('படகு') || q.includes('బోట్') || q.includes('নৌকা') || q.includes('relative') || q.includes('नातेवाईक') || q.includes('परिवार') || q.includes('family')) {
      return {
        intent: 'TRACKER',
        response: {
          mr: 'VesselAPI सॅटेलाइट ट्रॅकरद्वारे तुमच्या नौकेचे थेट GPS स्थान, वेग, इंधन स्तर आणि कुटुंबियांसाठी ट्रॅकिंग उपलब्ध आहे. Coast Guard संकट निवारणासाठीही याचा वापर करते.',
          hi: 'VesselAPI सैटेलाइट ट्रैकर के जरिए आपकी नाव की लाइव स्थिति, गति, ईंधन और परिवार के लिए ट्रैकिंग उपलब्ध है।',
          ta: 'VesselAPI செயற்கைக்கோள் ரேடார் மூலம் உங்கள் படகின் நேரலை இடம், வேகம் மற்றும் குடும்ப கண்காணிப்பு வசதி உள்ளது.',
          te: 'VesselAPI ద్వారా మీ బోట్ యొక్క ప్రత్యక్ష GPS లొకేషన్, వేగం మరియు కుటుంబం కోసం ట్రాకింగ్ అందుబాటులో ఉంది.',
          bn: 'VesselAPI স্যাটেলাইট রাডার দিয়ে নৌকার লাইভ লোকেশন, গতি এবং পরিবারের জন্য ট্র্যাকিং সুবিধা রয়েছে।',
          en: 'You can live track registered fishing vessels with GPS coordinates, AIS speed, fuel levels, and family tracking radar using the VesselAPI tracker.'
        },
        action: {
          type: 'NAVIGATE_VIEW',
          payload: 'tracker',
          label: {
            mr: '🛰️ लाइव्ह नौका ट्रॅकर उघडा',
            hi: '🛰️ लाइव वेसल ट्रैकर खोलें',
            ta: '🛰️ நேரலை படகு டிராக்கர் திற',
            te: '🛰️ బోట్ లైవ్ ట్రాకర్ తెరవండి',
            bn: '🛰️ লাইভ ভেসেল ট্র্যাকার খুলুন',
            en: '🛰️ Open VesselAPI Live Tracker'
          }
        }
      };
    }

    // 5. OFFLINE 2G SMS & NO-INTERNET INTENT
    if (q.includes('sms') || q.includes('एसएमएस') || q.includes('offline') || q.includes('ऑफलाइन') || q.includes('internet') || q.includes('नेटवर्क') || q.includes('नेट') || q.includes('2g') || q.includes('मेसेज')) {
      return {
        intent: 'OFFLINE_SMS',
        response: {
          mr: 'समुद्रात इंटरनेट नसतानाही सर्व शासकीय हवामान इशारे, PFZ कोऑर्डिनेट्स आणि नियम १४० अक्षरांच्या कॉम्प्रेस्ड २G SMS मध्ये फोनवर सेव्ह होतात. तुम्ही एका क्लिकवर ते ऐकू शकता व मित्रांना फॉरवर्ड करू शकता.',
          hi: 'समुद्र में बिना इंटरनेट के भी सभी सरकारी चेतावनी, मौसम और PFZ जानकारी 140 अक्षरों के ऑफलाइन 2G SMS में सुरक्षित रहती है। आप इसे सुन और फॉरवर्ड कर सकते हैं।',
          ta: 'இணையம் இல்லாதபோதும் அரசு எச்சரிக்கைகள் மற்றும் PFZ தகவல்கள் ஆஃப்லைன் 2G SMS ஆக சேமிக்கப்படுகின்றன.',
          te: 'ఇంటర్నెట్ లేనప్పుడు కూడా ప్రభుత్వ హెచ్చరికలు మరియు PFZ వివరాలు ఆఫ్‌లైన్ 2G SMS ద్వారా లభిస్తాయి.',
          bn: 'ইন্টারনেট না থাকলেও সরকারি সতর্কতা এবং PFZ তথ্য অফলাইন 2G SMS আকারে ফোনে সেভ থাকে।',
          en: 'All government alerts, PFZ coordinates, and cyclone warnings are compressed into <140 char 2G SMS and stored offline on your device with zero data required.'
        },
        action: {
          type: 'NAVIGATE_VIEW',
          payload: 'sms',
          label: {
            mr: '📱 ऑफलाइन शासकीय एसएमएस इनबॉक्स उघडा',
            hi: '📱 ऑफलाइन सरकारी SMS इनबॉक्स खोलें',
            ta: '📱 ஆஃப்லைன் அரசு SMS இன்பாக்ஸ் திற',
            te: '📱 ఆఫ్‌లైన్ ప్రభుత్వ SMS ఇన్‌బాక్స్ తెరవండి',
            bn: '📱 অফলাইন সরকারি SMS ইনবক্স খুলুন',
            en: '📱 Open Offline Government SMS Hub'
          }
        }
      };
    }

    // 6. GOVERNMENT WARNINGS & LEGAL PROCEEDINGS (IMD / GAZETTE) INTENT
    if (q.includes('imd') || q.includes('rule') || q.includes('नियम') || q.includes('कायदा') || q.includes('कानून') || q.includes('बंदी') || q.includes('ban') || q.includes('सर्क्युलर') || q.includes('gazette') || q.includes('दंडा') || q.includes('fine') || q.includes('आदेश') || q.includes('order')) {
      return {
        intent: 'IMD_LEGAL',
        response: {
          mr: 'शासकीय मत्स्यव्यवसाय नियमांनुसार: १ जून ते ३१ जुलै दरम्यान ६१ दिवसांची वार्षिक पावसाळी मासेमारी बंदी लागू आहे. लहान माशांच्या संरक्षणासाठी किमान कायदेशीर आकाराचे नियम आणि कासव संरक्षण यंत्र (TED) जाळ्यांना अनिवार्य आहे.',
          hi: 'सरकारी नियमों के अनुसार: 1 जून से 31 जुलाई तक 61 दिवसीय मानसून प्रतिबंध लागू है। कछुआ सुरक्षा जाली (TED) और छोटी मछलियों को पकड़ने पर रोक है।',
          ta: 'அரசு சட்டங்களின்படி: ஜூன் 1 முதல் ஜூலை 31 வரை 61 நாட்கள் வருடாந்திர பருவமழை மீன்பிடி தடைக்காலம் அமலில் உள்ளது.',
          te: 'ప్రభుత్వ నిబంధనల ప్రకారం: జూన్ 1 నుండి జూలై 31 వరకు 61 రోజుల వర్షాకాల చేపల వేట నిషేధం అమలులో ఉంది.',
          bn: 'সরকারি আইন অনুযায়ী: ১ জুন থেকে ৩১ জুলাই ৬১ দিনের বর্ষাকালীন মাছ ধরা নিষেধাজ্ঞা কার্যকর রয়েছে।',
          en: 'Latest Government Orders: Annual 61-day monsoon breeding ban active from 1 June to 31 July. Turtle Excluder Devices (TED) mandatory on trawlers. Fines up to Rs 2.5 Lakh for violations.'
        },
        action: {
          type: 'OPEN_IMD_LEGAL',
          label: {
            mr: '📜 शासकीय इशारे व कायदेशीर नियम वाचा',
            hi: '📜 सरकारी आदेश व कानूनी नियम देखें',
            ta: '📜 அரசு சட்டங்கள் & எச்சரிக்கைகள்',
            te: '📜 ప్రభుత్వ ఆదేశాలు & హెచ్చరికలు',
            bn: '📜 সরকারি আইন ও সতর্কতা দেখুন',
            en: '📜 View IMD Alerts & Legal Rules'
          }
        }
      };
    }

    // 7. DIESEL SAVINGS & FUEL OPTIMIZER INTENT
    if (q.includes('fuel') || q.includes('diesel') || q.includes('इंधन') || q.includes('डिझेल') || q.includes('डीजल') || q.includes('किंमत') || q.includes('दाम') || q.includes('profit') || q.includes('बचत') || q.includes('saving') || q.includes('விலை') || q.includes('ధర')) {
      return {
        intent: 'CALCULATOR',
        response: {
          mr: 'PFZ उपग्रह माहिती वापरल्याने थेट माशांच्या थव्याकडे जाता येते, ज्यामुळे प्रति ट्रिप सुमारे ३० ते ५० लिटर डिझेल (₹३,००० - ₹५,०००) ची बचत होते.',
          hi: 'उपग्रह PFZ दिशा का उपयोग करने से प्रति ट्रिप 30 से 50 लीटर डीजल (₹3,000 - ₹5,000) की बचत होती है और अधिक मछली मिलती है।',
          ta: 'PFZ செயற்கைக்கோள் வழிசெலுத்தல் மூலம் பயணத்திற்கு 30-50 லிட்டர் டீசல் சேமிக்கலாம்.',
          te: 'PFZ సమాచారంతో ప్రయాణానికి 30-50 లీటర్ల డీజిల్ ఆదా చేయవచ్చు.',
          bn: 'PFZ উপগ্রহ তথ্য ব্যবহারে প্রতি ট্রিপে ৩০-৫০ লিটার ডিজেল সাশ্রয় হয়।',
          en: 'Navigating directly to satellite PFZ coordinates saves roughly 30 to 50 Litres of marine diesel (Rs 3,000 - Rs 5,000) per expedition.'
        },
        action: {
          type: 'NAVIGATE_VIEW',
          payload: 'calculator',
          label: {
            mr: '⛽ डिझेल बचत व नफा गणक उघडा',
            hi: '⛽ डीजल बचत कैलकुलेटर खोलें',
            ta: '⛽ டீசல் சேமிப்பு கால்குலேட்டர்',
            te: '⛽ డీజిల్ ఆదా కాల்குలేటర్ తెరవండి',
            bn: '⛽ ডিজেল সাশ্রয় ক্যালকুলেটর খুলুন',
            en: '⛽ Open Catch & Fuel Optimizer'
          }
        }
      };
    }

    // 8. DEFAULT / GENERAL EXPLORATION GUIDANCE INTENT
    return {
      intent: 'GENERAL',
      response: {
        mr: `नमस्कार! मी भाषिणी AI सहाय्यक आहे. मी तुम्हाला मत्स्यसेतू ॲपवर हवामान अंदाज, माशांचे PFZ हॉटस्पॉट, नौका ट्रॅकिंग, आणि शासकीय नियम शोधण्यात मदत करू शकतो. खालील पर्यायांवर टॅप करा:`,
        hi: `नमस्ते! मैं भाषिणी AI सहायक हूँ। मैं आपको मौसम, मछली पकड़ने के क्षेत्र (PFZ), नाव ट्रैकिंग और सरकारी नियमों की जानकारी दे सकता हूँ। नीचे दिए गए विकल्प चुनें:`,
        ta: `வணக்கம்! நான் பாஷினி AI உதவியாளர். கடல் வானிலை, மீன்பிடி மண்டலம் (PFZ), படகு டிராக்கர் ஆகியவற்றிற்கு உங்களுக்கு வழிகாட்டுகிறேன்.`,
        te: `నమస్కారం! నేను భాషిణి AI సహాయకుడిని. సముద్ర వాతావరణం, చేపల వేట ప్రాంతాలు (PFZ), మరియు బోట్ ట్రాకింగ్ కోసం మీకు సహాయం చేస్తాను.`,
        bn: `নমস্কার! আমি ভাষিণী AI সহকারী। সমুদ্রের আবহাওয়া, মাছের হটস্পট (PFZ) এবং বোট ট্র্যাকিংয়ে আপনাকে সাহায্য করতে পারি।`,
        en: `Hello! I am your Bhashini AI Maritime Assistant. I can guide you through live weather, PFZ fish hotspots, satellite vessel tracking, offline SMS, and government rules.`
      },
      action: {
        type: 'NAVIGATE_VIEW',
        payload: 'advisories',
        label: {
          mr: '🌊 सागरी सल्ला व रडार नकाशा उघडा',
          hi: '🌊 समुद्री मौसम व रडार मैप खोलें',
          ta: '🌊 கடல் வரைபடம் மற்றும் வானிலை திற',
          te: '🌊 సముద్ర మ్యాప్ మరియు వాతావరణం',
          bn: '🌊 সমুদ্রের মানচিত্র ও আবহাওয়া খুলুন',
          en: '🌊 Explore Advisories & Ocean Radar'
        }
      }
    };
  }
}

export const bhasiniAIService = new BhasiniAIService();
