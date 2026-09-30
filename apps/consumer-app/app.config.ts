import base from "./app.json";

type AppJson = typeof base & {
  expo: typeof base.expo & { extra?: Record<string, string | undefined> };
};

const config: AppJson = {
  ...base,
  expo: {
    ...base.expo,
    extra: {
      // Baked at EAS build time: SERVLINK_API_URL=http://<lan-ip>:3001
      apiUrl: process.env.SERVLINK_API_URL,
      eas: { projectId: "0de8bc45-55d6-4cd2-b9e5-979cdfab4d9b" },
    },
  },
};

export default config;
