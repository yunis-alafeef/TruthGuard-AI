/**
 * TruthGuard AI - Rumor Lifecycle & Temporal Propagation Tracker
 * Analyzes rumor velocity, peak spread acceleration, and debunk latency.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export type LifecycleStage =
  | 'emergence'        // First sighted, localized
  | 'acceleration'     // Exponential viral growth
  | 'saturation'       // Broad public circulation
  | 'debunk_response'  // Fact-checking counter-narrative deployed
  | 'decay'            // Diminishing share volume
  | 'resurgent';       // Zombie rumor returning months/years later

export interface SightEvent {
  platform: 'x' | 'whatsapp' | 'facebook' | 'telegram' | 'tiktok' | 'news' | 'other';
  timestamp: string; // ISO date
  estimatedReach: number;
  isDebunk?: boolean;
}

export interface TemporalAnalysis {
  firstSighted: string;
  lastSighted: string;
  lifespanDays: number;
  stage: LifecycleStage;
  stageLabelAr: string;
  stageLabelEn: string;
  viralityVelocityScore: number; // 0 - 100
  debunkLatencyHours: number | null;
  resurgenceCount: number;
  trajectoryTrend: 'accelerating' | 'stable' | 'decaying' | 'dormant';
  timelineEvents: SightEvent[];
  recommendationAr: string;
  recommendationEn: string;
}

export function analyzeRumorTimeline(events: SightEvent[]): TemporalAnalysis {
  if (events.length === 0) {
    const now = new Date().toISOString();
    return {
      firstSighted: now,
      lastSighted: now,
      lifespanDays: 0,
      stage: 'emergence',
      stageLabelAr: 'ظهور أولي (محدود الانتشار)',
      stageLabelEn: 'Emergence',
      viralityVelocityScore: 10,
      debunkLatencyHours: null,
      resurgenceCount: 0,
      trajectoryTrend: 'stable',
      timelineEvents: [],
      recommendationAr: 'المراقبة الاستباقية لمنع تفشي الشائعة.',
      recommendationEn: 'Proactive monitoring to prevent breakout.'
    };
  }

  const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const first = new Date(sorted[0].timestamp);
  const last = new Date(sorted[sorted.length - 1].timestamp);
  const lifespanDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)));

  const firstDebunk = sorted.find(e => e.isDebunk);
  let debunkLatencyHours: number | null = null;
  if (firstDebunk) {
    debunkLatencyHours = Math.round((new Date(firstDebunk.timestamp).getTime() - first.getTime()) / (1000 * 60 * 60));
  }

  // Calculate volume velocity in the last 48 hours
  const nowMs = last.getTime();
  const recentEvents = sorted.filter(e => nowMs - new Date(e.timestamp).getTime() <= 48 * 3600 * 1000);
  const totalRecentReach = recentEvents.reduce((acc, curr) => acc + curr.estimatedReach, 0);

  let viralityVelocity = Math.min(100, Math.round((totalRecentReach / (lifespanDays * 500 + 1000)) * 20));
  if (viralityVelocity < 10) viralityVelocity = 15;

  let stage: LifecycleStage = 'emergence';
  let stageLabelAr = 'ظهور أولي';
  let stageLabelEn = 'Emergence';
  let trend: 'accelerating' | 'stable' | 'decaying' | 'dormant' = 'stable';

  if (lifespanDays > 60 && recentEvents.length > 2) {
    stage = 'resurgent';
    stageLabelAr = 'عودة الشائعة (Zombie Rumor)';
    stageLabelEn = 'Resurgent Rumor';
    trend = 'accelerating';
  } else if (firstDebunk && last.getTime() >= new Date(firstDebunk.timestamp).getTime()) {
    stage = 'debunk_response';
    stageLabelAr = 'مرحلة التفنيد والمواجهة';
    stageLabelEn = 'Debunk Response';
    trend = 'decaying';
  } else if (viralityVelocity > 65) {
    stage = 'acceleration';
    stageLabelAr = 'تسارع وتفشٍ فيروسي حاد';
    stageLabelEn = 'Viral Acceleration';
    trend = 'accelerating';
  } else if (lifespanDays > 7 && viralityVelocity > 40) {
    stage = 'saturation';
    stageLabelAr = 'تشبع عام وتداول واسع';
    stageLabelEn = 'Mainstream Saturation';
    trend = 'stable';
  }

  return {
    firstSighted: sorted[0].timestamp,
    lastSighted: sorted[sorted.length - 1].timestamp,
    lifespanDays,
    stage,
    stageLabelAr,
    stageLabelEn,
    viralityVelocityScore: viralityVelocity,
    debunkLatencyHours,
    resurgenceCount: stage === 'resurgent' ? 1 : 0,
    trajectoryTrend: trend,
    timelineEvents: sorted,
    recommendationAr: stage === 'acceleration' 
      ? 'ضرورة التدخل السريع ببيان تفنيدي رسمي عبر منصات التواصل ذات الانتشار العالي.'
      : 'نشر بطاقات التوعية وتوضيح الحقائق عبر المصادر الموثوقة.',
    recommendationEn: stage === 'acceleration'
      ? 'Urgent corrective action needed on high-traffic platforms.'
      : 'Disseminate educational debunk cards via credible outlets.'
  };
}
