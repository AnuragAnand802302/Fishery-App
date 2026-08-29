import { INITIAL_ADVISORIES } from '../data/mockAdvisories';

const STORAGE_KEYS = {
  ADVISORIES: 'matsya_advisories_v3',
  LANGUAGE: 'matsya_user_language',
  LOW_BANDWIDTH: 'matsya_2g_mode',
  SELECTED_HARBOR: 'matsya_selected_harbor',
  USER_LOCATION: 'matsya_simulated_boat_gps',
  THEME: 'matsya_theme_preference',
};

export const storageService = {
  getAdvisories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADVISORIES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initial advisories so new multi-language fields are preserved
          const initialMap = new Map(INITIAL_ADVISORIES.map(a => [a.id, a]));
          return parsed.map(adv => {
            if (initialMap.has(adv.id)) {
              return { ...initialMap.get(adv.id), ...adv, voiceText: initialMap.get(adv.id).voiceText, titles: initialMap.get(adv.id).titles };
            }
            return adv;
          });
        }
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
    // Initialize with default mock advisories
    this.saveAdvisories(INITIAL_ADVISORIES);
    return INITIAL_ADVISORIES;
  },

  saveAdvisories(advisories) {
    try {
      localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(advisories));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  },

  addAdvisory(newAdvisory) {
    const list = this.getAdvisories();
    const updated = [newAdvisory, ...list];
    this.saveAdvisories(updated);
    return updated;
  },

  getLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
    } catch {
      return 'en';
    }
  },

  setLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('Could not save language', e);
    }
  },

  getLowBandwidthMode() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LOW_BANDWIDTH) === 'true';
    } catch {
      return false;
    }
  },

  setLowBandwidthMode(enabled) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOW_BANDWIDTH, String(enabled));
    } catch (e) {
      console.warn('Could not save 2G mode', e);
    }
  },

  getSelectedHarbor() {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_HARBOR) || 'mumbai';
    } catch {
      return 'mumbai';
    }
  },

  setSelectedHarbor(harborId) {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_HARBOR, harborId);
    } catch (e) {
      console.warn('Could not save harbor', e);
    }
  },

  getUserLocation() {
    try {
      const loc = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
      if (loc) return JSON.parse(loc);
    } catch {
      // default
    }
    return { lat: 18.9186, lon: 72.8277, name: 'Mumbai Coast' };
  },

  setUserLocation(location) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
    } catch (e) {
      console.warn('Could not save location', e);
    }
  },

  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'beach';
    } catch {
      return 'beach';
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Could not save theme', e);
    }
  }
};
