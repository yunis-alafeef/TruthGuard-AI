/**
 * @file sensationalism.ts
 * @description Analyzes claims and news headlines for emotional sensationalism,
 * clickbait markers, exaggerated promises, and linguistic manipulation in both Arabic and English.
 */

export interface SensationalismResult {
  score: number; // 0 (completely neutral/objective) to 100 (extreme clickbait/sensationalism)
  level: 'low' | 'moderate' | 'high' | 'extreme';
  detectedTriggers: string[];
  exaggerationCount: number;
  hasPunctuationAbuse: boolean;
  capsRatio: number;
  analysis: {
    ar: string;
    en: string;
  };
}

const ARABIC_SENSATIONAL_TRIGGERS = [
  'عاجل جدا',
  'خطير جدا',
  'كارثة',
  'صدمة كبرى',
  'لن تصدق',
  'شاهد قبل الحذف',
  'مؤامرة',
  'سر أخفته الحكومات',
  'فضيحة مدوية',
  'معجزة طبية',
  'أخطر فيديو',
  'دواء سحري',
  'مفاجأة مذهلة',
  'انهيار تام',
  'حقيقة صادمة',
  'انفجار الوضع',
  'قبل فوات الأوان',
  'السر الخفي',
  'نهاية العالم',
  'احذروا فورا'
];

const ENGLISH_SENSATIONAL_TRIGGERS = [
  'shocking',
  'you won\'t believe',
  'miracle cure',
  'hidden secret',
  'mind-blowing',
  'they don\'t want you to know',
  'urgent alert',
  'devastating truth',
  'unbelievable discovery',
  'instant miracle',
  'secret plot',
  'watch before deleted',
  'catastrophic collapse',
  'bombshell revelation',
  'jaw-dropping',
  'life-changing secret'
];

export function analyzeSensationalism(text: string): SensationalismResult {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      level: 'low',
      detectedTriggers: [],
      exaggerationCount: 0,
      hasPunctuationAbuse: false,
      capsRatio: 0,
      analysis: {
        ar: 'النص محايد ولا يحتوي على مؤشرات تهويلية.',
        en: 'The text is neutral with no sensationalism markers.'
      }
    };
  }

  const normalized = text.toLowerCase();
  const detectedTriggers: string[] = [];

  // Check Arabic triggers
  for (const trigger of ARABIC_SENSATIONAL_TRIGGERS) {
    if (text.includes(trigger)) {
      detectedTriggers.push(trigger);
    }
  }

  // Check English triggers
  for (const trigger of ENGLISH_SENSATIONAL_TRIGGERS) {
    if (normalized.includes(trigger)) {
      detectedTriggers.push(trigger);
    }
  }

  // Check punctuation abuse (e.g. "!!!" or "???")
  const exclamationMatches = text.match(/!{2,}/g) || [];
  const questionMatches = text.match(/\?{2,}/g) || [];
  const hasPunctuationAbuse = exclamationMatches.length > 0 || questionMatches.length > 0;

  // Check capitalization (English)
  const letters = text.replace(/[^a-zA-Z]/g, '');
  const uppercaseLetters = text.replace(/[^A-Z]/g, '');
  const capsRatio = letters.length > 0 ? uppercaseLetters.length / letters.length : 0;

  // Calculate composite score
  let score = 0;
  score += detectedTriggers.length * 20;
  if (hasPunctuationAbuse) score += 20;
  if (capsRatio > 0.4 && letters.length > 6) score += 25;

  score = Math.min(100, Math.max(0, score));

  let level: SensationalismResult['level'] = 'low';
  if (score >= 75) level = 'extreme';
  else if (score >= 45) level = 'high';
  else if (score >= 20) level = 'moderate';

  const arText =
    level === 'low'
      ? 'النص موضوعي وذو صياغة هادئة خالية من التهويل الإعلامي.'
      : level === 'moderate'
      ? 'يحتوي النص على بعض عبارات الجذب أو علامات التعجب التي تستدعي الحذر.'
      : 'النص مليء بعبارات التهويل والإثارة غير الموضوعية (Clickbait) بهدف التأثير العاطفي.';

  const enText =
    level === 'low'
      ? 'The text exhibits objective tone and neutral journalistic diction.'
      : level === 'moderate'
      ? 'The text includes mild clickbait markers or emphatic punctuation.'
      : 'The text is heavily saturated with sensationalist, emotionally manipulative buzzwords.';

  return {
    score,
    level,
    detectedTriggers,
    exaggerationCount: detectedTriggers.length,
    hasPunctuationAbuse,
    capsRatio: Math.round(capsRatio * 100) / 100,
    analysis: {
      ar: arText,
      en: enText
    }
  };
}
