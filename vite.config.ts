import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // REMOVED 'base: './' to use the default absolute path '/'
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
