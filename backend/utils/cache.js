const DEFAULT_TTL_MS = 60_000; // 60 seconds

class InMemoryCache {
  #store = new Map(); // key → { value, expiresAt }

  set(key, value, ttlMs = DEFAULT_TTL_MS) {
    this.#store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get(key) {
    const entry = this.#store.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.#store.delete(key);
      return null;
    }

    return entry.value;
  }

  del(key) {
    this.#store.delete(key);
  }

  delByPrefix(prefix) {
    for (const key of this.#store.keys()) {
      if (key.startsWith(prefix)) {
        this.#store.delete(key);
      }
    }
  }

  flush() {
    this.#store.clear();
  }

  get size() {
    return this.#store.size;
  }
}

export default new InMemoryCache();
