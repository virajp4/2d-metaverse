export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || "123kasdk123",
    expiresIn: "24h",
  },
  server: {
    port: process.env.PORT || 3000,
  },
} as const;

export type Config = typeof config;
