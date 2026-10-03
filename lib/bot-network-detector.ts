/**
 * TruthGuard AI - Coordinated Inauthentic Behavior (CIB) & Bot Swarm Detector
 * Analyzes astroturfing campaigns, copy-paste repetition, and synchronized amplification.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface PostActivity {
  postId: string;
  handle: string;
  accountAgeDays: number;
  followersCount: number;
  text: string;
  timestamp: string; // ISO
  hasDefaultAvatar?: boolean;
}

export interface InauthenticSwarmAnalysis {
  cibScore: number; // 0 - 100
  isCoordinatedCampaign: boolean;
  campaignType: 'astroturfing' | 'copypasta_swarm' | 'amplification_burst' | 'organic';
  campaignTypeAr: string;
  campaignTypeEn: string;
  burstDurationMinutes: number;
  suspiciousAccountRatio: number; // 0.0 - 1.0
  verbatimRepetitionCount: number;
  indicatorsAr: string[];
  indicatorsEn: string[];
  recommendedMitigationAr: string;
  recommendedMitigationEn: string;
}

/**
 * Evaluates a batch of posts sharing a viral claim for coordination patterns
 */
export function analyzeCoordinatedBehavior(posts: PostActivity[]): InauthenticSwarmAnalysis {
  if (posts.length < 2) {
    return {
      cibScore: 5,
      isCoordinatedCampaign: false,
      campaignType: 'organic',
      campaignTypeAr: 'نشاط عضوي طبيعي',
      campaignTypeEn: 'Organic Activity',
      burstDurationMinutes: 0,
      suspiciousAccountRatio: 0,
      verbatimRepetitionCount: 0,
      indicatorsAr: ['عينة المنشورات غير كافية لرصد السلوك المنسق.'],
      indicatorsEn: ['Sample size too small for coordination analysis.'],
      recommendedMitigationAr: 'متابعة الرصد العادي.',
      recommendedMitigationEn: 'Standard monitoring.'
    };
  }

  const indicatorsAr: string[] = [];
  const indicatorsEn: string[] = [];

  // 1. Check account vulnerability/bot signals
  const suspiciousAccounts = posts.filter(p => p.accountAgeDays < 30 || (p.followersCount < 10 && p.hasDefaultAvatar));
  const suspiciousRatio = Number((suspiciousAccounts.length / posts.length).toFixed(2));

  if (suspiciousRatio >= 0.4) {
    indicatorsAr.push(`${Math.round(suspiciousRatio * 100)}% من الحسابات المشاركة حديثة الإنشاء (أقل من 30 يوماً) أو تفتقر لبيانات تعريفية.`);
    indicatorsEn.push(`${Math.round(suspiciousRatio * 100)}% of amplifying accounts were created within the last 30 days.`);
  }

  // 2. Check temporal synchronicity (burst time)
  const timestamps = posts.map(p => new Date(p.timestamp).getTime()).sort((a, b) => a - b);
  const burstDurationMs = timestamps[timestamps.length - 1] - timestamps[0];
  const burstMinutes = Math.max(1, Math.round(burstDurationMs / (1000 * 60)));

  if (posts.length >= 5 && burstMinutes <= 15) {
    indicatorsAr.push(`تزامن زمني غير طبيعي: نشر ${posts.length} منشورات خلال ${burstMinutes} دقيقة فقط.`);
    indicatorsEn.push(`Abnormal posting synchronicity: ${posts.length} posts generated within ${burstMinutes} minutes.`);
  }

  // 3. Verbatim Copypasta check
  const textFrequencies = new Map<string, number>();
  posts.forEach(p => {
    const clean = p.text.trim().toLowerCase().replace(/\s+/g, ' ');
    textFrequencies.set(clean, (textFrequencies.get(clean) || 0) + 1);
  });

  const maxRepetition = Math.max(...Array.from(textFrequencies.values()));
  if (maxRepetition >= 3) {
    indicatorsAr.push(`رصد حملة نسخ ولصق حرفي (Copypasta): تم تكرار نفس الصياغة الحرفية في ${maxRepetition} حسابات.`);
    indicatorsEn.push(`Verbatim copypasta swarm detected: identical text replicated across ${maxRepetition} accounts.`);
  }

  // Composite CIB score
  let score = Math.round(
    suspiciousRatio * 40 +
    (burstMinutes <= 15 && posts.length >= 5 ? 35 : 10) +
    (maxRepetition >= 3 ? 25 : 0)
  );
  score = Math.min(100, Math.max(5, score));

  let campaignType: InauthenticSwarmAnalysis['campaignType'] = 'organic';
  let campaignTypeAr = 'تداول عضوي طبيعي';
  let campaignTypeEn = 'Organic Circulation';

  if (score >= 70) {
    campaignType = maxRepetition >= 3 ? 'copypasta_swarm' : 'astroturfing';
    campaignTypeAr = 'حملة استعمار رقمي مصطنعة (Astroturfing / Bots)';
    campaignTypeEn = 'Coordinated Astroturfing / Bot Swarm';
  } else if (score >= 45) {
    campaignType = 'amplification_burst';
    campaignTypeAr = 'تضخيم متسارع شبه منسق';
    campaignTypeEn = 'Semi-Coordinated Amplification Burst';
  }

  return {
    cibScore: score,
    isCoordinatedCampaign: score >= 60,
    campaignType,
    campaignTypeAr,
    campaignTypeEn,
    burstDurationMinutes: burstMinutes,
    suspiciousAccountRatio: suspiciousRatio,
    verbatimRepetitionCount: maxRepetition,
    indicatorsAr,
    indicatorsEn,
    recommendedMitigationAr: score >= 60
      ? 'رفع تقرير إساءة استخدام للمنصة وتنبيه المستخدمين إلى وجود حملة تضليل منسقة مصطنعة.'
      : 'لا يلزم تدخل طارئ، النمط يبدو متوافقاً مع الاهتمام العام الطبيعي.',
    recommendedMitigationEn: score >= 60
      ? 'Report coordinated network to platform trust & safety teams.'
      : 'No intervention required; activity aligns with organic interest.'
  };
}
