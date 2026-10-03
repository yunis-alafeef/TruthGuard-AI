/**
 * TruthGuard AI - Audio & Voice Note Fact-Checking Pipeline
 * Transcribes audio claims, segments spoken evidence, and evaluates voice clone risks.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface AudioSegment {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
  speakerId?: string;
  isFactualClaim: boolean;
  extractedClaim?: string;
}

export interface AudioVerificationReport {
  durationSeconds: number;
  wordCount: number;
  transcriptText: string;
  segments: AudioSegment[];
  claimsIdentified: string[];
  aiVoiceCloneRisk: 'low' | 'moderate' | 'high';
  aiVoiceCloneConfidence: number; // 0 - 100
  acousticAnomaliesAr: string[];
  acousticAnomaliesEn: string[];
}

/**
 * Evaluates audio transcripts for factual assertions and potential synthetic voice clone anomalies
 */
export function processAudioTranscript(
  transcript: string,
  segments: { start: number; end: number; text: string; speaker?: string }[],
  audioDurationSec: number
): AudioVerificationReport {
  const FACT_PATTERNS = [
    /أكدت|أعلنت|صرح|اكتشف|توفي|وقعت|رسمياً|حسب تقرير|عاجل/i,
    /confirmed|announced|stated|discovered|died|occurred|officially|according to/i
  ];

  const processedSegments: AudioSegment[] = segments.map((s, idx) => {
    const isClaim = FACT_PATTERNS.some(p => p.test(s.text));
    return {
      id: `seg-${idx + 1}`,
      startSec: s.start,
      endSec: s.end,
      text: s.text,
      speakerId: s.speaker || 'Speaker 1',
      isFactualClaim: isClaim,
      extractedClaim: isClaim ? s.text.trim() : undefined
    };
  });

  const claims = processedSegments
    .filter(s => s.isFactualClaim && s.extractedClaim)
    .map(s => s.extractedClaim as string);

  // Analyze cadence & speed
  const wordCount = transcript.trim().split(/\s+/).length;
  const wordsPerMinute = audioDurationSec > 0 ? (wordCount / audioDurationSec) * 60 : 0;

  const anomaliesAr: string[] = [];
  const anomaliesEn: string[] = [];
  let cloneScore = 15;

  if (wordsPerMinute > 220) {
    cloneScore += 30;
    anomaliesAr.push('سرعة التحدث غير طبيعية وتتجاوز المعدل البشري المعتاد (أكثر من 220 كلمة/دقيقة).');
    anomaliesEn.push('Speaking rate exceeds normal human conversational thresholds (>220 WPM).');
  } else if (wordsPerMinute < 70 && audioDurationSec > 10) {
    cloneScore += 20;
    anomaliesAr.push('وقفات اصطناعية مفرطة بين العبارات.');
    anomaliesEn.push('Unnatural synthetic pauses detected between clauses.');
  }

  let cloneRisk: AudioVerificationReport['aiVoiceCloneRisk'] = 'low';
  if (cloneScore >= 60) cloneRisk = 'high';
  else if (cloneScore >= 35) cloneRisk = 'moderate';

  return {
    durationSeconds: audioDurationSec,
    wordCount,
    transcriptText: transcript,
    segments: processedSegments,
    claimsIdentified: claims,
    aiVoiceCloneRisk: cloneRisk,
    aiVoiceCloneConfidence: cloneScore,
    acousticAnomaliesAr: anomaliesAr,
    acousticAnomaliesEn: anomaliesEn
  };
}
