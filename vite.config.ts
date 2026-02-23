import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3001,
      host: '0.0.0.0',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    },
    plugins: [
      react(),
      // VitePWA({
      //   registerType: 'prompt',
      //   includeAssets: ['favicon.ico', 'icons/*'],
      //   manifest: {
      //     name: 'GenSpark',
      //     short_name: 'GenSpark',
      //     description: 'Master coding with GenSpark',
      //     theme_color: '#0a0b14',
      //     background_color: '#0a0b14',
      //     display: 'standalone',
      //     icons: [
      //       {
      //         src: '/icons/logo.png',
      //         sizes: '192x192',
      //         type: 'image/png'
      //       },
      //       {
      //         src: '/icons/logo.png',
      //         sizes: '512x512',
      //         type: 'image/png'
      //       }
      //     ]
      //       {
      //         urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
      //         handler: 'StaleWhileRevalidate',
      //         options: {
      //           cacheName: 'images-cache',
      //           expiration: {
      //             maxEntries: 50
      //           }
      //         }
      //       }
      //     ]
      //   }
      // })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui': ['lucide-react'],
          }
        }
      }
    }
  };
});
