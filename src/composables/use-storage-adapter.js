import { load } from '@tauri-apps/plugin-store';

// Detect Tauri runtime without importing @tauri-apps/api/core at module top-level,
// so web fallback (no Tauri) still works without a bundler error.
const isTauri = () =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

let storePromise = null;
const getStore = () => {
  if (!storePromise) {
    // autoSave debounce 100ms — batches burst writes (drag/drop) into single fsync.
    storePromise = load('todoapp.json', { autoSave: 100 });
  }
  return storePromise;
};

// One-time legacy migration: if Tauri store is empty but localStorage has data,
// copy it across so users do not lose todos after first launch on desktop.
const migrateLegacy = async (store, key) => {
  if (!isTauri()) return;
  if (typeof localStorage === 'undefined') return;
  const existing = await store.get(key);
  if (existing !== null && existing !== undefined) return;
  const legacy = localStorage.getItem(key);
  if (legacy === null) return;
  try {
    await store.set(key, JSON.parse(legacy));
    localStorage.removeItem(key);
  } catch (err) {
    // Keep legacy on parse failure — better to have duplicate than lose data.
    console.warn(`[storage] legacy migration skipped for ${key}:`, err);
  }
};

export const storage = {
  async get(key) {
    if (isTauri()) {
      const s = await getStore();
      return s.get(key);
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  async set(key, value) {
    if (isTauri()) {
      const s = await getStore();
      await s.set(key, value);
      // Force flush — autoSave debounce (100ms) would otherwise lose writes
      // if the user closes the app immediately after a mutation.
      await s.save();
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  },
  // Call once on app boot to migrate any pre-Tauri localStorage data.
  async migrateLegacyAll(keys) {
    if (!isTauri()) return;
    const s = await getStore();
    for (const k of keys) {
      await migrateLegacy(s, k);
    }
  },
};

export const isTauriRuntime = isTauri;
