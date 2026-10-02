/**
 * TruthGuard AI - Multi-Registry Fact-Check Aggregator & Normalizer
 * Bridges disparate rating schemas across IFCN signatories and regional fact-checkers.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export type StandardVerdict =
  | 'true'
  | 'mostly_true'
  | 'mixture'
  | 'mostly_false'
  | 'false'
  | 'unproven';

export interface ExternalCheckResult {
  checkerName: string;
  url: string;
  originalRating: string;
  normalizedVerdict: StandardVerdict;
  date: string;
  claimExcerpt: string;
  confidenceWeight: number;
}

export interface AggregationConsensus {
  consensusVerdict: StandardVerdict;
  consensusScore: number; // 0 - 100
  agreementRatio: number; // 0.0 - 1.0
  totalChecks: number;
  breakdown: Record<StandardVerdict, number>;
  checks: ExternalCheckResult[];
  consensusSummaryAr: string;
  consensusSummaryEn: string;
}

const RATING_MAPPINGS: Record<string, StandardVerdict> = {
  // English
  'true': 'true',
  'correct': 'true',
  'accurate': 'true',
  'mostly true': 'mostly_true',
  'half true': 'mixture',
  'mixture': 'mixture',
  'unproven': 'unproven',
  'unverified': 'unproven',
  'mostly false': 'mostly_false',
  'false': 'false',
  'fake': 'false',
  'pants on fire': 'false',
  // Arabic
  'صحيح': 'true',
  'صحيح جزئياً': 'mostly_true',
  'مضلل': 'mostly_false',
  'زائف': 'false',
  'مفبرك': 'false',
  'خرافة': 'false',
  'غير دقيق': 'mostly_false',
  'لا إثبات': 'unproven'
};

export function normalizeVerdict(rawRating: string): StandardVerdict {
  const clean = rawRating.trim().toLowerCase();
  for (const [key, value] of Object.entries(RATING_MAPPINGS)) {
    if (clean.includes(key)) return value;
  }
  return 'unproven';
}

export function computeConsensus(checks: ExternalCheckResult[]): AggregationConsensus {
  if (checks.length === 0) {
    return {
      consensusVerdict: 'unproven',
      consensusScore: 50,
      agreementRatio: 0,
      totalChecks: 0,
      breakdown: { true: 0, mostly_true: 0, mixture: 0, mostly_false: 0, false: 0, unproven: 0 },
      checks: [],
      consensusSummaryAr: 'لا توجد عمليات تدقيق خارجية مسجلة.',
      consensusSummaryEn: 'No external fact checks found.'
    };
  }

  const breakdown: Record<StandardVerdict, number> = {
    true: 0, mostly_true: 0, mixture: 0, mostly_false: 0, false: 0, unproven: 0
  };

  const weights: Record<StandardVerdict, number> = {
    true: 100, mostly_true: 75, mixture: 50, mostly_false: 25, false: 0, unproven: 50
  };

  let weightedSum = 0;
  let totalWeight = 0;

  checks.forEach(c => {
    breakdown[c.normalizedVerdict]++;
    const w = c.confidenceWeight || 1.0;
    weightedSum += weights[c.normalizedVerdict] * w;
    totalWeight += w;
  });

  const avgScore = Math.round(weightedSum / (totalWeight || 1));

  // Determine dominant verdict
  let maxCount = 0;
  let dominant: StandardVerdict = 'unproven';
  for (const [verdict, count] of Object.entries(breakdown) as [StandardVerdict, number][]) {
    if (count > maxCount) {
      maxCount = count;
      dominant = verdict;
    }
  }

  const agreementRatio = Number((maxCount / checks.length).toFixed(2));

  return {
    consensusVerdict: dominant,
    consensusScore: avgScore,
    agreementRatio,
    totalChecks: checks.length,
    breakdown,
    checks,
    consensusSummaryAr: `إجماع بنسبة ${(agreementRatio * 100).toFixed(0)}% بين ${checks.length} مؤسسات تدقيق مستقلة.`,
    consensusSummaryEn: `${(agreementRatio * 100).toFixed(0)}% consensus across ${checks.length} independent fact-checking organizations.`
  };
}
