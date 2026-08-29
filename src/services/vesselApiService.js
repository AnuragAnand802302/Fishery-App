/**
 * VesselAPI - Real-time AIS, NavIC Satellite & VMS Fleet Telemetry Service.
 * Provides live location tracking of registered fishing vessels for:
 * 1. Fishermen's Families & Relatives (Peace of Mind & Safety Status)
 * 2. Indian Coast Guard & Govt Marine Rescue Teams (Disaster Response & SOS Search)
 */

const STORAGE_KEY_VESSELS = 'matsya_registered_vessels_v1';

export const INITIAL_REGISTERED_VESSELS = [
  {
    id: 'IND-MH-MUM-892',
    name: 'Matsya Rani (मत्स्य राणी)',
    masterName: 'Ramesh Koli (रमेश कोळी)',
    phone: '+91 98765 43210',
    harborId: 'mumbai',
    harborName: 'Mumbai Sassoon Docks',
    state: 'Maharashtra',
    boatType: 'Motorized Trawler (32 ft)',
    crewCount: 4,
    coordinates: { lat: 18.7840, lon: 72.5620 },
    speedKnots: 6.4,
    headingDeg: 245,
    headingDirection: 'WSW',
    distanceFromShoreKm: 28.5,
    distanceFromShoreNm: 15.4,
    depthMeters: 38,
    batteryPct: 88,
    fuelLitres: 140,
    fuelCapacityLitres: 200,
    satelliteSignal: 'STRONG (NavIC-7)',
    status: 'ACTIVE_FISHING', // 'ACTIVE_FISHING' | 'RETURNING' | 'SOS_DISTRESS' | 'DOCK'
    lastPing: '2 mins ago',
    relativeContact: {
      name: 'Sunita Koli (Wife)',
      phone: '+91 98765 11223',
      relation: 'Spouse',
      village: 'Colaba Koliwada, Mumbai'
    },
    safetyStatus: 'SAFE'
  },
  {
    id: 'IND-AP-VIZ-401',
    name: 'Samudra Ratna (సముద్ర రత్న)',
    masterName: 'K. Appa Rao',
    phone: '+91 94401 23456',
    harborId: 'vizag',
    harborName: 'Visakhapatnam Harbor',
    state: 'Andhra Pradesh',
    boatType: 'Mechanized Deep Sea Craft',
    crewCount: 6,
    coordinates: { lat: 17.5210, lon: 83.4890 },
    speedKnots: 7.8,
    headingDeg: 130,
    headingDirection: 'SE',
    distanceFromShoreKm: 34.0,
    distanceFromShoreNm: 18.3,
    depthMeters: 55,
    batteryPct: 74,
    fuelLitres: 280,
    fuelCapacityLitres: 400,
    satelliteSignal: 'STRONG (NavIC-5)',
    status: 'ACTIVE_FISHING',
    lastPing: 'Just now',
    relativeContact: {
      name: 'K. Lakshmi (Wife)',
      phone: '+91 94401 98765',
      relation: 'Spouse',
      village: 'Fishermen Colony, Vizag'
    },
    safetyStatus: 'SAFE'
  },
  {
    id: 'IND-TN-CHE-205',
    name: 'Kadal Veeran (கடல் வீரன்)',
    masterName: 'M. Murugan',
    phone: '+91 98402 34567',
    harborId: 'chennai',
    harborName: 'Chennai Kasimedu Port',
    state: 'Tamil Nadu',
    boatType: 'Motorized Country Craft',
    crewCount: 3,
    coordinates: { lat: 12.9850, lon: 80.4500 },
    speedKnots: 5.2,
    headingDeg: 110,
    headingDirection: 'ESE',
    distanceFromShoreKm: 22.0,
    distanceFromShoreNm: 11.8,
    depthMeters: 28,
    batteryPct: 45,
    fuelLitres: 65,
    fuelCapacityLitres: 120,
    satelliteSignal: 'MEDIUM (NavIC-3)',
    status: 'RETURNING',
    lastPing: '4 mins ago',
    relativeContact: {
      name: 'V. Murugan (Brother)',
      phone: '+91 98402 77889',
      relation: 'Brother',
      village: 'Kasimedu, Chennai'
    },
    safetyStatus: 'SAFE'
  },
  {
    id: 'IND-KL-KOC-318',
    name: 'Sagara Kanya (സാഗര കന്യക)',
    masterName: 'Joseph Antony',
    phone: '+91 94471 88990',
    harborId: 'kochi',
    harborName: 'Kochi Thoppumpady',
    state: 'Kerala',
    boatType: 'Ring Seine Trawler',
    crewCount: 8,
    coordinates: { lat: 9.8120, lon: 76.0100 },
    speedKnots: 0.8,
    headingDeg: 280,
    headingDirection: 'WNW',
    distanceFromShoreKm: 31.2,
    distanceFromShoreNm: 16.8,
    depthMeters: 42,
    batteryPct: 22,
    fuelLitres: 40,
    fuelCapacityLitres: 300,
    satelliteSignal: 'CRITICAL (NavIC-1)',
    status: 'SOS_DISTRESS',
    lastPing: '30 secs ago',
    relativeContact: {
      name: 'Mary Antony (Wife)',
      phone: '+91 94471 11223',
      relation: 'Spouse',
      village: 'Fort Kochi'
    },
    safetyStatus: 'SOS_ACTIVE'
  },
  {
    id: 'IND-GJ-VER-109',
    name: 'Jai Somnath (જય સોમનાથ)',
    masterName: 'Karsanbhai Kharva',
    phone: '+91 98251 44556',
    harborId: 'veraval',
    harborName: 'Veraval Fishing Port',
    state: 'Gujarat',
    boatType: 'Gillnet Trawler',
    crewCount: 5,
    coordinates: { lat: 20.7400, lon: 70.1200 },
    speedKnots: 7.1,
    headingDeg: 230,
    headingDirection: 'SW',
    distanceFromShoreKm: 42.0,
    distanceFromShoreNm: 22.6,
    depthMeters: 48,
    batteryPct: 92,
    fuelLitres: 210,
    fuelCapacityLitres: 250,
    satelliteSignal: 'STRONG (NavIC-6)',
    status: 'ACTIVE_FISHING',
    lastPing: '1 min ago',
    relativeContact: {
      name: 'Dinesh Kharva (Son)',
      phone: '+91 98251 99887',
      relation: 'Son',
      village: 'Kharvawad, Veraval'
    },
    safetyStatus: 'SAFE'
  }
];

