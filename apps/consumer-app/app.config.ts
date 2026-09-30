import base from "./app.json";

const baseExtra = (base.expo as { extra?: Record<string, unknown> }).extra ?? {};

export default {
  ...base,
  expo: {
    ...base.expo,
    extra: {
      ...baseExtra,
      // Baked at EAS build time: SERVLINK_API_URL=http://<lan-ip>:3001
      apiUrl: process.env.SERVLINK_API_URL,
      eas: { projectId: "0de8bc45-55d6-4cd2-b9e5-979cdfab4d9b" },
    },
  },
};
