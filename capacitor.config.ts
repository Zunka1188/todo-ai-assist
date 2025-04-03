
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2b5e2c77f4b24032b2a46c5215a35766',
  appName: 'todo-ai-assist',
  webDir: 'dist',
  server: {
    url: 'https://2b5e2c77-f4b2-4032-b2a4-6c5215a35766.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // Ensure proper sizing for mobile devices
  ios: {
    contentInset: 'always',
  },
  android: {
    useLegacyBridge: false
  }
};

export default config;
