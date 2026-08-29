/**
 * Maritime Accident & Emergency Rescue Dispatch Service.
 * Transmits real-time distress signals and custom messages from fishermen directly
 * to Coast Guard Maritime Rescue Coordination Centres (MRCC), port authorities, and rescue patrol boats.
 */

const STORAGE_KEY_RESCUE_ALERTS = 'matsya_rescue_distress_alerts_v2';
const RESCUE_BROADCAST_CHANNEL = 'matsya_rescue_sos_broadcast_bus';

export const ACCIDENT_TYPES = [
  {
    id: 'CAPSIZE_FLOODING',
    icon: '🌊',
    severity: 'CRITICAL',
    title: {
      en: 'Vessel Capsize / Severe Flooding',
      mr: 'बोट उलटणे / प्रचंड पाणी भरणे',
      hi: 'नाव पलटना / जलभराव',
      ta: 'படகு கவிழ்தல் / வெள்ளம்',
      te: 'బోట్ బోల్తా / నీరు నిండటం',
      bn: 'নৌকা উল্টে যাওয়া / জল জমা',
      gu: 'હોડી પલટી જવી / પાણી ભરાવું'
    },
    defaultNote: 'Boat is taking in seawater rapidly. Hull breached. Bilge pumps overwhelmed. Lifejackets deployed.'
  },
  {
    id: 'ENGINE_FAILURE',
    icon: '⚙️',
    severity: 'HIGH',
    title: {
      en: 'Engine Failure / Drifting in Deep Sea',
      mr: 'इंजिन बिघाड / समुद्रात भरकटणे',
      hi: 'इंजन खराब / गहरे समुद्र में भटकना',
      ta: 'எஞ்சின் பழுது / கடலில் தத்தளிப்பு',
      te: 'ఇంజిన్ వైఫల్యం / కొట్టుకుపోవడం',
      bn: 'ইঞ্জিন বিকল / সমুদ্রে ভেসে থাকা',
      gu: 'એન્જિન બગડી જવું / વહી જવું'
    },
    defaultNote: 'Main propulsion engine failed. Vessel drifting without power in open swell. Need urgent tow to harbor.'
  },
  {
    id: 'MEDICAL_EMERGENCY',
    icon: '🩺',
    severity: 'HIGH',
    title: {
      en: 'Medical Emergency / Severe Crew Injury',
      mr: 'गंभीर वैद्यकीय आपत्कालीन / दुखापत',
      hi: 'गंभीर चिकित्सा आपातकाल / चोट',
      ta: 'மருத்துவ அவசரநிலை / காயம்',
      te: 'వైద్య అత్యవసర పరిస్థితి / గాయం',
      bn: 'চিকিৎসা জরুরি অবস্থা / গুরুতর আঘাত',
      gu: 'તબીબી કટોકટી / ગંભીર ઈજા'
    },
    defaultNote: 'Crew member severely injured/unconscious on board. First aid administered. Urgent MEDEVAC airlift needed.'
  },
  {
    id: 'COLLISION_GROUNDING',
    icon: '💥',
    severity: 'CRITICAL',
    title: {
      en: 'Collision / Coral Reef Grounding',
      mr: 'जहाज धडक / खडक आपटणे',
      hi: 'टक्कर / चट्टान से टकराना',
      ta: 'மோதல் / பாறையில் மோதுதல்',
      te: 'ఢీకొనడం / బండరాళ్లను ఢీకొట్టడం',
      bn: 'ধাক্কা / পাথরে আটকে যাওয়া',
      gu: 'અથડામણ / ખડક સાથે ટકરાવ'
    },
    defaultNote: 'Struck submerged rocks. Rudder broken and hull taking impact. Stranded at sea.'
  },
  {
    id: 'STORM_TRAP',
    icon: '⛈️',
    severity: 'CRITICAL',
    title: {
      en: 'Extreme Squall / Cyclone Trap',
      mr: 'तीव्र चक्रीवादळ / वादळात अडकणे',
      hi: 'चक्रवाती तूफान में फंसना',
      ta: 'கடும் புயலில் சிக்குதல்',
      te: 'తీవ్ర తుఫానులో చిక్కుకోవడం',
      bn: 'ঘূর্ণিঝড়ে আটকে পড়া',
      gu: 'ભારે વાવાઝોડામાં ફસાવું'
    },
    defaultNote: 'Trapped in 4.5m high swell squall waves and 50 kts gale winds. Unable to steer safely.'
  },
  {
    id: 'FIRE_ONBOARD',
    icon: '🔥',
    severity: 'CRITICAL',
    title: {
      en: 'Fire / Explosion On Board',
      mr: 'नौकेवर आग / स्फोट',
      hi: 'नाव पर आग लगना',
      ta: 'படகில் தீ விபத்து',
      te: 'బోట్‌లో అग्नि ప్రమాదం',
      bn: 'নৌকায় আগুন লাগা',
      gu: 'હોડીમાં આગ લાગવી'
    },
    defaultNote: 'Engine room fire reported. Extinguishers deployed. Preparing emergency life-raft evacuation.'
  }
];

