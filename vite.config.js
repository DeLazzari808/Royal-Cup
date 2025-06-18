import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // ESTA LINHA É A SOLUÇÃO DEFINITIVA
  // Ela diz ao Vite para tratar esses arquivos como imagens, e não como código.
  assetsInclude: ['**/*.JPG', '**/*.jpeg', '**/*.png', '**/*.jpg'],
});