export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || "123kasdk123",
  },
  server: {
    port: parseInt(process.env.WS_PORT || "3001"),
  },
} as const;
