/**
 * TruthGuard AI - Multi-Source Search & Evidence Aggregator
 * Gathers live evidence from Google Fact Check Tools, News APIs (Tavily/Serper), and RSS Wires.
 * Lead Architect: Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface EvidenceSource {
  title: string;
  url: string;
  snippet: string;
  publisher: string;
  publishedDate?: string;
  isFactChecker: boolean;
  factCheckRating?: string;
  stance?: 'supports' | 'contradicts' | 'context';
}

export interface AggregatedSearchEvidence {
  query: string;
  totalFound: number;
  sources: EvidenceSource[];
  factCheckMatches: number;
  newsArticlesCount: number;
  engineUsed: string;
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

/**
 * Clean and build focused search queries from claim text
 */
export function buildOptimizedSearchQuery(claimText: string): string {
  return claimText
    .replace(/[«»""''؟?!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

/**
 * 1. Google Fact Check Tools API
 * Queries international IFCN-certified databases (Misbar, Fatabyyano, Reuters, Snopes).
 */
export async function queryGoogleFactCheckTools(claim: string, apiKey?: string): Promise<EvidenceSource[]> {
  const key = apiKey || process.env.GOOGLE_FACTCHECK_API_KEY || process.env.VITE_GOOGLE_FACTCHECK_API_KEY;
  if (!key) return [];

  try {
    const endpoint = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(claim)}&key=${key}&languageCode=ar`;
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.claims || !Array.isArray(data.claims)) return [];

    const evidence: EvidenceSource[] = [];
    for (const item of data.claims) {
      if (item.claimReview && Array.isArray(item.claimReview)) {
        for (const review of item.claimReview) {
          evidence.push({
            title: review.title || item.text || 'Fact Check Review',
            url: review.url,
            snippet: `مراجعة التحقق: ${review.textualRating || ''} - الناشر: ${review.publisher?.name || ''}`,
            publisher: review.publisher?.name || 'Fact Check Agency',
            publishedDate: review.reviewDate,
            isFactChecker: true,
            factCheckRating: review.textualRating,
            stance: /false|fake|كاذب|زائف|غير صحيح/i.test(review.textualRating || '') ? 'contradicts' : 'supports'
          });
        }
      }
    }
    return evidence;
  } catch {
    return [];
  }
}

/**
 * 2. Tavily or Serper News Search API
 */
export async function queryNewsSearchApi(query: string, apiKey?: string): Promise<EvidenceSource[]> {
  const tavilyKey = apiKey || process.env.TAVILY_API_KEY || process.env.VITE_TAVILY_API_KEY;

  if (tavilyKey) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          search_depth: 'advanced',
          include_domains: [],
          max_results: 6,
          topic: 'news'
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((r: { title: string; url: string; content: string; published_date?: string }) => {
            const domain = new URL(r.url).hostname.replace(/^www\./, '');
            const isFactChecker = KNOWN_FACTCHECKERS.some(fc => r.url.toLowerCase().includes(fc));
            return {
              title: r.title,
              url: r.url,
              snippet: r.content?.slice(0, 300) || '',
              publisher: domain,
              publishedDate: r.published_date,
              isFactChecker
            };
          });
        }
      }
    } catch {
      // Fallback to next provider
    }
  }

  return [];
}

/**
 * 3. Live Verified Wire Feeds & Fallback Web Search
 */
export async function queryLiveWireFallback(query: string): Promise<EvidenceSource[]> {
  const sources: EvidenceSource[] = [];

  try {
    const bingRss = `https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`;
    const res = await fetch(bingRss, {
      headers: { 'User-Agent': 'Mozilla/5.0 TruthGuardAI/3.0 FactCheckEngine' },
      signal: AbortSignal.timeout(4000)
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
    // Network isolated or timeout
  }

  return sources;
}

/**
 * Main Aggregator: Queries all providers in parallel and deduplicates
 */
export async function aggregateEvidence(claimText: string): Promise<AggregatedSearchEvidence> {
  const query = buildOptimizedSearchQuery(claimText);

  // Parallel retrieval
  const [factCheckResults, newsResults] = await Promise.all([
    queryGoogleFactCheckTools(query),
    queryNewsSearchApi(query)
  ]);

  let combined = [...factCheckResults, ...newsResults];

  // If insufficient evidence, query fallback wires
  if (combined.length < 2) {
    const fallbackResults = await queryLiveWireFallback(query);
    combined = [...combined, ...fallbackResults];
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const uniqueSources: EvidenceSource[] = [];
  for (const s of combined) {
    if (!seen.has(s.url)) {
      seen.add(s.url);
      uniqueSources.push(s);
    }
  }

  const factCheckMatches = uniqueSources.filter(s => s.isFactChecker).length;

  return {
    query,
    totalFound: uniqueSources.length,
    sources: uniqueSources.slice(0, 10),
    factCheckMatches,
    newsArticlesCount: uniqueSources.length - factCheckMatches,
    engineUsed: factCheckResults.length > 0 ? 'Google FactCheck + Live News' : 'Live Multi-Wire Search'
  };
}
