/**
 * Arabic & multilingual text normalization utilities for TruthGuard AI.
 * Cleans diacritics, standardizes letter variants (Hamza, Taa Marbuta, Alef Maqsura),
 * strips sensationalist prefixes, and optimizes search queries.
 */

// Arabic diacritics regex range (\u064B to \u0652 plus shadda \u0651 and dagger alef \u0670)
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u0652\u0656-\u0670]/g;
const ARABIC_TATWEEL_REGEX = /\u0640/g;

/**
 * Removes Arabic harakat/tashkeel and tatweel
 */
export function stripArabicDiacritics(text: string): string {
  return text.replace(ARABIC_DIACRITICS_REGEX, "").replace(ARABIC_TATWEEL_REGEX, "");
}

/**
 * Standardizes Arabic letter variants for robust search matching:
 * - [أإآٱ] -> ا
 * - ة -> ه (in search terms)
 * - ى -> ي
 */
export function normalizeArabicLetters(text: string): string {
  return text
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

/**
 * Strips sensationalist clickbait prefixes often found in shared WhatsApp/social claims
 */
const COMMON_PREFIXES = [
  /^عاجل[:\s-]+/i,
  /^تحذير[:\s-]+/i,
  /^هام جدا[:\s-]+/i,
  /^هل تعلم ان[:\s]+/i,
  /^هل تعلم أن[:\s]+/i,
  /^يقال ان[:\s]+/i,
  /^يقال أن[:\s]+/i,
  /^حقيقة أم كذب[:\s-]+/i,
  /^حقيقة ام كذب[:\s-]+/i,
  /^breaking[:\s-]+/i,
  /^urgent[:\s-]+/i,
  /^warning[:\s-]+/i,
  /^did you know that[:\s]+/i,
];

export function sanitizeClaimInput(text: string): string {
  let cleaned = text.trim();
  // Strip common noisy wrapping quotes or emojis at boundaries
  cleaned = cleaned.replace(/^["'“”«»]+/g, "").replace(/["'“”«»]+$/g, "").trim();

  // Strip sensationalist prefix if text remains sufficiently long
  for (const prefix of COMMON_PREFIXES) {
    if (prefix.test(cleaned)) {
      const stripped = cleaned.replace(prefix, "").trim();
      if (stripped.length >= 8) {
        cleaned = stripped;
      }
      break;
    }
  }

  // Normalize excessive spaces
  return cleaned.replace(/\s+/g, " ");
}

/**
 * Builds optimized search keywords for web queries
 */
export function buildSearchQuery(claim: string): string {
  const withoutDiacritics = stripArabicDiacritics(claim);
  const withoutPunctuation = withoutDiacritics
    .replace(/[“”"'.!?,;:()«»—_\-/]/g, " ")
    .replace(/\b(the|a|an|is|was|were|that|this|and|or|of|to|in|on|for|by)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return withoutPunctuation || claim;
}
