import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FieldShift Ethiopia — NASA Agricultural Decision Support',
        short_name: 'FieldShift ET',
        theme_color: '#245B3C',
        background_color: '#F7F8F2',
        display: 'standalone'
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
});
