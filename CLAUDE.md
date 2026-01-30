# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (use PowerShell on Windows/WSL due to chmod issues)
powershell.exe -Command "cd 'C:\Users\Matt\IdeaProjects\steptracker'; npm install"

# Start Expo development server
npx expo start

# Start for Android
npx expo start --android

# Build APK with EAS
eas build --platform android --profile preview

# Type checking
npx tsc --noEmit
```

## Architecture

### Expo Router (File-based Routing)
- `app/_layout.tsx` - Root layout with AuthProvider
- `app/index.tsx` - Entry point, redirects based on auth state
- `app/login.tsx` - Email/password authentication
- `app/(tabs)/` - Protected tab navigator (Home, History, Settings)

### State Management
- **Auth**: React Context via `useAuth` hook (`hooks/useAuth.tsx`)
- **Step Data**: Custom hook `useStepData` manages Firestore sync
- **Settings**: Stored in Firestore, cached locally with auto-save

### Sensor Integration
- `usePedometer`: Subscribes to `expo-sensors` Pedometer, gets historical steps from midnight
- `useLocation`: Watches GPS position, calculates distance via Haversine formula
- Auto-saves to Firestore every 30 seconds and on significant step changes

### Firebase Structure
```
users/{userId}/
  ├── settings/preferences  # dailyGoal, gpsEnabled, vibrationEnabled
  └── steps/{date}          # Daily step records (steps, distance, calories, goalReached)
```

### Key Files
- `services/firebase.ts` - Firebase initialization (uses EXPO_PUBLIC_ env vars)
- `services/firestore.ts` - All Firestore CRUD operations
- `constants/theme.ts` - Design tokens (colors, typography, spacing)
- `constants/config.ts` - App configuration (goals, intervals)

## Firebase Configuration

Create `.env` from `.env.example` with real Firebase credentials:
```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
```

## Testing Notes

- Pedometer only works on physical devices, not emulators
- GPS requires location permission and may drain battery
- Goal vibration triggers once per day (tracked in AsyncStorage)
