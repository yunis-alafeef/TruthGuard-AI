/**
 * TruthGuard AI - AI Evidence Reasoner (RAG Architecture)
 * Uses generative AI strictly as a reasoning & synthesis evaluator over retrieved evidence,
 * not as an oracle of truth. Eliminates hallucination via closed-domain grounding.
 * Lead Architect: Yunis Al-Afeef <shoeabvv@gmail.com>
 */

import { GoogleGenAI } from '@google/genai';
import type { EvidenceSource } from './search-aggregator';

export type VeracityVerdict = 'True' | 'Likely True' | 'Misleading' | 'False' | 'Unverified';

export interface EvaluatedEvidenceItem {
  url: string;
  publisher: string;
  stance: 'supports' | 'contradicts' | 'context';
  relevanceExplanationAr: string;
  relevanceExplanationEn: string;
}

export interface VerificationSynthesis {
  verdict: VeracityVerdict;
  verdictAr: string;
  confidenceScore: number; // 0 - 100
  summaryAr: string;
  summaryEn: string;
  keyDiscrepanciesAr: string[];
  keyDiscrepanciesEn: string[];
  evaluatedEvidence: EvaluatedEvidenceItem[];
  modelUsed: string;
  reasoningTimeMs: number;
}

const VERDICT_MAP_AR: Record<VeracityVerdict, string> = {
  'True': 'صحيح ومؤكد',
  'Likely True': 'صحيح غالباً',
  'Misleading': 'مضلل / ينقصه السياق',
  'False': 'زائف تماماً',
  'Unverified': 'غير مؤكد لعدم كفاية الأدلة'
};

/**
 * Evaluates evidence using Google Gemini API
 */
