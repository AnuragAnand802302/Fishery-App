import React from 'react';
import { Wifi, WifiOff, Database, RefreshCw, MessageSquare } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function OfflineBadge({ isOnline, lang, isLowBandwidth, lastSyncTime, onForceSync, onOpenOfflineSms }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (isLowBandwidth) {
    return (
      <div className="bg-zinc-900 border-b border-zinc-700 px-4 py-1.5 text-xs text-white flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          <span>{isOnline ? 'NETWORK: CONNECTED' : 'NETWORK: OFFLINE CACHE (2G READY)'}</span>
        </div>
        <button
          onClick={onOpenOfflineSms}
          className="text-amber-400 font-bold underline cursor-pointer"
        >
          [SMS INBOX]
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                {t.badge_online}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-400 font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                {t.badge_offline}
              </span>
            )}
          </div>

          <button
            onClick={onOpenOfflineSms}
            className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center gap-1 text-[11px] border border-slate-700 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>Offline Govt SMS Inbox</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Synced: {lastSyncTime || 'Just now'}</span>
          <button
            onClick={onForceSync}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Refresh satellite data"
          >
            <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Sync Now</span>
          </button>
        </div>

      </div>
    </div>
  );
}
