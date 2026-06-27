import { ref, computed } from "vue";
import { storage } from "./use-storage-adapter.js";
import {
  createApiFootballClient,
  formatApiError,
} from "../api/api-football-client.js";
import { fetchWorldCupFixtures } from "../api/worldcup-fixtures-endpoint.js";
import bundledFixtures from "../data/worldcup-2026-fixtures.json";

const CACHE_KEY = "worldcup.fixtures";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — respects 100 req/day free tier
const API_KEY_STORAGE = "worldcup.apiKey";

// Build-time fallback scraped from Wikipedia (see scripts/build-worldcup-fixtures.mjs).
// Used when api-football.com rejects the request (free plan only covers
// 2022-2024). Static so the app always has something to render when the
// API path is blocked AND we have nothing in the per-user cache yet.
const BUNDLED = Array.isArray(bundledFixtures) ? bundledFixtures : [];

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

// Fill fixtures from the bundled JSON. Used only when the API path
// failed AND the per-user cache is also empty — never overwrites a
// fresher cached dataset.
const loadBundledFallback = () => {
  if (BUNDLED.length === 0) return;
  fixtures.value = BUNDLED;
  lastFetchedAt.value = Date.now();
  console.info(`[worldcup] cargados ${BUNDLED.length} fixtures del fallback bundleado`);
};

// clientFactory is injectable so unit tests can swap the network layer
// without module-level mocks. Production callers omit it; the default
// is the real API-Football client.
const fetchFresh = async ({ force = false, clientFactory = createApiFootballClient } = {}) => {
  // Single-flight: if a fetch is already running, return the same promise.
  if (inflight) return inflight;

  const apiKey = await storage.get(API_KEY_STORAGE);
  // Without an API key the live fetch is impossible. The bundled JSON
  // is good enough to render the calendar — don't punish the user for
  // skipping the optional key configuration. Clear any prior error so
  // the view doesn't keep showing "Falta configurar la API key".
  if (!apiKey) {
    error.value = null;
    if (fixtures.value.length === 0 && BUNDLED.length > 0) {
      loadBundledFallback();
    }
    return;
  }
  if (!force && !isStale() && fixtures.value.length > 0) return;

  loading.value = true;
  error.value = null;
  inflight = (async () => {
    try {
      const client = clientFactory({ apiKey });
      const body = await fetchWorldCupFixtures(client);
      fixtures.value = Array.isArray(body?.response) ? body.response : [];
      lastFetchedAt.value = Date.now();
      await writeCache();
    } catch (err) {
      error.value = formatApiError(err);
      // Graceful degradation: if we have no cached fixtures to fall
      // back to, fill from the bundled Wikipedia scrape so the calendar
      // isn't blank. The bundled data is always older than a real API
      // hit, so we never overwrite a populated fixtures array.
      if (fixtures.value.length === 0 && BUNDLED.length > 0) {
        loadBundledFallback();
      }
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

// Group fixtures by calendar day (YYYY-MM-DD) and sort each day by kickoff.
// Used by WorldCupView to render the calendar the same way the todos view
// does — one section per day, matches of that day stacked underneath.
const groupedByDay = computed(() => {
  const map = new Map();
  for (const fx of fixtures.value) {
    const dateKey = fx?.fixture?.date?.slice(0, 10);
    if (!dateKey) continue;
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey).push(fx);
  }
  for (const list of map.values()) {
    list.sort((a, b) =>
      String(a?.fixture?.date || "").localeCompare(String(b?.fixture?.date || ""))
    );
  }
  return Array.from(map, ([date, list]) => ({ date, list })).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
});

export function useWorldCupFixtures() {
  return {
    fixtures: computed(() => fixtures.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    lastFetchedAt: computed(() => lastFetchedAt.value),
    groupedByMatchday,
    groupedByDay,
    refresh: (force = true) => fetchFresh({ force }),
    loadFromCache: readCache,
  };
}

// Test-only: reset module-level singleton state between cases.
// Not part of the public composable API — exported so unit tests can
// start each case with a clean slate without re-importing the module.
export function __resetWorldCupFixturesState() {
  fixtures.value = [];
  loading.value = false;
  error.value = null;
  lastFetchedAt.value = null;
  inflight = null;
}

// Test-only: invoke fetchFresh with a custom clientFactory. Mirrors
// the public refresh() but lets tests inject a network mock directly,
// sidestepping module-level vi.mock quirks.
export function __refreshWithClientFactory(clientFactory) {
  return fetchFresh({ force: true, clientFactory });
}