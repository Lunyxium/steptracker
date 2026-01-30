// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Step data types
export interface DayEntry {
  id: string;
  date: string; // "2026-01-27"
  steps: number;
  distance: number; // in km
  calories: number;
  goalReached: boolean;
  updatedAt: Date;
}

// Settings types
export interface Settings {
  gpsEnabled: boolean;
  vibrationEnabled: boolean;
  dailyGoal: number;
}

// Home screen state
export interface HomeState {
  steps: number;
  distance: number; // in km
  calories: number;
  goalReached: boolean;
  isTracking: boolean;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Pedometer hook return type
export interface PedometerData {
  steps: number;
  isAvailable: boolean;
  error: string | null;
}

// Location hook return type
export interface LocationData {
  distance: number;
  isTracking: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}
