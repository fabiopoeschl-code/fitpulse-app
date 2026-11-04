import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.fitpulse.sportapp',
  appName: 'FitPulse',
  webDir: 'out',
  overrideUserAgent:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  server: {
    url: 'https://fitpulse-app-iota.vercel.app',
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'fitpulse-app-iota.vercel.app',
      '*.vercel.app',
      '*.supabase.co',
      'accounts.google.com',
      '*.google.com',
      '*.gstatic.com',
    ],
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#10b981',
    },
  },
};

export default config;
