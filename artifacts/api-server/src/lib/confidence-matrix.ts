/**
 * @file confidence-matrix.ts
 * @description Provides an explainable, multi-factor confidence matrix decomposing the
 * overall veracity score into transparent, auditable sub-metrics.
 */

export interface ConfidenceFactor {
  factorName: string;
  factorNameAr: string;
  weightPercent: number; // e.g., 40
  score: number; // 0 to 100
  weightedContribution: number;
  descriptionAr: string;
  descriptionEn: string;
}

export interface TransparencyMatrix {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  reliabilityStatus: 'extremely_reliable' | 'solid_evidence' | 'partial_evidence' | 'low_evidence' | 'unreliable';
  factors: ConfidenceFactor[];
}

export function computeConfidenceMatrix(params: {
  evidenceCount: number;
  topSourceReputation: number;
  modelProbability: number;
  sensationalismScore: number;
}): TransparencyMatrix {
  // 1. Evidence Grounding (Weight: 40%)
  const evidenceScore = Math.min(100, params.evidenceCount * 25);
  const evidenceWeighted = (evidenceScore * 0.4);

  // 2. Source Authority (Weight: 20%)
  const sourceScore = Math.min(100, Math.max(10, params.topSourceReputation));
  const sourceWeighted = (sourceScore * 0.2);

  // 3. Statistical Model Alignment (Weight: 25%)
  const modelScore = Math.min(100, Math.max(0, Math.round(params.modelProbability * 100)));
  const modelWeighted = (modelScore * 0.25);

  // 4. Linguistic Neutrality (Weight: 15%) - inverted sensationalism
  const neutralityScore = Math.max(0, 100 - params.sensationalismScore);
  const neutralityWeighted = (neutralityScore * 0.15);

  const overallScore = Math.round(evidenceWeighted + sourceWeighted + modelWeighted + neutralityWeighted);

  let grade: TransparencyMatrix['grade'] = 'F';
  let reliabilityStatus: TransparencyMatrix['reliabilityStatus'] = 'unreliable';

  if (overallScore >= 90) {
    grade = 'A+';
    reliabilityStatus = 'extremely_reliable';
  } else if (overallScore >= 80) {
    grade = 'A';
    reliabilityStatus = 'solid_evidence';
  } else if (overallScore >= 65) {
    grade = 'B';
    reliabilityStatus = 'partial_evidence';
  } else if (overallScore >= 45) {
    grade = 'C';
    reliabilityStatus = 'low_evidence';
  } else if (overallScore >= 30) {
    grade = 'D';
    reliabilityStatus = 'unreliable';
  }

  const factors: ConfidenceFactor[] = [
    {
      factorName: 'Live Web Grounding',
      factorNameAr: 'أدلة الويب الحية ومطابقة المصادر',
      weightPercent: 40,
      score: evidenceScore,
      weightedContribution: Math.round(evidenceWeighted),
      descriptionAr: 'قوة الأدلة الحية المستخرجة من محركات البحث وتوافقها الدلالي.',
      descriptionEn: 'Strength and semantic alignment of live web evidence retrieved.'
    },
    {
      factorName: 'Statistical ML Model',
      factorNameAr: 'نموذج التعلم الآلي الإحصائي (LIAR Benchmark)',
      weightPercent: 25,
      score: modelScore,
      weightedContribution: Math.round(modelWeighted),
      descriptionAr: 'توقع المصنف الإحصائي المدرب على معايير التحقق الصحفية.',
      descriptionEn: 'Probability estimation from the statistical fact-checking classifier.'
    },
    {
      factorName: 'Source Authority & Domain Trust',
      factorNameAr: 'موثوقية وتصنيف النطاقات المستشهد بها',
      weightPercent: 20,
      score: sourceScore,
      weightedContribution: Math.round(sourceWeighted),
      descriptionAr: 'تصنيف سمعة المواقع الناشرة واحتواؤها على تدقيق معتمد.',
      descriptionEn: 'Authority rating and fact-checking accreditation of cited domains.'
    },
    {
      factorName: 'Linguistic Neutrality',
      factorNameAr: 'الحياد اللغوي وخلو الصياغة من التهويل',
      weightPercent: 15,
      score: neutralityScore,
      weightedContribution: Math.round(neutralityWeighted),
      descriptionAr: 'خلو النص من مفردات الإثارة والترهيب والاصطياد الإلكتروني.',
      descriptionEn: 'Freedom from emotional manipulators and sensationalist rhetoric.'
    }
  ];

  return {
    overallScore,
    grade,
    reliabilityStatus,
    factors
  };
}
