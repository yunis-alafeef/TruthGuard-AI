/**
 * TruthGuard AI - Semantic Claim Clustering & Deduplication Engine
 * Identifies duplicate, paraphrased, and viral variants of rumors across social media.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface ClusteredClaim {
  id: string;
  text: string;
  source?: string;
  timestamp?: string;
  similarityScore?: number;
}

export interface ClaimCluster {
  clusterId: string;
  canonicalClaim: string;
  size: number;
  averageSimilarity: number;
  variants: ClusteredClaim[];
  keywords: string[];
  theme: string;
}

export interface ClusterOptions {
  threshold?: number; // 0.0 to 1.0 (default 0.45)
  ngramSize?: number;  // default 2
  stopWordsAr?: string[];
  stopWordsEn?: string[];
}

const DEFAULT_STOPWORDS = new Set([
  'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'الذين',
  'ان', 'أن', 'إن', 'كان', 'كانت', 'قد', 'لم', 'لن', 'ما', 'هو', 'هي', 'هم', 'كل', 'بعد',
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'by', 'with', 'that', 'this'
]);

/**
 * Normalizes Arabic and English text for comparison
 */
export function normalizeForClustering(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, '') // remove Arabic diacritics
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts n-grams from normalized text
 */
export function extractNgrams(text: string, n = 2): Set<string> {
  const words = normalizeForClustering(text)
    .split(' ')
    .filter(w => w.length > 1 && !DEFAULT_STOPWORDS.has(w));
  
  const ngrams = new Set<string>();
  if (words.length < n) {
    words.forEach(w => ngrams.add(w));
    return ngrams;
  }

  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Calculates Jaccard similarity between two texts based on n-grams
 */
export function calculateJaccardSimilarity(textA: string, textB: string, n = 2): number {
  const setA = extractNgrams(textA, n);
  const setB = extractNgrams(textB, n);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionSize = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionSize++;
  }

  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize > 0 ? Number((intersectionSize / unionSize).toFixed(3)) : 0;
}

/**
 * Clusters a list of claims into grouped rumor threads
 */
export function clusterClaims(claims: (string | ClusteredClaim)[], options: ClusterOptions = {}): ClaimCluster[] {
  const threshold = options.threshold ?? 0.40;
  const ngramSize = options.ngramSize ?? 2;

  const normalizedClaims: ClusteredClaim[] = claims.map((item, index) => {
    if (typeof item === 'string') {
      return { id: `claim-${index + 1}`, text: item };
    }
    return item;
  });

  const clusters: ClaimCluster[] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < normalizedClaims.length; i++) {
    const current = normalizedClaims[i];
    if (assigned.has(current.id)) continue;

    const clusterMembers: ClusteredClaim[] = [{ ...current, similarityScore: 1.0 }];
    assigned.add(current.id);

    let totalSimilarity = 1.0;

    for (let j = i + 1; j < normalizedClaims.length; j++) {
      const candidate = normalizedClaims[j];
      if (assigned.has(candidate.id)) continue;

      const sim = calculateJaccardSimilarity(current.text, candidate.text, ngramSize);
      if (sim >= threshold) {
        clusterMembers.push({ ...candidate, similarityScore: sim });
        assigned.add(candidate.id);
        totalSimilarity += sim;
      }
    }

    // Extract top representative keywords
    const allWords = clusterMembers
      .flatMap(m => normalizeForClustering(m.text).split(' '))
      .filter(w => w.length > 2 && !DEFAULT_STOPWORDS.has(w));

    const wordCounts = new Map<string, number>();
    allWords.forEach(w => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
    const sortedKeywords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => entry[0]);

    clusters.push({
      clusterId: `cluster-${clusters.length + 1}`,
      canonicalClaim: current.text,
      size: clusterMembers.length,
      averageSimilarity: Number((totalSimilarity / clusterMembers.length).toFixed(3)),
      variants: clusterMembers,
      keywords: sortedKeywords,
      theme: sortedKeywords[0] || 'عام'
    });
  }

  return clusters.sort((a, b) => b.size - a.size);
}
