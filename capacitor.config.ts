import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.davidchiriac.wifesrecipebook",
  appName: "Wife's Recipe Book",
  webDir: 'dist/wifes-recipe-book/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#0C1220',
    },
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    FirebaseAuthentication: {
      // Enable Google sign-in for native via the Firebase Auth Capacitor plugin.
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
