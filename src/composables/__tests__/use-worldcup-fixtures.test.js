import { describe, it, expect, beforeEach, vi } from "vitest";

// In-memory storage stub. The composable reads/writes through this map.
const store = new Map();
vi.mock("../use-storage-adapter.js", () => ({
  storage: {
    get: vi.fn(async (k) => (store.has(k) ? store.get(k) : null)),
    set: vi.fn(async (k, v) => {
      store.set(k, v);
    }),
  },
}));

const {
  useWorldCupFixtures,
  __resetWorldCupFixturesState,
  __refreshWithClientFactory,
} = await import("../use-worldcup-fixtures.js");

// The injected client must return the parsed body (the shape
// createRapidApiFootballClient returns after awaiting res.json()),
// not a Response-like object.
const okBody = (n = 1) => ({
  response: Array.from({ length: n }, (_, i) => ({
    fixture: { id: i + 1, date: "2026-06-11T20:00:00Z", status: { short: "NS" } },
    league: { round: "Group Stage - Matchday 1" },
    teams: { home: { name: "Team A" }, away: { name: "Team B" } },
    goals: { home: null, away: null },
  })),
});

// Mimic the ApiError the real client throws on non-2xx.
const apiError = (status) => {
  const err = new Error(`API ${status}`);
  err.name = "ApiError";
  err.status = status;
  return err;
};

beforeEach(() => {
  store.clear();
  __resetWorldCupFixturesState();
});

