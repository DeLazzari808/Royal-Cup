import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        time: resolve(__dirname, 'time.html'),
      },
    },
  },
  assetsInclude: ['**/*.JPG', '**/*.jpeg', '**/*.png', '**/*.jpg'],
});