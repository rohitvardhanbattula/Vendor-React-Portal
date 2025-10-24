import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/odata': {
        target: 'http://localhost:4004',
        changeOrigin: true,
        secure: false
      },
      '/uploadattachments': {
        target: 'http://localhost:4004',
        changeOrigin: true,
        secure: false
      },
      '/fileextraction': {
        target: 'http://localhost:4004',
        changeOrigin: true,
        secure: false
      },
      '/fetchGSTDetails': {
        target: 'http://localhost:4004',
        changeOrigin: true,
        secure: false
      },
      '/downloadZip': {
        target: 'http://localhost:4004',
        changeOrigin: true,
        secure: false
      },
      '/downloadFile': {
        target: 'http://localhost:4004',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
