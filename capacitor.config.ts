import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.manyhandz.app',
  appName: 'ManyHandz',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
