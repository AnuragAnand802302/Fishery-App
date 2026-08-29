import React, { useState } from 'react';
import { Fuel, TrendingUp, Fish, Calculator } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translations';

const FISH_MARKET_RATES = [
  { 
    id: 'tuna', 
    names: {
      en: 'Yellowfin Tuna',
      mr: 'पिवळा टूना / सुरमई',
      hi: 'येलोफिन टूना',
      ta: 'சூரை மீன் (Tuna)',
      te: 'ట్యూనా చేప',
      bn: 'টুনা মাছ',
      ml: 'ട്യൂണ (ചൂര)',
      gu: 'ટુના માછલી',
      or: 'ଟୁନା ମାଛ'
    },
    avgPricePerKg: 280, 
    typicalCatchKg: 120, 
    fuelSavedLitres: 35 
  },
  { 
    id: 'mackerel', 
    names: {
      en: 'Indian Mackerel',
      mr: 'भारतीय बांगडा (Mackerel)',
      hi: 'भारतीय मैकेरल',
      ta: 'கானாங்கெளுத்தி (Mackerel)',
      te: 'కణగంతలు',
      bn: 'ম্যাকেরেল মাছ',
      ml: 'അയില',
      gu: 'બાંગડા માછલી',
      or: 'ମାକେରେଲ୍ ମାଛ'
    },
    avgPricePerKg: 190, 
    typicalCatchKg: 250, 
    fuelSavedLitres: 28 
  },
  { 
    id: 'pomfret', 
    names: {
      en: 'Silver Pomfret',
      mr: 'सिल्व्हर पापलेट (Pomfret)',
      hi: 'सिल्वर पॉम्फ्रेट',
      ta: 'வவ்வால் மீன் (Pomfret)',
      te: 'చందమామ చేప',
      bn: 'রূপচাঁদা (পমফ্রেট)',
      ml: 'ആവോലി',
      gu: 'હલવો માછલી',
      or: 'ଚାନ୍ଦି ମାଛ'
    },
    avgPricePerKg: 550, 
    typicalCatchKg: 80, 
    fuelSavedLitres: 30 
  },
  { 
    id: 'squid', 
    names: {
      en: 'Squid / Cuttlefish',
      mr: 'मांदेली / स्क्विड (Squid)',
      hi: 'स्क्विड / कूंथल',
      ta: 'கணவாய் மீன் (Squid)',
      te: 'స్క్విడ్ చేప',
      bn: 'স্কুইড মাছ',
      ml: 'കൂന്തൽ (Squid)',
      gu: 'સ્ક્વિડ',
      or: 'ସ୍କ୍ୱିଡ୍'
    },
    avgPricePerKg: 340, 
    typicalCatchKg: 95, 
    fuelSavedLitres: 40 
  },
  { 
    id: 'sardine', 
    names: {
      en: 'Oil Sardine',
      mr: 'तारली (Sardine)',
      hi: 'ऑयल सार्डिन',
      ta: 'மத்தி மீன் (Sardine)',
      te: 'కవ్వళ్లు',
      bn: 'সার্ডিন মাছ',
      ml: 'മത്തി (Sardine)',
      gu: 'પેડલી માછલી',
      or: 'ସାର୍ଡିନ୍'
    },
    avgPricePerKg: 120, 
    typicalCatchKg: 400, 
    fuelSavedLitres: 25 
  },
];

export default function CatchEstimator({ lang = 'en', isLowBandwidth }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [selectedFish, setSelectedFish] = useState(FISH_MARKET_RATES[0]);
  const [boatType, setBoatType] = useState('motorized'); // 'motorized', 'mechanized', 'traditional'
  const dieselPrice = 92; // ₹/Litre

  const boatMultiplier = boatType === 'mechanized' ? 1.8 : boatType === 'traditional' ? 0.4 : 1.0;
  const fuelSaved = Math.round(selectedFish.fuelSavedLitres * boatMultiplier);
  const moneySavedDiesel = fuelSaved * dieselPrice;
  const estimatedCatchValue = Math.round(selectedFish.avgPricePerKg * selectedFish.typicalCatchKg * boatMultiplier);
  const totalTripAdvantage = moneySavedDiesel + estimatedCatchValue;

  const currentFishName = selectedFish.names?.[lang] || selectedFish.names?.en || selectedFish.id;

  if (isLowBandwidth) {
    return (
      <div className="bg-zinc-950 border-2 border-white p-3 rounded-xl text-white font-mono mb-4">
        <h3 className="font-bold text-yellow-300 uppercase mb-2">
          [{t.optimizer_title}]
        </h3>
        <div className="text-xs space-y-1">
          <div>{t.target_fish_species} <strong>{currentFishName}</strong></div>
          <div>{t.diesel_saved_per_trip}: <strong>{fuelSaved} L (₹{moneySavedDiesel.toLocaleString('en-IN')})</strong></div>
          <div>{t.est_yield_value}: <strong>₹{estimatedCatchValue.toLocaleString('en-IN')}</strong></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-cyan-500/30 shadow-2xl space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {t.optimizer_title}
            </h3>
            <p className="text-xs text-slate-400">
              {t.optimizer_subtitle}
            </p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-extrabold hidden sm:inline-block">
          {t.fuel_savings_avg}
        </span>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* Target Species Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
            <Fish className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.target_fish_species}</span>
          </label>
          <select
            value={selectedFish.id}
            onChange={(e) => {
              const found = FISH_MARKET_RATES.find((f) => f.id === e.target.value);
              if (found) setSelectedFish(found);
            }}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-semibold focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            {FISH_MARKET_RATES.map((f) => {
              const fName = f.names?.[lang] || f.names?.en || f.id;
              return (
                <option key={f.id} value={f.id}>
                  🐟 {fName} (₹{f.avgPricePerKg}/kg)
                </option>
              );
            })}
          </select>
        </div>

        {/* Boat Category */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            {t.vessel_type}
          </label>
          <select
            value={boatType}
            onChange={(e) => setBoatType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-semibold focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="motorized">{t.boat_motorized}</option>
            <option value="mechanized">{t.boat_mechanized}</option>
            <option value="traditional">{t.boat_traditional}</option>
          </select>
        </div>

      </div>

      {/* Results Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
        
        {/* Diesel Saved */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">{t.diesel_saved_per_trip}</div>
            <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
              ~{fuelSaved} Litres
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">
              ({t.save_rupees} ₹{moneySavedDiesel.toLocaleString('en-IN')})
            </div>
          </div>
        </div>

        {/* Catch Value */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Fish className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">{t.est_yield_value}</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              ₹{estimatedCatchValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400">
              ~{Math.round(selectedFish.typicalCatchKg * boatMultiplier)} kg {t.expected_kg}
            </div>
          </div>
        </div>

        {/* Total Economic Advantage */}
        <div className="flex items-center gap-3 sm:border-l sm:border-slate-800 sm:pl-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">{t.total_trip_benefit}</div>
            <div className="text-base sm:text-lg font-black text-cyan-300 font-mono">
              ₹{totalTripAdvantage.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">
              {t.high_return}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
