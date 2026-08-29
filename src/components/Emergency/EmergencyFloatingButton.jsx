import React from 'react';
import { ShieldAlert, Radio } from 'lucide-react';

export default function EmergencyFloatingButton({ onClick, lang = 'en' }) {
  const getButtonText = () => {
    switch (lang) {
      case 'mr': return 'आपत्कालीन बचाव (SOS)';
      case 'hi': return 'आपातकालीन बचाव (SOS)';
      case 'ta': return 'அவசர உதவி (SOS)';
      case 'te': return 'అత్యవసర రక్షణ (SOS)';
      case 'bn': return 'জরুরি উদ্ধার (SOS)';
      case 'gu': return 'કટોકટી બચાવ (SOS)';
      default: return 'EMERGENCY RESCUE (SOS)';
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={onClick}
        className="group relative flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-600/50 border-2 border-white/40 hover:border-red-300 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse"
        title="Trigger Emergency Maritime Accident & Rescue Signal"
      >
        {/* Glow halo */}
        <span className="absolute -inset-1 rounded-full bg-red-600/40 blur-md group-hover:bg-red-500/60 transition-all"></span>

        <div className="relative p-1.5 rounded-full bg-white text-red-600 shadow-md">
          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform animate-bounce" />
        </div>

        <div className="relative flex flex-col text-left">
          <span className="text-[10px] text-red-200 uppercase font-mono tracking-wider flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-white animate-spin" />
            <span>Coast Guard 1554</span>
          </span>
          <span className="font-display font-black leading-tight">
            {getButtonText()}
          </span>
        </div>
      </button>
    </div>
  );
}
