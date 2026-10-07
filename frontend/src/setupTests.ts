import '@testing-library/jest-dom';

// Node 26+ no longer exposes localStorage by default in the jsdom environment.
// Polyfill it so AuthContext / http.ts can read/write the JWT token in tests.
const storage = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => { storage.set(k, v); },
      removeItem: (k: string) => { storage.delete(k); },
      clear: () => { storage.clear(); },
      key: (i: number) => Array.from(storage.keys())[i] ?? null,
      get length() { return storage.size; },
    },
    writable: true,
    configurable: true,
  });
}
