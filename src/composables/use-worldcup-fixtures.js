import { ref, computed } from "vue";
import { storage } from "./use-storage-adapter.js";
import { createRapidApiFootballClient } from "../api/rapidapi-football-client.js";
import { fetchWorldCupFixtures } from "../api/worldcup-fixtures-endpoint.js";

const CACHE_KEY = "worldcup.fixtures";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — respects 100 req/day free tier
const API_KEY_STORAGE = "worldcup.apiKey";

// Module-level singletons — same pattern as useAuth/useCategories so all
// callers see the same fixtures, loading flag, and lastFetchedAt.
const fixtures = ref([]);
const loading = ref(false);
const error = ref(null);
const lastFetchedAt = ref(null);
let inflight = null;

const isStale = () =>
  !lastFetchedAt.value || Date.now() - lastFetchedAt.value > CACHE_TTL_MS;

const readCache = async () => {
  try {
    const cached = await storage.get(CACHE_KEY);
    if (cached && Array.isArray(cached.fixtures)) {
      fixtures.value = cached.fixtures;
      lastFetchedAt.value = cached.fetchedAt || null;
    }
  } catch (err) {
    console.warn("[worldcup] cache read failed:", err);
  }
};

const writeCache = async () => {
  try {
    await storage.set(CACHE_KEY, {
      fixtures: fixtures.value,
      fetchedAt: lastFetchedAt.value,
    });
  } catch (err) {
    console.warn("[worldcup] cache write failed:", err);
  }
};

const fetchFresh = async ({ force = false } = {}) => {
  // Single-flight: if a fetch is already running, return the same promise.
  if (inflight) return inflight;

  const apiKey = await storage.get(API_KEY_STORAGE);
  if (!apiKey) {
    error.value = "Falta configurar la API key en Ajustes";
    return;
  }
  if (!force && !isStale() && fixtures.value.length > 0) return;

  loading.value = true;
  error.value = null;
  inflight = (async () => {
    try {
      const client = createRapidApiFootballClient({ apiKey });
      const body = await fetchWorldCupFixtures(client);
      fixtures.value = Array.isArray(body?.response) ? body.response : [];
      lastFetchedAt.value = Date.now();
      await writeCache();
    } catch (err) {
      error.value = err?.message || "Error desconocido";
    } finally {
      loading.value = false;
      inflight = null;
    }
  })();
  return inflight;
};

const groupedByMatchday = computed(() => {
  const map = new Map();
  for (const fx of fixtures.value) {
    const round = fx?.league?.round || "Sin jornada";
    if (!map.has(round)) map.set(round, []);
    map.get(round).push(fx);
  }
  return Array.from(map, ([round, list]) => ({ round, list }));
});

export function useWorldCupFixtures() {
  return {
    fixtures: computed(() => fixtures.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    lastFetchedAt: computed(() => lastFetchedAt.value),
    groupedByMatchday,
    refresh: (force = true) => fetchFresh({ force }),
    loadFromCache: readCache,
  };
}
