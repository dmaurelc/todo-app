import { describe, it, expect, vi } from "vitest";
import {
  ApiError,
  createApiFootballClient,
  formatApiError,
} from "../api-football-client.js";

const okJson = (body) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

const failJson = (status, body = {}) => ({
  ok: false,
  status,
  json: async () => body,
});

describe("createApiFootballClient", () => {
  it("throws when apiKey is missing", () => {
    expect(() => createApiFootballClient({ apiKey: "" })).toThrow(ApiError);
  });

  it("builds the URL with query params and the api-sports header", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson({ response: [] }));
    const client = createApiFootballClient({ apiKey: "k", fetchImpl });
    await client("/fixtures", { league: 1, season: 2026 });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain("v3.football.api-sports.io/fixtures");
    expect(url).toContain("league=1");
    expect(url).toContain("season=2026");
    expect(init.method).toBe("GET");
    expect(init.headers["x-apisports-key"]).toBe("k");
    // RapidAPI-era headers must be gone.
    expect(init.headers["x-rapidapi-key"]).toBeUndefined();
    expect(init.headers["x-rapidapi-host"]).toBeUndefined();
  });

  it("skips undefined and null params", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson({ response: [] }));
    const client = createApiFootballClient({ apiKey: "k", fetchImpl });
    await client("/fixtures", { league: 1, from: undefined, to: null });

    const [url] = fetchImpl.mock.calls[0];
    expect(url).not.toContain("from=");
    expect(url).not.toContain("to=");
  });

  it("throws ApiError on 401 and parses the body when JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      failJson(401, { errors: { token: "Invalid API key" }, response: [] })
    );
    const client = createApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      body: { errors: { token: "Invalid API key" }, response: [] },
    });
  });

  it("tolerates a non-JSON error body and still throws ApiError", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    });
    const client = createApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      body: null,
    });
  });

  it("wraps fetch network failures as an ApiError with kind=network", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("NetworkError"));
    const client = createApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      body: { kind: "network", cause: "NetworkError" },
    });
  });

  it("throws ApiError on 429 with the upstream rate-limit message", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      failJson(429, { errors: { rateLimit: "You have reached the daily limit" } })
    );
    const client = createApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
      body: { errors: { rateLimit: "You have reached the daily limit" } },
    });
  });

  it("throws ApiError on a 200 that carries non-empty body.errors", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      okJson({ errors: { season: "Invalid season" }, response: [] })
    );
    const client = createApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      body: { season: "Invalid season" },
    });
  });

  it("resolves with the body on 2xx + empty errors", async () => {
    const body = { response: [{ id: 1 }] };
    const fetchImpl = vi.fn().mockResolvedValue(okJson(body));
    const client = createApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).resolves.toEqual(body);
  });
});

describe("formatApiError", () => {
  it("returns a network message for kind=network errors", () => {
    const err = new ApiError("Network error", { body: { kind: "network" } });
    expect(formatApiError(err)).toMatch(/sin conexi/i);
  });

  it("explains 401 and surfaces the upstream token message when present", () => {
    const err = new ApiError("API 401", {
      status: 401,
      body: { errors: { token: "Invalid API key" } },
    });
    expect(formatApiError(err)).toMatch(/api key inv/i);
    expect(formatApiError(err)).toMatch(/Invalid API key/);
  });

  it("falls back to a generic 401 copy when no upstream body", () => {
    const err = new ApiError("API 401", { status: 401 });
    expect(formatApiError(err)).toMatch(/api key inv/i);
  });

  it("explains 403 with the upstream plan or token message", () => {
    const err = new ApiError("API 403", {
      status: 403,
      body: { errors: { plan: "Your current plan does not include this season" } },
    });
    expect(formatApiError(err)).toMatch(/403/);
    expect(formatApiError(err)).toMatch(/plan/);
  });

  it("explains 404 with the upstream message when present", () => {
    const err = new ApiError("API 404", {
      status: 404,
      body: { errors: { league: "League not found" } },
    });
    expect(formatApiError(err)).toMatch(/404/);
    expect(formatApiError(err)).toMatch(/League not found/);
  });

  it("handles 404 as not-yet-published when the body is empty", () => {
    const err = new ApiError("API 404", { status: 404 });
    expect(formatApiError(err)).toMatch(/404/);
    expect(formatApiError(err)).toMatch(/temporada|publicada/i);
  });

  it("explains 429 as a rate limit and surfaces the upstream copy", () => {
    const err = new ApiError("API 429", {
      status: 429,
      body: { errors: { rateLimit: "You have reached the daily limit" } },
    });
    expect(formatApiError(err)).toMatch(/l.mite de peticiones/i);
    expect(formatApiError(err)).toMatch(/daily limit/);
  });

  it("treats 5xx as a server-side outage", () => {
    const err = new ApiError("API 503", { status: 503 });
    expect(formatApiError(err)).toMatch(/servidor/i);
  });

  it("returns the upstream message when status is unknown but body has copy", () => {
    const err = new ApiError("API 418", {
      status: 418,
      body: { errors: { teapot: "I'm a teapot" } },
    });
    expect(formatApiError(err)).toBe("I'm a teapot");
  });

  it("returns the upstream message from a 200 with a flat { token } body", () => {
    const err = new ApiError("API errors", {
      status: 200,
      body: { token: "Invalid API key" },
    });
    expect(formatApiError(err)).toMatch(/Invalid API key/);
  });

  it("falls back to a plan hint when status is 200 and body is empty", () => {
    const err = new ApiError("API errors", { status: 200, body: {} });
    expect(formatApiError(err)).toMatch(/plan|dashboard|temporada/i);
  });

  it("returns a friendly default for null/undefined", () => {
    expect(formatApiError(null)).toMatch(/desconocido/i);
    expect(formatApiError(undefined)).toMatch(/desconocido/i);
  });
});
