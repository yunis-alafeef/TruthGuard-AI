/**
 * TruthGuard AI - Logical Fallacy & Rhetorical Flaw Classifier
 * Identifies formal and informal reasoning fallacies in misleading arguments.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface FallacyMatch {
  type: string;
  nameAr: string;
  nameEn: string;
  explanationAr: string;
  explanationEn: string;
  confidence: number;
  triggerPhrase: string;
}

export interface FallacyAuditReport {
  hasFallacies: boolean;
  detectedFallacies: FallacyMatch[];
  fallacyCount: number;
  argumentQualityScore: number; // 0 - 100
  critiqueSummaryAr: string;
  critiqueSummaryEn: string;
}

interface FallacyRule {
  type: string;
  nameAr: string;
  nameEn: string;
  explanationAr: string;
  explanationEn: string;
  regexPatterns: RegExp[];
}

const FALLACY_RULES: FallacyRule[] = [
  {
    type: 'ad_hominem',
    nameAr: 'مغالطة الشخصنة (Ad Hominem)',
    nameEn: 'Ad Hominem',
    explanationAr: 'مهاجمة شخص القائل أو خلفيته بدلاً من مناقشة الدليل والحجة المطروحة.',
    explanationEn: 'Attacking the person making the argument rather than the argument itself.',
    regexPatterns: [
      /(هو عميل|هو خائن|لأنه جاهل|لا تسمع له لأنه|لأنه مأجور)/i,
      /(he is a traitor|he is corrupt|paid shill|ignorant fool|can't trust him because)/i
    ]
  },
  {
    type: 'false_dilemma',
    nameAr: 'مغالطة المعضلة الزائفة (False Dilemma)',
    nameEn: 'False Dilemma',
    explanationAr: 'حصر الخيارات في طرفين متناقضين فقط (إما معنا أو ضدنا) مع تجاهل البدائل.',
    explanationEn: 'Presenting only two extreme choices while ignoring valid middle grounds.',
    regexPatterns: [
      /(إما أن تقبل|أو أنك خائن|إما معنا وإما|لا يوجد خيار آخر غير)/i,
      /(either you agree or|with us or against us|no other option except)/i
    ]
  },
  {
    type: 'appeal_to_false_authority',
    nameAr: 'الاحتكام لسلطة زائفة (Appeal to False Authority)',
    nameEn: 'Appeal to False Authority',
    explanationAr: 'الاستشهاد بخبير في غير مجاله أو مصدر مجهول لإضفاء مصداقية وهمية.',
    explanationEn: 'Citing an unqualified authority or anonymous expert to substantiate a claim.',
    regexPatterns: [
      /(أكد خبير ياباني مجهول|قال علماء سريون|طبيب شهير رفض ذكر اسمه|حسب مصدر مجهول)/i,
      /(anonymous scientists confirmed|a famous doctor who refused to be named|secret experts say)/i
    ]
  },
  {
    type: 'slippery_slope',
    nameAr: 'مغالطة المنحدر الزلق (Slippery Slope)',
    nameEn: 'Slippery Slope',
    explanationAr: 'افتراض أن خطوة أولى بسيطة ستؤدي حتماً إلى سلسلة كوارث دون إثبات الرابط.',
    explanationEn: 'Assuming a first minor step will inevitably trigger a catastrophic chain reaction.',
    regexPatterns: [
      /(إذا سمحنا بهذا فستنهار الدولة|هذا سيؤدي حتماً إلى دمار|ستنتهي البشرية إذا)/i,
      /(if we allow this then society will collapse|inevitably lead to apocalypse)/i
    ]
  }
];

export function detectLogicalFallacies(text: string): FallacyAuditReport {
  const matches: FallacyMatch[] = [];

  FALLACY_RULES.forEach(rule => {
    for (const pattern of rule.regexPatterns) {
      const match = text.match(pattern);
      if (match) {
        matches.push({
          type: rule.type,
          nameAr: rule.nameAr,
          nameEn: rule.nameEn,
          explanationAr: rule.explanationAr,
          explanationEn: rule.explanationEn,
          confidence: 85,
          triggerPhrase: match[0]
        });
        break;
      }
    }
  });

  const qualityScore = Math.max(10, 100 - matches.length * 25);

  return {
    hasFallacies: matches.length > 0,
    detectedFallacies: matches,
    fallacyCount: matches.length,
    argumentQualityScore: qualityScore,
    critiqueSummaryAr: matches.length > 0
      ? `تم رصد ${matches.length} مغالطة منطقية تؤثر على مصداقية الطرح البرهاني.`
      : 'لم ترصد مغالطات منطقية صريحة في النص.',
    critiqueSummaryEn: matches.length > 0
      ? `Identified ${matches.length} reasoning fallacies undermining argumentative validity.`
      : 'No obvious rhetorical fallacies detected.'
  };
}
