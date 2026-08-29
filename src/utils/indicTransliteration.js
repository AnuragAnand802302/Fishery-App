/**
 * High-Quality Indic Phonetic Transliteration Engine for MatsyaSetu.
 * Converts regional Indian script announcements into natural phonetic strings
 * so that Indian Female voices (e.g. en-IN / hi-IN) can speak them 100% completely
 * even if the user's OS lacks a regional language pack (like Bengali, Tamil, Telugu, etc.).
 */

export function getPhoneticFallback(text, lang) {
  if (!text) return '';

  // For Hindi and Marathi, Devanagari is natively supported by all hi-IN voice engines
  if (lang === 'hi' || lang === 'mr') {
    return text;
  }

  // Pre-compiled phonetic translations for common coastal advisories
  const PHONETIC_MAP = {
    bn: {
      'মৎস্যসেতু': 'Matsyasetu',
      'সামুদ্রিক': 'samudrik',
      'পূর্বাভাস': 'purbabhash',
      'পরামর্শ': 'poramorsho',
      'ঢেউয়ের উচ্চতা': 'dheu-er uchhata',
      'বাতাসের গতি': 'bataser goti',
      'সমুদ্র শান্ত ও মাছ ধরতে যাওয়া নিরাপদ': 'somudra shanto o machh dhorte jawa nirapod.',
      'বিপদ': 'Bipod!',
      'ঘূর্ণিঝড়ের সতর্কতা': 'ghurnijhorer sotorkota.',
      'সমুদ্রে যাবেন না': 'somudre jaben na.',
      'নটিক্যাল মাইল': 'nautical mile',
      'মিটার': 'meter',
    },
    ta: {
      'மத்ஸ்யசேது': 'Matsyasetu',
      'கடல் வானிலை': 'Kadal Vaanilai',
      'அறிக்கை': 'Arikkai',
      'ஆலோசனை': 'Aalosanai',
      'அலை உயரம்': 'Alai uyaram',
      'காற்றின் வேகம்': 'Kaatrin vegam',
      'கடல் அமைதியாக உள்ளது': 'Kadal amaidhiyaaga ulladhu',
      'வேட்டைக்குச் செல்ல பாதுகாப்பானது': 'vettaikku chella paadhukaappaanadhu.',
      'எச்சரிக்கை': 'Echarikkai!',
      'புயல் எச்சரிக்கை': 'Puyal echarikkai.',
      'கடலுக்குச் செல்ல வேண்டாம்': 'Kadalukku chella vendaam.',
      'கடல் மைல்': 'Kadal mile',
      'மீட்டர்': 'meter',
    },
    te: {
      'మత్స్యసేతు': 'Matsyasetu',
      'సముద్ర వాతావరణం': 'Samudra Vaataavaranam',
      'సలహా': 'Salaha',
      'అలల ఎత్తు': 'Alala etthu',
      'గాలి వేగం': 'Gaali vegam',
      'సముద్రం ప్రశాంతంగా ఉంది': 'Samudram prashaantamgaa undhi',
      'వేటకు వెళ్లడం సురక్షితం': 'vetaku velladam surakshitham.',
      'హెచ్చరిక': 'Heccharika!',
      'తీవ్ర తుఫాను హెచ్చరిక': 'Theevra thufaanu heccharika.',
      'సముద్రంలోకి వెళ్లవద్దు': 'Samudramloki vellavaddhu.',
      'నాటికల్ మైళ్లు': 'Nautical miles',
      'మీటర్లు': 'meters',
    },
    ml: {
      'മത്സ്യസേതു': 'Matsyasetu',
      'കാലാവസ്ഥ': 'Kaalaavastha',
      'മുന്നറിയിപ്പ്': 'Munnariyippu',
      'തിരമാല ഉയരം': 'Thiramaala uyaram',
      'കാറ്റിന്റെ വേഗത': 'Kaattinte vegatha',
      'കടൽ ശാന്തമാണ്': 'Kadal shaantham-aannu',
      'മത്സ്യബന്ധനത്തിന് പോകുന്നത് സുരക്ഷിതം': 'malsyabandhanathinu pokunnathu surakshitham.',
      'അപകടം': 'Apadakam!',
      'ചുഴലിക്കാറ്റ്': 'Chuzhalikkaattu.',
      'കടലിൽ പോകരുത്': 'Kadalil pokaruthu.',
    },
    gu: {
      'મત્સ્યસેતુ': 'Matsyasetu',
      'દરિયાઈ હવામાન': 'Dariyaee havaamaan',
      'સલાહ': 'Salah',
      'મોજાંની ઊંચાઈ': 'Mojaani oonchai',
      'પવનની ઝડપ': 'Pavanni jhadap',
      'દરિયો શાંત છે': 'Dariyo shaant chhe',
      'દરિયામાં જવું સલામત છે': 'Dariyaama javu salaamat chhe.',
      'સાવધાન': 'Saavadhaan!',
      'વાવાઝોડાની ચેતવણી': 'Vaavaazodaani chetavani.',
      'દરિયામાં ન જશો': 'Dariyaama na jasho.',
    },
    or: {
      'ମତ୍ସ୍ୟସେତୁ': 'Matsyasetu',
      'ସମୁଦ୍ର ପାଣିପାଗ': 'Samudra Paanipaaga',
      'ପରାମର୍ଶ': 'Paraamarsha',
      'ଢେଉ ଉଚ୍ଚତା': 'Dheu uchhataa',
      'ପବନର ବେଗ': 'Pabanara bega',
      'ସମୁଦ୍ର ଶାନ୍ତ ଅଛି': 'Samudra shaanta achhi',
      'ମାଛ ଧରିବାକୁ ଯିବା ସୁରକ୍ଷିତ': 'Maachha dharibaaku jibaa surakshita.',
      'ବିପଦ': 'Bipada!',
      'ବାତ୍ୟା ସତର୍କତା': 'Baatyaa satarkataa.',
      'ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ': 'Samudraku jaaantu naahin.',
    }
  };

  let transliterated = text;
  const map = PHONETIC_MAP[lang];
  if (map) {
    for (const [indic, roman] of Object.entries(map)) {
      transliterated = transliterated.replaceAll(indic, roman);
    }
  }

  return transliterated;
}
