import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Radio, 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Search,
  ShieldAlert,
  MapPin,
  Users,
  Clock,
  Compass,
  Volume2
} from 'lucide-react';
import { HARBORS } from '../../data/mockAdvisories';
import { rescueAlertService } from '../../services/rescueAlertService';
import { formatGPSCoords } from '../../utils/geoUtils';

const SAMPLE_BOATS = [
  { id: 'IND-MH-MUM-892', name: 'Matsya Kripa', harbor: 'Mumbai Sassoon Docks', type: 'Mechanized Trawler', lat: 18.78, lon: 72.56, speed: '8.4 kts', status: 'IN_PFZ_ZONE', crew: 5 },
  { id: 'IND-AP-402', name: 'Matsya Jyoti', harbor: 'Visakhapatnam', type: 'Mechanized Trawler', lat: 17.58, lon: 83.45, speed: '9.2 kts', status: 'IN_PFZ_ZONE', crew: 6 },
  { id: 'IND-TN-118', name: 'Kadal Kural', harbor: 'Chennai Kasimedu', type: 'Motorized Craft', lat: 13.05, lon: 80.42, speed: '7.4 kts', status: 'SAILING_SAFE', crew: 4 },
  { id: 'IND-KL-903', name: 'Samudra Vani', harbor: 'Kochi', type: 'Trawler', lat: 9.82, lon: 76.05, speed: '8.8 kts', status: 'IN_PFZ_ZONE', crew: 5 },
  { id: 'IND-GJ-771', name: 'Sagar Ratna', harbor: 'Veraval', type: 'Deep Sea Boat', lat: 20.45, lon: 70.12, speed: '10.1 kts', status: 'RETURNING_PORT', crew: 8 },
  { id: 'IND-OD-204', name: 'Kalinga Rani', harbor: 'Paradip', type: 'Motorized Craft', lat: 20.25, lon: 86.72, speed: '6.0 kts', status: 'CAUTION_ALERT', crew: 4 },
];

