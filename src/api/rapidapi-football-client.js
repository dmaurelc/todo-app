// Thin fetch wrapper for API-Football via RapidAPI.
// Throws ApiError on non-2xx or on body.errors; caller decides retry/cache.
const BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";
const HOST = "api-football-v1.p.rapidapi.com";

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export const createRapidApiFootballClient = ({ apiKey, fetchImpl = fetch }) => {
  if (!apiKey) throw new ApiError("Missing apiKey");
  return async (path, params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }
    const res = await fetchImpl(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": HOST,
      },
    });
    if (!res.ok) {
      throw new ApiError(`API ${res.status}`, { status: res.status });
    }
    const body = await res.json();
    if (body.errors && Object.keys(body.errors).length > 0) {
      throw new ApiError("API errors", { status: res.status, body: body.errors });
    }
    return body;
  };
};
