export interface FlaggedClause {
  originalText: string;
  plainEnglish: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
}

export interface RiskCategory {
  name: string;
  score: number;
  description: string;
}

export interface AnalysisResult {
  overallRiskScore: number;
  summary: string;
  categories: RiskCategory[];
  flaggedClauses: FlaggedClause[];
  positivePoints: string[];
}

export enum AppState {
  LANDING = 'LANDING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  SUBMISSION_PREVIEW = 'SUBMISSION_PREVIEW'
}

export interface RuleMatch {
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
}
