import React from 'react';
import { Volume2, VolumeX, AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translations';
import { speechService } from '../../services/speechService';
import { encodeAdvisoryToSMS } from '../../services/smsEncoder';

export default function LowBandwidthFeed({
  advisories,
  selectedHarbor,
  setSelectedHarbor,
  lang = 'en',
  speakingState,
  onOpenSOS,
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSpeak = (text) => {
    if (speakingState?.isSpeaking) {
      speechService.stop();
      return;
    }
    speechService.speak(text, lang);
  };

  return (
    <div className="bg-black text-white font-mono p-3 min-h-[80vh] border-2 border-white rounded-xl">
      
      {/* 2G Header */}
      <div className="border-b-2 border-white pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black uppercase text-yellow-300">
            [{t.badge_low_bandwidth}]
          </h2>
          <p className="text-xs text-gray-300">
            {t.bhashini_engine} | Female Voice
          </p>
        </div>

        <button
          onClick={onOpenSOS}
          className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 text-sm uppercase tracking-wider border-2 border-white cursor-pointer"
        >
          🚨 {t.emergency_sos}
        </button>
      </div>

      {/* Advisories list */}
      <div className="space-y-4">
        {advisories.map((adv, index) => {
          const smsText = adv.smsPayload || encodeAdvisoryToSMS(adv);
          const voiceText = adv.voiceText?.[lang] || adv.voiceText?.hi || adv.title;
          const isDanger = adv.riskLevel === 'DANGER' || adv.type === 'CYCLONE';
          const isCaution = adv.riskLevel === 'CAUTION';
          const localizedTitle = adv.titles?.[lang] || adv.titles?.hi || adv.title;
          const localizedSpecies = adv.targetSpeciesNames?.[lang] || adv.targetSpecies || [];

          return (
            <div
              key={adv.id}
              className={`p-3 border-2 rounded-lg ${
                isDanger
                  ? 'border-red-500 bg-red-950/40 text-red-200'
                  : isCaution
                  ? 'border-yellow-400 bg-zinc-900 text-yellow-100'
                  : 'border-zinc-500 bg-zinc-950 text-white'
              }`}
            >
              {/* Header row */}
              <div className="flex justify-between items-start gap-2 border-b border-zinc-700 pb-2 mb-2">
                <div>
                  <span className="font-bold text-xs bg-white text-black px-1.5 py-0.5 mr-2">
                    #{index + 1} {adv.type}
                  </span>
                  <span className="font-bold text-xs text-yellow-300">
                    {adv.harborName}
                  </span>
                </div>

                {/* Voice button */}
                <button
                  onClick={() => handleSpeak(voiceText)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-2.5 py-1 flex items-center gap-1 border border-white cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t.listen_voice}</span>
                </button>
              </div>

              {/* Title */}
              <div className="font-bold text-sm mb-2 text-white">
                {localizedTitle}
              </div>

              {/* Data lines */}
              <div className="text-xs space-y-1 text-gray-200">
                {adv.coordinates && (
                  <div>
                    {t.from_your_position}: <strong>{adv.distanceNm} {t.nautical_miles} ({adv.bearingDirection})</strong>
                  </div>
                )}
                {localizedSpecies && localizedSpecies.length > 0 && (
                  <div>
                    {t.target_catch} <strong>{localizedSpecies.join(', ')}</strong>
                  </div>
                )}
                {adv.depthMeters && (
                  <div>
                    {t.depth}: <strong>{adv.depthMeters}</strong> | {t.wave_height}: <strong>{adv.weather?.waveHeight}</strong>
                  </div>
                )}
                <div>
                  {t.safety_status}: <strong className={isDanger ? 'text-red-400 font-black' : isCaution ? 'text-yellow-300' : 'text-green-400'}>
                    {isDanger ? t.danger_do_not_sail : isCaution ? t.caution_advised : t.safe_to_sail}
                  </strong>
                </div>
              </div>

              {/* SMS Text format */}
              <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] text-green-300 font-mono break-words bg-black p-1.5 border border-zinc-700">
                SMS: {smsText}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
