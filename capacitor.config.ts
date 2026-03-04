import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.glinto.app',
  appName: 'Glinto',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#0a0b14"
    },
    AdMob: {
      appId: "ca-app-pub-3940256099942544~3347511713", // Google Test App ID for Android
    }
  }

};

export default config;
