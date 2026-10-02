/**
 * TruthGuard AI - Societal Harm & Misinformation Risk Profiler
 * Quantifies public safety, civic integrity, and financial harm threats.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export type ThreatCategory =
  | 'public_health'
  | 'civic_elections'
  | 'financial_fraud'
  | 'social_harmony'
  | 'general_misinformation';

export interface ThreatDimension {
  category: ThreatCategory;
  categoryLabelAr: string;
  categoryLabelEn: string;
  severityScore: number; // 0 - 100
  triggers: string[];
}

export interface RiskProfile {
  riskScore: number; // 0 - 100
  threatLevel: 'critical' | 'high' | 'moderate' | 'low';
  threatLevelAr: string;
  threatLevelEn: string;
  primaryDomain: ThreatCategory;
  dimensions: ThreatDimension[];
  interventionStrategyAr: string;
  interventionStrategyEn: string;
}

const HEALTH_KEYWORDS = [
  'علاج', 'سرطان', 'دواء', 'فايروس', 'لقاح', 'تطعيم', 'وفاة', 'تسمم', 'قاتل',
  'cure', 'cancer', 'vaccine', 'virus', 'poison', 'fatal', 'treatment', 'deadly'
];

const CIVIC_KEYWORDS = [
  'تزوير انتخابات', 'انقلاب', 'اغتيال', 'حظر تجول', 'إعلان حرب', 'طوارئ',
  'election fraud', 'coup', 'assassination', 'martial law', 'curfew', 'rigged'
];

const FINANCIAL_KEYWORDS = [
  'إفلاس بنك', 'انهيار العملة', 'استثمار مضمون', 'أرباح خيالية', 'احتيال',
  'bank collapse', 'currency crash', 'guaranteed returns', 'crypto scam'
];

export function profileMisinformationRisk(claimText: string, confidenceScore: number): RiskProfile {
  const textLower = claimText.toLowerCase();

  const healthTriggers = HEALTH_KEYWORDS.filter(k => textLower.includes(k));
  const civicTriggers = CIVIC_KEYWORDS.filter(k => textLower.includes(k));
  const financialTriggers = FINANCIAL_KEYWORDS.filter(k => textLower.includes(k));

  const dimensions: ThreatDimension[] = [
    {
      category: 'public_health',
      categoryLabelAr: 'الصحة العامة وسلامة الأفراد',
      categoryLabelEn: 'Public Health & Safety',
      severityScore: Math.min(100, healthTriggers.length * 35),
      triggers: healthTriggers
    },
    {
      category: 'civic_elections',
      categoryLabelAr: 'الاستقرار المدني والنزاهة المؤسسية',
      categoryLabelEn: 'Civic & Institutional Integrity',
      severityScore: Math.min(100, civicTriggers.length * 35),
      triggers: civicTriggers
    },
    {
      category: 'financial_fraud',
      categoryLabelAr: 'الأمان المالي وحماية المستهلك',
      categoryLabelEn: 'Financial Security & Consumer Protection',
      severityScore: Math.min(100, financialTriggers.length * 35),
      triggers: financialTriggers
    }
  ];

  // Highest severity category
  const sorted = [...dimensions].sort((a, b) => b.severityScore - a.severityScore);
  const topDomain = sorted[0].severityScore > 0 ? sorted[0].category : 'general_misinformation';
  const maxDimScore = sorted[0].severityScore;

  // Composite risk = domain harm * (1 - confidence/100 if false)
  const falsehoodMultiplier = confidenceScore < 50 ? (100 - confidenceScore) / 100 : 0.3;
  const compositeScore = Math.min(100, Math.round(maxDimScore * 0.7 + falsehoodMultiplier * 30));

  let threatLevel: RiskProfile['threatLevel'] = 'low';
  let threatLevelAr = 'منخفض';
  let threatLevelEn = 'Low Risk';

  if (compositeScore >= 75) {
    threatLevel = 'critical';
    threatLevelAr = 'حرج جداً (خطر مباشر)';
    threatLevelEn = 'Critical Threat';
  } else if (compositeScore >= 50) {
    threatLevel = 'high';
    threatLevelAr = 'مرتفع';
    threatLevelEn = 'High Threat';
  } else if (compositeScore >= 25) {
    threatLevel = 'moderate';
    threatLevelAr = 'متوسط';
    threatLevelEn = 'Moderate Threat';
  }

  return {
    riskScore: compositeScore,
    threatLevel,
    threatLevelAr,
    threatLevelEn,
    primaryDomain: topDomain,
    dimensions,
    interventionStrategyAr: threatLevel === 'critical'
      ? 'إصدار تنبيه عاجل وتنسيق مع الهيئات المعنية لمنع الضرر بالسلامة العامة.'
      : 'إرفاق بطاقات التحقق وسياق التصحيح التلقائي على المحتوى المنشور.',
    interventionStrategyEn: threatLevel === 'critical'
      ? 'Issue immediate priority alert and coordinate with competent health/civic authorities.'
      : 'Attach automated contextual debunk cards to circulated content.'
  };
}
