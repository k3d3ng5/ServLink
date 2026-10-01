export default {
  name: "ServLink",
  slug: "servlink",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "servlink",
  userInterfaceStyle: "light",
  splash: { resizeMode: "contain", backgroundColor: "#FFFFFF" },
  ios: { supportsTablet: true, bundleIdentifier: "com.servlink.app" },
  android: { package: "com.servlink.app" },
  web: { favicon: "./assets/favicon.png" },
  plugins: ["expo-router", "expo-status-bar", "expo-font", "expo-splash-screen"],
  extra: {
    router: {},
    // Baked at EAS build time: SERVLINK_API_URL=https://<public-api>
    apiUrl: process.env.SERVLINK_API_URL,
    eas: { projectId: "0de8bc45-55d6-4cd2-b9e5-979cdfab4d9b" },
  },
  owner: "yaxx",
};
