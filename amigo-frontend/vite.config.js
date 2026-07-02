<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // 1. Import this
=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
>>>>>>> ravindu/master

// https://vitejs.dev/config/
export default defineConfig({
<<<<<<< HEAD
  plugins: [
    react(),
    nodePolyfills({ // 2. Add this block
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  define: {
    'global': 'window', // Keep this for safety
  },
  server: {
    port: 3000,
    strictPort: true
  }
})
=======
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
>>>>>>> ravindu/master
