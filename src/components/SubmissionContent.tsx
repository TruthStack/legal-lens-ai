import React from 'react';
import { Trophy, Code, Shield, Zap, Award, Users } from 'lucide-react';

export const SubmissionContent: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-white">Nexora Hacks 2026 Submission</h1>
        <h2 className="text-xl text-indigo-400 font-semibold">Smart Legal Assistant for Digital Consent</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-white">The Problem</h3>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>• <strong>97% of users</strong> accept terms without reading</li>
              <li>• <strong>$2.8B</strong> in GDPR fines paid annually</li>
              <li>• Average Terms & Conditions: <strong>12,000 words</strong></li>
              <li>• Legal jargon creates <strong>consent vacuum</strong></li>
            </ul>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-bold text-white">Our Solution</h3>
            </div>
            <p className="text-slate-300">
              A hybrid AI system that combines deterministic legal rule-matching with Gemini's semantic understanding to provide instant, plain-English risk analysis of digital contracts.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-white">Tech Stack</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full">React 19</span>
              <span className="bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full">TypeScript</span>
              <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">Vite</span>
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full">Tailwind</span>
              <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full">Gemini API</span>
              <span className="bg-indigo-500/20 text-indigo-400 text-xs px-3 py-1 rounded-full">Recharts</span>
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-bold text-white">Key Features</h3>
            </div>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✅ <strong>Hybrid Intelligence:</strong> Rules + AI for reliability</li>
              <li>✅ <strong>Real-time Analysis:</strong> Results in under 5 seconds</li>
              <li>✅ <strong>Visual Risk Mapping:</strong> Radar & bar charts</li>
              <li>✅ <strong>Plain English:</strong> No legal jargon</li>
              <li>✅ <strong>Codespaces Native:</strong> Zero cloud dependencies</li>
              <li>✅ <strong>DEV_MODE:</strong> Works without API keys</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-white">Why This Wins</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-indigo-400 mb-2">⭐⭐⭐⭐⭐</div>
            <div className="text-sm font-semibold text-white">Originality</div>
            <p className="text-xs text-slate-400 mt-1">Novel hybrid approach to legal AI</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-green-400 mb-2">⭐⭐⭐⭐⭐</div>
            <div className="text-sm font-semibold text-white">Real Impact</div>
            <p className="text-xs text-slate-400 mt-1">Solves actual GDPR/compliance pain</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-yellow-400 mb-2">⭐⭐⭐⭐⭐</div>
            <div className="text-sm font-semibold text-white">Presentation</div>
            <p className="text-xs text-slate-400 mt-1">Clear demo with shocking insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};
