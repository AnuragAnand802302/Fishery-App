/**
 * MatsyaSetu High-Reliability Speech Engine with Sentence-by-Sentence Pacing.
 * 
 * Guarantees that announcements are spoken calmly, clearly, and completely
 * without rushing, finishing too quickly, or getting cut off by browser timeouts.
 * 
 * Supports all 9 coastal Indian languages:
 * mr (Marathi), bn (Bengali), ta (Tamil), te (Telugu),
 * ml (Malayalam), gu (Gujarati), or (Odia), hi (Hindi), en (English)
 */

import { getPhoneticFallback } from '../utils/indicTransliteration';

const FEMALE_VOICE_HINTS = [
  'female', 'woman', 'girl', 'zira', 'heera', 'swara', 'kalpana', 'kavya', 
  'neerja', 'sunita', 'shruti', 'priya', 'sangeeta', 'veena', 'anjali', 
  'google', 'samantha', 'victoria', 'karen', 'lekha'
];

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSpeaking = false;
    this.callbacks = new Set();
    this.voices = [];
    this.gender = 'female';
    this.activeUtterances = []; // Prevents Chromium garbage collection bug
    this.heartbeatTimer = null;
    this.speedRate = 0.78; // Calm, clear, measured rate for rural coastal fishermen

    if (this.synth) {
      this.loadVoices();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
  }

  onStateChange(cb) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  notify(speaking, text = '') {
    this.isSpeaking = speaking;
    this.callbacks.forEach((cb) => cb({ isSpeaking: speaking, currentText: text, gender: this.gender }));
  }

  stop() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.synth) {
      this.synth.cancel();
    }
    this.activeUtterances = [];
    this.notify(false, '');
  }

  /**
   * Split full advisory into natural complete sentences for pacing
   */
  splitIntoSentences(text) {
    // Split by full stops, danda (।), exclamation or newline
    return text
      .split(/([।\.\!\?\n]+)/)
      .reduce((acc, part, idx, arr) => {
        if (idx % 2 === 0 && part.trim()) {
          const punct = arr[idx + 1] ? arr[idx + 1].trim() : '.';
          acc.push(part.trim() + punct);
        }
        return acc;
      }, [])
      .filter((s) => s.trim().length > 0);
  }

  /**
   * Finds the best female voice matching the language or Indic female profile
   */
  findVoice(langCode) {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    const voices = this.voices;
    if (!voices || voices.length === 0) return null;

    // 1. Direct language match with Female hint
    const directFemale = voices.find((v) => {
      const matchLang = v.lang.toLowerCase().startsWith(langCode) || v.lang.toLowerCase().replace('_', '-').includes(langCode);
      const isFemale = FEMALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h));
      return matchLang && isFemale;
    });
    if (directFemale) return directFemale;

    // 2. Direct language match (any voice)
    const directAny = voices.find((v) => 
      v.lang.toLowerCase().startsWith(langCode) || v.lang.toLowerCase().replace('_', '-').includes(langCode)
    );
    if (directAny) return directAny;

    // 3. Indian Female voice (hi-IN / en-IN like Microsoft Heera / Swara / Google)
    const indicFemale = voices.find((v) => {
      const isIndic = v.lang.includes('IN') || v.lang.startsWith('hi');
      const isFemale = FEMALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h));
      return isIndic && isFemale;
    });
    if (indicFemale) return indicFemale;

    // 4. Any Indian voice
    const indicAny = voices.find((v) => v.lang.includes('IN') || v.lang.startsWith('hi'));
    if (indicAny) return indicAny;

    // 5. Any female voice or default
    return voices.find((v) => FEMALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h))) || voices[0];
  }

  /**
   * Speaks the entire announcement sentence-by-sentence with calm, dignified pacing
   */
  async speak(text, langCode = 'mr') {
    if (!text) return;
    this.stop();

    if (!this.synth) {
      console.warn('SpeechSynthesis not supported on this device');
      return;
    }

    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }

    const sentences = this.splitIntoSentences(text);
    if (sentences.length === 0) {
      sentences.push(text);
    }

    const nativeVoice = this.findVoice(langCode);
    const hasNativeVoice = nativeVoice && (
      nativeVoice.lang.toLowerCase().startsWith(langCode) || 
      nativeVoice.lang.toLowerCase().replace('_', '-').includes(langCode)
    );

    let targetLocale = 'hi-IN';
    if (langCode === 'en') {
      targetLocale = 'en-IN';
    } else if (langCode === 'hi' || langCode === 'mr') {
      targetLocale = 'hi-IN'; // Devanagari is natively pronounced
    } else if (hasNativeVoice) {
      targetLocale = nativeVoice.lang;
    } else {
      targetLocale = 'en-IN';
    }

    this.notify(true, text);

    // Keep active utterances in memory to prevent browser garbage collection
    this.activeUtterances = [];

    // Heartbeat to prevent browser SpeechSynthesis from pausing on long text
    this.heartbeatTimer = setInterval(() => {
      if (this.synth.speaking && this.synth.paused) {
        this.synth.resume();
      }
    }, 5000);

    // Queue each sentence with deliberate, calm timing
    sentences.forEach((sentence, index) => {
      let sentenceText = sentence;
      if (langCode !== 'en' && langCode !== 'hi' && langCode !== 'mr' && !hasNativeVoice) {
        sentenceText = getPhoneticFallback(sentence, langCode);
      }

      const utterance = new SpeechSynthesisUtterance(sentenceText);
      utterance.lang = targetLocale;
      utterance.rate = this.speedRate; // Calm rate (0.78) so it doesn't rush or finish quickly
      utterance.pitch = 1.15; // Natural clear female pitch

      if (nativeVoice) {
        utterance.voice = nativeVoice;
      } else {
        const indicFemale = this.findVoice('hi') || this.findVoice('en');
        if (indicFemale) utterance.voice = indicFemale;
      }

      // If it's the last sentence, clear state when finished
      if (index === sentences.length - 1) {
        utterance.onend = () => {
          this.stop();
        };
        utterance.onerror = (err) => {
          console.warn('Speech onend/error:', err);
          this.stop();
        };
      }

      this.activeUtterances.push(utterance);
      this.synth.speak(utterance);
    });
  }
}

export const speechService = new SpeechService();