describe("useWorldCupFixtures", () => {
  it("refresh with no key loads bundled fallback instead of erroring", async () => {
    // The API key is OPTIONAL — the bundled Wikipedia JSON is good
    // enough to render the calendar. No error, no broken view.
    const { refresh, error, fixtures } = useWorldCupFixtures();
    await refresh(true);

    expect(error.value).toBeNull();
    expect(fixtures.value.length).toBeGreaterThan(0);
  });

  it("refresh with key + valid response populates fixtures and writes cache", async () => {
    store.set("worldcup.apiKey", "k");
    const clientFactory = vi.fn(() => () => Promise.resolve(okBody(3)));
    const { fixtures, lastFetchedAt } = useWorldCupFixtures();
    await __refreshWithClientFactory(clientFactory);

    expect(clientFactory).toHaveBeenCalledTimes(1);
    expect(fixtures.value).toHaveLength(3);
    expect(lastFetchedAt.value).toBeGreaterThan(0);
    const cached = store.get("worldcup.fixtures");
    expect(cached.fixtures).toEqual(fixtures.value);
    expect(cached.fetchedAt).toBe(lastFetchedAt.value);
  });

  it("does not refetch inside the TTL unless forced", async () => {
    store.set("worldcup.apiKey", "k");
    const clientFactory = vi.fn(() => () => Promise.resolve(okBody(2)));
    const { refresh, fixtures } = useWorldCupFixtures();
    await __refreshWithClientFactory(clientFactory);
    expect(clientFactory).toHaveBeenCalledTimes(1);

    // refresh(false) is a no-op while the cache is fresh.
    await refresh(false);
    expect(clientFactory).toHaveBeenCalledTimes(1);
    expect(fixtures.value).toHaveLength(2);
  });

  it("force=true refetches even within the TTL", async () => {
    store.set("worldcup.apiKey", "k");
    const clientFactory = vi.fn(() => () => Promise.resolve(okBody(1)));
    await __refreshWithClientFactory(clientFactory);
    await __refreshWithClientFactory(clientFactory);
    expect(clientFactory).toHaveBeenCalledTimes(2);
  });

  it("loadFromCache populates fixtures from the store", async () => {
    const cachedFixtures = [
      { fixture: { id: 99 }, league: { round: "X" }, teams: {}, goals: {} },
    ];
    const cached = { fixtures: cachedFixtures, fetchedAt: Date.now() - 1000 };
    store.set("worldcup.fixtures", cached);
    store.set("worldcup.apiKey", "k");
    const clientFactory = vi.fn(() => () => Promise.resolve(okBody(1)));
    const { loadFromCache, fixtures, refresh, lastFetchedAt } = useWorldCupFixtures();
    await loadFromCache();
    expect(fixtures.value).toEqual(cachedFixtures);
    expect(lastFetchedAt.value).toBe(cached.fetchedAt);

    await refresh(false);
    expect(clientFactory).not.toHaveBeenCalled();
  });

  it("ApiError sets error.value and keeps previous cache intact", async () => {
    store.set("worldcup.apiKey", "k");
    const previous = [{ fixture: { id: 1 } }];
    store.set("worldcup.fixtures", { fixtures: previous, fetchedAt: 1 });
    const clientFactory = vi.fn(() => () => Promise.reject(apiError(429)));
    const { loadFromCache, fixtures, error } = useWorldCupFixtures();
    await loadFromCache();
    expect(fixtures.value).toEqual(previous);
    await __refreshWithClientFactory(clientFactory);
    // formatApiError maps 429 to a Spanish rate-limit message; we
    // don't pin the full string — the dedicated tests in
    // rapidapi-football-client.test.js cover the mapping. Here we
    // only assert that the prior cache survived.
    expect(typeof error.value).toBe("string");
    expect(fixtures.value).toEqual(previous);
  });

  it("network failure surfaces a Spanish 'sin conexion' message", async () => {
    store.set("worldcup.apiKey", "k");
    const clientFactory = vi.fn(
      () => () => Promise.reject({
        name: "ApiError",
        body: { kind: "network", cause: "NetworkError" },
      })
    );
    const { error } = useWorldCupFixtures();
    await __refreshWithClientFactory(clientFactory);
    expect(error.value).toMatch(/sin conexi/i);
  });

  it("403 surfaces the upstream plan/season message in Spanish", async () => {
    store.set("worldcup.apiKey", "k");
    const clientFactory = vi.fn(
      () => () => Promise.reject({
        name: "ApiError",
        status: 403,
        body: { errors: { plan: "Your current plan does not include this season" } },
      })
    );
    const { error } = useWorldCupFixtures();
    await __refreshWithClientFactory(clientFactory);
    expect(error.value).toMatch(/403/);
    expect(error.value).toMatch(/plan/);
  });

  it("401 surfaces the upstream token message in Spanish", async () => {
    store.set("worldcup.apiKey", "k");
    const clientFactory = vi.fn(
      () => () => Promise.reject({
        name: "ApiError",
        status: 401,
        body: { errors: { token: "Invalid API key" } },
      })
    );
    const { error } = useWorldCupFixtures();
    await __refreshWithClientFactory(clientFactory);
    expect(error.value).toMatch(/api key inv/i);
    expect(error.value).toMatch(/Invalid API key/);
  });

  it("concurrent refresh calls share a single fetch via single-flight", async () => {
    store.set("worldcup.apiKey", "k");
    let resolveFn;
    const clientFactory = vi.fn(
      () => () => new Promise((resolve) => {
        resolveFn = resolve;
      })
    );
    // Issue the second call inside a microtask so the first call has
    // already passed the `if (inflight) return` check and set
    // `inflight = (async () => {...})()`. Otherwise both calls
    // proceed past the check in parallel.
    const p1 = __refreshWithClientFactory(clientFactory);
    await Promise.resolve();
    const p2 = __refreshWithClientFactory(clientFactory);
    expect(clientFactory).toHaveBeenCalledTimes(1);
    resolveFn(okBody(1));
    await Promise.all([p1, p2]);
    expect(clientFactory).toHaveBeenCalledTimes(1);
  });

  it("ApiError with no cache falls back to the bundled Wikipedia JSON", async () => {
    // Simulates api-football.com rejecting the 2026 season on the free
    // plan. The user has no prior cache, so we should still render the
    // calendar from the bundled JSON shipped at build time.
    store.set("worldcup.apiKey", "k");
    const clientFactory = vi.fn(() => () => Promise.reject(apiError(403)));
    const { fixtures, error, lastFetchedAt } = useWorldCupFixtures();
    await __refreshWithClientFactory(clientFactory);

    expect(error.value).toMatch(/plan|temporada/i);
    expect(fixtures.value.length).toBeGreaterThan(0);
    expect(lastFetchedAt.value).toBeGreaterThan(0);
  });

  it("ApiError does NOT overwrite a populated fixtures array with bundled data", async () => {
    // If the cache had a fresher dataset than the bundled JSON (e.g. the
    // API worked once, then started failing), the cache wins.
    store.set("worldcup.apiKey", "k");
    const freshFromCache = [{ fixture: { id: 999 }, league: { round: "X" }, teams: {}, goals: {} }];
    store.set("worldcup.fixtures", { fixtures: freshFromCache, fetchedAt: 1 });
    const clientFactory = vi.fn(() => () => Promise.reject(apiError(500)));
    const { loadFromCache, fixtures, error } = useWorldCupFixtures();
    await loadFromCache();
    expect(fixtures.value).toEqual(freshFromCache);
    await __refreshWithClientFactory(clientFactory);
    expect(typeof error.value).toBe("string");
    // Cache survives — bundled JSON does not overwrite a non-empty array.
    expect(fixtures.value).toEqual(freshFromCache);
  });

  describe("groupedByDay", () => {
    const sampleBody = [
      { fixture: { id: 1, date: "2026-06-15T18:00:00Z" }, league: { round: "Group Stage · A" }, teams: {}, goals: {} },
      { fixture: { id: 2, date: "2026-06-15T21:00:00Z" }, league: { round: "Group Stage · A" }, teams: {}, goals: {} },
      { fixture: { id: 3, date: "2026-06-16T17:00:00Z" }, league: { round: "Group Stage · A" }, teams: {}, goals: {} },
      { fixture: { id: 4, date: "2026-06-14T20:00:00Z" }, league: { round: "Round of 32" }, teams: {}, goals: {} },
    ];

    it("groups by YYYY-MM-DD and sorts days chronologically", async () => {
      store.set("worldcup.apiKey", "k");
      const clientFactory = vi.fn(() => () => Promise.resolve({ response: sampleBody }));
      const { groupedByDay } = useWorldCupFixtures();
      await __refreshWithClientFactory(clientFactory);

      expect(groupedByDay.value.map((d) => d.date)).toEqual([
        "2026-06-14",
        "2026-06-15",
        "2026-06-16",
      ]);
    });

    it("sorts fixtures within a day by kickoff time", async () => {
      store.set("worldcup.apiKey", "k");
      const clientFactory = vi.fn(() => () => Promise.resolve({ response: sampleBody }));
      const { groupedByDay } = useWorldCupFixtures();
      await __refreshWithClientFactory(clientFactory);

      const june15 = groupedByDay.value.find((d) => d.date === "2026-06-15");
      expect(june15.list.map((f) => f.fixture.id)).toEqual([1, 2]);
    });

    it("skips fixtures without a parseable date", async () => {
      store.set("worldcup.apiKey", "k");
      const body = {
        response: [
          { fixture: { id: 1, date: "2026-06-15T18:00:00Z" }, league: {}, teams: {}, goals: {} },
          { fixture: { id: 2 }, league: {}, teams: {}, goals: {} },
        ],
      };
      const clientFactory = vi.fn(() => () => Promise.resolve(body));
      const { groupedByDay } = useWorldCupFixtures();
      await __refreshWithClientFactory(clientFactory);
      expect(groupedByDay.value).toHaveLength(1);
      expect(groupedByDay.value[0].list).toHaveLength(1);
    });
  });
});
