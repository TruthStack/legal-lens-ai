import { AnalysisResult, RiskLevel } from '../types';
import { runRuleEngine, LEGAL_RULES } from '../rules';

// Environment variables
const meta = (import.meta as any);
const DEV_MODE = meta.env?.VITE_DEV_MODE === 'true';

// Enhanced mock data for demo
const MOCK_RESULTS = [
  {
    overallRiskScore: 82,
    summary: "This agreement contains critical high-risk clauses including mandatory arbitration, extensive data sharing with affiliates, and significant liability limitations. Users should exercise extreme caution.",
    categories: [
      { name: 'Data Privacy', score: 88, description: 'Extensive data sharing with third parties' },
      { name: 'Liability', score: 92, description: 'Severe limitation of company liability' },
      { name: 'Dispute Resolution', score: 95, description: 'Mandatory arbitration with class action waiver' },
      { name: 'Intellectual Property', score: 78, description: 'Broad perpetual license to user content' },
      { name: 'Contract Changes', score: 65, description: 'Unilateral modification rights' },
      { name: 'Jurisdiction', score: 70, description: 'Unfavorable jurisdiction selection' },
    ],
    flaggedClauses: [
      {
        originalText: "You agree to resolve any and all disputes through binding individual arbitration and waive your right to participate in class actions or class-wide arbitration.",
        plainEnglish: "You cannot sue the company in court or join class action lawsuits with other users.",
        riskLevel: 'Critical' as RiskLevel,
        category: 'Dispute Resolution'
      },
      {
        originalText: "We may share your personal information with affiliates, partners, advertising networks, analytics providers, and other third parties for business purposes.",
        plainEnglish: "Your personal data can be shared with hundreds of other companies for advertising and analytics.",
        riskLevel: 'High' as RiskLevel,
        category: 'Data Privacy'
      },
      {
        originalText: "Our total liability shall not exceed the amount you have paid us in the past six months. In no event shall we be liable for indirect, incidental, or consequential damages.",
        plainEnglish: "The company's maximum financial responsibility is very limited, even if they cause significant harm.",
        riskLevel: 'High' as RiskLevel,
        category: 'Liability'
      }
    ],
    positivePoints: [
      "30-day notice for major changes to terms",
      "Option to download your data",
      "Clear opt-out process for marketing emails"
    ]
  }
];

export async function analyzeTerms(text: string): Promise<AnalysisResult> {
  console.log('🔧 Starting analysis. DEV_MODE:', DEV_MODE);

  // Use mock data if DEV_MODE is true
  if (DEV_MODE) {
    console.log('🔧 Using enhanced mock analysis (DEV_MODE)');
    await new Promise(resolve => setTimeout(resolve, 1200));

    const result = { ...MOCK_RESULTS[0] };
    const ruleMatches = runRuleEngine(text);

    // Enhance with actual rule matches
    if (ruleMatches.length > 0) {
      result.overallRiskScore = Math.min(95, result.overallRiskScore + ruleMatches.length * 5);

      ruleMatches.forEach(match => {
        const exists = result.flaggedClauses.some(fc => fc.category === match.category);
        if (!exists) {
          result.flaggedClauses.push({
            originalText: "[Auto-detected by legal pattern recognition]",
            plainEnglish: match.reason,
            riskLevel: match.riskLevel as RiskLevel,
            category: match.category
          });
        }
      });
    }

    return result;
  }

  try {
    console.log('📡 Calling Backend API: /api/analyze');
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const aiResult = await response.json() as AnalysisResult;
    console.log('✅ AI response received from backend');
    return aiResult;

  } catch (error) {
    console.error('❌ API Error, falling back to local rules:', error);

    const ruleMatches = runRuleEngine(text);
    return {
      overallRiskScore: Math.min(100, ruleMatches.length * 20),
      summary: "AI analysis unavailable. Showing results from local legal rule engine. " + (error instanceof Error ? error.message : ""),
      categories: LEGAL_RULES.map(rule => ({
        name: rule.category,
        score: ruleMatches.some(m => m.category === rule.category) ? 70 : 30,
        description: rule.reason
      })).slice(0, 6),
      flaggedClauses: ruleMatches.map(match => ({
        originalText: "[Detected by local rule engine]",
        plainEnglish: match.reason,
        riskLevel: match.riskLevel as RiskLevel,
        category: match.category
      })),
      positivePoints: ["Using local rule-based analysis as fallback"]
    };
  }
}
