import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  FileText,
  Zap,
  ArrowRight,
  AlertTriangle,
  Scale,
  Trophy,
  Github,
  Info,
  CheckCircle,
  XCircle,
  BarChart3,
  Sparkles
} from 'lucide-react';  
import { AppState, AnalysisResult } from './types';
import { analyzeTerms } from './services/geminiService';
import { RiskRadar, RiskBar } from './components/Visualizations';
import { SubmissionContent } from './components/SubmissionContent';

const SAMPLE_TEXTS = {
  INSTAGRAM: `You grant us a non-exclusive, royalty-free, transferable, sub-licensable, worldwide license to host, use, distribute, modify, run, copy, publicly perform or display, translate, and create derivative works of your content. This license will end when your content is deleted from our systems. You agree that we may access, store, process, and use any information and personal data that you provide.`,
  ARBITRATION: `MANDATORY ARBITRATION: YOU AND THE COMPANY AGREE THAT ANY DISPUTE, CLAIM OR CONTROVERSY ARISING OUT OF OR RELATING TO THESE TERMS SHALL BE SETTLED BY BINDING INDIVIDUAL ARBITRATION AND NOT IN A COURT OF LAW. CLASS ACTION WAIVER: YOU AGREE TO RESOLVE DISPUTES ON AN INDIVIDUAL BASIS AND WAIVE ANY RIGHT TO PARTICIPATE IN CLASS ACTIONS.`,
  PRIVACY: `We may share your personal information with affiliates, partners, and service providers for business purposes including marketing, analytics, and service improvement. We may also share data with law enforcement when required by law. By using our service, you consent to this data sharing.`,
  LIABILITY: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID US IN THE PAST SIX MONTHS. WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. YOU AGREE TO INDEMNIFY AND HOLD HARMLESS THE COMPANY FROM ANY CLAIMS.`
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [analysisTime, setAnalysisTime] = useState(0);

  useEffect(() => {
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [inputText]);

  const startAnalysis = async () => {
    if (inputText.length < 100) {
      setError("Please paste at least 100 characters for accurate analysis.");
      return;
    }

    setError(null);
    setLoading(true);
    setAppState(AppState.ANALYZING);
    const startTime = Date.now();

    try {
      const result = await analyzeTerms(inputText);
      const endTime = Date.now();
      setAnalysisTime(endTime - startTime);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (e) {
      console.error(e);
      setError("Analysis failed. Please check your API key or try DEV_MODE.");
      setAppState(AppState.LANDING);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleKey: keyof typeof SAMPLE_TEXTS) => {
    setInputText(SAMPLE_TEXTS[sampleKey]);
    setError(null);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/20';
    if (score >= 60) return 'bg-orange-500/20';
    if (score >= 40) return 'bg-yellow-500/20';
    return 'bg-green-500/20';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setAppState(AppState.LANDING);
                setError(null);
              }}
            >
              <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Legal Lens</h1>
                <p className="text-xs text-slate-400">AI-Powered Consent Transparency</p>
              </div>
            </div>

            <div className="flex items-center gap-4">

            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Landing Page */}
        {appState === AppState.LANDING && (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Read the{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  terms
                </span>{' '}
                without reading the{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  fine print
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                AI-powered analysis of Terms & Conditions to identify privacy risks, liability traps, and hidden clauses in seconds.
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-6">
              <div className="glass rounded-2xl overflow-hidden border border-slate-800">
                <div className="p-1 bg-gradient-to-r from-slate-800 to-slate-900">
                  <textarea
                    className="w-full h-64 bg-transparent p-6 text-slate-200 placeholder-slate-500 outline-none resize-none font-mono text-sm"
                    placeholder="Paste Terms & Conditions text here... (Minimum 100 characters)"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSampleClick('INSTAGRAM')}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Sample: Content License
                    </button>
                    <button
                      onClick={() => handleSampleClick('ARBITRATION')}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Sample: Arbitration
                    </button>
                    <button
                      onClick={() => handleSampleClick('PRIVACY')}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Sample: Data Sharing
                    </button>
                    <button
                      onClick={() => handleSampleClick('LIABILITY')}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Sample: Liability
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-500">
                      {wordCount} words • {inputText.length} chars
                    </div>
                    <button
                      onClick={startAnalysis}
                      disabled={loading || inputText.length < 100}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze Contract
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 pt-8">
                {[
                  {
                    icon: Scale,
                    title: 'Legal Rule Engine',
                    desc: 'Deterministic pattern matching for known high-risk legal clauses with instant detection.',
                    color: 'text-blue-500'
                  },
                  {
                    icon: Zap,
                    title: 'Gemini AI Analysis',
                    desc: 'Semantic understanding to catch nuanced implications and hidden meanings.',
                    color: 'text-purple-500'
                  },
                  {
                    icon: BarChart3,
                    title: 'Visual Risk Mapping',
                    desc: 'Interactive charts showing risk distribution across legal categories.',
                    color: 'text-green-500'
                  },
                ].map((feature, index) => (
                  <div key={index} className="glass p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${feature.color.replace('text', 'bg')}/20`}>
                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <h3 className="font-bold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {appState === AppState.ANALYZING && (
          <div className="max-w-2xl mx-auto py-20">
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 mx-auto border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-indigo-500" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Hybrid Analysis in Progress</h3>
                <p className="text-slate-400">
                  Cross-referencing legal patterns with AI semantic analysis...
                </p>

                <div className="w-full max-w-md mx-auto bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" style={{ width: '60%' }} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
                  <div className="text-center">
                    <div className="font-semibold">Rule Engine</div>
                    <div className="text-xs">Scanning patterns...</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">AI Analysis</div>
                    <div className="text-xs">Processing semantics...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {appState === AppState.RESULTS && analysisResult && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Risk Score Header */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass p-8 rounded-2xl space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Risk Analysis Complete</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Analyzed in {analysisTime}ms • Hybrid Intelligence Engine
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-5xl font-black ${getRiskColor(analysisResult.overallRiskScore)}`}>
                      {analysisResult.overallRiskScore}
                    </div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                      Overall Risk Score
                    </div>
                    <div className={`mt-2 text-xs font-bold px-2 py-1 rounded-full ${getRiskBgColor(analysisResult.overallRiskScore)} ${getRiskColor(analysisResult.overallRiskScore)}`}>
                      {getRiskLevel(analysisResult.overallRiskScore)} RISK
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000 ease-out"
                      style={{ width: `${analysisResult.overallRiskScore}%` }}
                    />
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-300 text-lg leading-relaxed italic">
                      "{analysisResult.summary}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Risk Vector Map</h3>
                  <Info className="w-4 h-4 text-slate-500" />
                </div>
                <RiskRadar categories={analysisResult.categories} />
              </div>
            </div>

            {/* Risk Categories */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Risk by Category</h3>
              <RiskBar categories={analysisResult.categories} />
            </div>

            {/* Flagged Clauses */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-white">Flagged Clauses</h3>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs font-bold rounded-full">
                  {analysisResult.flaggedClauses.length} found
                </span>
              </div>

              <div className="grid gap-4">
                {analysisResult.flaggedClauses.map((clause, index) => (
                  <div
                    key={index}
                    className="glass p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-full border border-slate-700">
                          {clause.category}
                        </span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${clause.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-500' :
                            clause.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-500' :
                              clause.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-green-500/20 text-green-500'
                          }`}>
                          {clause.riskLevel} Risk
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        Clause #{index + 1}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">
                          Original Text
                        </div>
                        <p className="text-sm text-slate-400 font-mono italic leading-relaxed">
                          "{clause.originalText.substring(0, 200)}..."
                        </p>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">
                          Plain English Explanation
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {clause.plainEnglish}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Positive Points */}
            {analysisResult.positivePoints.length > 0 && (
              <div className="glass p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-bold text-white">User-Friendly Provisions</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysisResult.positivePoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-8">
              <button
                onClick={() => setAppState(AppState.LANDING)}
                className="px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                Start New Analysis
              </button>
              <button
                onClick={() => {
                  const text = `Legal Lens Analysis Results:\nOverall Risk: ${analysisResult.overallRiskScore}/100\n\n${analysisResult.summary}\n\nFlagged Clauses:\n${analysisResult.flaggedClauses.map(c => `• ${c.category}: ${c.plainEnglish}`).join('\n')}`;
                  navigator.clipboard.writeText(text);
                }}
                className="px-6 py-3 bg-indigo-600/20 text-indigo-400 font-medium rounded-lg hover:bg-indigo-600/30 transition-colors border border-indigo-500/20"
              >
                Copy Summary
              </button>
            </div>
          </div>
        )}

        {/* Submission Preview */}
        {appState === AppState.SUBMISSION_PREVIEW && (
          <div className="py-8">
            <SubmissionContent />
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setAppState(AppState.LANDING)}
                className="px-6 py-3 text-sm text-slate-400 hover:text-white transition-colors font-medium"
              >
                ← Return to App
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-white">Legal Lens</span>
              </div>
              <p className="text-xs text-slate-500">
                AI-powered digital consent transparency tool
              </p>
            </div>

            <div className="text-xs font-medium text-slate-600 uppercase tracking-widest flex flex-wrap justify-center gap-6">

              <span>•</span>
              <a href="#" className="hover:text-slate-400 transition-colors">
                Open Source
              </a>
              <span>•</span>
              <a href="#" className="hover:text-slate-400 transition-colors">
                Hybrid Architecture
              </a>
              <span>•</span>
              <a href="#" className="hover:text-slate-400 transition-colors">
                Privacy First
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-700">
            <p>
              ⚠️ This tool provides informational analysis only and does not constitute legal advice.
              Always consult with a qualified legal professional for important decisions.
            </p>
            <p className="mt-2">
              {import.meta.env.VITE_DEV_MODE === 'true' ? '🔧 Running in DEV_MODE (mock data)' : '🟢 Connected to Gemini API'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
