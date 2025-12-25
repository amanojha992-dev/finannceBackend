const cache = new Map();
const TTL = 2 * 60 * 60 * 1000;

export function getCachedFundamental(symbol) {
  const entry = cache.get(symbol);
  if (!entry) return null;

  const isExpired = Date.now() - entry.time > TTL;
  if (isExpired) {
    cache.delete(symbol);
    return null;
  }

  return entry.data;
}

export function setCachedFundamental(symbol, data) {
  cache.set(symbol, {
    data,
    time: Date.now(),
  });
}

export function clearFundamentalsCache() {
  cache.clear();
}
