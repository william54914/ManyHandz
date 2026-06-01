import type { CapacitorConfig } from "@capacitor/cli";

// ManyHandz is a server-rendered Next.js app. Capacitor wraps a hosted URL
// rather than bundling a static export. To build the native shell:
//   1. Deploy the Next.js app (Vercel/Render/etc).
//   2. Set CAPACITOR_SERVER_URL to that deployment URL.
//   3. Run `npx cap sync` then `npx cap open ios` / `npx cap open android`.
//
// Set CAPACITOR_USE_LOCAL_DEV=1 to point at http://localhost:3000 instead
// (useful while developing the native shell).
const productionUrl =
  process.env.CAPACITOR_SERVER_URL || "https://app.manyhandz.com";
const devUrl = "http://localhost:3000";
const useLocalDev = process.env.CAPACITOR_USE_LOCAL_DEV === "1";

const config: CapacitorConfig = {
  appId: "com.manyhandz.app",
  appName: "ManyHandz",
  // webDir points at the (intentionally minimal) static fallback shipped
  // inside the IPA/APK. The real app is loaded from `server.url` below.
  // Run `npm run build:native-shell` to generate the fallback if you ever
  // need fully offline first-launch.
  webDir: "public",
  server: {
    url: useLocalDev ? devUrl : productionUrl,
    androidScheme: "https",
    iosScheme: "https",
    cleartext: useLocalDev,
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#0a0e1a",
  },
  android: {
    backgroundColor: "#0a0e1a",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0e1a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
