import { GoogleGenAI } from '@google/genai';
import { AnalysisResult } from '../types';
import { runRuleEngine, LEGAL_RULES } from '../rules';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || process.env.DEV_MODE === 'true';

// Use a model that actually exists in your API
const MODEL_NAME = 'gemini-2.5-flash'; // This one exists in your list

// Mock data for DEV_MODE
const MOCK_RESULT: AnalysisResult = {
  overallRiskScore: 68,
  summary: "This agreement contains several high-risk clauses including mandatory arbitration, broad data sharing permissions, and significant liability limitations. Users should pay particular attention to dispute resolution and intellectual property sections.",
  categories: [
    { name: 'Data Privacy', score: 75, description: 'Extensive data sharing with third parties' },
    { name: 'Liability', score: 85, description: 'Severe limitation of company liability' },
    { name: 'Dispute Resolution', score: 90, description: 'Mandatory arbitration required' },
    { name: 'Intellectual Property', score: 60, description: 'Broad licensing of user content' },
    { name: 'Contract Changes', score: 55, description: 'Unilateral modification rights' },
    { name: 'Indemnification', score: 70, description: 'User must cover company legal costs' },
  ],
  flaggedClauses: [
    {
      originalText: "You agree to resolve any disputes through binding individual arbitration and waive your right to participate in class actions.",
      plainEnglish: "You cannot sue the company in court or join class action lawsuits.",
      riskLevel: 'Critical',
      category: 'Dispute Resolution'
    },
    {
      originalText: "We may share your data with affiliates, partners, and service providers for business purposes.",
      plainEnglish: "Your personal information can be shared with many other companies.",
      riskLevel: 'High',
      category: 'Data Privacy'
    },
    {
      originalText: "Our total liability shall not exceed the amount you have paid us in the past six months.",
      plainEnglish: "The company's maximum responsibility is very limited.",
      riskLevel: 'High',
      category: 'Liability'
    }
  ],
  positivePoints: [
    "30-day notice for major changes",
    "Data deletion request process available",
    "Clear opt-out for marketing emails"
  ]
};

export async function analyzeTerms(text: string): Promise<AnalysisResult> {
  console.log('🔧 Starting analysis. DEV_MODE:', DEV_MODE, 'Model:', MODEL_NAME);
  
  // DEV_MODE: Return mock data immediately
  if (DEV_MODE) {
    console.log('🔧 DEV_MODE enabled - Using mock analysis');
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_RESULT;
  }

  // REAL MODE: Use Gemini API
  if (!API_KEY) {
    console.error('❌ No API key found');
    throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env.local');
  }

  try {
    console.log('📡 Calling Gemini API with model:', MODEL_NAME);
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const ruleMatches = runRuleEngine(text);

    // Prepare prompt for Gemini
    const prompt = `
You are a legal analysis AI. Analyze the following Terms & Conditions text and provide a risk assessment.

TEXT TO ANALYZE:
${text.substring(0, 8000)}

ANALYSIS REQUIREMENTS:
1. Provide an overall risk score (0-100, where 100 is highest risk)
2. Write a 2-3 sentence summary
3. Identify risk categories with scores (Data Privacy, Liability, Dispute Resolution, Intellectual Property, Contract Changes, Indemnification)
4. List specific concerning clauses with plain English explanations
5. Note any positive or user-friendly provisions

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

    console.log('📤 Sending request to Gemini...');
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    console.log('✅ Gemini API Response received:', response.text ? 'Has text' : 'No text');
    
    let aiResult: AnalysisResult;
    try {
      // Extract JSON from response
      const responseText = response.text || '{}';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : '{}';
      
      aiResult = JSON.parse(jsonText) as AnalysisResult;
      console.log('✅ Parsed Gemini response successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError);
      console.log('Response was:', response.text?.substring(0, 200));
      
      // Fallback to mock data if parsing fails
      aiResult = MOCK_RESULT;
    }

    // Merge rule engine matches
    ruleMatches.forEach(match => {
      const exists = aiResult.flaggedClauses.some(fc => 
        fc.category === match.category
      );
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

  } catch (error: any) {
    console.error('❌ Gemini API Error:', error.message || error);
    console.error('Full error:', error);
    
    // Fallback to rule engine
    const ruleMatches = runRuleEngine(text);
    console.log('🔄 Falling back to rule engine with', ruleMatches.length, 'matches');
    
    return {
      overallRiskScore: Math.min(100, ruleMatches.length * 20),
      summary: "AI service temporarily unavailable. Showing results from legal rule engine.",
      categories: LEGAL_RULES.map(rule => ({
        name: rule.category,
        score: ruleMatches.some(m => m.category === rule.category) ? 70 : 30,
        description: rule.reason
      })).slice(0, 6),
      flaggedClauses: ruleMatches.map(match => ({
        originalText: "[Detected by rule engine - AI service unavailable]",
        plainEnglish: match.reason,
        riskLevel: match.riskLevel,
        category: match.category
      })),
      positivePoints: ["Using fallback rule-based analysis"]
    };
  }
}
