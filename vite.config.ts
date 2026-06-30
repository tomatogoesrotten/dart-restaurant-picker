import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const PROXY_PORT = process.env.PORT ?? "8787";

// Dev-proxy forwards /api to the local Node proxy process so the browser
// only ever talks to our own origin (the Google key lives in the proxy).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: `http://localhost:${PROXY_PORT}`,
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "server/**/*.test.js"],
  },
});