export default function FleetRadar({ advisories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [activeSosAlerts, setActiveSosAlerts] = useState(() => rescueAlertService.getActiveAlerts());

  // Listen to real-time incoming SOS signals & messages from fishermen
  useEffect(() => {
    const unsub = rescueAlertService.onUpdate((alerts) => {
      setActiveSosAlerts(alerts);
    });
    return () => unsub();
  }, []);

  const filteredBoats = SAMPLE_BOATS.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.harbor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendCustomBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage('');
    }, 3000);
  };

  const handleDispatchRescueUnit = (alertId) => {
    rescueAlertService.updateRescueStatus(
      alertId, 
      'PATROL_EN_ROUTE', 
      'Fast Patrol Vessel (ICGS Varaha) departed from harbor station at 28 knots.'
    );
  };

  const handleLaunchHelicopter = (alertId) => {
    rescueAlertService.updateRescueStatus(
      alertId, 
      'HELICOPTER_AIRBORNE', 
      'Chetak CG-812 search & rescue helicopter airborne for visual location.'
    );
  };

  const handleResolveAlert = (alertId) => {
    rescueAlertService.cancelDistressAlert(alertId);
  };

  const activeSosCount = activeSosAlerts.length;

  return (
    <div className="space-y-6">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Tracked Coastal Vessels</div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">1,482</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">● 100% AIS / GPS Sync</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Vessels in PFZ Hotspots</div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">894</div>
          <div className="text-[10px] text-slate-400 mt-0.5">High catch density</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">SMS Alerts Dispatched (24h)</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">14,290</div>
          <div className="text-[10px] text-amber-300 mt-0.5">2G Keypad Delivered</div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          activeSosCount > 0 
            ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse shadow-lg shadow-red-950/50' 
            : 'bg-slate-900/80 border-slate-800 text-white'
        }`}>
          <div className="text-xs text-slate-400">Active SOS Distress Beacons</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-red-400">
            {activeSosCount}
          </div>
          <div className="text-[10px] font-semibold mt-0.5 text-red-300">
            {activeSosCount > 0 ? '⚠️ URGENT RESCUE IN PROGRESS' : 'All Fleets Safe'}
          </div>
        </div>

      </div>

      {/* ----------------- INCOMING REAL-TIME SOS RESCUE COMMAND CENTER ----------------- */}
      {activeSosCount > 0 && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border-2 border-red-500 shadow-2xl bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-950 space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-600 text-white font-black animate-bounce shadow-lg shadow-red-600/50">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-display font-black text-white flex items-center gap-2">
                  <span>🚨 Direct Rescue Signal Incoming from Fisherman</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-red-600 text-white animate-pulse">
                    PRIORITY 1 MAYDAY
                  </span>
                </h3>
                <p className="text-xs text-red-200 mt-0.5">
                  Direct distress packet transmitted from vessel with live satellite GPS coordinates and captain message
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-amber-300 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-500/40">
              Coast Guard MRCC Feed: ACTIVE
            </span>
          </div>

          {/* Active Distress Cards */}
          <div className="space-y-4">
            {activeSosAlerts.map((alert) => {
              const gps = formatGPSCoords(alert.coordinates.lat, alert.coordinates.lon);
              const isPatrolDispatched = alert.status === 'PATROL_EN_ROUTE' || alert.status === 'HELICOPTER_AIRBORNE';

              return (
                <div 
                  key={alert.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border-2 border-red-500/60 shadow-xl space-y-3.5"
                >
                  {/* Top Vessel & Emergency Nature */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{alert.accidentType.icon}</span>
                      <div>
                        <div className="text-base font-black text-white flex items-center gap-2">
                          <span>{alert.vesselName}</span>
                          <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 bg-slate-900 rounded-md border border-slate-700">
                            {alert.vesselId}
                          </span>
                        </div>
                        <div className="text-xs text-red-400 font-bold">
                          {alert.accidentType.title.en} • {alert.accidentType.title.mr}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">Time: <strong className="text-white font-mono">{alert.timeFormatted || 'Just now'}</strong></span>
                      <span className="text-slate-400">Crew: <strong className="text-amber-300">{alert.crewCount} Fishermen</strong></span>
                    </div>
                  </div>

                  {/* Fisherman's Exact Message Banner */}
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border-2 border-amber-500/60 text-xs space-y-1">
                    <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>DIRECT MESSAGE TRANSMITTED BY FISHERMAN:</span>
                    </div>
                    <p className="text-amber-200 text-sm font-semibold italic">
                      "{alert.fishermanMessage}"
                    </p>
                  </div>

                  {/* Coordinates & Master Info Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Exact Target Coordinates:</span>
                      <span className="font-mono font-extrabold text-cyan-300 text-sm">
                        {gps.combined}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Captain / Mobile:</span>
                      <span className="font-bold text-white flex items-center justify-between">
                        <span>{alert.captainName}</span>
                        {alert.phone && (
                          <a href={`tel:${alert.phone}`} className="text-emerald-400 hover:underline flex items-center gap-1">
                            <PhoneCall className="w-3 h-3" />
                            <span>{alert.phone}</span>
                          </a>
                        )}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">District Command:</span>
                      <span className="font-bold text-amber-300">
                        {alert.nearestCoastGuardBase || `${alert.harborName} Station`}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Dispatch FPV / Launch Helicopter / Resolve */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleDispatchRescueUnit(alert.id)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isPatrolDispatched
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30'
                      }`}
                    >
                      <Ship className="w-4 h-4" />
                      <span>{isPatrolDispatched ? '✓ FPV ICGS Varaha En-Route' : '🚀 Dispatch Fast Patrol Vessel (FPV)'}</span>
                    </button>

                    <button
                      onClick={() => handleLaunchHelicopter(alert.id)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Radio className="w-4 h-4" />
                      <span>🚁 Launch Chetak SAR Heli</span>
                    </button>

                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      <span>Mark Rescued & Close</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Fleet Monitoring Table */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ship className="w-5 h-5 text-cyan-400" />
              <span>Active Coastal Fleet Radar</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live vessel positioning, harbor affiliation & weather zone status
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vessel ID / Harbor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-cyan-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Vessel ID & Name</th>
                <th className="pb-3">Base Harbor</th>
                <th className="pb-3">Coordinates</th>
                <th className="pb-3">Speed</th>
                <th className="pb-3">Telemetry Status</th>
                <th className="pb-3 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredBoats.map((boat) => {
                const isSosActive = activeSosAlerts.some((a) => a.vesselId === boat.id);

                return (
                  <tr key={boat.id} className={`hover:bg-slate-900/40 transition-colors ${isSosActive ? 'bg-red-950/40 font-bold' : ''}`}>
                    <td className="py-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {isSosActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                        <span>{boat.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{boat.id} • {boat.type}</div>
                    </td>
                    <td className="py-3.5 text-slate-300">{boat.harbor}</td>
                    <td className="py-3.5 font-mono text-cyan-300">{boat.lat}° N, {boat.lon}° E</td>
                    <td className="py-3.5 text-slate-300 font-mono">{boat.speed}</td>
                    <td className="py-3.5">
                      {isSosActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                          🚨 MAYDAY DISTRESS
                        </span>
                      ) : boat.status === 'IN_PFZ_ZONE' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Harvesting in PFZ
                        </span>
                      ) : boat.status === 'RETURNING_PORT' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          Returning to Port
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Caution Advised
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => {
                          alert(`Contacting Indian Coast Guard MRCC for vessel ${boat.name} (${boat.id}) at ${boat.lat}° N, ${boat.lon}° E.`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Emergency Relay"
                      >
                        <Radio className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Authority Broadcast Composer */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Radio className="w-5 h-5 text-amber-400" />
          <span>Priority Emergency Broadcast to Fleet (शासकीय इशारा प्रसारण)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Send zero-data flash broadcast notifications directly to all registered vessels and keypad phones.
        </p>

        <form onSubmit={handleSendCustomBroadcast} className="space-y-3">
          <textarea
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Type official emergency warning or weather ban instructions..."
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Target: <strong>All Active Coastal Vessels ({SAMPLE_BOATS.length} In-Range)</strong>
            </span>

            <button
              type="submit"
              disabled={broadcastSent || !broadcastMessage}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                broadcastSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {broadcastSent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{broadcastSent ? 'Broadcast Sent!' : 'Dispatch Flash Warning'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
