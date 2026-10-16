import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 8100 }, // the usual Ionic port
  build: { chunkSizeWarningLimit: 2000 }, // Ionic apps are big; this warning is just noise
});
