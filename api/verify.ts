/**
 * TruthGuard AI - Vercel Serverless Function: POST /api/verify
 * Handles claim sanitization, multi-source evidence retrieval, and AI evidence synthesis.
 * Lead Architect: Yunis Al-Afeef <shoeabvv@gmail.com>
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { aggregateEvidence } from '../lib/search-aggregator';
import { reasonOverEvidence } from '../lib/evidence-reasoner';
import { globalClaimsCache } from '../lib/claims-cache';

interface RequestBody {
  text?: string;
  claim?: string;
  language?: 'ar' | 'en';
}

function parseJsonBody(req: IncomingMessage): Promise<RequestBody> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: IncomingMessage & { body?: RequestBody; method?: string }, res: ServerResponse & { status?: (c: number) => ServerResponse; json?: (d: unknown) => void }) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  try {
    const body = req.body || await parseJsonBody(req);
    const rawClaim = (body.text || body.claim || '').trim();

    if (!rawClaim || rawClaim.length < 5) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'يرجى إدخال ادعاء أو خبر للتحقق منه (5 أحرف على الأقل).' }));
      return;
    }

    // Check Cache
    const cacheKey = `claim:${rawClaim.slice(0, 150)}`;
    const cached = globalClaimsCache.get(cacheKey);
    if (cached) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Cache-Status', 'HIT');
      res.end(JSON.stringify(cached));
      return;
    }

    // 1. Multi-source evidence gathering (Google Fact Check + News Wires)
    const searchResult = await aggregateEvidence(rawClaim);

    // 2. AI Reasoning over evidence
    const synthesis = await reasonOverEvidence(rawClaim, searchResult.sources);

    const responsePayload = {
      id: `tg-${Date.now()}`,
      originalClaim: rawClaim,
      verdict: synthesis.verdict,
      verdictAr: synthesis.verdictAr,
      confidenceScore: synthesis.confidenceScore,
      summaryAr: synthesis.summaryAr,
      summaryEn: synthesis.summaryEn,
      sourcesCount: searchResult.totalFound,
      factCheckMatches: searchResult.factCheckMatches,
      newsArticlesCount: searchResult.newsArticlesCount,
      sources: searchResult.sources.map(s => ({
        title: s.title,
        url: s.url,
        publisher: s.publisher,
        publishedDate: s.publishedDate,
        isFactChecker: s.isFactChecker,
        stance: s.stance || (synthesis.verdict === 'False' ? 'contradicts' : 'supports'),
        snippet: s.snippet
      })),
      keyFindings: synthesis.keyDiscrepanciesAr,
      modelUsed: synthesis.modelUsed,
      verifiedAt: new Date().toISOString(),
      architecture: 'TypeScript + Live Search + Gemini RAG (Serverless)'
    };

    // Cache result
    globalClaimsCache.set(cacheKey, responsePayload);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache-Status', 'MISS');
    res.end(JSON.stringify(responsePayload));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'حدث خطأ أثناء فحص الأدلة، يرجى المحاولة مرة أخرى.',
      details: String(error)
    }));
  }
}
