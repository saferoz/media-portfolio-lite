import { reelAssets } from './reel-assets';

export const REEL_CACHE = 'raden-reels-v1';
const MAX_BYTES = 64 * 1024 * 1024;
const MAX_FILES = 3;
const TTL = 7 * 24 * 60 * 60 * 1000;
const INDEX = '/__reel_cache__/index';
type Entry = { path: string; key: string; bytes: number; saved: number; used: number };
type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
export function allowReelPrefetch() {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return !document.hidden && !connection?.saveData && !/(^|-)2g$|^3g$/.test(connection?.effectiveType ?? '');
}
export function reelSource(path: string) {
  const asset = reelAssets[path];
  return asset ? `${path}?v=${asset.revision}` : path;
}

// All transactions are small in count and serialized across viewers/tabs when
// Web Locks is available. No service worker or application-page cache.
let queue: Promise<unknown> = Promise.resolve();
async function transaction<T>(work: (cache: Cache, entries: Entry[]) => Promise<T>): Promise<T | undefined> {
  const run = async () => {
    try {
      const cache = await caches.open(REEL_CACHE);
      const response = await cache.match(INDEX);
      const stored: Entry[] = response ? await response.json() : [];
      const entries: Entry[] = [];
      for (const entry of stored) {
        if (Date.now() - entry.saved >= TTL || reelSource(entry.path) !== entry.key) await cache.delete(entry.key);
        else entries.push(entry);
      }
      // Recover orphaned blobs after a quota failure interrupted index storage.
      const validKeys = new Set(entries.map(entry => new URL(entry.key, location.origin).href));
      for (const request of await cache.keys()) {
        if (new URL(request.url).pathname !== INDEX && !validKeys.has(request.url)) await cache.delete(request);
      }
      const result = await work(cache, entries);
      await cache.put(INDEX, new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } }));
      return result;
    } catch { return undefined; } // Private mode, quota, eviction: ordinary playback survives.
  };
  const task: Promise<T | undefined> = queue.then(async () => {
    try { return navigator.locks ? await navigator.locks.request(REEL_CACHE, run) : await run(); }
    catch { return undefined; }
  });
  queue = task.catch(() => {});
  return task;
}

export async function cachedReel(path: string): Promise<Blob | undefined> {
  return transaction(async (cache, entries) => {
    const entry = entries.find(item => item.key === reelSource(path));
    if (!entry) return undefined;
    const response = await cache.match(entry.key);
    if (!response) { entries.splice(entries.indexOf(entry), 1); return undefined; }
    entry.used = Date.now();
    return response.blob();
  });
}

export async function prepareReel(path: string, signal: AbortSignal): Promise<Blob | undefined> {
  const asset = reelAssets[path];
  if (!asset || !allowReelPrefetch() || signal.aborted) return;
  const existing = await cachedReel(path);
  if (signal.aborted) return;
  if (existing) return existing;
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (estimate?.quota && estimate.quota - (estimate.usage ?? 0) < asset.bytes * 2) return;
    const response = await fetch(reelSource(path), { signal, priority: 'low' });
    if (response.status !== 200) return;
    const blob = await response.blob();
    if (signal.aborted || blob.size !== asset.bytes) return;
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())))
      .map(byte => byte.toString(16).padStart(2, '0')).join('');
    if (signal.aborted || !hash.startsWith(asset.revision)) return;
    await transaction(async (cache, entries) => {
      if (signal.aborted) return;
      const key = reelSource(path);
      const duplicate = entries.findIndex(entry => entry.key === key);
      if (duplicate !== -1) entries.splice(duplicate, 1);
      entries.sort((a, b) => a.used - b.used);
      while (entries.length >= MAX_FILES || entries.reduce((sum, item) => sum + item.bytes, 0) + blob.size > MAX_BYTES) {
        const oldest = entries.shift();
        if (!oldest) break;
        await cache.delete(oldest.key);
      }
      await cache.put(key, new Response(blob, { headers: { 'Content-Type': 'video/mp4' } }));
      entries.push({ path, key, bytes: blob.size, saved: Date.now(), used: Date.now() });
    });
    return signal.aborted ? undefined : blob;
  } catch { return undefined; }
}
