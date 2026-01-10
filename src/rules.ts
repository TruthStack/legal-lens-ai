import { RuleMatch } from './types';

export const LEGAL_RULES = [
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

export function runRuleEngine(text: string): RuleMatch[] {
  const matches: RuleMatch[] = [];
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
