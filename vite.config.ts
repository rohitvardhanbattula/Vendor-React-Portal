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
        target: 'https://the-hackett-group-d-b-a-answerthink--inc--at-development1a73fa6.cfapps.us10.hana.ondemand.com/',
        changeOrigin: true,
        secure: false
      },
      '/uploadattachments': {
        target: 'https://the-hackett-group-d-b-a-answerthink--inc--at-development1a73fa6.cfapps.us10.hana.ondemand.com/',
        changeOrigin: true,
        secure: false
      },
      '/fileextraction': {
        target: 'https://the-hackett-group-d-b-a-answerthink--inc--at-development1a73fa6.cfapps.us10.hana.ondemand.com/',
        changeOrigin: true,
        secure: false
      },
      '/fetchGSTDetails': {
        target: 'https://the-hackett-group-d-b-a-answerthink--inc--at-development1a73fa6.cfapps.us10.hana.ondemand.com/',
        changeOrigin: true,
        secure: false
      },
      '/downloadZip': {
        target: 'https://the-hackett-group-d-b-a-answerthink--inc--at-development1a73fa6.cfapps.us10.hana.ondemand.com/',
        changeOrigin: true,
        secure: false
      },
      '/downloadFile': {
        target: 'https://the-hackett-group-d-b-a-answerthink--inc--at-development1a73fa6.cfapps.us10.hana.ondemand.com/',
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
