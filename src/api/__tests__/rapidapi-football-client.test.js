import { describe, it, expect, vi } from "vitest";
import {
  ApiError,
  createRapidApiFootballClient,
} from "../rapidapi-football-client.js";

const okJson = (body) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

const failJson = (status) => ({
  ok: false,
  status,
  json: async () => ({}),
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

  it("throws ApiError on 401", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(failJson(401));
    const client = createRapidApiFootballClient({ apiKey: "k", fetchImpl });
    await expect(client("/fixtures")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
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
