import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'stripe-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          'canvas-vendor': ['konva', 'react-konva'],
          'auth-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning limit to 600kb (from default 500kb)
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging (set to true if needed)
    sourcemap: false,
    // Minify for production
    minify: 'esbuild',
    // Target modern browsers
    target: 'es2020',
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // Preview server configuration
  preview: {
    port: 3000,
    strictPort: true,
  },
});
