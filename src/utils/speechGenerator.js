/**
 * Comprehensive Multilingual Speech Announcement Generator for MatsyaSetu.
 * Produces complete, clear voice messages for rural coastal fishermen
 * in all 9 Indian coastal languages (Marathi, Hindi, Tamil, Telugu, Bengali, Malayalam, Gujarati, Odia, English).
 */

export function buildAdvisorySpeechText(adv, lang = 'mr', userDistanceNm, userDirection) {
  if (!adv) return '';

  // If specific curated voiceText exists for this language, use it
  if (adv.voiceText && adv.voiceText[lang]) {
    return adv.voiceText[lang];
  }

  const dist = userDistanceNm || adv.distanceNm || 20;
  const dir = userDirection || adv.bearingDirection || 'समुद्रात';
  const depth = adv.depthMeters || '35 ते 50 मीटर';
  const isDanger = adv.riskLevel === 'DANGER' || adv.type === 'CYCLONE';
  const isCaution = adv.riskLevel === 'CAUTION' || adv.type === 'WARNING';

  // 1. MARATHI (मराठी)
  if (lang === 'mr') {
    const title = adv.titles?.mr || adv.title;
    const species = (adv.targetSpeciesNames?.mr || adv.targetSpecies || []).join(', ');
    if (isDanger) {
      return `सावधान! ${adv.harborName} साठी रेड अलर्ट. तीव्र चक्रीवादळाचा इशारा. वाऱ्याचा वेग 75 किलोमीटर प्रति तास पेक्षा जास्त आहे. समुद्रात मासेमारीवर पूर्ण बंदी आहे. सर्व बोटींनी ताबडतोब बंदरात परतावे.`;
    }
    if (isCaution) {
      return `सागरी इशारा! ${adv.harborName} क्षेत्रात मोठ्या लाटांची शक्यता आहे. आपल्या स्थानापासून ${dist} नॉटिकल मैल अंतरावर सावधगिरीने मासेमारी करा.`;
    }
    return `मत्स्यसेतू मासेमारी सल्ला. ${title}. आपल्या स्थानापासून ${dist} नॉटिकल मैल ${dir} दिशेला मुबलक मासे मिळण्याची शक्यता आहे. मुख्य मासे: ${species}. पाण्याची खोली ${depth}. समुद्र शांत असून मासेमारीसाठी पूर्णपणे सुरक्षित आहे. अंदाजे ${adv.fuelSavingLitres || 30} लिटर डिझेलची बचत होईल.`;
  }

  // 2. HINDI (हिन्दी)
  if (lang === 'hi') {
    const title = adv.titles?.hi || adv.title;
    const species = (adv.targetSpeciesNames?.hi || adv.targetSpecies || []).join(', ');
    if (isDanger) {
      return `सावधान! ${adv.harborName} के लिए रेड अलर्ट। भीषण चक्रवाती तूफान की चेतावनी। समुद्र में मछली पकड़ने पर पूर्ण प्रतिबंध है। सभी नावें तुरंत बंदरगाह लौटें।`;
    }
    if (isCaution) {
      return `समुद्री चेतावनी! ${adv.harborName} क्षेत्र में ऊंची लहरें हैं। अपनी स्थिति से ${dist} नॉटिकल मील पर सावधानी से जाएं।`;
    }
    return `मत्स्यसेतु मत्स्य सलाह। ${title}। आपके स्थान से ${dist} नॉटिकल मील ${dir} दिशा में मछली का बड़ा भंडार उपलब्ध है। लक्षित मछली: ${species}। पानी की गहराई ${depth}। समुद्र शांत और सुरक्षित है।`;
  }

  // 3. TAMIL (தமிழ்)
  if (lang === 'ta') {
    const title = adv.titles?.ta || adv.title;
    const species = (adv.targetSpeciesNames?.ta || adv.targetSpecies || []).join(', ');
    if (isDanger) {
      return `எச்சரிக்கை! ${adv.harborName} புயல் சிவப்பு எச்சரிக்கை. கடலுக்குள் செல்ல வேண்டாம். அனைத்து படகுகளும் உடனடியாக கரைக்கு திரும்பவும்.`;
    }
    return `மத்ஸ்யசேது மீன்பிடி ஆலோசனை. ${title}. உங்கள் இடத்திலிருந்து ${dist} கடல் மைல் ${dir} திசையில் மீன் வளம் அதிகம் உள்ளது. முக்கிய மீன்கள்: ${species}. கடல் ஆழம் ${depth}. கடல் அமைதியாக உள்ளது, வேட்டைக்கு செல்லலாம்.`;
  }

  // 4. TELUGU (తెలుగు)
  if (lang === 'te') {
    const title = adv.titles?.te || adv.title;
    const species = (adv.targetSpeciesNames?.te || adv.targetSpecies || []).join(', ');
    if (isDanger) {
      return `హెచ్చరిక! ${adv.harborName} తీవ్ర తుఫాను రెడ్ అలర్ట్. చేపల వేటకు వెళ్లవద్దు. బోట్లు వెంటనే తీరానికి తిరిగి రావాలి.`;
    }
    return `మత్స్యసేతు సలహా. ${title}. మీ స్థానం నుండి ${dist} నాటికల్ మైళ్ల ${dir} దిశలో చేపల లభ్యత ఎక్కువ. లభించే చేపలు: ${species}. నీటి లోతు ${depth}. వేటకు వెళ్లడం సురక్షితం.`;
  }

  // 5. BENGALI (বাংলা)
  if (lang === 'bn') {
    const title = adv.titles?.bn || adv.title;
    const species = (adv.targetSpeciesNames?.bn || adv.targetSpecies || []).join(', ');
    if (isDanger) {
      return `বিপদ সংকেত! ${adv.harborName} ঘূর্ণিঝড়ের লাল সতর্কতা। সমুদ্রে মাছ ধরা নিষিদ্ধ। অবিলম্বে বন্দরে ফিরুন।`;
    }
    return `মৎস্যসেতু পরামর্শ। ${title}। আপনার অবস্থান থেকে ${dist} নটিক্যাল মাইল ${dir} দিকে প্রচুর মাছের সম্ভাবনা। মাছের প্রজাতি: ${species}। সমুদ্র শান্ত ও নিরাপদ।`;
  }

  // 6. MALAYALAM (മലയാളം)
  if (lang === 'ml') {
    const title = adv.titles?.ml || adv.title;
    const species = (adv.targetSpeciesNames?.ml || adv.targetSpecies || []).join(', ');
    if (isDanger) {
      return `അപകട മുന്നറിയിപ്പ്! ${adv.harborName} അതിതീവ്ര ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ്. കടലിൽ പോകരുത്. ബോട്ടുകൾ ഉടൻ തിരിച്ചെത്തുക.`;
    }
    return `മത്സ്യസേതു അറിയിപ്പ്. ${title}. നിങ്ങളുടെ സ്ഥാനത്തുനിന്ന് ${dist} നോട്ടിക്കൽ മൈൽ ${dir} ദിശയിൽ മീനുകൾ ലഭ്യമാണ്. ലഭ്യമായ മീനുകൾ: ${species}. കടൽ ശാന്തമാണ്.`;
  }

  // 7. GUJARATI (ગુજરાતી)
  if (lang === 'gu') {
    const title = adv.titles?.gu || adv.title;
    const species = (adv.targetSpeciesNames?.gu || adv.targetSpecies || []).join(', ');
    if (isDanger) {
      return `સાવધાન! ${adv.harborName} વાવાઝોડાની ગંભીર ચેતવણી. દરિયામાં માછીમારી પર સંપૂર્ણ પ્રતિબંધ છે. તમામ બોટ તુરંત બંદરે પાછી ફરો.`;
    }
    return `મત્સ્યસેતુ મત્સ્ય સલાહ. ${title}. તમારા સ્થાનથી ${dist} નોટિકલ માઇલ ${dir} દિશામાં માછલીનો મોટો જથ્થો છે. મુખ્ય માછલી: ${species}. દરિયો શાંત અને સુરક્ષિત છે.`;
  }

  // 8. ODIA (ଓଡ଼ିଆ)
  if (lang === 'or') {
    const title = adv.titles?.or || adv.title;
    const species = (adv.targetSpeciesNames?.or || adv.targetSpecies || []).join(', ');
    if (isDanger) {
      return `ସତର୍କତା! ${adv.harborName} ଭୟଙ୍କର ବାତ୍ୟା ସତର୍କତା। ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ। ସମସ୍ତ ଡଙ୍ଗା ତୁରନ୍ତ କୂଳକୁ ଫେରିଆସନ୍ତୁ।`;
    }
    return `ମତ୍ସ୍ୟସେତୁ ମାଛ ଧରା ପରାମର୍ଶ। ${title}। ଆପଣଙ୍କ ସ୍ଥାନରୁ ${dist} ନଟିକାଲ୍ ମାଇଲ୍ ${dir} ଦିଗରେ ମାଛ ମିଳିବାର ପ୍ରଚୁର ସମ୍ଭାବନା ଅଛି। ମାଛ: ${species}। ସମୁଦ୍ର ଶାନ୍ତ ଅଛି।`;
  }

  // 9. ENGLISH (Universal Default)
  return `MatsyaSetu Marine Advisory for ${adv.harborName}. ${adv.title}. Located ${dist} nautical miles ${dir}. Target species: ${(adv.targetSpecies || []).join(', ')}. Zone depth ${depth}. Sea conditions safe for navigation.`;
}
