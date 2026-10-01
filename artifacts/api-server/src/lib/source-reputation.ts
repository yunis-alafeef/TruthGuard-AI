/**
 * @file source-reputation.ts
 * @description Curated knowledge base of domain credibility ratings, fact-checking initiatives,
 * satirical websites, and bias classification for source evaluation.
 */

export interface SourceReputation {
  domain: string;
  name: string;
  credibilityScore: number; // 0 to 100
  category: 'fact_checker' | 'tier1_journalism' | 'government_official' | 'satire' | 'unreliable_conspiracy' | 'general';
  biasLean: 'center' | 'left_center' | 'right_center' | 'left' | 'right' | 'state_affiliated';
  country: string;
  verifiedFactChecker: boolean;
  notes: string;
}

export const REPUTATION_REGISTRY: Record<string, SourceReputation> = {
  // Fact Checkers
  'reuters.com': {
    domain: 'reuters.com',
    name: 'Reuters Fact Check',
    credibilityScore: 98,
    category: 'tier1_journalism',
    biasLean: 'center',
    country: 'International',
    verifiedFactChecker: true,
    notes: 'Global independent news agency with rigorous editorial standards.'
  },
  'apnews.com': {
    domain: 'apnews.com',
    name: 'Associated Press Fact Check',
    credibilityScore: 98,
    category: 'tier1_journalism',
    biasLean: 'center',
    country: 'International',
    verifiedFactChecker: true,
    notes: 'Member of IFCN (International Fact-Checking Network).'
  },
  'snopes.com': {
    domain: 'snopes.com',
    name: 'Snopes',
    credibilityScore: 94,
    category: 'fact_checker',
    biasLean: 'center',
    country: 'USA',
    verifiedFactChecker: true,
    notes: 'Pioneer digital fact-checking organization.'
  },
  'misbar.com': {
    domain: 'misbar.com',
    name: 'مسبار (Misbar Arabic Fact Check)',
    credibilityScore: 95,
    category: 'fact_checker',
    biasLean: 'center',
    country: 'Pan-Arab',
    verifiedFactChecker: true,
    notes: 'منصة رائدة عربية للتحقق من الأخبار وتفنيد الشائعات.'
  },
  'fatabyyano.net': {
    domain: 'fatabyyano.net',
    name: 'فتبينوا (Fatabyyano)',
    credibilityScore: 96,
    category: 'fact_checker',
    biasLean: 'center',
    country: 'Pan-Arab',
    verifiedFactChecker: true,
    notes: 'مشروع عربي مستقل ومعتمد من الشبكة الدولية للتحقق من المعلومات IFCN.'
  },
  'who.int': {
    domain: 'who.int',
    name: 'World Health Organization (WHO)',
    credibilityScore: 99,
    category: 'government_official',
    biasLean: 'center',
    country: 'International',
    verifiedFactChecker: false,
    notes: 'Official public health scientific authority.'
  },
  // Satirical Sources
  'theonion.com': {
    domain: 'theonion.com',
    name: 'The Onion',
    credibilityScore: 10,
    category: 'satire',
    biasLean: 'center',
    country: 'USA',
    verifiedFactChecker: false,
    notes: 'Known satirical fiction publication, not factual news.'
  },
  'babylonbee.com': {
    domain: 'babylonbee.com',
    name: 'The Babylon Bee',
    credibilityScore: 10,
    category: 'satire',
    biasLean: 'right',
    country: 'USA',
    verifiedFactChecker: false,
    notes: 'Satirical humor website.'
  },
  'alhudood.net': {
    domain: 'alhudood.net',
    name: 'الحدود (Alhudood Satire)',
    credibilityScore: 10,
    category: 'satire',
    biasLean: 'center',
    country: 'Pan-Arab',
    verifiedFactChecker: false,
    notes: 'موقع عربي ساخر يطرح أخباراً هزلية غير واقعية.'
  }
};

/**
 * Extracts normalized hostname from a URL string or domain.
 */
export function extractDomain(urlOrDomain: string): string {
  try {
    const raw = urlOrDomain.trim();
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      return raw.replace(/^(www\.)/, '').split('/')[0].toLowerCase();
    }
    const url = new URL(raw);
    return url.hostname.replace(/^(www\.)/, '').toLowerCase();
  } catch {
    return urlOrDomain.toLowerCase().trim();
  }
}

/**
 * Evaluates the reputation of a source domain.
 */
export function lookupSourceReputation(urlOrDomain: string): SourceReputation {
  const domain = extractDomain(urlOrDomain);

  if (REPUTATION_REGISTRY[domain]) {
    return REPUTATION_REGISTRY[domain];
  }

  // Check subdomains
  for (const [key, rep] of Object.entries(REPUTATION_REGISTRY)) {
    if (domain.endsWith('.' + key)) {
      return rep;
    }
  }

  // Default unknown domain
  return {
    domain,
    name: domain,
    credibilityScore: 50,
    category: 'general',
    biasLean: 'center',
    country: 'Unknown',
    verifiedFactChecker: false,
    notes: 'Unindexed source domain. Fact-checking heuristics applied by default.'
  };
}
