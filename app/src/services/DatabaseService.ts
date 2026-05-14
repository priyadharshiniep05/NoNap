// Fallback for AsyncStorage if the module is not yet installed
// This allows the app to run in Expo Go even if the package is missing.

let AsyncStorage: any = {
  getItem: async (key: string) => null,
  setItem: async (key: string, value: string) => {},
  removeItem: async (key: string) => {},
};

try {
  // Try to require the real AsyncStorage if available
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('AsyncStorage module not found, using in-memory mock. Run "npx expo install @react-native-async-storage/async-storage" to fix.');
  
  // Simple in-memory fallback
  const _storage: Record<string, string> = {};
  AsyncStorage = {
    getItem: async (key: string) => _storage[key] || null,
    setItem: async (key: string, value: string) => { _storage[key] = value; },
    removeItem: async (key: string) => { delete _storage[key]; },
  };
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'personal' | 'fleet';
  name: string;
}

export interface AlertLog {
  id: string;
  driverId: string;
  timestamp: string;
  type: 'DROWSY' | 'CAUTION';
  location?: { latitude: number; longitude: number };
}

class DatabaseService {
  private USER_KEY = '@nonap_user_profile';
  private ALERTS_KEY = '@nonap_alerts';

  async login(email: string, role: 'personal' | 'fleet'): Promise<UserProfile> {
    const profile: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role,
      name: email.split('@')[0],
    };
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(profile));
    return profile;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const data = await AsyncStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  async logAlert(alert: Omit<AlertLog, 'id' | 'timestamp'>): Promise<void> {
    const newAlert: AlertLog = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    console.log('🚨 ALERT LOGGED:', newAlert);

    const existingAlerts = await this.getAlerts();
    await AsyncStorage.setItem(this.ALERTS_KEY, JSON.stringify([newAlert, ...existingAlerts]));
  }

  async getAlerts(): Promise<AlertLog[]> {
    const data = await AsyncStorage.getItem(this.ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async logout() {
    await AsyncStorage.removeItem(this.USER_KEY);
  }
}

export const db = new DatabaseService();
