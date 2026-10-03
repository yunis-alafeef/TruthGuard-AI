/**
 * TruthGuard AI - Production Vercel Serverless Function: POST /api/verify
 * Multi-Source Search + Grounded Gemini RAG Reasoner + Zero-Downtime Fallback
 * Lead Architect: Yunis Al-Afeef <shoeabvv@gmail.com>
 */

import { GoogleGenAI } from '@google/genai';

interface EvidenceSource {
  title: string;
  url: string;
  snippet: string;
  publisher: string;
  publishedDate?: string;
  isFactChecker: boolean;
  factCheckRating?: string;
  stance?: 'supports' | 'contradicts' | 'context';
}

const KNOWN_FACTCHECKERS = [
  'misbar.com',
  'fatabyyano.net',
  'snopes.com',
  'politifact.com',
  'factcheck.org',
  'reuters.com/fact-check',
  'apnews.com/hub/ap-fact-check',
  'afp.com/fact-check',
  'fullfact.org'
];

// In-Memory Edge Cache
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

function sendJson(res: any, statusCode: number, payload: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

// 1. Google Fact Check Tools API
async function queryFactCheckTools(claim: string, apiKey?: string): Promise<EvidenceSource[]> {
  const key = apiKey || process.env.GOOGLE_FACTCHECK_API_KEY;
  if (!key) return [];
  try {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(claim)}&key=${key}&languageCode=ar`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.claims || !Array.isArray(data.claims)) return [];

    const evidence: EvidenceSource[] = [];
    for (const item of data.claims) {
      if (item.claimReview && Array.isArray(item.claimReview)) {
        for (const r of item.claimReview) {
          evidence.push({
            title: r.title || item.text || 'Fact Check Review',
            url: r.url || 'https://factchecktools.googleapis.com',
            snippet: `مراجعة التحقق: ${r.textualRating || ''} - الناشر: ${r.publisher?.name || ''}`,
            publisher: r.publisher?.name || 'Fact Check Registry',
            publishedDate: r.reviewDate,
            isFactChecker: true,
            factCheckRating: r.textualRating,
            stance: /false|fake|كاذب|زائف|غير صحيح/i.test(r.textualRating || '') ? 'contradicts' : 'supports'
          });
        }
      }
    }
    return evidence;
  } catch {
    return [];
  }
}

// 2. Tavily Real-Time News API
async function queryTavilyNews(query: string, apiKey?: string): Promise<EvidenceSource[]> {
  const key = apiKey || process.env.TAVILY_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: 'advanced',
        max_results: 6,
        topic: 'news'
      }),
      signal: AbortSignal.timeout(4500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((r: any) => ({
          title: r.title,
          url: r.url,
          snippet: r.content?.slice(0, 300) || '',
          publisher: new URL(r.url).hostname.replace(/^www\./, ''),
          publishedDate: r.published_date,
          isFactChecker: KNOWN_FACTCHECKERS.some(fc => r.url.toLowerCase().includes(fc))
        }));
      }
    }
  } catch {
    // Fallback
  }
  return [];
}

// 3. Live Wire RSS Fallback
async function queryLiveWireFallback(query: string): Promise<EvidenceSource[]> {
  const sources: EvidenceSource[] = [];
  try {
    const rssUrl = `https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`;
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 TruthGuardAI/3.0 FactCheckEngine' },
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const text = await res.text();
      const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];
      for (const item of items.slice(0, 6)) {
        const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
        const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
        if (titleMatch && linkMatch) {
          const rawUrl = linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
          if (rawUrl.startsWith('http')) {
            const domain = new URL(rawUrl).hostname.replace(/^www\./, '');
            const title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
            const snippet = descMatch ? descMatch[1].replace(/<[^>]+>|<!\[CDATA\[|\]\]>/g, '').trim() : '';
            sources.push({
              title,
              url: rawUrl,
              snippet: snippet.slice(0, 300),
              publisher: domain,
              isFactChecker: KNOWN_FACTCHECKERS.some(fc => rawUrl.toLowerCase().includes(fc))
            });
          }
        }
      }
    }
  } catch {
    // Network fallback
  }
  return sources;
}

// Sensationalism Analyzer
function checkSensationalism(text: string) {
  const TRIGGERS = [
    'عاجل جدا', 'صادم', 'لن تصدق', 'كارثة كبرى', 'فضيحة', 'خطير للغاية', 'سري للغاية',
    'شاهد قبل الحذف', 'زلزال مدمر يهز', 'انهيار كامل', 'وفاة مفاجئة تهز', 'مؤامرة ماسونية',
    'breaking', 'shocking', 'you wont believe', 'bombshell', 'mindblowing', 'secret leak'
  ];
  const detected = TRIGGERS.filter(w => text.toLowerCase().includes(w));
  const hasExclamation = text.includes('!') || text.includes('!!') || text.includes('؟!');
  const score = Math.min(100, (detected.length * 28) + (hasExclamation ? 20 : 0));
  return {
    score,
    level: score > 60 ? 'extreme' : score > 35 ? 'high' : score > 15 ? 'moderate' : 'low',
    triggers: detected,
    hasExclamation
  };
}

// AI Grounded Reasoner
async function evaluateWithGemini(claim: string, sources: EvidenceSource[], apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const formattedSources = sources.map((s, idx) => `[Source ${idx + 1}] (${s.publisher}): ${s.title}\nSnippet: ${s.snippet}`).join('\n\n');

    const prompt = `You are TruthGuard AI, an impartial objective fact-checking evaluation engine.
Evaluate whether the following CLAIM is substantiated or refuted by the retrieved evidence.

CLAIM: "${claim}"

RETRIEVED EVIDENCE:
${formattedSources || 'No external news articles matched.'}

Strict Rules:
- Rely strictly on facts in the evidence.
- Respond with JSON:
{
  "verdict": "supported" | "mostly_true" | "unverified" | "misleading" | "false",
  "confidenceScore": number (35 to 98),
  "verdictLabelAr": "صحيح ومؤكد" | "صحيح غالباً" | "غير مؤكد" | "مضلل / ينقصه السياق" | "زائف تماماً",
  "verdictLabelEn": "Supported" | "Mostly True" | "Unverified" | "Misleading" | "False",
  "summaryAr": "شرح تحليلي دقيق وموضوعي باللغة العربية مع ذكر المصادر المستند عليها",
  "summaryEn": "Detailed objective English analysis citing the referenced sources",
  "subClaims": ["نقطة 1", "نقطة 2"]
}`;

    const CANDIDATES = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-flash-lite-latest', 'gemini-3.8-flash'];
    for (const model of CANDIDATES) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.1 }
        });
        if (res && res.text) {
          const parsed = JSON.parse(res.text.replace(/```json|```/g, '').trim());
          return {
            ...parsed,
            modelUsed: `Google Gemini (${model}) RAG Grounded`
          };
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Fallback
  }
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  try {
    // Safe body extraction
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    if (!body || typeof body !== 'object') {
      body = {};
    }

    const claim = (body.claim || body.text || '').trim();
    if (!claim || claim.length < 3) {
      return sendJson(res, 400, { error: 'يرجى كتابة الادعاء أو الخبر المراد فحصه.' });
    }

    // Check Cache
    const cacheKey = claim.toLowerCase().slice(0, 150);
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return sendJson(res, 200, cached.data);
    }

    const sensationalism = checkSensationalism(claim);

    // 1. Gather Evidence in Parallel
    const [factCheckResults, newsResults] = await Promise.all([
      queryFactCheckTools(claim),
      queryTavilyNews(claim)
    ]);

    let combined = [...factCheckResults, ...newsResults];
    if (combined.length < 2) {
      const fallbackResults = await queryLiveWireFallback(claim);
      combined = [...combined, ...fallbackResults];
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueSources: EvidenceSource[] = [];
    for (const s of combined) {
      if (!seen.has(s.url)) {
        seen.add(s.url);
        uniqueSources.push(s);
      }
    }

    // 2. Reason over Evidence with AI
    let aiEvaluation = await evaluateWithGemini(claim, uniqueSources);

    // Deterministic fallback if Gemini is offline
    if (!aiEvaluation) {
      const isRefuted = uniqueSources.some(s => /false|fake|كاذب|خاطئ|لا صحة|نفت/i.test(`${s.title} ${s.snippet}`));
      const isConfirmed = uniqueSources.some(s => /official|confirmed|أعلنت|أكدت|رسمياً/i.test(`${s.title} ${s.snippet}`));

      let verdict = 'mostly_true';
      let verdictLabelAr = 'صحيح غالباً';
      let verdictLabelEn = 'Mostly True';
      let conf = 75;

      if (isRefuted) {
        verdict = 'false';
        verdictLabelAr = 'زائف تماماً';
        verdictLabelEn = 'False';
        conf = 88;
      } else if (isConfirmed) {
        verdict = 'supported';
        verdictLabelAr = 'صحيح ومؤكد';
        verdictLabelEn = 'Supported';
        conf = 92;
      } else if (uniqueSources.length === 0) {
        verdict = 'unverified';
        verdictLabelAr = 'غير مؤكد لقلة الأدلة';
        verdictLabelEn = 'Unverified';
        conf = 40;
      }

      aiEvaluation = {
        verdict,
        confidenceScore: conf,
        verdictLabelAr,
        verdictLabelEn,
        summaryAr: isRefuted
          ? 'تشير التغطيات الصحفية وبيانات وكالات الأنباء إلى نفي هذا الادعاء وتفنيده.'
          : isConfirmed
          ? 'تتطابق تفاصيل هذا الادعاء مع البيانات والتغطيات الرسمية الموثقة.'
          : 'المعلومات المتداولة تحتاج إلى مزيد من التدقيق والتحقق من مصادرها الأصلية.',
        summaryEn: isRefuted
          ? 'Public reporting and certified news releases refute this claim as false.'
          : isConfirmed
          ? 'Details in this claim align with official announcements in certified records.'
          : 'Circulating details lack sufficient independent corroboration.',
        subClaims: ['فحص تطابق الأخبار مع المصادر المسترجعة.'],
        modelUsed: 'Deterministic Consensus Engine'
      };
    }

    // Confidence Matrix Calculation
    const evidenceScore = Math.min(100, Math.max(25, uniqueSources.length * 20));
    const modelScore = aiEvaluation.confidenceScore || 75;
    const sourceScore = uniqueSources.some(s => s.isFactChecker) ? 95 : 84;
    const neutralityScore = Math.max(10, 100 - sensationalism.score);

    const overallScore = Math.round(
      evidenceScore * 0.4 +
      modelScore * 0.25 +
      sourceScore * 0.2 +
      neutralityScore * 0.15
    );

    const matrix = {
      overallScore,
      grade: overallScore >= 85 ? 'A+' : overallScore >= 75 ? 'A' : overallScore >= 60 ? 'B' : overallScore >= 40 ? 'C' : 'F',
      factors: [
        {
          nameAr: 'أدلة الويب الحية ومطابقة المصادر الإخبارية',
          nameEn: 'Live Web & News Grounding',
          weight: 40,
          score: evidenceScore,
          contribution: Math.round(evidenceScore * 0.4)
        },
        {
          nameAr: 'تحليل المنطق البرهاني (AI Evidence Reasoning)',
          nameEn: 'AI Evidence Reasoning & Stance Analysis',
          weight: 25,
          score: modelScore,
          contribution: Math.round(modelScore * 0.25)
        },
        {
          nameAr: 'موثوقية وتصنيف النطاقات المستشهد بها',
          nameEn: 'Source Domain Trust & Accreditation',
          weight: 20,
          score: sourceScore,
          contribution: Math.round(sourceScore * 0.2)
        },
        {
          nameAr: 'الحياد اللغوي وخلو الصياغة من التهويل',
          nameEn: 'Linguistic Neutrality',
          weight: 15,
          score: neutralityScore,
          contribution: Math.round(neutralityScore * 0.15)
        }
      ]
    };

    const formattedSources = uniqueSources.map(s => ({
      title: s.title,
      url: s.url,
      domain: s.publisher,
      publisher: s.publisher,
      reliability: s.isFactChecker ? 98 : 85,
      isFactChecker: s.isFactChecker,
      stance: s.stance || (aiEvaluation.verdict === 'false' ? 'contradicts' : 'supports'),
      snippet: s.snippet,
      publishedDate: s.publishedDate
    }));

    const responsePayload = {
      claim,
      verdict: aiEvaluation.verdict,
      verdictLabelAr: aiEvaluation.verdictLabelAr,
      verdictLabelEn: aiEvaluation.verdictLabelEn,
      confidenceScore: overallScore,
      summaryAr: aiEvaluation.summaryAr,
      summaryEn: aiEvaluation.summaryEn,
      sensationalism,
      matrix,
      subClaims: (aiEvaluation.subClaims || []).map((sc: string) => ({
        claim: sc,
        verdict: aiEvaluation.verdict,
        status: 'verified'
      })),
      sources: formattedSources,
      sourcesCount: uniqueSources.length,
      factCheckMatches: uniqueSources.filter(s => s.isFactChecker).length,
      newsArticlesCount: uniqueSources.filter(s => !s.isFactChecker).length,
      modelUsed: aiEvaluation.modelUsed,
      architecture: 'TypeScript + Multi-Source Search + Gemini Evidence Reasoner (Vercel Serverless)',
      verifiedAt: new Date().toISOString()
    };

    // Cache for 12 hours
    memoryCache.set(cacheKey, {
      data: responsePayload,
      expiresAt: Date.now() + 12 * 60 * 60 * 1000
    });

    return sendJson(res, 200, responsePayload);
  } catch (error: any) {
    console.error('Verify serverless error:', error);
    return sendJson(res, 500, {
      error: 'حدث خطأ غير متوقع أثناء فحص الادعاء، يرجى المحاولة مرة أخرى.',
      details: String(error?.message || error)
    });
  }
}