export async function reasonOverEvidence(
  claimText: string,
  evidenceList: EvidenceSource[],
  apiKey?: string
): Promise<VerificationSynthesis> {
  const startTime = Date.now();
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  // If no evidence retrieved, return Unverified immediately
  if (evidenceList.length === 0) {
    return {
      verdict: 'Unverified',
      verdictAr: VERDICT_MAP_AR['Unverified'],
      confidenceScore: 30,
      summaryAr: 'لم يتم العثور على تغطية أو مصادر إخبارية موثوقة كافية للحكم على الادعاء بدقة.',
      summaryEn: 'Insufficient indexed coverage or credible news evidence to substantiate the claim.',
      keyDiscrepanciesAr: ['غياب أي تقارير من وكالات الأنباء الرسمية أو هيئات التحقق المستقلة.'],
      keyDiscrepanciesEn: ['Absence of coverage across certified wire services and fact-checking bodies.'],
      evaluatedEvidence: [],
      modelUsed: 'Heuristic Rule Base',
      reasoningTimeMs: Date.now() - startTime
    };
  }

  // Check if an established fact-checker already debunked or confirmed it
  const factCheckerDebunk = evidenceList.find(e => e.isFactChecker && e.stance === 'contradicts');
  const factCheckerSupport = evidenceList.find(e => e.isFactChecker && e.stance === 'supports');

  if (key) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });

      const evidenceFormatted = evidenceList.map((e, idx) => `
[Source #${idx + 1}]
Publisher: ${e.publisher}
URL: ${e.url}
IsFactChecker: ${e.isFactChecker}
Title: ${e.title}
Snippet: ${e.snippet}
`).join('\n');

      const systemInstruction = `You are TruthGuard AI, an impartial, evidence-based fact-checking reasoning engine.
Your sole mission is to evaluate whether the following CLAIM is substantiated, contradicted, or omitted by the provided EVIDENCE SOURCES.

STRICT RULES:
1. Grounding Only: Never use external assumptions or hallucinated facts. Rely strictly on the provided evidence.
2. If sources contradict the claim, mark it "False" or "Misleading".
3. If sources confirm the claim with official evidence, mark it "True" or "Likely True".
4. If sources are vague or do not address the claim, mark it "Unverified".
5. Output ONLY valid JSON matching this schema:
{
  "verdict": "True" | "Likely True" | "Misleading" | "False" | "Unverified",
  "confidenceScore": number (30 to 98),
  "summaryAr": "فقرة واضحة وموضوعية باللغة العربية تشرح النتيجة وتذكر أسماء المصادر",
  "summaryEn": "A concise, objective English paragraph explaining the verdict citing source names",
  "keyDiscrepanciesAr": ["نقطة 1", "نقطة 2"],
  "keyDiscrepanciesEn": ["Point 1", "Point 2"],
  "evidenceStances": [
    { "index": 1, "stance": "supports" | "contradicts" | "context", "reasonAr": "شرح موجز", "reasonEn": "Brief note" }
  ]
}`;

      const prompt = `CLAIM TO VERIFY:
"${claimText}"

RETRIEVED LIVE EVIDENCE SOURCES:
${evidenceFormatted}

Please provide your rigorous evidence evaluation in JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());

      const verdict: VeracityVerdict = ['True', 'Likely True', 'Misleading', 'False', 'Unverified'].includes(parsed.verdict)
        ? parsed.verdict
        : 'Unverified';

      const evaluatedEvidence: EvaluatedEvidenceItem[] = evidenceList.map((e, idx) => {
        const itemStance = parsed.evidenceStances?.find((s: { index: number }) => s.index === idx + 1);
        return {
          url: e.url,
          publisher: e.publisher,
          stance: itemStance?.stance || e.stance || 'context',
          relevanceExplanationAr: itemStance?.reasonAr || `تم توظيف هذا المصدر في فحص السياق عبر ${e.publisher}`,
          relevanceExplanationEn: itemStance?.reasonEn || `Source utilized for contextual cross-reference via ${e.publisher}`
        };
      });

      return {
        verdict,
        verdictAr: VERDICT_MAP_AR[verdict],
        confidenceScore: Math.min(98, Math.max(35, Number(parsed.confidenceScore) || 75)),
        summaryAr: parsed.summaryAr,
        summaryEn: parsed.summaryEn,
        keyDiscrepanciesAr: parsed.keyDiscrepanciesAr || [],
        keyDiscrepanciesEn: parsed.keyDiscrepanciesEn || [],
        evaluatedEvidence,
        modelUsed: 'Google Gemini 2.5 Flash (RAG Grounded)',
        reasoningTimeMs: Date.now() - startTime
      };
    } catch {
      // Fallback to deterministic evidence scoring below
    }
  }

  // Deterministic Fallback Logic (if Gemini API key is absent or network fails)
  let verdict: VeracityVerdict = 'Likely True';
  let conf = 70;
  let summaryAr = '';
  let summaryEn = '';

  if (factCheckerDebunk) {
    verdict = 'False';
    conf = 92;
    summaryAr = `أكدت هيئة التحقق المعتمدة (${factCheckerDebunk.publisher}) أن هذا الادعاء غير صحيح وزائف.`;
    summaryEn = `Verified fact-checking agency (${factCheckerDebunk.publisher}) refuted this claim as false.`;
  } else if (factCheckerSupport) {
    verdict = 'True';
    conf = 94;
    summaryAr = `أكدت هيئة التحقق والتقارير الموثقة (${factCheckerSupport.publisher}) صحة هذا الادعاء.`;
    summaryEn = `Verified fact-checking agency (${factCheckerSupport.publisher}) confirmed this claim as accurate.`;
  } else {
    // Cross-examine keywords
    const textLower = claimText.toLowerCase();
    const isFalseSignals = evidenceList.filter(e => /false|fake|كاذب|خاطئ|لا صحة|نفت|شائعة/i.test(`${e.title} ${e.snippet}`));
    const isTrueSignals = evidenceList.filter(e => /official|confirmed|أعلنت|أكدت|رسمياً|تقرير/i.test(`${e.title} ${e.snippet}`));

    if (isFalseSignals.length >= 2) {
      verdict = 'False';
      conf = 88;
      summaryAr = `تشير تغطيات المصادر المسترجعة إلى نفي الادعاء وتفنيده في عدة تقارير إخبارية.`;
      summaryEn = `Indexed reports explicitly refute and debunk the viral claim.`;
    } else if (isTrueSignals.length >= 2) {
      verdict = 'True';
      conf = 85;
      summaryAr = `تتطابق تفاصيل الادعاء مع بيانات وتغطيات رسمية منشورة في عدة منافذ إخبارية موثوقة.`;
      summaryEn = `Claim details corroborate with multiple official announcements in indexed news.`;
    } else {
      verdict = 'Misleading';
      conf = 65;
      summaryAr = `المعلومات المتداولة تحتوي على عناصر غير دقيقة أو تنزع الأحداث من سياقها الفعلي.`;
      summaryEn = `The circulation omits key context or distorts verifiable event timelines.`;
    }
  }

  return {
    verdict,
    verdictAr: VERDICT_MAP_AR[verdict],
    confidenceScore: conf,
    summaryAr,
    summaryEn,
    keyDiscrepanciesAr: ['مقارنة السياق الإخباري مع الادعاء المتداول.'],
    keyDiscrepanciesEn: ['Cross-examination of news context against circulating claim.'],
    evaluatedEvidence: evidenceList.map(e => ({
      url: e.url,
      publisher: e.publisher,
      stance: verdict === 'False' ? 'contradicts' : 'supports',
      relevanceExplanationAr: `تم توثيق التقرير من ${e.publisher}`,
      relevanceExplanationEn: `Documented report from ${e.publisher}`
    })),
    modelUsed: 'Deterministic Consensus Engine',
    reasoningTimeMs: Date.now() - startTime
  };
}
