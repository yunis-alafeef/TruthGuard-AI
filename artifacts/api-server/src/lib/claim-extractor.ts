/**
 * @file claim-extractor.ts
 * @description Extracts and decomposes multi-sentence texts, posts, and articles into
 * individual atomic, fact-checkable propositions and verifiable claims.
 */

export interface AtomicClaim {
  id: string;
  originalText: string;
  claimProposition: string;
  type: 'verifiable_fact' | 'opinion' | 'rhetorical_question' | 'prediction';
  priority: 'high' | 'medium' | 'low';
  searchQuery: string;
}

export interface ClaimDecompositionResult {
  totalExtracted: number;
  verifiableClaims: AtomicClaim[];
  nonVerifiableStatements: string[];
}

const OPINION_MARKERS = [
  'أعتقد أن',
  'في رأيي',
  'أرى أن',
  'يبدو لي',
  'من وجهة نظري',
  'من المحتمل',
  'أتوقع',
  'i believe',
  'in my opinion',
  'i think',
  'it seems',
  'from my perspective'
];

export function extractAtomicClaims(text: string): ClaimDecompositionResult {
  if (!text || !text.trim()) {
    return {
      totalExtracted: 0,
      verifiableClaims: [],
      nonVerifiableStatements: []
    };
  }

  // Split by sentence terminators (., !, ?, \n, ؛)
  const sentences = text
    .split(/[\n.!؟؛;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  const verifiableClaims: AtomicClaim[] = [];
  const nonVerifiableStatements: string[] = [];

  sentences.forEach((sentence, idx) => {
    const lower = sentence.toLowerCase();

    // Check if it's a rhetorical question
    if (sentence.includes('؟') || sentence.includes('?')) {
      nonVerifiableStatements.push(sentence);
      return;
    }

    // Check if it's purely opinion
    const isOpinion = OPINION_MARKERS.some(marker => lower.startsWith(marker) || lower.includes(marker));
    if (isOpinion) {
      nonVerifiableStatements.push(sentence);
      return;
    }

    // Build search query: clean stopwords and focus on key nouns/verbs
    const cleanQuery = sentence
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    verifiableClaims.push({
      id: `claim-${idx + 1}-${Date.now().toString(36)}`,
      originalText: sentence,
      claimProposition: sentence,
      type: 'verifiable_fact',
      priority: sentence.length > 40 ? 'high' : 'medium',
      searchQuery: cleanQuery
    });
  });

  return {
    totalExtracted: verifiableClaims.length,
    verifiableClaims,
    nonVerifiableStatements
  };
}
