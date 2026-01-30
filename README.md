# StepTracker

A React Native step counter app built with Expo for the M335 school project.

## Features

- **Step Counting**: Real-time pedometer tracking using device sensors
- **Distance Tracking**: GPS-based distance calculation
- **Goal System**: Customizable daily step goals with haptic feedback
- **History**: View your step history with weekly chart
- **Firebase Backend**: Cloud sync with Firebase Auth and Firestore

## Tech Stack

- Expo SDK 54+ with TypeScript
- Expo Router (file-based routing)
- Firebase Auth (Email/Password)
- Firebase Firestore
- expo-sensors (Pedometer)
- expo-location (GPS)
- expo-haptics (Vibration feedback)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your Android device
- Firebase project (for cloud features)

### Installation

```bash
# Install dependencies (use PowerShell on Windows/WSL)
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npx expo start
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Create a Firestore database
4. Copy your web app config to `.env`

### Running on Device

1. Install Expo Go on your Android phone
2. Run `npx expo start`
3. Scan the QR code with Expo Go

**Note**: Pedometer requires a physical device - it won't work in emulators.

## Project Structure

```
steptracker/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigator screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Entry redirect
│   └── login.tsx          # Login screen
├── components/            # Reusable components
│   ├── ui/               # Generic UI (Button, Card, ProgressRing)
│   └── features/         # Feature components (StepCounter, StatsCard)
├── hooks/                 # Custom React hooks
├── services/              # Firebase and external services
├── constants/             # Theme and config
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions
```

## Building APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

## License

School project - M335 React Native
