import React from 'react';
import { Bot, Mic, Sparkles } from 'lucide-react';

export default function BhasiniFloatingButton({ onClick, lang = 'en' }) {
  const getButtonText = () => {
    switch (lang) {
      case 'mr': return 'भाषिणी AI सहाय्यक';
      case 'hi': return 'भाषिणी AI सहायक';
      case 'ta': return 'பாஷினி AI உதவியாளர்';
      case 'te': return 'భాషిణి AI సహాయకుడు';
      case 'bn': return 'ভাষিণী AI সহকারী';
      case 'gu': return 'ભાષિણી AI સહાયક';
      default: return 'Bhashini AI Voice Bot';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="group relative flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-2xl shadow-cyan-500/40 border-2 border-white/30 hover:border-cyan-300 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Glow halo */}
        <span className="absolute -inset-1 rounded-full bg-cyan-500/30 blur-md group-hover:bg-cyan-400/50 transition-all"></span>

        <div className="relative p-1.5 rounded-full bg-white text-cyan-700 shadow-md">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
        </div>

        <div className="relative flex flex-col text-left">
          <span className="text-[10px] text-cyan-200 uppercase font-mono tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
            <span>Digital India AI</span>
          </span>
          <span className="font-display font-black leading-tight">
            {getButtonText()}
          </span>
        </div>

        <div className="relative p-1 rounded-full bg-cyan-400/20 text-cyan-300 ml-1 animate-pulse">
          <Mic className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
}
