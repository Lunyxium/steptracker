# StepTracker

> Kompetenznachweis Modul 335 — Mobile-Applikation realisieren

Eine mobile Schrittzähler-App mit Echtzeit-Tracking, GPS-Distanzberechnung und Firebase-Backend — entwickelt mit React Native und Expo.

## 📚 [→ Dokumentation im Wiki](https://github.com/Lunyxium/steptracker/wiki)
---

## Highlights

| Feature | Beschreibung |
|---------|-------------|
| **Schrittzähler** | Echtzeit-Pedometer via Hardware Step Counter mit Fallback-Mechanismus |
| **GPS-Tracking** | Distanzberechnung mit Haversine-Formel, optional ein-/ausschaltbar |
| **Tagesziel-System** | Konfigurierbares Ziel (5'000–20'000 Schritte) mit haptischem Feedback bei Erreichung |
| **Verlauf** | 7-Tage-Balkendiagramm und tägliche Statistiken (Schritte, km, kcal) |
| **Cloud-Sync** | Firebase Firestore mit Offline-Persistenz und Auto-Save alle 30 Sekunden |
| **Authentifizierung** | Firebase Auth (Email/Passwort) mit Session-Persistenz und Remember Me |

<div align="center"><img src="https://raw.githubusercontent.com/Lunyxium/steptracker/master/documentation/Screenshot_StepTracker.jpeg" width="40%"></div>

---

## Tech Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| [React Native](https://reactnative.dev/) | 0.81.5 | UI-Framework |
| [Expo SDK](https://expo.dev/) | 54 | Build-Pipeline, Sensor-APIs, Routing |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.2 | Typsichere Entwicklung |
| [Firebase](https://firebase.google.com/) | 12.8.0 | Auth + Firestore |
| [Expo Router](https://docs.expo.dev/router/introduction/) | 6.0.22 | File-based Navigation |

### Sensoren und Aktoren

| Komponente | Library | Typ |
|------------|---------|-----|
| Schrittzähler | `expo-sensors` | Sensor |
| GPS / Location | `expo-location` | Sensor |
| Vibration | `expo-haptics` | Aktor |

---

## Projektstruktur

```
steptracker/
├── app/                          # Screens (Expo Router)
│   ├── _layout.tsx               # Root Layout mit AuthProvider
│   ├── index.tsx                 # Entry Point (Auth-Redirect)
│   ├── login.tsx                 # Login / Registrierung
│   └── (tabs)/                   # Tab-Navigator
│       ├── index.tsx             # Home (Schrittzähler + Stats)
│       ├── history.tsx           # Verlauf (7-Tage-Chart)
│       └── settings.tsx          # Einstellungen
├── components/
│   ├── ui/                       # Button, Card, ProgressRing
│   └── features/                 # StepCounter, StatsCard, HistoryChart
├── hooks/                        # useAuth, usePedometer, useLocation, useStepData
├── services/                     # Firebase Init, Firestore CRUD, Haptic Feedback
├── constants/                    # Theme Tokens, App-Konfiguration
├── utils/                        # Haversine, Formatierung, Datumshilfen
└── types/                        # TypeScript Interfaces
```

---

## Voraussetzungen

- **Node.js** >= 18
- **npm**
- **EAS CLI** — `npm install -g eas-cli`
- **Expo Account** — `npx expo register` (kostenlos)
- **Firebase-Projekt** mit Email/Password Auth und Firestore
- **Physisches Android-Gerät** (Pedometer funktioniert nicht im Emulator)

---

## Installation und Setup

### 1. Repository klonen

```powershell
git clone https://github.com/Lunyxium/steptracker.git
cd steptracker
```

### 2. Dependencies installieren

```powershell
npm install
```

### 3. Firebase konfigurieren

`.env` Datei im Projekt-Root erstellen (siehe `.env.example`):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=<dein-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<app-id>
```

> Die Werte findest du in der [Firebase Console](https://console.firebase.google.com) unter Projekteinstellungen.

### 4. Firebase-Dienste aktivieren

1. **Authentication** — Sign-in method — Email/Password aktivieren
2. **Firestore Database** erstellen — Production-Modus
3. **Security Rules** setzen:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Development Build erstellen

> **Wichtig:** Expo Go reicht fuer dieses Projekt nicht aus. Der Schrittzaehler braucht die `ACTIVITY_RECOGNITION`-Permission, die nur in einem Development Build verfuegbar ist.

```powershell
npx expo install expo-dev-client
eas build --platform android --profile development
npx expo start --dev-client
```

Geraet und PC muessen im gleichen WLAN sein.

---

## APK erstellen

### Preview (Abgabe / Testing)

```powershell
eas build --platform android --profile preview
```

Erzeugt eine standalone `.apk` die ohne Dev Server funktioniert.

### Production (Play Store)

```powershell
eas build --platform android --profile production
```

Erzeugt ein signiertes `.aab` (Android App Bundle) fuer den Google Play Store.

---

## Firestore-Datenstruktur

```
users/{userId}/
├── steps/{YYYY-MM-DD}          # Taegliche Eintraege
│   ├── steps: number
│   ├── distance: number (km)
│   ├── calories: number
│   ├── goalReached: boolean
│   └── updatedAt: Timestamp
└── settings/preferences        # User-Einstellungen
    ├── dailyGoal: number
    ├── gpsEnabled: boolean
    └── vibrationEnabled: boolean
```

---

## Android Permissions

| Permission | Zweck | Runtime-Request |
|------------|-------|-----------------|
| `ACTIVITY_RECOGNITION` | Schrittzaehler | Ja (Android 10+) |
| `ACCESS_FINE_LOCATION` | GPS-Tracking | Ja |
| `ACCESS_COARSE_LOCATION` | GPS-Fallback | Ja |
| `VIBRATE` | Haptisches Feedback | Nein |

---

## Lizenz

Schulprojekt — Modul 335, Applikationsentwicklung EFZ
