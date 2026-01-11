import { GoogleGenAI } from '@google/genai';
import { AnalysisResult } from '../types';
import { runRuleEngine, LEGAL_RULES } from '../rules';

// Environment variables - works in both dev and Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || process.env.VITE_DEV_MODE === 'true';

// Use correct model for your API
const MODEL_NAME = 'gemini-2.5-flash';

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
        riskLevel: 'Critical',
        category: 'Dispute Resolution'
      },
      {
        originalText: "We may share your personal information with affiliates, partners, advertising networks, analytics providers, and other third parties for business purposes.",
        plainEnglish: "Your personal data can be shared with hundreds of other companies for advertising and analytics.",
        riskLevel: 'High',
        category: 'Data Privacy'
      },
      {
        originalText: "Our total liability shall not exceed the amount you have paid us in the past six months. In no event shall we be liable for indirect, incidental, or consequential damages.",
        plainEnglish: "The company's maximum financial responsibility is very limited, even if they cause significant harm.",
        riskLevel: 'High',
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
  console.log('🔧 Starting analysis. DEV_MODE:', DEV_MODE, 'API Key:', API_KEY ? 'Present' : 'Missing');
  
  // Always use mock data if DEV_MODE is true OR no API key
  if (DEV_MODE || !API_KEY) {
    console.log('🔧 Using enhanced mock analysis');
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
            riskLevel: match.riskLevel,
            category: match.category
          });
        }
      });
    }
    
    return result;
  }

  try {
    console.log('📡 Calling Gemini API with model:', MODEL_NAME);
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const ruleMatches = runRuleEngine(text);

    const prompt = `
You are a legal analysis AI. Analyze the following Terms & Conditions text and provide a risk assessment.

TEXT TO ANALYZE:
${text.substring(0, 8000)}

ANALYSIS REQUIREMENTS:
1. Overall risk score (0-100, 100 is highest risk)
2. 2-3 sentence summary
3. Risk categories with scores (Data Privacy, Liability, Dispute Resolution, Intellectual Property, Contract Changes, Indemnification)
4. Specific concerning clauses with plain English explanations
5. Any positive/user-friendly provisions

RESPONSE FORMAT (JSON ONLY):
{
  "overallRiskScore": number,
  "summary": string,
  "categories": [{"name": string, "score": number, "description": string}],
  "flaggedClauses": [{"originalText": string, "plainEnglish": string, "riskLevel": "Low"|"Medium"|"High"|"Critical", "category": string}],
  "positivePoints": string[]
}

Return ONLY valid JSON, no other text.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    console.log('✅ Gemini response received');
    
    let aiResult: AnalysisResult;
    try {
      const responseText = response.text || '{}';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : '{}';
      aiResult = JSON.parse(jsonText) as AnalysisResult;
    } catch {
      aiResult = MOCK_RESULTS[0];
    }

    // Merge rule engine matches
    ruleMatches.forEach(match => {
      const exists = aiResult.flaggedClauses.some(fc => fc.category === match.category);
      if (!exists) {
        aiResult.flaggedClauses.push({
          originalText: "[Auto-detected by legal rule engine]",
          plainEnglish: match.reason,
          riskLevel: match.riskLevel,
          category: match.category
        });
      }
    });

    return aiResult;

  } catch (error) {
    console.error('❌ Gemini API Error, falling back to rules:', error);
    
    const ruleMatches = runRuleEngine(text);
    return {
      overallRiskScore: Math.min(100, ruleMatches.length * 20),
      summary: "AI analysis temporarily unavailable. Showing results from legal rule engine.",
      categories: LEGAL_RULES.map(rule => ({
        name: rule.category,
        score: ruleMatches.some(m => m.category === rule.category) ? 70 : 30,
        description: rule.reason
      })).slice(0, 6),
      flaggedClauses: ruleMatches.map(match => ({
        originalText: "[Detected by rule engine]",
        plainEnglish: match.reason,
        riskLevel: match.riskLevel,
        category: match.category
      })),
      positivePoints: ["Using rule-based analysis as fallback"]
    };
  }
}
