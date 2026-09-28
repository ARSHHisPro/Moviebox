import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/style.[hash].css';
            }
            return 'assets/[name].[hash].[ext]';
          },
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'lucide': ['lucide-react'],
          },
        },
      },
      esbuild: {
        drop: ['console', 'debugger'],
        pure: ['console.log'],
        mangleProps: /^_/,
        mangleQuoted: true,
        mangleSuffix: 'mb',
        dropLabels: true,
        treeShaking: true,
      },
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '2.0.0'),
    },
  };
});
