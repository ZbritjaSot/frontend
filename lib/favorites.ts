export const FAVORITES_STORAGE_KEY = "zbritjasot-favorites";

export type FavoriteKind = "offer" | "flyer";

export type FavoriteRef = {
  kind: FavoriteKind;
  id: string;
};

export type FavoriteKey = `${FavoriteKind}:${string}`;

const EMPTY_KEYS: FavoriteKey[] = [];

let cachedKeys: FavoriteKey[] = EMPTY_KEYS;
let cachedSerialized = "[]";

export function favoriteKey(kind: FavoriteKind, id: string): FavoriteKey {
  return `${kind}:${id}`;
}

export function parseFavoriteKey(value: string): FavoriteRef | null {
  const match = /^(offer|flyer):(.+)$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const id = match[2];
  if (!id) {
    return null;
  }
  return { kind: match[1] as FavoriteKind, id };
}

function normalizeList(raw: unknown): FavoriteKey[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set<string>();
  const keys: FavoriteKey[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string") {
      continue;
    }
    const parsed = parseFavoriteKey(entry);
    if (!parsed) {
      continue;
    }
    const key = favoriteKey(parsed.kind, parsed.id);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    keys.push(key);
  }
  return keys;
}

function remember(keys: FavoriteKey[]): FavoriteKey[] {
  const serialized = JSON.stringify(keys);
  if (serialized === cachedSerialized) {
    return cachedKeys;
  }
  cachedSerialized = serialized;
  cachedKeys = keys.length === 0 ? EMPTY_KEYS : keys;
  return cachedKeys;
}

function loadFromStorage(): FavoriteKey[] {
  if (typeof window === "undefined") {
    return EMPTY_KEYS;
  }
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      return remember([]);
    }
    return remember(normalizeList(JSON.parse(raw) as unknown));
  } catch {
    return remember([]);
  }
}

/**
 * Snapshot for useSyncExternalStore — must return a stable reference when
 * the contents have not changed, or React will loop.
 */
export function readFavoriteKeys(): FavoriteKey[] {
  if (typeof window === "undefined") {
    return EMPTY_KEYS;
  }
  return loadFromStorage();
}

export function readFavoriteRefs(): FavoriteRef[] {
  return readFavoriteKeys()
    .map(parseFavoriteKey)
    .filter((item): item is FavoriteRef => item != null);
}

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeFavorites(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function onStorage(event: StorageEvent): void {
  if (event.key !== FAVORITES_STORAGE_KEY && event.key !== null) {
    return;
  }
  cachedSerialized = "";
  loadFromStorage();
  notify();
}

export function writeFavoriteKeys(keys: FavoriteKey[]): void {
  if (typeof window === "undefined") {
    return;
  }
  const next = remember(normalizeList(keys));
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore private-mode / blocked storage.
  }
  notify();
}

export function isFavoriteStored(kind: FavoriteKind, id: string): boolean {
  return readFavoriteKeys().includes(favoriteKey(kind, id));
}

export function toggleFavoriteStored(kind: FavoriteKind, id: string): boolean {
  const key = favoriteKey(kind, id);
  const current = readFavoriteKeys();
  const next = current.includes(key)
    ? current.filter((item) => item !== key)
    : [...current, key];
  writeFavoriteKeys(next);
  return next.includes(key);
}

export function removeFavoriteStored(kind: FavoriteKind, id: string): void {
  const key = favoriteKey(kind, id);
  const current = readFavoriteKeys();
  if (!current.includes(key)) {
    return;
  }
  writeFavoriteKeys(current.filter((item) => item !== key));
}

/** Server snapshot — stable empty array for SSR. */
export function serverFavoriteKeys(): FavoriteKey[] {
  return EMPTY_KEYS;
}
