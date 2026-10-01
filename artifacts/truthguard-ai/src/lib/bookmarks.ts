/**
 * @file bookmarks.ts
 * @description Local bookmarking and custom tag management for saved investigations.
 */

export interface BookmarkedClaim {
  id: string;
  claim: string;
  verdict: string;
  confidenceScore: number;
  tags: string[];
  notes?: string;
  savedAt: string;
}

const STORAGE_KEY = 'truthguard_bookmarked_investigations';

export function getBookmarks(): BookmarkedClaim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(item: Omit<BookmarkedClaim, 'savedAt'>): BookmarkedClaim[] {
  const current = getBookmarks();
  const existingIdx = current.findIndex(b => b.id === item.id);
  const newItem: BookmarkedClaim = {
    ...item,
    savedAt: new Date().toISOString()
  };

  let updated: BookmarkedClaim[];
  if (existingIdx >= 0) {
    updated = current.map((b, i) => (i === existingIdx ? newItem : b));
  } else {
    updated = [newItem, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save bookmark', err);
  }
  return updated;
}

export function removeBookmark(id: string): BookmarkedClaim[] {
  const current = getBookmarks();
  const updated = current.filter(b => b.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove bookmark', err);
  }
  return updated;
}

export function getAllTags(): string[] {
  const bookmarks = getBookmarks();
  const tagSet = new Set<string>();
  bookmarks.forEach(b => {
    b.tags?.forEach(t => tagSet.add(t));
  });
  return Array.from(tagSet);
}
