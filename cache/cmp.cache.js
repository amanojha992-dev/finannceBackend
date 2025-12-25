const cache = new Map();
const TTL = 2 * 60 * 1000; 

export function getCachedCMP(symbol) {
  const entry = cache.get(symbol);
  if (!entry) return null;

  const isExpired = Date.now() - entry.time > TTL;
  if (isExpired) {
    cache.delete(symbol); 
    return null;
  }

  return entry.price;
}

export function setCachedCMP(symbol, price) {
  cache.set(symbol, {
    price,
    time: Date.now(),
  });
}


export function clearCMPCache() {
  cache.clear();
}
