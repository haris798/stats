import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.screentime.ku',
  appName: 'ScreenTime.ku',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
