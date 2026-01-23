import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'api-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/analyze' && req.method === 'POST') {
              try {
                let body = '';
                for await (const chunk of req) { body += chunk; }
                const { text } = JSON.parse(body);

                const mod = await import('@google/generative-ai');
                if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');

                const genAI = new mod.GoogleGenerativeAI(env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

                const prompt = `
Analyze the T&C text and provide a risk assessment.
TEXT: ${text.substring(0, 8000)}
FORMAT: JSON ONLY
{
  "overallRiskScore": number,
  "summary": string,
  "categories": [{"name": string, "score": number, "description": string}],
  "flaggedClauses": [{"originalText": string, "plainEnglish": string, "riskLevel": "Low"|"Medium"|"High"|"Critical", "category": string}],
  "positivePoints": string[]
}
Return ONLY valid JSON.
`;
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                res.setHeader('Content-Type', 'application/json');
                res.end(jsonMatch ? jsonMatch[0] : '{}');
              } catch (error: any) {
                console.error('Local Proxy Error:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: error.message }));
              }
            } else { next(); }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.VITE_DEV_MODE': JSON.stringify(env.VITE_DEV_MODE || 'false')
    },
    server: {
      port: 3000,
      host: true,
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        external: ['@google/generative-ai'],
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['recharts', 'lucide-react']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    publicDir: 'public'
  }
})