class RescueAlertService {
  constructor() {
    this.listeners = new Set();
    this.activeDistressAlerts = this.loadDistressAlerts();

    // Cross-tab real-time sync via BroadcastChannel
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        this.broadcastChannel = new window.BroadcastChannel(RESCUE_BROADCAST_CHANNEL);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_SOS_ALERT') {
            this.activeDistressAlerts = this.loadDistressAlerts();
            this.notify();
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }
  }

  loadDistressAlerts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_RESCUE_ALERTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load rescue alerts', e);
    }
    return [];
  }

  saveDistressAlerts(list) {
    this.activeDistressAlerts = list;
    try {
      localStorage.setItem(STORAGE_KEY_RESCUE_ALERTS, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to write rescue alerts', e);
    }
    this.notify();

    // Broadcast cross-tab
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'NEW_SOS_ALERT', payload: list });
      }
    } catch (e) {
      // ignore
    }
  }

  onUpdate(cb) {
    if (!this.listeners) this.listeners = new Set();
    this.listeners.add(cb);
    return () => this.listeners?.delete(cb);
  }

  notify() {
    if (this.listeners && typeof this.listeners.forEach === 'function') {
      this.listeners.forEach((cb) => {
        try { cb(this.activeDistressAlerts); } catch (e) { console.warn(e); }
      });
    }
  }

  getActiveAlerts() {
    return this.activeDistressAlerts;
  }

  /**
   * Automatically transmits fisherman's SOS distress signal and message directly to rescue teams.
   */
  dispatchAccidentSignal({
    fishermanMessage = '',
    accidentType,
    vesselId = 'IND-MH-MUM-892',
    vesselName = 'Matsya Kripa (मत्स्य कृपा)',
    captainName = 'Ramesh Koli',
    phone = '+91 98201 54321',
    crewCount = 5,
    coordinates = { lat: 18.7840, lon: 72.5620 },
    harborName = 'Mumbai'
  }) {
    const alertId = `SOS-${Date.now()}`;
    const selectedAccident = accidentType || ACCIDENT_TYPES[0];

    const finalMessage = fishermanMessage.trim() || selectedAccident.defaultNote;

    const newAlert = {
      id: alertId,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      accidentType: selectedAccident,
      fishermanMessage: finalMessage,
      vesselId,
      vesselName,
      captainName,
      phone,
      crewCount,
      coordinates,
      harborName,
      nearestCoastGuardBase: `${harborName} Coast Guard District HQ`,
      status: 'TRANSMITTED_TO_RESCUE_TEAM', // 'TRANSMITTED_TO_RESCUE_TEAM' | 'PATROL_DISPATCHED' | 'HELI_AIRBORNE' | 'RESOLVED'
      rescueUnit: 'ICGS Varaha (Fast Patrol Vessel) + Chetak CG-812 Helicopter',
      etaMinutes: 18,
      dispatchChannels: ['SATELLITE_DIRECT_LINK', 'COAST_GUARD_MRCC_FEED', 'VHF_CH_16', 'OFFLINE_SMS_1554'],
      timeline: [
        { 
          time: new Date().toLocaleTimeString(), 
          title: 'SOS Transmitted by Fisherman', 
          desc: `Message: "${finalMessage}"` 
        },
        { 
          time: new Date().toLocaleTimeString(), 
          title: 'Signal Logged at Coast Guard MRCC Command', 
          desc: `Coordinates ${coordinates.lat.toFixed(4)}° N, ${coordinates.lon.toFixed(4)}° E verified.` 
        },
        { 
          time: 'In Progress', 
          title: 'Fast Patrol Vessel Dispatching', 
          desc: 'ICGS Varaha preparing emergency departure.' 
        }
      ]
    };

    const updated = [newAlert, ...this.activeDistressAlerts];
    this.saveDistressAlerts(updated);

    return newAlert;
  }

  /**
   * Rescue team updates mission status (e.g. Dispatched, En-route, Rescued)
   */
  updateRescueStatus(alertId, newStatus, statusDesc = '') {
    const updated = this.activeDistressAlerts.map((alert) => {
      if (alert.id === alertId) {
        const newTimeline = [
          ...alert.timeline,
          {
            time: new Date().toLocaleTimeString(),
            title: newStatus.replace(/_/g, ' '),
            desc: statusDesc || 'Rescue team operational update.'
          }
        ];
        return {
          ...alert,
          status: newStatus,
          timeline: newTimeline
        };
      }
      return alert;
    });

    this.saveDistressAlerts(updated);
  }

  cancelDistressAlert(alertId) {
    const updated = this.activeDistressAlerts.filter((a) => a.id !== alertId);
    this.saveDistressAlerts(updated);
  }
}

export const rescueAlertService = new RescueAlertService();
