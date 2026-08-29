/**
 * Authentication Service for MatsyaSetu.
 * Supports OTP-based Fisherman Authentication, Official Authority Login,
 * and Persistent Session Management.
 */

const STORAGE_AUTH_KEY = 'matsya_authenticated_user_v1';

export const DEMO_USERS = {
  fisherman: {
    id: 'USR-FISH-892',
    name: 'Ramesh Koli (रमेश कोळी)',
    role: 'fisherman',
    phone: '+91 98765 43210',
    vesselId: 'IND-MH-MUM-892',
    boatType: 'Motorized Country Craft (OBM)',
    homeHarbor: 'mumbai',
    state: 'Maharashtra',
    verified: true,
  },
  officer: {
    id: 'USR-OFFICER-007',
    name: 'Capt. Arvind Sharma',
    role: 'admin',
    email: 'officer@incois.gov.in',
    designation: 'Senior Marine Safety Officer, INCOIS',
    station: 'Mumbai Sassoon Docks Sector',
    badgeId: 'INCOIS-CMD-409',
    verified: true,
  },
};

class AuthService {
  constructor() {
    this.currentUser = this.loadStoredUser();
    this.listeners = new Set();
  }

  loadStoredUser() {
    try {
      const data = localStorage.getItem(STORAGE_AUTH_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Auth load error', e);
    }
    // Default to demo fisherman for easy first-time hackathon review
    return DEMO_USERS.fisherman;
  }

  saveUser(user) {
    this.currentUser = user;
    try {
      if (user) {
        localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_AUTH_KEY);
      }
    } catch (e) {
      console.warn('Auth save error', e);
    }
    this.notify();
  }

  onAuthChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return Boolean(this.currentUser);
  }

  /**
   * Fisherman Mobile / OTP Login
   */
  async loginWithPhone(phone, otp, boatId = 'IND-MH-MUM-892') {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 400));

    if (otp !== '1234' && otp.length < 4) {
      throw new Error('Invalid OTP. Use demo OTP: 1234');
    }

    const user = {
      id: `USR-FISH-${Math.floor(100 + Math.random() * 900)}`,
      name: 'Registered Boat Master',
      role: 'fisherman',
      phone: phone || '+91 98765 43210',
      vesselId: boatId || 'IND-MH-MUM-892',
      boatType: 'Motorized Trawler',
      homeHarbor: 'mumbai',
      verified: true,
    };

    this.saveUser(user);
    return user;
  }

  /**
   * Coastal Authority Officer Login
   */
  async loginOfficer(email, password) {
    await new Promise((res) => setTimeout(res, 400));

    if (!email || !password) {
      throw new Error('Please enter official email and password');
    }

    const user = {
      ...DEMO_USERS.officer,
      email: email || 'officer@incois.gov.in',
    };

    this.saveUser(user);
    return user;
  }

  /**
   * Quick Hackathon 1-Tap Demo Login
   */
  loginDemo(role = 'fisherman') {
    const user = DEMO_USERS[role] || DEMO_USERS.fisherman;
    this.saveUser(user);
    return user;
  }

  logout() {
    this.saveUser(null);
  }
}

export const authService = new AuthService();
