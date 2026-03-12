import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Polyfill Node's `global` for any remaining CommonJS libraries.
  // Required by packages like simple-peer, randombytes, etc.
  // Even though Room.jsx now uses native RTCPeerConnection, this prevents
  // any other transitive dependency from breaking with the same error.
  define: {
    global: 'globalThis',
  },

  server: {
    port: 5173,
  },
});
