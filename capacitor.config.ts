import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.fitpulse.sportapp',
  appName: 'FitPulse Sport & Gesundheit',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#10b981',
    },
  },
};

export default config;
