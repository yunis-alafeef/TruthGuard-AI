/**
 * TruthGuard AI - Affective Manipulation & Stance Polarization Analyzer
 * Uncovers cognitive bias triggers, panic-inducing language, and outrage framing.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface ManipulationIndicator {
  type: 'fear' | 'urgency' | 'moral_outrage' | 'us_vs_them';
  typeAr: string;
  typeEn: string;
  intensity: number; // 0 - 100
  matchedTokens: string[];
}

export interface AffectiveAnalysis {
  manipulationScore: number; // 0 - 100
  dominantTactic: string;
  dominantTacticAr: string;
  indicators: ManipulationIndicator[];
  isEmotionallyCharged: boolean;
  neutralAlternativeAr?: string;
  neutralAlternativeEn?: string;
}

const FEAR_TOKENS = [
  'كارثة', 'مرعب', 'احذروا', 'خطر داهم', 'هلاك', 'مؤامرة خبيثة',
  'catastrophe', 'terrifying', 'danger', 'deadly', 'conspiracy', 'peril'
];

const URGENCY_TOKENS = [
  'قبل الحذف', 'عاجل جدا', 'انشر بسرعة', 'قبل فوات الأوان', 'سارع قبل',
  'before it gets deleted', 'urgent', 'share immediately', 'act now'
];

const OUTGROUP_TOKENS = [
  'الخونة', 'العدو الداخلي', 'هم يريدون تدميرنا', 'المتآمرون',
  'traitors', 'enemy within', 'they want to destroy us', 'conspirators'
];

const OUTRAGE_TOKENS = [
  'فضيحة مدوية', 'عار لا يغتفر', 'إهانة كبرى', 'جريمة لا تسكت',
  'scandalous', 'outrageous', 'unforgivable disgrace', 'blatant insult'
];

export function analyzeAffectiveManipulation(text: string): AffectiveAnalysis {
  const textLower = text.toLowerCase();

  const fearMatches = FEAR_TOKENS.filter(t => textLower.includes(t));
  const urgencyMatches = URGENCY_TOKENS.filter(t => textLower.includes(t));
  const outgroupMatches = OUTGROUP_TOKENS.filter(t => textLower.includes(t));
  const outrageMatches = OUTRAGE_TOKENS.filter(t => textLower.includes(t));

  const indicators: ManipulationIndicator[] = [
    {
      type: 'fear',
      typeAr: 'الترهيب والتخويف',
      typeEn: 'Fear-Mongering',
      intensity: Math.min(100, fearMatches.length * 35),
      matchedTokens: fearMatches
    },
    {
      type: 'urgency',
      typeAr: 'الاستعجال المصطنع (FOMO)',
      typeEn: 'Artificial Urgency',
      intensity: Math.min(100, urgencyMatches.length * 40),
      matchedTokens: urgencyMatches
    },
    {
      type: 'us_vs_them',
      typeAr: 'الاستقطاب وتأليب الفئات',
      typeEn: 'Out-Group Polarization',
      intensity: Math.min(100, outgroupMatches.length * 45),
      matchedTokens: outgroupMatches
    },
    {
      type: 'moral_outrage',
      typeAr: 'الاستفزاز الأخلاقي والغضب',
      typeEn: 'Moral Outrage',
      intensity: Math.min(100, outrageMatches.length * 35),
      matchedTokens: outrageMatches
    }
  ];

  const totalIntensity = indicators.reduce((acc, curr) => acc + curr.intensity, 0);
  const avgManipulation = Math.min(100, Math.round(totalIntensity / 2.5));

  const sorted = [...indicators].sort((a, b) => b.intensity - a.intensity);
  const dominant = sorted[0].intensity > 0 ? sorted[0] : null;

  return {
    manipulationScore: avgManipulation,
    dominantTactic: dominant ? dominant.typeEn : 'Neutral',
    dominantTacticAr: dominant ? dominant.typeAr : 'صياغة محايدة',
    indicators,
    isEmotionallyCharged: avgManipulation >= 40
  };
}
