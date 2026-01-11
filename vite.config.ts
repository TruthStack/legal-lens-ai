import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': env,
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'import.meta.env.VITE_DEV_MODE': JSON.stringify(env.VITE_DEV_MODE || 'false')
    },
    server: {
      port: 3000,
      host: true,
    },
    // Vercel-specific build optimizations
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['recharts', 'lucide-react'],
            ai: ['@google/genai']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    // Public directory for assets
    publicDir: 'public'
  }
})
