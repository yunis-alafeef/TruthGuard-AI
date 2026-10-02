/**
 * TruthGuard AI - Schema.org ClaimReview Structured Data Generator
 * Generates standards-compliant Google Fact Check JSON-LD metadata.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface FactCheckClaimInput {
  claim: string;
  claimDate?: string;
  claimant?: string;
  claimUrl?: string;
  verdict: 'true' | 'mostly_true' | 'half_true' | 'mostly_false' | 'false' | 'unproven';
  verdictTextAr: string;
  verdictTextEn: string;
  reviewUrl: string;
  summary: string;
  datePublished: string;
  authorName?: string;
}

export interface ClaimReviewSchema {
  '@context': 'https://schema.org';
  '@type': 'ClaimReview';
  url: string;
  datePublished: string;
  claimReviewed: string;
  itemReviewed: {
    '@type': 'Claim';
    name: string;
    datePublished?: string;
    appearance?: {
      '@type': 'CreativeWork';
      url: string;
    }[];
    author?: {
      '@type': 'Organization' | 'Person';
      name: string;
    };
  };
  author: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating: 5;
    worstRating: 1;
    alternateName: string;
  };
}

/**
 * Maps TruthGuard verdicts to Schema.org 1-5 numerical rating
 */
export function getRatingValue(verdict: string): number {
  switch (verdict) {
    case 'true': return 5;
    case 'mostly_true': return 4;
    case 'half_true': return 3;
    case 'unproven': return 3;
    case 'mostly_false': return 2;
    case 'false': return 1;
    default: return 3;
  }
}

/**
 * Builds standard ClaimReview JSON-LD structure
 */
export function generateClaimReviewJsonLd(input: FactCheckClaimInput): ClaimReviewSchema {
  const ratingValue = getRatingValue(input.verdict);

  return {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    url: input.reviewUrl,
    datePublished: input.datePublished || new Date().toISOString().split('T')[0],
    claimReviewed: input.claim,
    itemReviewed: {
      '@type': 'Claim',
      name: input.claim,
      datePublished: input.claimDate,
      author: input.claimant ? {
        '@type': 'Person',
        name: input.claimant
      } : undefined,
      appearance: input.claimUrl ? [
        {
          '@type': 'CreativeWork',
          url: input.claimUrl
        }
      ] : undefined
    },
    author: {
      '@type': 'Organization',
      name: input.authorName || 'TruthGuard AI Fact Checking Initiative',
      url: 'https://truthguard.ai'
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue,
      bestRating: 5,
      worstRating: 1,
      alternateName: input.verdictTextEn || input.verdict
    }
  };
}

/**
 * Converts schema to embeddable HTML <script type="application/ld+json"> tag
 */
export function renderClaimReviewScriptTag(input: FactCheckClaimInput): string {
  const schema = generateClaimReviewJsonLd(input);
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}
