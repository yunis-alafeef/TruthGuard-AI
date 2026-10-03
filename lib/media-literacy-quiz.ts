/**
 * TruthGuard AI - Media Literacy & Critical Thinking Simulation Engine
 * Interactive scenarios testing user discernment of fake headlines and manipulated graphics.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface ScenarioQuestion {
  id: string;
  category: 'cherry_picking' | 'fake_url' | 'synthetic_image' | 'deceptive_headline';
  promptAr: string;
  promptEn: string;
  options: {
    id: string;
    textAr: string;
    textEn: string;
    isCorrect: boolean;
    explanationAr: string;
    explanationEn: string;
  }[];
  criticalSkillTaughtAr: string;
  criticalSkillTaughtEn: string;
}

export const LITERACY_SCENARIOS: ScenarioQuestion[] = [
  {
    id: 'sc-1',
    category: 'fake_url',
    promptAr: 'وصلك رابط لخبر عاجل يبدو هكذا: https://www.bbc.com.news-breaking-24.co/article.html — كيف تتعامل معه؟',
    promptEn: 'You received a breaking news link formatted as: https://www.bbc.com.news-breaking-24.co/article.html — How do you evaluate it?',
    options: [
      {
        id: 'opt-1',
        textAr: 'أفتحه مباشرة لأنه يبدأ بـ bbc.com.',
        textEn: 'Open it directly because it starts with bbc.com.',
        isCorrect: false,
        explanationAr: 'خطأ: النطاق الفعلي ينتهي بـ .co وليس bbc.com، وهي تقنية خداع شائعة.',
        explanationEn: 'Incorrect: The actual root domain is .co, not bbc.com.'
      },
      {
        id: 'opt-2',
        textAr: 'أتحقق من النطاق الجذري وأدرك أنه نطاق تصيد احتيالي ينتحل هوية BBC.',
        textEn: 'Examine root domain and identify it as an impersonation spoof.',
        isCorrect: true,
        explanationAr: 'صحيح! اسم النطاق الأساسي هو news-breaking-24.co وليس بي بي سي.',
        explanationEn: 'Correct! The actual root domain is news-breaking-24.co.'
      }
    ],
    criticalSkillTaughtAr: 'التحقق من النطاق الجذري لتجنب الروابط المزيفة ومواقع الانتحال.',
    criticalSkillTaughtEn: 'URL anatomy verification and domain spoofing detection.'
  },
  {
    id: 'sc-2',
    category: 'synthetic_image',
    promptAr: 'صورة متداولة لشخصية عامة في موقف محرج مع أيدي مشوهة بـ 6 أصابع وخلفية ضبابية غير منتظمة.',
    promptEn: 'A viral photo of a public official with distorted six-fingered hands and irregular background geometry.',
    options: [
      {
        id: 'opt-1',
        textAr: 'حقيقة ومؤكدة لأن الصور لا يمكن تزييفها بسهولة.',
        textEn: 'Authentic because images cannot be easily forged.',
        isCorrect: false,
        explanationAr: 'غير صحيح: تشوهات الأطابع والتباينات الهندسية من أشهر علامات الذكاء الاصطناعي التوليدي.',
        explanationEn: 'Incorrect: Finger anomalies and geometric warps are classic generative AI artifacts.'
      },
      {
        id: 'opt-2',
        textAr: 'صورة مولدة بالذكاء الاصطناعي (AI Deepfake) ويجب فحصها بحثاً عكسياً.',
        textEn: 'Likely an AI-generated image requiring reverse visual verification.',
        isCorrect: true,
        explanationAr: 'أحسنت! تشوهات الأطراف وعدم اتساق الإضاءة علامة قوية على التوليد الرقمي.',
        explanationEn: 'Correct! Limb anomalies and lighting mismatches indicate digital synthesis.'
      }
    ],
    criticalSkillTaughtAr: 'ملاحظة التشوهات الهندسية والأطراف في الصور المولدة بالذكاء الاصطناعي.',
    criticalSkillTaughtEn: 'Spotting anatomical and lighting inconsistencies in synthetic media.'
  }
];

export function gradeLiteracyQuiz(answers: Record<string, string>): {
  scorePercent: number;
  correctCount: number;
  total: number;
  feedbackAr: string;
  feedbackEn: string;
} {
  let correct = 0;
  LITERACY_SCENARIOS.forEach(sc => {
    const selected = sc.options.find(o => o.id === answers[sc.id]);
    if (selected?.isCorrect) correct++;
  });

  const total = LITERACY_SCENARIOS.length;
  const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    scorePercent,
    correctCount: correct,
    total,
    feedbackAr: scorePercent >= 80 
      ? 'ممتاز! تمتلك وعياً نقدياً قوياً وقدرة عالية على تفنيد حيل التضليل الرقمي.'
      : 'جيد، ننصح بمراجعة علامات النطاقات الخادعة وتفاصيل الصور المولدة بالذكاء الاصطناعي.',
    feedbackEn: scorePercent >= 80
      ? 'Outstanding! You demonstrate high resilience against deceptive digital tactics.'
      : 'Good effort! Review domain spoofing cues and AI visual synthesis artifacts.'
  };
}
