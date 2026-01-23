import { GoogleGenerativeAI } from '@google/generative-ai';

// Rule engine patterns (copied from src/rules.ts to keep the API function self-contained or we could import if possible)
// For simplicity and to avoid complex build setups for Vercel functions, I'll include the logic here.
const LEGAL_RULES = [
    {
        pattern: /arbitration|dispute resolution|waive.*jury|mandatory arbitration/i,
        category: 'Dispute Resolution',
        riskLevel: 'High',
        reason: 'Mandatory arbitration clause detected. You may be waiving your right to a trial by jury.',
    },
    {
        pattern: /share.*third party|affiliates|marketing partners|data.*partner/i,
        category: 'Data Privacy',
        riskLevel: 'Medium',
        reason: 'Data sharing with third parties or affiliates is explicitly mentioned.',
    },
    {
        pattern: /no liability|not liable|disclaim.*warranty|limitation of liability/i,
        category: 'Liability',
        riskLevel: 'Medium',
        reason: 'Company significantly limits or disclaims liability for damages.',
    },
    {
        pattern: /irrevocable.*license|perpetual.*right|own.*content|worldwide license/i,
        category: 'Intellectual Property',
        riskLevel: 'High',
        reason: 'User content rights may be transferred or licensed perpetually to the company.',
    },
    {
        pattern: /at any time|without notice|change.*terms|modify.*agreement/i,
        category: 'Contract Changes',
        riskLevel: 'Medium',
        reason: 'Company reserves the right to change terms without prior notification.',
    },
    {
        pattern: /indemnify|hold harmless|defend.*company/i,
        category: 'Indemnification',
        riskLevel: 'High',
        reason: 'You may be required to pay for the company\'s legal costs.',
    },
    {
        pattern: /class action waiver|class-action|joint action/i,
        category: 'Class Action',
        riskLevel: 'Critical',
        reason: 'You may be waiving your right to participate in class action lawsuits.',
    },
    {
        pattern: /consent.*marketing|promotional emails|target.*advertising/i,
        category: 'Marketing Consent',
        riskLevel: 'Low',
        reason: 'You may be consenting to marketing communications.',
    },
];

function runRuleEngine(text: string) {
    const matches: any[] = [];
    LEGAL_RULES.forEach((rule) => {
        if (rule.pattern.test(text)) {
            matches.push({
                category: rule.category,
                riskLevel: rule.riskLevel,
                reason: rule.reason,
            });
        }
    });
    return matches;
}

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { text } = await req.json();

        if (!text) {
            return new Response(JSON.stringify({ error: 'Text is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            console.error('Missing GEMINI_API_KEY environment variable');
            return new Response(JSON.stringify({ error: 'API key not configured on server' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

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

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let aiResult;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : '{}';
            aiResult = JSON.parse(jsonText);
        } catch {
            throw new Error('Failed to parse AI response');
        }

        // Merge rule engine matches
        ruleMatches.forEach(match => {
            const exists = aiResult.flaggedClauses.some((fc: any) => fc.category === match.category);
            if (!exists) {
                aiResult.flaggedClauses.push({
                    originalText: "[Auto-detected by legal rule engine]",
                    plainEnglish: match.reason,
                    riskLevel: match.riskLevel,
                    category: match.category
                });
            }
        });

        return new Response(JSON.stringify(aiResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error in analyze API:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
