/**
 * @file i18n.ts
 * @description Comprehensive bilingual localization dictionary and helper utilities
 * supporting Arabic (RTL) and English (LTR).
 */

export type Locale = 'ar' | 'en';

export const TRANSLATIONS = {
  ar: {
    appTitle: 'حارس الحقيقة | TruthGuard AI',
    appSubtitle: 'نظام ذكي متقدم للتحقق من الادعاءات وفحص التضليل الإعلامي',
    motto: 'لا تصدق فقط… تحقق.',
    authorBadge: 'إعداد وعمل المهندس يونس العفيف',
    inputPlaceholder: 'أدخل الادعاء أو الخبر أو النص المشبوه للتحقق من صحته فورياً...',
    verifyButton: 'فحص وتحقيق',
    verifyingButton: 'جارٍ الفحص والتحقق...',
    clearButton: 'مسح',
    sampleClaimsTitle: 'نماذج ادعاءات شائعة للاختبار:',
    historyTitle: 'سجل التحقيقات السابقة',
    noHistory: 'لم يتم إجراء أي تحقيقات بعد.',
    batchTitle: 'الفحص المجمع للادعاءات',
    exportReport: 'تصدير التقرير',
    copyDebunk: 'نسخ بطاقة التفنيد',
    copiedSuccess: 'تم النسخ بنجاح!',
    confidenceLabel: 'درجة المصداقية والموثوقية:',
    verdictLabel: 'الحكم النهائي:',
    evidenceLabel: 'أدلة الويب والمصادر المرجعية:',
    noEvidenceFound: 'لم يتم العثور على مصادر ويب كافية تثبت هذا الادعاء.',
    filterAll: 'الكل',
    verdicts: {
      supported: 'صحيح ومثبت',
      mostly_true: 'صحيح إلى حد كبير',
      unverified: 'غير مؤكد / يحتاج أدلة',
      misleading: 'مضلل وخارج السياق',
      false: 'كاذب تماماً'
    },
    metrics: {
      webEvidence: 'أدلة الويب الحية',
      mlModel: 'النموذج الإحصائي',
      sourceAuthority: 'موثوقية النطاقات',
      neutrality: 'الحياد اللغوي'
    }
  },
  en: {
    appTitle: 'TruthGuard AI',
    appSubtitle: 'Advanced fact-checking system & automated misinformation defense',
    motto: 'Don’t just believe… verify.',
    authorBadge: 'Engineered by Eng. Yunis Al-Afeef',
    inputPlaceholder: 'Enter a claim, news headline, or viral post to fact-check instantly...',
    verifyButton: 'Verify Claim',
    verifyingButton: 'Verifying & Grounding...',
    clearButton: 'Clear',
    sampleClaimsTitle: 'Sample trending claims to test:',
    historyTitle: 'Investigation History',
    noHistory: 'No claims verified yet.',
    batchTitle: 'Batch Claims Verification',
    exportReport: 'Export Report',
    copyDebunk: 'Copy Debunk Card',
    copiedSuccess: 'Copied to clipboard!',
    confidenceLabel: 'Credibility & Confidence Score:',
    verdictLabel: 'Final Verdict:',
    evidenceLabel: 'Web Evidence & Cited Sources:',
    noEvidenceFound: 'No conclusive web evidence found supporting this assertion.',
    filterAll: 'All',
    verdicts: {
      supported: 'Verified True',
      mostly_true: 'Mostly True',
      unverified: 'Unverified / Inconclusive',
      misleading: 'Misleading / Out of Context',
      false: 'False / Fabricated'
    },
    metrics: {
      webEvidence: 'Live Web Grounding',
      mlModel: 'Statistical ML Model',
      sourceAuthority: 'Source Authority',
      neutrality: 'Linguistic Neutrality'
    }
  }
} as const;

export function getDictionary(locale: Locale) {
  return TRANSLATIONS[locale] || TRANSLATIONS.ar;
}

export function isRtl(locale: Locale): boolean {
  return locale === 'ar';
}
