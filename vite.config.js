// vite.config.js

import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        time: resolve(__dirname, 'time.html'),
        matamata: resolve(__dirname, 'mata-mata.html'),
        // Adicionada a nova página de times
        teams: resolve(__dirname, 'teams.html'),
      },
    },
  },
  assetsInclude: ['**/*.JPG', '**/*.jpeg', '**/*.png', '**/*.jpg'],
});