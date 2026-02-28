/**
 * Private memo storage for the "Pay with memo" flow.
 * Store and retrieve sent memos (e.g. in localStorage or custom storage).
 */

export interface SentMemoEntry {
  txHash: string;
  to: string;
  amount: string;
  memo: string;
  at: number;
}

export const DEFAULT_STORAGE_KEY = 'pol-stealth-sent-memos';

export interface MemoStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getDefaultAdapter(): MemoStorageAdapter {
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as unknown as { localStorage?: MemoStorageAdapter };
    if (g.localStorage && typeof g.localStorage.getItem === 'function' && typeof g.localStorage.setItem === 'function') {
      return g.localStorage;
    }
  }
  return { getItem: () => null, setItem: () => {} };
}
const defaultAdapter = getDefaultAdapter();

/**
 * Save a sent memo (call after a successful transfer).
 */
export function saveSentMemo(
  entry: Omit<SentMemoEntry, 'at'>,
  storageKey: string = DEFAULT_STORAGE_KEY,
  storage: MemoStorageAdapter = defaultAdapter
): void {
  try {
    const stored = storage.getItem(storageKey);
    const list: SentMemoEntry[] = stored ? JSON.parse(stored) : [];
    list.push({ ...entry, at: Date.now() });
    storage.setItem(storageKey, JSON.stringify(list));
  } catch (_) {
    // ignore
  }
}

/**
 * Get all sent memos (oldest first, or pass limit for newest N).
 */
export function getSentMemos(
  storageKey: string = DEFAULT_STORAGE_KEY,
  storage: MemoStorageAdapter = defaultAdapter,
  limit?: number
): SentMemoEntry[] {
  try {
    const stored = storage.getItem(storageKey);
    const list: SentMemoEntry[] = stored ? JSON.parse(stored) : [];
    const sorted = [...list].sort((a, b) => a.at - b.at);
    return limit != null ? sorted.slice(-limit) : sorted;
  } catch (_) {
    return [];
  }
}

/**
 * Get memo for a specific tx hash.
 */
export function getSentMemoByTxHash(
  txHash: string,
  storageKey: string = DEFAULT_STORAGE_KEY,
  storage: MemoStorageAdapter = defaultAdapter
): SentMemoEntry | null {
  const list = getSentMemos(storageKey, storage);
  return list.find((e) => e.txHash === txHash) ?? null;
}

/**
 * Clear all stored sent memos (optional, for testing or reset).
 */
export function clearSentMemos(
  storageKey: string = DEFAULT_STORAGE_KEY,
  storage: MemoStorageAdapter = defaultAdapter
): void {
  try {
    storage.setItem(storageKey, JSON.stringify([]));
  } catch (_) {}
}
