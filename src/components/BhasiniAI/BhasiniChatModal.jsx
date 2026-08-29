import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Compass, 
  Radio, 
  MessageSquare, 
  FileText, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink,
  Layers,
  Fuel
} from 'lucide-react';
import { bhasiniAIService, BHASHINI_PROMPT_SUGGESTIONS } from '../../services/bhasiniService';
import { speechService } from '../../services/speechService';
import { TRANSLATIONS } from '../../data/translations';

const SPEECH_LANG_MAP = {
  mr: 'mr-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  en: 'en-IN'
};

export default function BhasiniChatModal({
  isOpen,
  onClose,
  lang = 'en',
  selectedHarborObj,
  onNavigateToView,
  onOpenSOS,
  onOpenImdLegal
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bhasini',
      text: {
        mr: 'नमस्कार! मी भाषिणी AI सागरी सहाय्यक आहे. समुद्रातील हवामान, माशांचे PFZ हॉटस्पॉट, नौका ट्रॅकिंग किंवा शासकीय नियमांबद्दल मला विचारा किंवा बोला!',
        hi: 'नमस्ते! मैं भाषिणी AI समुद्री सहायक हूँ। आज का मौसम, मछली क्षेत्र (PFZ), नाव ट्रैकिंग या सरकारी नियमों के बारे में पूछें या बोलें!',
        ta: 'வணக்கம்! நான் பாஷினி AI கடல்சார் உதவியாளர். இன்றைய வானிலை, மீன்பிடி மண்டலம் அல்லது அரசு சட்டங்கள் பற்றி கேளுங்கள்!',
        te: 'నమస్కారం! నేను భాషిణి AI సహాయకుడిని. సముద్ర వాతావరణం, చేపల వేట లేదా ప్రభుత్వ నిబంధనల గురించి మాట్లాడండి!',
        bn: 'নমস্কার! আমি ভাষিণী AI সহকারী। সমুদ্রের আবহাওয়া, মাছের অঞ্চল বা বোট ট্র্যাকিং সম্পর্কে জিজ্ঞাসা করুন!',
        en: 'Hello! I am your Digital India Bhashini AI Assistant. Ask me anything about sea weather, PFZ hotspots, vessel tracking, or government rules!'
      },
      action: {
        type: 'NAVIGATE_VIEW',
        payload: 'advisories',
        label: {
          mr: '🌊 सागरी सल्ला व थेट नकाशा पहा',
          hi: '🌊 समुद्री मौसम व लाइव मैप देखें',
          ta: '🌊 நேரலை வரைபடம் மற்றும் வானிலை',
          te: '🌊 సముద్ర మ్యాప్ మరియు వాతావరణం',
          bn: '🌊 লাইভ আবহাওয়া ও মানচিত্র দেখুন',
          en: '🌊 View Advisories & Live Ocean Map'
        }
      }
    }
  ]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        handleSendQuery(transcript);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = SPEECH_LANG_MAP[lang] || 'en-IN';
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Mic start failed', e);
        }
      } else {
        alert('Voice speech recognition is not supported in this browser. Please type your query.');
      }
    }
  };

  const handleSendQuery = async (queryToSend) => {
    const query = queryToSend || inputQuery;
    if (!query || query.trim() === '') return;

    const userMsgId = 'usr_' + Date.now();
    const newUserMsg = {
      id: userMsgId,
      sender: 'user',
      text: { [lang]: query, en: query }
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await bhasiniAIService.processQuery({
        query,
        lang,
        selectedHarborObj
      });

      const aiMsgId = 'ai_' + Date.now();
      const newAiMsg = {
        id: aiMsgId,
        sender: 'bhasini',
        text: result.response,
        action: result.action
      };

      setMessages((prev) => [...prev, newAiMsg]);

      // Speak response aloud automatically in low-literacy mode
      const speechText = result.response?.[lang] || result.response?.en || '';
      speechService.speak(speechText, lang);

    } catch (err) {
      console.error('Bhasini processing failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (action) => {
    if (!action) return;

    if (action.type === 'OPEN_SOS') {
      onClose();
      onOpenSOS();
    } else if (action.type === 'OPEN_IMD_LEGAL') {
      onClose();
      onOpenImdLegal();
    } else if (action.type === 'NAVIGATE_VIEW') {
      onClose();
      onNavigateToView(action.payload);
    }
  };

  const handleSpeakMsg = (msg) => {
    const textToSpeak = msg.text?.[lang] || msg.text?.en || '';
    speechService.speak(textToSpeak, lang);
  };

  if (!isOpen) return null;

  const suggestions = BHASHINI_PROMPT_SUGGESTIONS[lang] || BHASHINI_PROMPT_SUGGESTIONS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header: Bhashini AI Branding */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30 relative">
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Bhashini AI Voice Assistant (भाषिणी AI)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Govt. of India NLTM
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Speak or ask anything • Auto-guides you across MatsyaSetu in 9 languages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Tap to Ask:</span>
          </span>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(sug)}
              className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const textContent = msg.text?.[lang] || msg.text?.en || '';
            const actionLabel = msg.action?.label?.[lang] || msg.action?.label?.en;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-md">
                    AI
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none font-bold'
                        : 'bg-slate-900/95 border border-cyan-500/30 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {textContent}
                  </div>

                  {/* AI Message Action Button & Speak Button */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSpeakMsg(msg)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t.listen_voice || 'Listen'}</span>
                      </button>

                      {msg.action && (
                        <button
                          onClick={() => handleExecuteAction(msg.action)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                        >
                          <span>{actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                AI
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-bold flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Bhashini AI is analyzing maritime intelligence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar: Mic + Text + Send */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
          
          {isListening && (
            <div className="mb-2 p-2 rounded-xl bg-red-950/80 border border-red-500/60 text-red-300 text-xs flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>🎙️ Bhashini AI Listening... Speak in your language now!</span>
              </div>
              <button
                onClick={toggleMic}
                className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-bold text-[10px] cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-2xl font-black transition-all shadow-lg active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-bounce shadow-red-600/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
              }`}
              title="Click and speak in your language"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={lang === 'mr' ? 'मासेमारी, हवामान किंवा नियमांबद्दल विचारा...' : lang === 'hi' ? 'मौसम, मछली या नियमों के बारे में पूछें...' : 'Ask about sea weather, PFZ hotspots, vessel tracking...'}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
