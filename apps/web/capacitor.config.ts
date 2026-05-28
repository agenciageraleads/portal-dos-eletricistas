import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.portaleletricos.app',
  appName: 'Portal Elétricos',
  webDir: 'public',
  server: {
    url: 'https://app.portaleletricos.com.br',
    cleartext: false
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#667eea",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
