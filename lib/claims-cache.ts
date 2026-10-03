/**
 * TruthGuard AI - In-Memory Claims & Evidence Cache
 * Stores recent verification reports to reduce API overhead and latency.
 * Lead Architect: Yunis Al-Afeef <shoeabvv@gmail.com>
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class ClaimsCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;

  constructor(defaultTtlHours = 24) {
    this.defaultTtlMs = defaultTtlHours * 60 * 60 * 1000;
  }

  private normalizeKey(key: string): string {
    return key.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  get<T>(key: string): T | null {
    const normKey = this.normalizeKey(key);
    const entry = this.cache.get(normKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(normKey);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, customTtlMs?: number): void {
    const normKey = this.normalizeKey(key);
    this.cache.set(normKey, {
      data,
      expiresAt: Date.now() + (customTtlMs || this.defaultTtlMs)
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const globalClaimsCache = new ClaimsCache();
