/**
 * In-memory Least Recently Used (LRU) Cache with Time-to-Live (TTL) support.
 * Reduces redundant web crawling and ML calls for repeated claim verifications.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LruTtlCache<T> {
  private readonly capacity: number;
  private readonly defaultTtlMs: number;
  private readonly store: Map<string, CacheEntry<T>>;

  constructor(capacity = 100, defaultTtlMinutes = 10) {
    this.capacity = capacity;
    this.defaultTtlMs = defaultTtlMinutes * 60 * 1000;
    this.store = new Map<string, CacheEntry<T>>();
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    // Refresh LRU position by re-inserting
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, customTtlMs?: number): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.capacity) {
      // Evict oldest entry (first key in map iterator)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }

    const ttl = customTtlMs ?? this.defaultTtlMs;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

export const claimCache = new LruTtlCache<unknown>(100, 15);
