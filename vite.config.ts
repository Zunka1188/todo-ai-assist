
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "2b5e2c77-f4b2-4032-b2a4-6c5215a35766.lovableproject.com"
    ],
  },
  plugins: [
    react(),
    tsconfigPaths(),
    // Only include lovable-tagger in development mode if available
    mode === 'development' && (() => {
      try {
        return require('lovable-tagger')?.componentTagger();
      } catch (e) {
        console.warn('lovable-tagger not found, skipping component tagging');
        return null;
      }
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
}));
