import { describe, it, expect, vi } from "vitest";
import {
  ApiError,
  createRapidApiFootballClient,
  formatApiError,
} from "../rapidapi-football-client.js";

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

describe("createRapidApiFootballClient", () => {
  it("throws when apiKey is missing", () => {
    expect(() => createRapidApiFootballClient({ apiKey: "" })).toThrow(ApiError);
  });

  it("builds the URL with query params and the rapidapi headers", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson({ response: [] }));
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await client("/fixtures", { league: 1, season: 2026 });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain("api-football-v1.p.rapidapi.com/v3/fixtures");
    expect(url).toContain("league=1");
    expect(url).toContain("season=2026");
    expect(init.method).toBe("GET");
    expect(init.headers["x-rapidapi-key"]).toBe("k");
    expect(init.headers["x-rapidapi-host"]).toBe("api-football-v1.p.rapidapi.com");
  });

  it("skips undefined and null params", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson({ response: [] }));
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await client("/fixtures", { league: 1, from: undefined, to: null });

    const [url] = fetchImpl.mock.calls[0];
    expect(url).not.toContain("from=");
    expect(url).not.toContain("to=");
  });

  it("throws ApiError on 401 and parses the body when JSON", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(failJson(401, { message: "Invalid API key" }));
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      body: { message: "Invalid API key" },
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
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      body: null,
    });
  });

  it("wraps fetch network failures as an ApiError with kind=network", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("NetworkError"));
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      body: { kind: "network", cause: "NetworkError" },
    });
  });

  it("throws ApiError on 429", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(failJson(429));
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
    });
  });

  it("throws ApiError when body.errors is non-empty", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      okJson({ errors: { rateLimit: "exceeded" }, response: [] })
    );
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      body: { rateLimit: "exceeded" },
    });
  });

  it("resolves with the body on 2xx + empty errors", async () => {
    const body = { response: [{ id: 1 }] };
    const fetchImpl = vi.fn().mockResolvedValue(okJson(body));
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).resolves.toEqual(body);
  });
});

describe("formatApiError", () => {
  it("returns a network message for kind=network errors", () => {
    const err = new ApiError("Network error", { body: { kind: "network" } });
    expect(formatApiError(err)).toMatch(/sin conexi/i);
  });

  it("explains 401 as an invalid key", () => {
    const err = new ApiError("API 401", { status: 401 });
    expect(formatApiError(err)).toMatch(/api key inv/i);
  });

  it("detects the RapidAPI 'not subscribed' message on 403", () => {
    const err = new ApiError("API 403", {
      status: 403,
      body: { message: "You are not subscribed to this API" },
    });
    expect(formatApiError(err)).toMatch(/no est.s suscrito/i);
    expect(formatApiError(err)).toMatch(/api-football/i);
  });

  it("detects a domain-restricted 403", () => {
    const err = new ApiError("API 403", {
      status: 403,
      body: { message: "This key is restricted to other domains" },
    });
    expect(formatApiError(err)).toMatch(/restringida/i);
  });

  it("falls back to a generic 403 message when the upstream copy is unknown", () => {
    const err = new ApiError("API 403", { status: 403, body: { message: "x" } });
    expect(formatApiError(err)).toMatch(/403/);
  });

  it("handles 404 as a not-yet-published season", () => {
    const err = new ApiError("API 404", { status: 404 });
    expect(formatApiError(err)).toMatch(/404/);
    expect(formatApiError(err)).toMatch(/temporada|publicada/i);
  });

  it("explains 429 as a rate limit", () => {
    const err = new ApiError("API 429", { status: 429 });
    expect(formatApiError(err)).toMatch(/l.mite de peticiones/i);
  });

  it("treats 5xx as a server-side outage", () => {
    const err = new ApiError("API 503", { status: 503 });
    expect(formatApiError(err)).toMatch(/servidor/i);
  });

  it("returns the upstream message when status is unknown but body has copy", () => {
    const err = new ApiError("API 418", {
      status: 418,
      body: { message: "I'm a teapot" },
    });
    expect(formatApiError(err)).toBe("I'm a teapot");
  });

  it("returns a friendly default for null/undefined", () => {
    expect(formatApiError(null)).toMatch(/desconocido/i);
    expect(formatApiError(undefined)).toMatch(/desconocido/i);
  });
});