class VesselApiService {
  constructor() {
    this.listeners = new Set();
    this.vessels = this.loadStoredVessels();
    this.simTimer = null;
    this.startLiveSimulation();
  }

  loadStoredVessels() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_VESSELS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Vessel storage load error', e);
    }
    this.saveVessels(INITIAL_REGISTERED_VESSELS);
    return INITIAL_REGISTERED_VESSELS;
  }

  saveVessels(list) {
    this.vessels = list;
    try {
      localStorage.setItem(STORAGE_KEY_VESSELS, JSON.stringify(list));
    } catch (e) {
      console.warn('Vessel storage write error', e);
    }
    this.notify();
  }

  onUpdate(cb) {
    if (!this.listeners) this.listeners = new Set();
    this.listeners.add(cb);
    return () => this.listeners?.delete(cb);
  }

  notify() {
    if (this.listeners && typeof this.listeners.forEach === 'function') {
      this.listeners.forEach((cb) => {
        try { cb(this.vessels); } catch (e) { console.warn(e); }
      });
    }
  }

  getAllVessels() {
    return this.vessels;
  }

  getVesselByIdOrPhone(query) {
    if (!query) return null;
    const clean = query.trim().toUpperCase().replace(/\s+/g, '');
    return this.vessels.find((v) => 
      v.id.toUpperCase().replace(/\s+/g, '').includes(clean) ||
      v.phone.replace(/\D/g, '').includes(clean.replace(/\D/g, '')) ||
      v.name.toUpperCase().includes(clean)
    );
  }

  /**
   * Register a new vessel from the Fisherman App
   */
  registerVessel(newVessel) {
    const list = [newVessel, ...this.vessels.filter((v) => v.id !== newVessel.id)];
    this.saveVessels(list);
    return newVessel;
  }

  /**
   * Trigger SOS Distress for a specific vessel
   */
  triggerVesselSOS(vesselId, reason = 'ENGINE_FAILURE') {
    const updated = this.vessels.map((v) => {
      if (v.id === vesselId) {
        return {
          ...v,
          status: 'SOS_DISTRESS',
          safetyStatus: 'SOS_ACTIVE',
          lastPing: 'SOS LIVE BEACON',
          sosReason: reason,
        };
      }
      return v;
    });
    this.saveVessels(updated);
  }

  /**
   * Dispatch Rescue Team to Vessel
   */
  dispatchRescueTeam(vesselId, rescueUnitName = 'ICGS Samarth (Coast Guard Fast Patrol)') {
    const updated = this.vessels.map((v) => {
      if (v.id === vesselId) {
        return {
          ...v,
          rescueDispatched: true,
          rescueUnit: rescueUnitName,
          rescueEtaMins: 24,
        };
      }
      return v;
    });
    this.saveVessels(updated);
    return true;
  }

  /**
   * Live NavIC AIS micro-movement simulation
   */
  startLiveSimulation() {
    if (this.simTimer) clearInterval(this.simTimer);

    this.simTimer = setInterval(() => {
      let changed = false;
      const updated = this.vessels.map((v) => {
        if (v.status === 'DOCK') return v;

        // Slight drift/speed simulation
        const latDelta = (Math.random() - 0.5) * 0.0004;
        const lonDelta = (Math.random() - 0.5) * 0.0004;
        changed = true;

        return {
          ...v,
          coordinates: {
            lat: Number((v.coordinates.lat + latDelta).toFixed(4)),
            lon: Number((v.coordinates.lon + lonDelta).toFixed(4)),
          },
          lastPing: 'Just now',
        };
      });

      if (changed) {
        this.saveVessels(updated);
      }
    }, 15000);
  }
}

export const vesselApiService = new VesselApiService();
