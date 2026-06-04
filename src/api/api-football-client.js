// Thin fetch wrapper for the API-Football v3 service (api-football.com /
// api-sports). Throws ApiError on non-2xx, on body.errors (the API
// returns errors inside an otherwise-successful response), or on
// network failures. The caller decides retry/cache behaviour.
const BASE_URL = "https://v3.football.api-sports.io";
const HOST = "v3.football.api-sports.io";

export class ApiError extends Error {
  // body is the parsed JSON response (when available). The api-football
  // service returns 401/403 with { errors: { token: "..." }, response: [] }
  // and a 200 with non-empty { errors } when a parameter is rejected —
  // both useful for actionable UI copy.
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export const createApiFootballClient = ({ apiKey, fetchImpl = fetch }) => {
  if (!apiKey) throw new ApiError("Missing apiKey");
  return async (path, params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }
    let res;
    try {
      res = await fetchImpl(url.toString(), {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey,
        },
      });
    } catch (err) {
      // Network error (DNS, offline, CORS). Surface as a network-shaped
      // ApiError so the caller can branch on `body.kind === "network"`.
      throw new ApiError("Network error", {
        body: { kind: "network", cause: err?.message },
      });
    }
    if (!res.ok) {
      // Try to parse the error body; tolerate non-JSON responses
      // (proxies sometimes return HTML on 5xx).
      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      throw new ApiError(`API ${res.status}`, { status: res.status, body });
    }
    const body = await res.json();
    if (body?.errors && Object.keys(body.errors).length > 0) {
      throw new ApiError("API errors", { status: res.status, body: body.errors });
    }
    return body;
  };
};

// Maps an ApiError to a user-facing Spanish message. Centralised so the
// composable and the SettingsDialog "Probar conexion" button stay in sync.
export const formatApiError = (err) => {
  if (!err) return "Error desconocido";
  // Network-level failure before any HTTP response.
  if (err?.body?.kind === "network") {
    return "Sin conexion. Verifica tu internet o la configuracion de red.";
  }
  const status = err?.status;
  // API-Football returns errors in two shapes:
  //   non-2xx: { errors: { token, plan, season, rateLimit, ... } }
  //   200-with-bad-query: { errors: { token: "..." } } on its own,
  //                       or sometimes nested.
  // Walk any nested `errors` first, then fall back to scanning the
  // whole body for the first human-readable string the API gave us.
  const upstreamMsg = findUpstreamMessage(err?.body);
  switch (status) {
    case 401:
      return upstreamMsg
        ? `API key invalida o expirada (${upstreamMsg}). Verifica la clave en Ajustes -> Mundial 2026.`
        : "API key invalida o expirada. Verifica la clave en Ajustes -> Mundial 2026.";
    case 403:
      return upstreamMsg
        ? `Acceso denegado (403): ${upstreamMsg}. Tu plan puede no incluir esta temporada o esta consulta.`
        : "Acceso denegado (403). Tu plan puede no incluir esta temporada o esta consulta.";
    case 404:
      return upstreamMsg
        ? `Recurso no encontrado (404): ${upstreamMsg}`
        : "Recurso no encontrado (404). La temporada 2026 puede no estar publicada aun.";
    case 429:
      return upstreamMsg
        ? `Limite de peticiones alcanzado (${upstreamMsg}). Espera o actualiza tu plan en dashboard.api-football.com.`
        : "Limite de peticiones alcanzado. Espera unos minutos o actualiza tu plan en dashboard.api-football.com.";
    default:
      if (status >= 500) {
        return `El servidor de API-Football esta fallando (${status}). Intenta mas tarde.`;
      }
      if (upstreamMsg) return String(upstreamMsg);
      if (err?.body?.message) return String(err.body.message);
      // 200 + non-empty body.errors: we already extracted upstreamMsg
      // above; if it was present the previous branch returned it.
      // This is the final fallback for an empty errors object that
      // still triggered the throw (defensive).
      return err?.message && err.message !== "API errors"
        ? err.message
        : "La API rechazo la consulta. Revisa tu plan en dashboard.api-football.com o espera a que la temporada 2026 este disponible.";
  }
};

// Walks an arbitrary body shape and returns the first non-empty string
// the API gave us. Handles the { errors: { ... } } wrapper, a flat
// { token: "..." }, or a deeply nested error structure.
const findUpstreamMessage = (body) => {
  if (!body || typeof body !== "object") return null;
  // First try the documented { errors: { ... } } shape.
  if (body.errors && typeof body.errors === "object") {
    const fromErrors = Object.values(body.errors).find(
      (v) => typeof v === "string" && v.length
    );
    if (fromErrors) return fromErrors;
  }
  // Then scan the body itself for any string field. Useful when the
  // API returns { token: "Invalid API key" } at the top level.
  const fromBody = Object.values(body).find(
    (v) => typeof v === "string" && v.length
  );
  return fromBody || null;
};

// Re-export HOST for tests and the SettingsDialog that may want to
// display the upstream service name in the help text.
export const API_FOOTBALL_HOST = HOST;
