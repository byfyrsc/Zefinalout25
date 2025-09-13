import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.22ee0bf878a549d589387d45c2f48a2e',
  appName: 'intelifeed-hub-07',
  webDir: 'dist',
  server: {
    url: 'https://22ee0bf8-78a5-49d5-8938-7d45c2f48a2e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Haptics: {
      enable: true
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;